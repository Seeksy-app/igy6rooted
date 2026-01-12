import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HMAC-SHA256 signing function
async function signRequest(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return new TextDecoder().decode(hexEncode(new Uint8Array(signature)));
}

// Log booking event to database
async function logBookingEvent(
  supabase: any,
  orgId: string,
  bookingRequestId: string | null,
  eventType: string,
  eventPayload: any
) {
  if (!bookingRequestId) return;
  
  try {
    await supabase.from("booking_events").insert({
      org_id: orgId,
      booking_request_id: bookingRequestId,
      event_type: eventType,
      event_payload: eventPayload,
    });
  } catch (error) {
    console.error("Failed to log booking event:", error);
  }
}

// Create follow-up on failure
async function createFollowup(
  supabase: any,
  orgId: string,
  bookingRequestId: string | null,
  notes: string,
  priority: "low" | "normal" | "high" = "normal"
) {
  try {
    const { data, error } = await supabase.from("followups").insert({
      org_id: orgId,
      booking_request_id: bookingRequestId,
      priority,
      notes,
      status: "open",
    }).select().single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to create follow-up:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/integration-proxy", "");
    
    // Get environment variables
    const INTEGRATION_SERVICE_URL = Deno.env.get("INTEGRATION_SERVICE_URL");
    const INTEGRATION_SERVICE_HMAC_SECRET = Deno.env.get("INTEGRATION_SERVICE_HMAC_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Initialize Supabase client for audit logging
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    let body: any = {};
    if (req.method === "POST") {
      body = await req.json();
    }

    const orgId = body.org_id || url.searchParams.get("org_id");
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${req.method} ${path} - org: ${orgId}`);

    // Route handling
    switch (path) {
      case "/health": {
        // Health check - works even without integration service configured
        const integrationConfigured = !!INTEGRATION_SERVICE_URL;
        
        if (!integrationConfigured) {
          return new Response(
            JSON.stringify({
              status: "partial",
              message: "Integration Service URL not configured",
              timestamp,
              services: {
                proxy: "ok",
                integration_service: "not_configured",
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Ping the integration service
        try {
          const signature = await signRequest("", INTEGRATION_SERVICE_HMAC_SECRET || "");
          const response = await fetch(`${INTEGRATION_SERVICE_URL}/health`, {
            headers: { "X-IGY6-Signature": signature },
          });
          const data = await response.json();
          
          return new Response(
            JSON.stringify({
              status: "ok",
              timestamp,
              services: {
                proxy: "ok",
                integration_service: data.status || "ok",
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({
              status: "error",
              message: "Integration Service unreachable",
              timestamp,
              services: {
                proxy: "ok",
                integration_service: "unreachable",
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
          );
        }
      }

      case "/availability": {
        if (req.method !== "POST") {
          return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
          );
        }

        const { service_key, zip, from, to, preferred_windows, booking_request_id } = body;

        // Validate required fields
        if (!orgId || !service_key || !zip || !from || !to) {
          return new Response(
            JSON.stringify({ 
              error: "Missing required fields",
              required: ["org_id", "service_key", "zip", "from", "to"]
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Log the availability request
        await logBookingEvent(supabase, orgId, booking_request_id, "availability_requested", {
          service_key,
          zip,
          from,
          to,
          preferred_windows,
        });

        // If Integration Service is not configured, return mock data
        if (!INTEGRATION_SERVICE_URL) {
          console.log("Integration Service not configured - returning mock slots");
          
          const mockSlots = [
            { start: `${from.split("T")[0]}T09:00:00`, end: `${from.split("T")[0]}T10:00:00`, confidence: 0.95 },
            { start: `${from.split("T")[0]}T11:00:00`, end: `${from.split("T")[0]}T12:00:00`, confidence: 0.87 },
            { start: `${from.split("T")[0]}T14:00:00`, end: `${from.split("T")[0]}T15:00:00`, confidence: 0.72 },
          ];

          await logBookingEvent(supabase, orgId, booking_request_id, "availability_response", {
            source: "mock",
            slots: mockSlots,
          });

          return new Response(
            JSON.stringify({
              org_id: orgId,
              service_key,
              slots: mockSlots,
              source: "mock",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Forward to Integration Service with HMAC signature
        try {
          const payload = JSON.stringify(body);
          const signature = await signRequest(payload, INTEGRATION_SERVICE_HMAC_SECRET || "");

          const response = await fetch(`${INTEGRATION_SERVICE_URL}/availability`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-IGY6-Signature": signature,
            },
            body: payload,
          });

          const data = await response.json();

          await logBookingEvent(supabase, orgId, booking_request_id, "availability_response", {
            source: "integration_service",
            slots: data.slots,
            status: response.status,
          });

          if (!response.ok) {
            throw new Error(data.error || "Integration Service error");
          }

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("Integration Service error:", error);

          await logBookingEvent(supabase, orgId, booking_request_id, "availability_error", {
            error: error.message,
          });

          return new Response(
            JSON.stringify({ error: error.message, slots: [] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
          );
        }
      }

      case "/book": {
        if (req.method !== "POST") {
          return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
          );
        }

        const { customer, service_key, address, zip, slot, notes, booking_request_id } = body;

        // Validate required fields
        if (!orgId || !customer?.name || !customer?.phone || !service_key || !address || !zip || !slot?.start || !slot?.end) {
          return new Response(
            JSON.stringify({
              error: "Missing required fields",
              required: ["org_id", "customer.name", "customer.phone", "service_key", "address", "zip", "slot.start", "slot.end"]
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Create or update booking request record
        let bookingId = booking_request_id;
        
        if (!bookingId) {
          const { data: newBooking, error: bookingError } = await supabase
            .from("booking_requests")
            .insert({
              org_id: orgId,
              channel: "voice",
              customer_name: customer.name,
              caller_phone: customer.phone,
              customer_email: customer.email,
              service_key,
              address,
              zip,
              preferred_windows: [slot],
              status: "searching",
              raw_payload: body,
            })
            .select()
            .single();

          if (bookingError) {
            console.error("Failed to create booking request:", bookingError);
          } else {
            bookingId = newBooking.id;
          }
        } else {
          // Update existing booking request
          await supabase
            .from("booking_requests")
            .update({ status: "searching", updated_at: new Date().toISOString() })
            .eq("id", bookingId);
        }

        await logBookingEvent(supabase, orgId, bookingId, "book_requested", {
          customer,
          service_key,
          address,
          zip,
          slot,
          notes,
        });

        // If Integration Service is not configured, simulate booking
        if (!INTEGRATION_SERVICE_URL) {
          console.log("Integration Service not configured - simulating booking");
          
          // Simulate 80% success rate
          const success = Math.random() > 0.2;
          
          if (success) {
            const mockResult = {
              status: "booked",
              jobber_client_id: `mock_client_${Date.now()}`,
              jobber_visit_id: `mock_visit_${Date.now()}`,
              scheduled_start: slot.start,
              scheduled_end: slot.end,
            };

            // Update booking request
            if (bookingId) {
              await supabase
                .from("booking_requests")
                .update({
                  status: "booked",
                  jobber_client_id: mockResult.jobber_client_id,
                  jobber_visit_id: mockResult.jobber_visit_id,
                  scheduled_start: mockResult.scheduled_start,
                  scheduled_end: mockResult.scheduled_end,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", bookingId);
            }

            await logBookingEvent(supabase, orgId, bookingId, "book_success", mockResult);

            return new Response(JSON.stringify(mockResult), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          } else {
            const failureResult = {
              status: "needs_followup",
              error: "Mock failure - no availability in Jobber",
            };

            // Update booking request
            if (bookingId) {
              await supabase
                .from("booking_requests")
                .update({
                  status: "needs_followup",
                  last_error: failureResult.error,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", bookingId);
            }

            // Create follow-up
            await createFollowup(
              supabase,
              orgId,
              bookingId,
              `Booking failed: ${failureResult.error}\nCustomer: ${customer.name} (${customer.phone})\nService: ${service_key}\nAddress: ${address}, ${zip}`,
              "high"
            );

            await logBookingEvent(supabase, orgId, bookingId, "book_failed", failureResult);

            return new Response(JSON.stringify(failureResult), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // Forward to Integration Service with HMAC signature
        try {
          const payload = JSON.stringify(body);
          const signature = await signRequest(payload, INTEGRATION_SERVICE_HMAC_SECRET || "");

          const response = await fetch(`${INTEGRATION_SERVICE_URL}/book`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-IGY6-Signature": signature,
            },
            body: payload,
          });

          const data = await response.json();

          // Update booking request based on result
          if (bookingId) {
            const updateData: any = {
              status: data.status,
              updated_at: new Date().toISOString(),
            };

            if (data.status === "booked") {
              updateData.jobber_client_id = data.jobber_client_id;
              updateData.jobber_visit_id = data.jobber_visit_id;
              updateData.scheduled_start = data.scheduled_start;
              updateData.scheduled_end = data.scheduled_end;
            } else if (data.status === "failed" || data.status === "needs_followup") {
              updateData.last_error = data.error;
              updateData.status = "needs_followup";

              // Create automatic follow-up
              await createFollowup(
                supabase,
                orgId,
                bookingId,
                `Booking failed: ${data.error}\nCustomer: ${customer.name} (${customer.phone})\nService: ${service_key}\nAddress: ${address}, ${zip}`,
                "high"
              );
            }

            await supabase
              .from("booking_requests")
              .update(updateData)
              .eq("id", bookingId);
          }

          await logBookingEvent(supabase, orgId, bookingId, 
            data.status === "booked" ? "book_success" : "book_failed", 
            data
          );

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("Integration Service error:", error);

          // Update booking request with error
          if (bookingId) {
            await supabase
              .from("booking_requests")
              .update({
                status: "needs_followup",
                last_error: error.message,
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);

            // Create follow-up for error
            await createFollowup(
              supabase,
              orgId,
              bookingId,
              `Integration Service error: ${error.message}\nCustomer: ${customer.name} (${customer.phone})\nService: ${service_key}\nAddress: ${address}, ${zip}`,
              "high"
            );
          }

          await logBookingEvent(supabase, orgId, bookingId, "book_error", {
            error: error.message,
          });

          return new Response(
            JSON.stringify({
              status: "needs_followup",
              error: error.message,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
          );
        }
      }

      case "/followup/create": {
        if (req.method !== "POST") {
          return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
          );
        }

        const { booking_request_id, priority = "normal", notes } = body;

        if (!orgId || !notes) {
          return new Response(
            JSON.stringify({ error: "Missing required fields", required: ["org_id", "notes"] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        const followup = await createFollowup(supabase, orgId, booking_request_id, notes, priority);

        if (!followup) {
          return new Response(
            JSON.stringify({ error: "Failed to create follow-up" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ followup_id: followup.id, status: "open" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Not found", path }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
    }
  } catch (error: any) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
