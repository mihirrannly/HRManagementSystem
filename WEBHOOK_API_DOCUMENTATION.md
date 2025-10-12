# Webhook API Documentation

## Overview
This document describes the webhook API endpoint for receiving attendance data in the Rannkly HR Management system.

## Endpoint Details

### POST /api/webhook/attendance

Receives attendance data via webhook with secure authentication.

**URL:** `http://localhost:5001/api/webhook/attendance`

**Method:** `POST`

**Authentication:** Required via `x-auth-key` header

---

## Authentication

The endpoint is secured using a custom auth key passed in the request header.

### Header Required:
```
x-auth-key: your-secure-webhook-auth-key-here
```

### Setup:
1. Add the following to your `.env` file:
   ```
   ATTENDANCE_AUTH_KEY=your-secure-webhook-auth-key-here
   ```
2. Replace `your-secure-webhook-auth-key-here` with a strong, unique key
3. Use this same key in the `x-auth-key` header when making requests

---

## Request Format

### Headers
```
Content-Type: application/json
x-auth-key: your-secure-webhook-auth-key-here
```

### Body
The request body can be any valid JSON. Examples:

**Single Attendance Record:**
```json
{
  "employeeId": "EMP001",
  "date": "2025-10-10",
  "checkIn": "09:00:00",
  "checkOut": "18:00:00",
  "status": "present"
}
```

**Multiple Attendance Records:**
```json
[
  {
    "employeeId": "EMP001",
    "date": "2025-10-10",
    "checkIn": "09:00:00",
    "checkOut": "18:00:00",
    "status": "present"
  },
  {
    "employeeId": "EMP002",
    "date": "2025-10-10",
    "checkIn": "09:15:00",
    "checkOut": "18:30:00",
    "status": "present"
  }
]
```

---

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Webhook received successfully",
  "data": {
    "received": true,
    "timestamp": "2025-10-10T12:00:00.000Z",
    "recordCount": 1
  }
}
```

### Error Responses

**401 Unauthorized - Missing Auth Key:**
```json
{
  "success": false,
  "message": "Authentication failed. No auth key provided.",
  "error": "Missing x-auth-key header"
}
```

**401 Unauthorized - Invalid Auth Key:**
```json
{
  "success": false,
  "message": "Authentication failed. Invalid auth key.",
  "error": "Invalid x-auth-key header"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error processing webhook data",
  "error": "Error details (in development mode)"
}
```

---

## Testing the Endpoint

### Using cURL:

**Test with valid auth key:**
```bash
curl -X POST http://localhost:5001/api/webhook/attendance \
  -H "Content-Type: application/json" \
  -H "x-auth-key: your-secure-webhook-auth-key-here" \
  -d '{
    "employeeId": "EMP001",
    "date": "2025-10-10",
    "checkIn": "09:00:00",
    "checkOut": "18:00:00",
    "status": "present"
  }'
```

**Test without auth key (should fail):**
```bash
curl -X POST http://localhost:5001/api/webhook/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "date": "2025-10-10"
  }'
```

**Test with invalid auth key (should fail):**
```bash
curl -X POST http://localhost:5001/api/webhook/attendance \
  -H "Content-Type: application/json" \
  -H "x-auth-key: wrong-key" \
  -d '{
    "employeeId": "EMP001",
    "date": "2025-10-10"
  }'
```

### Using Postman:

1. Create a new POST request
2. Set URL: `http://localhost:5001/api/webhook/attendance`
3. Go to Headers tab:
   - Add `Content-Type`: `application/json`
   - Add `x-auth-key`: `your-secure-webhook-auth-key-here`
4. Go to Body tab:
   - Select `raw`
   - Select `JSON` format
   - Enter your JSON data
5. Click Send

### Using JavaScript/Node.js:

```javascript
const axios = require('axios');

async function sendWebhook() {
  try {
    const response = await axios.post(
      'http://localhost:5001/api/webhook/attendance',
      {
        employeeId: 'EMP001',
        date: '2025-10-10',
        checkIn: '09:00:00',
        checkOut: '18:00:00',
        status: 'present'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-key': 'your-secure-webhook-auth-key-here'
        }
      }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

sendWebhook();
```

---

## Health Check Endpoint

### GET /api/webhook/health

Check if the webhook service is operational.

**URL:** `http://localhost:5001/api/webhook/health`

**Method:** `GET`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "Webhook service is operational",
  "timestamp": "2025-10-10T12:00:00.000Z"
}
```

---

## Security Best Practices

1. **Strong Auth Key:** Use a long, random string as your auth key (minimum 32 characters)
2. **Keep Secret:** Never commit your `.env` file or expose the auth key
3. **Rotate Keys:** Regularly update the `ATTENDANCE_AUTH_KEY` value
4. **HTTPS:** In production, always use HTTPS to encrypt data in transit
5. **IP Whitelisting:** Consider adding IP restrictions in production
6. **Rate Limiting:** The endpoint is protected by the global rate limiter (5000 requests per 15 minutes)

---

## Logging

The webhook endpoint logs all incoming requests to the console:
- Timestamp of the request
- Request body (JSON formatted)
- Request headers (content-type and user-agent)
- Authentication success/failure

Check your server logs to see the received webhook data.

---

## Next Steps

Currently, the endpoint logs the received data and returns a success response. To implement full attendance processing:

1. Add data validation for the received attendance records
2. Parse and validate employee IDs
3. Process attendance data and store in the database
4. Handle conflicts and duplicates
5. Send notifications if required
6. Return detailed processing results

---

## Support

For issues or questions, check the server logs for detailed error messages. All webhook-related logs are prefixed with emojis for easy identification:
- ✅ Success messages
- ⚠️ Warning messages
- ❌ Error messages
- 📥 Incoming webhook data

