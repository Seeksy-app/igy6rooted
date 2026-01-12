# ElevenLabs Agent Tool Configuration for IGY6 Rooted

This document describes how to configure the ElevenLabs Conversational AI agent to use the Jobber scheduling tools.

## Base Configuration

The agent should be configured in the ElevenLabs web console with the following tools:

### Tool 1: get_availability

**Description**: Get available appointment slots for a service type and location.

**HTTP Configuration**:
- Method: `POST`
- URL: `https://hogskywqiunvpaseryci.supabase.co/functions/v1/jobber-api/availability`

**Headers**:
```
Content-Type: application/json
x-org-id: {{ORG_ID}}
x-conversation-id: {{conversation_id}}
x-igy6-timestamp: {{current_timestamp}}
x-igy6-signature: {{hmac_signature}}
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| service_type | string | Yes | Type of service (e.g., "lawn_mowing", "landscaping") |
| zip | string | Yes | ZIP code for the service location |
| date_from | string | Yes | Start date in ISO 8601 format |
| date_to | string | Yes | End date in ISO 8601 format |
| org_id | string | Yes | Organization ID |

**Example Request**:
```json
{
  "service_type": "lawn_mowing",
  "zip": "78701",
  "date_from": "2026-01-15T00:00:00Z",
  "date_to": "2026-01-17T23:59:59Z",
  "org_id": "your-org-uuid"
}
```

**Example Response**:
```json
{
  "org_id": "...",
  "timezone": "America/Chicago",
  "service_type": "lawn_mowing",
  "duration_minutes": 120,
  "slots": [
    { "start": "2026-01-15T09:00:00Z", "end": "2026-01-15T11:00:00Z", "confidence": 0.9 },
    { "start": "2026-01-15T14:00:00Z", "end": "2026-01-15T16:00:00Z", "confidence": 0.9 }
  ]
}
```

---

### Tool 2: book_appointment

**Description**: Book an appointment for a customer at a specific time slot.

**HTTP Configuration**:
- Method: `POST`
- URL: `https://hogskywqiunvpaseryci.supabase.co/functions/v1/jobber-api/book`

**Headers**:
```
Content-Type: application/json
x-org-id: {{ORG_ID}}
x-conversation-id: {{conversation_id}}
x-igy6-timestamp: {{current_timestamp}}
x-igy6-signature: {{hmac_signature}}
```

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| customer_name | string | Yes | Full name of the customer |
| phone | string | Yes | Customer phone number |
| email | string | No | Customer email address |
| service_type | string | Yes | Type of service |
| address | string | Yes | Full service address |
| slot_start | string | Yes | Start time in ISO 8601 format |
| slot_end | string | Yes | End time in ISO 8601 format |
| notes | string | No | Additional notes or instructions |
| org_id | string | Yes | Organization ID |

**Example Request**:
```json
{
  "customer_name": "John Smith",
  "phone": "512-555-1234",
  "email": "john@example.com",
  "service_type": "lawn_mowing",
  "address": "123 Main St, Austin, TX 78701",
  "slot_start": "2026-01-15T09:00:00Z",
  "slot_end": "2026-01-15T11:00:00Z",
  "notes": "Gate code is 1234",
  "org_id": "your-org-uuid"
}
```

**Success Response**:
```json
{
  "status": "booked",
  "booking_id": "uuid",
  "jobber_record_ids": {
    "clientId": "...",
    "requestId": "...",
    "jobId": "...",
    "visitId": "..."
  },
  "confirmation": {
    "customer_name": "John Smith",
    "service_type": "lawn_mowing",
    "address": "123 Main St, Austin, TX 78701",
    "scheduled_start": "2026-01-15T09:00:00Z",
    "scheduled_end": "2026-01-15T11:00:00Z",
    "message": "Your lawn mowing appointment is confirmed for Wednesday, January 15 at 9:00 AM."
  }
}
```

**Failure Response (with fallback)**:
```json
{
  "status": "needs_followup",
  "error": "Unable to create appointment in Jobber",
  "message": "I apologize, but I couldn't complete the booking. A team member will call you back shortly to confirm your appointment."
}
```

---

## Agent Prompt Configuration

Add this to your ElevenLabs agent system prompt:

```
You are an AI scheduling assistant for IGY6 Rooted, a lawn care and landscaping company.

Your primary job is to help callers schedule appointments. Follow these steps:

1. GREET the caller warmly and ask how you can help
2. GATHER information:
   - What service do they need?
   - What is their address or ZIP code?
   - When would they prefer to schedule?
3. CHECK AVAILABILITY using the get_availability tool
4. OFFER 2-3 available time slots
5. CONFIRM the caller's choice
6. COLLECT their information:
   - Full name
   - Phone number (confirm the one they're calling from)
   - Email (optional)
   - Any special instructions or gate codes
7. BOOK the appointment using the book_appointment tool
8. CONFIRM the booking with date, time, and what to expect

If booking fails or no slots are available:
- Reassure the caller that a team member will call them back
- Confirm their contact information
- Thank them for their patience

Always be friendly, professional, and helpful. If you're unsure about something, ask clarifying questions.

Available services:
- Lawn Mowing
- Landscaping
- Fertilization
- Weed Control
- Tree Trimming
- Leaf Removal
- Seasonal Cleanup
```

---

## HMAC Signature Generation

For secure tool calls, generate signatures like this:

```javascript
const timestamp = Math.floor(Date.now() / 1000).toString();
const payload = JSON.stringify(requestBody);
const message = `${timestamp}.${payload}`;
const signature = HMAC_SHA256(ELEVENLABS_HMAC_SECRET, message);
```

The signature should be sent as a hex-encoded string in the `x-igy6-signature` header.

---

## Testing the Integration

1. **Test Health Check**:
   ```bash
   curl "https://hogskywqiunvpaseryci.supabase.co/functions/v1/jobber-api/health?org_id=YOUR_ORG_ID"
   ```

2. **Test Availability**:
   ```bash
   curl -X POST "https://hogskywqiunvpaseryci.supabase.co/functions/v1/jobber-api/availability" \
     -H "Content-Type: application/json" \
     -d '{
       "org_id": "YOUR_ORG_ID",
       "service_type": "lawn_mowing",
       "zip": "78701",
       "date_from": "2026-01-15",
       "date_to": "2026-01-17"
     }'
   ```

3. **Test Booking**:
   ```bash
   curl -X POST "https://hogskywqiunvpaseryci.supabase.co/functions/v1/jobber-api/book" \
     -H "Content-Type: application/json" \
     -d '{
       "org_id": "YOUR_ORG_ID",
       "customer_name": "Test Customer",
       "phone": "512-555-0000",
       "service_type": "lawn_mowing",
       "address": "123 Test St, Austin, TX 78701",
       "slot_start": "2026-01-15T09:00:00Z",
       "slot_end": "2026-01-15T11:00:00Z"
     }'
   ```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Jobber not connected" | OAuth not completed | Admin must connect Jobber in the dashboard |
| "Invalid signature" | HMAC mismatch | Check secret and signature algorithm |
| "Missing org_id" | No org context | Ensure org_id is passed in request |
| "No slots available" | Calendar full or outside business hours | Check business hours configuration |
