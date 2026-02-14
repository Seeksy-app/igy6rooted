import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-igy6-signature, x-igy6-timestamp, x-org-id, x-conversation-id",
};

const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";
const JOBBER_GRAPHQL_VERSION = "2024-09-16";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// HMAC-SHA256 verification
async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
  maxAgeSeconds = 120
): Promise<boolean> {
  // Check timestamp freshness
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - requestTime) > maxAgeSeconds) {
    console.log("HMAC: Timestamp too old or in future");
    return false;
  }

  // Verify signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expectedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expectedHex = new TextDecoder().decode(hexEncode(new Uint8Array(expectedSig)));
  
  return signature === expectedHex;
}

// Get valid access token for org (with auto-refresh)
async function getValidAccessToken(supabase: any, orgId: string): Promise<string | null> {
  const JOBBER_CLIENT_ID = Deno.env.get("JOBBER_CLIENT_ID");
  const JOBBER_CLIENT_SECRET = Deno.env.get("JOBBER_CLIENT_SECRET");

  // Get current tokens
  const { data: account, error } = await supabase
    .from("integration_jobber_accounts")
    .select("*")
    .eq("org_id", orgId)
    .eq("status", "connected")
    .maybeSingle();

  if (error || !account) {
    console.error("No connected Jobber account for org:", orgId);
    return null;
  }

  // Check if token is still valid (with 5-min buffer)
  const expiresAt = new Date(account.token_expires_at).getTime();
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt - now > bufferMs) {
    return account.access_token;
  }

  // Token expired or expiring soon - refresh it
  console.log("Refreshing expired token for org:", orgId);

  if (!account.refresh_token) {
    console.error("No refresh token available");
    await supabase
      .from("integration_jobber_accounts")
      .update({ status: "error", updated_at: new Date().toISOString() })
      .eq("id", account.id);
    return null;
  }

  try {
    const tokenResponse = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
        client_id: JOBBER_CLIENT_ID!,
        client_secret: JOBBER_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token refresh failed:", errorText);
      await supabase
        .from("integration_jobber_accounts")
        .update({ status: "error", updated_at: new Date().toISOString() })
        .eq("id", account.id);
      await supabase
        .from("jobber_connections")
        .update({ status: "error", last_error: "Token refresh failed", updated_at: new Date().toISOString() })
        .eq("org_id", orgId);
      return null;
    }

    const tokenData = await tokenResponse.json();
    const newExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

    await supabase
      .from("integration_jobber_accounts")
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || account.refresh_token,
        token_expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);

    console.log("Token refreshed successfully");
    return tokenData.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

// Execute Jobber GraphQL query
async function jobberGraphQL(accessToken: string, query: string, variables?: Record<string, any>): Promise<any> {
  console.log("GraphQL request type:", query.trim().substring(0, 30));
  
  const response = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-JOBBER-GRAPHQL-VERSION": JOBBER_GRAPHQL_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseText = await response.text();
  console.log("GraphQL response status:", response.status);
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("Failed to parse GraphQL response:", responseText);
    throw new Error(`Invalid JSON response from Jobber API: ${responseText.substring(0, 200)}`);
  }

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    throw new Error(data.errors[0]?.message || "GraphQL error");
  }

  return data.data;
}

// Log tool call to database
async function logToolCall(
  supabase: any,
  orgId: string,
  conversationId: string | null,
  toolName: string,
  requestPayload: any,
  responsePayload: any | null,
  status: string,
  error: string | null
) {
  try {
    await supabase.from("ai_tool_call_logs").insert({
      org_id: orgId,
      conversation_id: conversationId,
      tool_name: toolName,
      request_payload: requestPayload,
      response_payload: responsePayload,
      status,
      error,
    });
  } catch (e) {
    console.error("Failed to log tool call:", e);
  }
}

// Create AI booking record
async function createAiBooking(
  supabase: any,
  orgId: string,
  conversationId: string | null,
  bookingData: any
) {
  try {
    const { data, error } = await supabase.from("ai_bookings").insert({
      org_id: orgId,
      conversation_id: conversationId,
      customer_name: bookingData.customer_name,
      phone: bookingData.phone,
      email: bookingData.email,
      service_type: bookingData.service_type,
      address: bookingData.address,
      slot_start: bookingData.slot_start,
      slot_end: bookingData.slot_end,
      notes: bookingData.notes,
      jobber_client_id: bookingData.jobber_client_id,
      jobber_request_id: bookingData.jobber_request_id,
      jobber_job_id: bookingData.jobber_job_id,
      jobber_visit_id: bookingData.jobber_visit_id,
      status: bookingData.status || "scheduled",
    }).select().single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Failed to create AI booking:", e);
    return null;
  }
}

// Get appointment rules for org
async function getAppointmentRules(supabase: any, orgId: string) {
  const { data, error } = await supabase
    .from("ai_appointment_rules")
    .select("*")
    .eq("org_id", orgId)
    .maybeSingle();

  if (error || !data) {
    // Return defaults
    return {
      timezone: "America/Chicago",
      default_duration_minutes: 120,
      travel_buffer_minutes: 30,
      min_lead_time_minutes: 180,
      max_days_out: 21,
      business_hours: {
        mon: [["09:00", "17:00"]],
        tue: [["09:00", "17:00"]],
        wed: [["09:00", "17:00"]],
        thu: [["09:00", "17:00"]],
        fri: [["09:00", "17:00"]],
        sat: [],
        sun: [],
      },
      service_type_map: {},
    };
  }

  return data;
}

// GraphQL Queries
const QUERIES = {
  // Get schedule entries (visits) for date range
  getSchedule: `
    query GetSchedule($startDate: ISO8601Date!, $endDate: ISO8601Date!) {
      calendarEvents(
        filter: { startAt: { gte: $startDate, lte: $endDate } }
        first: 100
      ) {
        nodes {
          ... on Visit {
            id
            title
            startAt
            endAt
            allDay
            job {
              id
              title
            }
            assignedUsers {
              nodes {
                id
                name { full }
              }
            }
          }
        }
      }
    }
  `,

  // Create or find client
  createClient: `
    mutation CreateClient($input: ClientCreateInput!) {
      clientCreate(input: $input) {
        client {
          id
          name
          phones { number }
          emails { address }
        }
        userErrors {
          message
          path
        }
      }
    }
  `,

  // Search for existing client
  searchClients: `
    query SearchClients($searchTerm: String!) {
      clients(searchTerm: $searchTerm, first: 5) {
        nodes {
          id
          name
          phones { number }
          emails { address }
        }
      }
    }
  `,

  // Create request (leads to job)
  createRequest: `
    mutation CreateRequest($input: RequestCreateInput!) {
      requestCreate(input: $input) {
        request {
          id
          title
          status
          client {
            id
            name
          }
        }
        userErrors {
          message
          path
        }
      }
    }
  `,

  // Create job
  createJob: `
    mutation CreateJob($input: JobCreateInput!) {
      jobCreate(input: $input) {
        job {
          id
          title
          jobNumber
          client {
            id
            name
          }
        }
        userErrors {
          message
          path
        }
      }
    }
  `,

  // Create visit (scheduled appointment)
  createVisit: `
    mutation CreateVisit($input: VisitCreateInput!) {
      visitCreate(input: $input) {
        visit {
          id
          title
          startAt
          endAt
          job {
            id
            title
          }
        }
        userErrors {
          message
          path
        }
      }
    }
  `,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ELEVENLABS_HMAC_SECRET = Deno.env.get("ELEVENLABS_HMAC_SECRET");
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const url = new URL(req.url);
  const path = url.pathname.replace("/jobber-api", "");
  
  // Get headers
  const signature = req.headers.get("x-igy6-signature");
  const timestamp = req.headers.get("x-igy6-timestamp");
  const orgId = req.headers.get("x-org-id") || url.searchParams.get("org_id");
  const conversationId = req.headers.get("x-conversation-id");

  let body: any = {};
  let rawBody = "";
  
  if (req.method === "POST") {
    rawBody = await req.text();
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = {};
    }
  }

  // Use org_id from body if not in headers
  const effectiveOrgId = orgId || body.org_id;

  console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

  // Authentication: either HMAC (ElevenLabs) or JWT (user requests)
  let isAuthenticated = false;

  // Check HMAC first (for ElevenLabs tool calls)
  if (ELEVENLABS_HMAC_SECRET && signature && timestamp) {
    const isValid = await verifyHmacSignature(rawBody, signature, ELEVENLABS_HMAC_SECRET, timestamp);
    if (!isValid) {
      console.error("Invalid HMAC signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    isAuthenticated = true;
  }

  // If not HMAC authenticated, require JWT
  if (!isAuthenticated) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const tokenStr = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(tokenStr);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify org membership
    if (effectiveOrgId) {
      const { data: membership } = await supabase
        .from("team_members")
        .select("role")
        .eq("org_id", effectiveOrgId)
        .eq("user_id", claimsData.claims.sub)
        .single();
      if (!membership) {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    isAuthenticated = true;
  }

  // Validate org_id format
  if (!effectiveOrgId || !UUID_REGEX.test(effectiveOrgId)) {
    return new Response(
      JSON.stringify({ error: "Valid org_id is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    switch (path) {
      case "/health": {
        const accessToken = await getValidAccessToken(supabase, effectiveOrgId);
        const connected = !!accessToken;

        return new Response(
          JSON.stringify({
            status: connected ? "connected" : "not_connected",
            jobber_connected: connected,
            token_valid: connected,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "/availability": {
        const { service_type, zip, date_from, date_to, duration_minutes } = 
          req.method === "POST" ? body : Object.fromEntries(url.searchParams);

        if (!date_from || !date_to) {
          await logToolCall(supabase, effectiveOrgId, conversationId, "get_availability", body, null, "error", "Missing date_from or date_to");
          return new Response(
            JSON.stringify({ error: "Missing date_from or date_to", slots: [] }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const accessToken = await getValidAccessToken(supabase, effectiveOrgId);
        if (!accessToken) {
          await logToolCall(supabase, effectiveOrgId, conversationId, "get_availability", body, null, "error", "Jobber not connected");
          return new Response(
            JSON.stringify({ error: "Jobber not connected. Please connect your Jobber account first.", slots: [] }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get appointment rules
        const rules = await getAppointmentRules(supabase, effectiveOrgId);
        const serviceDuration = duration_minutes || 
          (rules.service_type_map as Record<string, any>)[service_type]?.duration || 
          rules.default_duration_minutes;

        // Query Jobber for existing schedule
        const scheduleData = await jobberGraphQL(accessToken, QUERIES.getSchedule, {
          startDate: date_from.split("T")[0],
          endDate: date_to.split("T")[0],
        });

        const existingEvents = scheduleData?.calendarEvents?.nodes || [];

        // Generate available slots based on business hours minus existing events
        const slots: Array<{ start: string; end: string; confidence: number }> = [];
        const businessHours = rules.business_hours as Record<string, string[][]>;
        const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

        const startDate = new Date(date_from);
        const endDate = new Date(date_to);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayName = dayNames[d.getDay()];
          const dayHours = businessHours[dayName] || [];

          for (const [openTime, closeTime] of dayHours) {
            const [openH, openM] = openTime.split(":").map(Number);
            const [closeH, closeM] = closeTime.split(":").map(Number);

            // Generate slots at 1-hour intervals
            for (let h = openH; h < closeH; h++) {
              const slotStart = new Date(d);
              slotStart.setHours(h, h === openH ? openM : 0, 0, 0);

              const slotEnd = new Date(slotStart);
              slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);

              // Skip if slot extends past closing time
              if (slotEnd.getHours() > closeH || (slotEnd.getHours() === closeH && slotEnd.getMinutes() > closeM)) {
                continue;
              }

              // Check for conflicts with existing events
              const hasConflict = existingEvents.some((event: any) => {
                const eventStart = new Date(event.startAt);
                const eventEnd = new Date(event.endAt);
                // Add travel buffer
                eventStart.setMinutes(eventStart.getMinutes() - rules.travel_buffer_minutes);
                eventEnd.setMinutes(eventEnd.getMinutes() + rules.travel_buffer_minutes);
                
                return slotStart < eventEnd && slotEnd > eventStart;
              });

              if (!hasConflict) {
                slots.push({
                  start: slotStart.toISOString(),
                  end: slotEnd.toISOString(),
                  confidence: 0.9,
                });
              }
            }
          }
        }

        const response = {
          org_id: effectiveOrgId,
          timezone: rules.timezone,
          service_type,
          duration_minutes: serviceDuration,
          slots: slots.slice(0, 10), // Return max 10 slots
        };

        await logToolCall(supabase, effectiveOrgId, conversationId, "get_availability", 
          { service_type, zip, date_from, date_to }, response, "success", null);

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "/book": {
        if (req.method !== "POST") {
          return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { 
          customer_name, phone, email, 
          service_type, address, 
          slot_start, slot_end, 
          notes 
        } = body;

        // Validate required fields
        if (!customer_name || !phone || !service_type || !address || !slot_start || !slot_end) {
          const missingFields = [];
          if (!customer_name) missingFields.push("customer_name");
          if (!phone) missingFields.push("phone");
          if (!service_type) missingFields.push("service_type");
          if (!address) missingFields.push("address");
          if (!slot_start) missingFields.push("slot_start");
          if (!slot_end) missingFields.push("slot_end");

          await logToolCall(supabase, effectiveOrgId, conversationId, "book_appointment", body, null, "error", `Missing fields: ${missingFields.join(", ")}`);
          
          return new Response(
            JSON.stringify({ 
              error: `Missing required fields: ${missingFields.join(", ")}`,
              status: "failed"
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const accessToken = await getValidAccessToken(supabase, effectiveOrgId);
        if (!accessToken) {
          await logToolCall(supabase, effectiveOrgId, conversationId, "book_appointment", body, null, "error", "Jobber not connected");
          
          // Create follow-up since we can't book
          await supabase.from("followups").insert({
            org_id: effectiveOrgId,
            priority: "high",
            status: "open",
            notes: `Booking failed - Jobber not connected\nCustomer: ${customer_name} (${phone})\nService: ${service_type}\nAddress: ${address}\nRequested: ${slot_start}`,
          });

          return new Response(
            JSON.stringify({ 
              error: "Jobber not connected. A team member will call you back to schedule.",
              status: "needs_followup"
            }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        try {
          // Step 1: Search for existing client or create new one
          let clientId: string;
          
          const searchResult = await jobberGraphQL(accessToken, QUERIES.searchClients, {
            searchTerm: phone,
          });

          if (searchResult?.clients?.nodes?.length > 0) {
            clientId = searchResult.clients.nodes[0].id;
            console.log("Found existing client:", clientId);
          } else {
            // Create new client - Jobber requires specific enum values for description
            console.log("Creating new client:", { customer_name, phone, email, address });
            const clientInput: any = {
              firstName: customer_name.split(" ")[0] || "Customer",
              lastName: customer_name.split(" ").slice(1).join(" ") || "Customer",
              phones: [{ number: phone, primary: true, description: "MOBILE" }],
            };
            
            // Add email if provided
            if (email) {
              clientInput.emails = [{ address: email, primary: true, description: "MAIN" }];
            }
            
            // Add billing address if provided - need to parse properly
            if (address) {
              clientInput.billingAddress = {
                street1: address,
              };
            }
            
            console.log("Client input payload:", JSON.stringify(clientInput));
            const clientResult = await jobberGraphQL(accessToken, QUERIES.createClient, {
              input: clientInput,
            });

            console.log("Client create response:", JSON.stringify(clientResult));

            if (!clientResult?.clientCreate) {
              throw new Error("Failed to create client - no response from Jobber API");
            }

            if (clientResult.clientCreate.userErrors?.length > 0) {
              throw new Error(clientResult.clientCreate.userErrors[0].message);
            }

            if (!clientResult.clientCreate.client?.id) {
              throw new Error("Failed to create client - no client ID returned");
            }

            clientId = clientResult.clientCreate.client.id;
            console.log("Created new client:", clientId);
          }

          // Step 2: Create a request
          console.log("Creating request for client:", clientId);
          const requestResult = await jobberGraphQL(accessToken, QUERIES.createRequest, {
            input: {
              clientId,
              title: `${service_type} - ${customer_name}`,
              instructions: notes || `Service requested via AI booking system`,
            },
          });

          console.log("Request create response:", JSON.stringify(requestResult));

          if (!requestResult?.requestCreate) {
            throw new Error("Failed to create request - no response from Jobber API");
          }

          if (requestResult.requestCreate.userErrors?.length > 0) {
            throw new Error(requestResult.requestCreate.userErrors[0].message);
          }

          const requestId = requestResult.requestCreate.request?.id || null;
          console.log("Created request:", requestId);

          // Step 3: Create job
          console.log("Creating job for client:", clientId);
          const jobResult = await jobberGraphQL(accessToken, QUERIES.createJob, {
            input: {
              clientId,
              title: `${service_type} - ${customer_name}`,
              instructions: notes || `Service requested via AI booking system`,
            },
          });

          console.log("Job create response:", JSON.stringify(jobResult));

          if (!jobResult?.jobCreate) {
            throw new Error("Failed to create job - no response from Jobber API");
          }

          if (jobResult.jobCreate.userErrors?.length > 0) {
            throw new Error(jobResult.jobCreate.userErrors[0].message);
          }

          if (!jobResult.jobCreate.job?.id) {
            throw new Error("Failed to create job - no job ID returned");
          }

          const jobId = jobResult.jobCreate.job.id;
          const jobNumber = jobResult.jobCreate.job.jobNumber;
          console.log("Created job:", jobId, "number:", jobNumber);

          // Step 4: Create visit (scheduled appointment)
          console.log("Creating visit for job:", jobId);
          const visitResult = await jobberGraphQL(accessToken, QUERIES.createVisit, {
            input: {
              jobId,
              title: `${service_type} - ${customer_name}`,
              startAt: slot_start,
              endAt: slot_end,
              instructions: notes,
            },
          });

          console.log("Visit create response:", JSON.stringify(visitResult));

          if (!visitResult?.visitCreate) {
            throw new Error("Failed to create visit - no response from Jobber API");
          }

          if (visitResult.visitCreate.userErrors?.length > 0) {
            throw new Error(visitResult.visitCreate.userErrors[0].message);
          }

          if (!visitResult.visitCreate.visit?.id) {
            throw new Error("Failed to create visit - no visit ID returned");
          }

          const visitId = visitResult.visitCreate.visit.id;
          console.log("Created visit:", visitId);

          // Save to ai_bookings table
          const booking = await createAiBooking(supabase, effectiveOrgId, conversationId, {
            customer_name,
            phone,
            email,
            service_type,
            address,
            slot_start,
            slot_end,
            notes,
            jobber_client_id: clientId,
            jobber_request_id: requestId,
            jobber_job_id: jobId,
            jobber_visit_id: visitId,
            status: "scheduled",
          });

          const response = {
            status: "booked",
            booking_id: booking?.id,
            jobber_record_ids: {
              clientId,
              requestId,
              jobId,
              jobNumber,
              visitId,
            },
            confirmation: {
              customer_name,
              service_type,
              address,
              scheduled_start: slot_start,
              scheduled_end: slot_end,
              message: `Your ${service_type} appointment is confirmed for ${new Date(slot_start).toLocaleString("en-US", { 
                weekday: "long", 
                month: "long", 
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
              })}. You will receive a confirmation text shortly.`,
            },
          };

          await logToolCall(supabase, effectiveOrgId, conversationId, "book_appointment", body, response, "success", null);

          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });

        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Booking error:", error);

          // Create follow-up for failed booking
          await supabase.from("followups").insert({
            org_id: effectiveOrgId,
            priority: "high",
            status: "open",
            notes: `Booking failed: ${message}\nCustomer: ${customer_name} (${phone})\nEmail: ${email || "N/A"}\nService: ${service_type}\nAddress: ${address}\nRequested: ${slot_start} - ${slot_end}\nNotes: ${notes || "N/A"}`,
          });

          await logToolCall(supabase, effectiveOrgId, conversationId, "book_appointment", body, null, "error", message);

          return new Response(
            JSON.stringify({
              status: "needs_followup",
              error: message,
              message: "I apologize, but I couldn't complete the booking. A team member will call you back shortly to confirm your appointment.",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: "Not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Jobber API error:", error);

    await logToolCall(supabase, effectiveOrgId, conversationId, path.replace("/", ""), body, null, "error", message);

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
