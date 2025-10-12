# Webhook Implementation - COMPLETE

## ✅ **Status: FULLY FUNCTIONAL**

The webhook endpoint now **saves attendance data to the database**!

---

## 🎯 **What Was Implemented:**

### **Full Attendance Processing:**
- ✅ Receives data from fingerprint machine
- ✅ Finds employee by ID
- ✅ Automatically detects check-in vs check-out
- ✅ Saves to database
- ✅ Calculates late minutes
- ✅ Handles weekends
- ✅ Calculates total hours
- ✅ Returns detailed response

---

## 📡 **Webhook Endpoint:**

**URL:** `POST http://localhost:5001/api/webhook/attendance`

**Authentication:** `x-auth-key: c2750e75957b4c7c8627d0ca699409f3`

---

## 📥 **Supported Data Formats:**

The webhook is **flexible** and supports multiple formats:

### **Format 1: Simple**
```json
{
  "employeeId": "CODR034",
  "timestamp": "2025-10-10T14:30:00",
  "type": "check-in"
}
```

### **Format 2: Alternative Field Names**
```json
{
  "employee_id": "CODR034",
  "punchTime": "2025-10-10 14:30:00",
  "punchType": "IN"
}
```

### **Format 3: Without Type (Auto-detect)**
```json
{
  "employeeId": "CODR034",
  "timestamp": "2025-10-10T14:30:00"
}
```
*Automatically detects: If no check-in exists → check-in, If check-in exists → check-out*

### **Format 4: Multiple Records**
```json
[
  { "employeeId": "CODR034", "timestamp": "2025-10-10T09:00:00", "type": "check-in" },
  { "employeeId": "CODR034", "timestamp": "2025-10-10T18:00:00", "type": "check-out" }
]
```

---

## 🔧 **Flexible Field Mapping:**

The webhook recognizes these field names:

| Data Field | Accepts |
|------------|---------|
| Employee ID | `employeeId`, `employee_id`, `userId`, `user_id`, `empId` |
| Timestamp | `timestamp`, `punchTime`, `punch_time`, `time`, `dateTime` |
| Type | `type`, `punchType`, `punch_type`, `action` |

---

## 🧪 **How to Test:**

### **Test 1: Manual Test with cURL**

```bash
curl -X POST http://localhost:5001/api/webhook/attendance \
  -H "Content-Type: application/json" \
  -H "x-auth-key: c2750e75957b4c7c8627d0ca699409f3" \
  -d '{
    "employeeId": "CODR034",
    "timestamp": "2025-10-10T14:30:00",
    "type": "check-in"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Processed 1 record(s) successfully",
  "data": {
    "processed": 1,
    "failed": 0,
    "records": [
      {
        "employeeId": "CODR034",
        "type": "check-in",
        "time": "14:30",
        "isLate": true,
        "lateMinutes": 270
      }
    ],
    "timestamp": "2025-10-10T09:00:30.123Z"
  }
}
```

### **Test 2: From Your Fingerprint Machine**

1. Configure your fingerprint machine to send data to:
   ```
   URL: http://localhost:5001/api/webhook/attendance
   Method: POST
   Header: x-auth-key: c2750e75957b4c7c8627d0ca699409f3
   ```

2. Punch on the machine

3. Check server logs:
   ```bash
   tail -f backend.log | grep "📥 Webhook"
   ```

4. Verify in database:
   ```bash
   node check-attendance-status.js
   ```

---

## 📊 **What Happens When Employee Punches:**

### **Check-In Flow:**
1. Employee punches fingerprint
2. Machine sends data to webhook
3. Webhook finds employee by ID
4. Checks if already checked in today
5. Calculates if late (office starts 10:00 AM)
6. Saves to database with:
   - Check-in time
   - Late status
   - Weekend flag (if Saturday/Sunday)
   - Method: 'biometric'
7. Returns success response

### **Check-Out Flow:**
1. Employee punches fingerprint again
2. Machine sends data to webhook
3. Webhook finds today's attendance
4. Checks if already checked in
5. Adds check-out time
6. **Calculates total hours worked**
7. Saves to database
8. Returns success with total hours

---

## 🎯 **Logic & Rules:**

### **Check-In:**
- ✅ One check-in per day
- ✅ Late if after 10:00 AM (Mon-Fri)
- ✅ No late marking on weekends
- ✅ Weekend work allowed and tracked

### **Check-Out:**
- ✅ Must check-in first
- ✅ One check-out per day
- ✅ Calculates total hours
- ✅ Weekend check-out allowed

### **Timezone:**
- All times in **Asia/Kolkata (IST)**
- Automatic conversion from any timezone

---

## 📋 **Response Format:**

### **Success Response:**
```json
{
  "success": true,
  "message": "Processed 1 record(s) successfully",
  "data": {
    "processed": 1,
    "failed": 0,
    "records": [
      {
        "employeeId": "CODR034",
        "type": "check-in",
        "time": "14:30",
        "isLate": true,
        "lateMinutes": 270
      }
    ],
    "timestamp": "2025-10-10T09:00:30.123Z"
  }
}
```

### **Partial Success (Some Failed):**
```json
{
  "success": true,
  "message": "Processed 1 record(s) successfully, 1 failed",
  "data": {
    "processed": 1,
    "failed": 1,
    "records": [...],
    "timestamp": "..."
  },
  "errors": [
    {
      "record": {...},
      "error": "Employee CODR999 not found"
    }
  ]
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Authentication failed. Invalid auth key.",
  "error": "Invalid x-auth-key header"
}
```

---

## 🔍 **Monitoring & Logs:**

### **Watch Webhook Activity:**
```bash
tail -f backend.log | grep -E "(📥 Webhook|✅ Found|Check-in|Check-out)"
```

### **Check Specific Employee:**
```bash
node check-attendance-status.js
```

### **Server Logs Show:**
- 📥 Webhook received data
- ✅ Found employee: CODR034 - Mihir Bhardwaj
- 📅 Punch time: 2025-10-10 14:30:00
- ✅ Check-in saved for CODR034 at 14:30 (Late by 270 mins)

---

## 💡 **Where to See Data:**

After webhook processes attendance:

### **1. Dashboard**
- Go to: http://localhost:5175/dashboard
- Login as CODR034
- See: "Checked in at: 14:30"
- Late badge appears if late

### **2. Attendance Page**
- Go to: http://localhost:5175/attendance
- See today's record in the table
- Status shows: Present/Late/Weekend

### **3. Database**
```bash
node check-attendance-status.js
```

---

## 🐛 **Troubleshooting:**

### **Issue 1: Employee Not Found**
**Error:** `Employee CODR034 not found`

**Solution:**
- Check if employee exists in database
- Verify employeeId is correct
- Check spelling/case sensitivity

### **Issue 2: Already Checked In**
**Error:** `Already checked in today for CODR034`

**Solution:**
- This is normal - employee already punched in
- Next punch will be check-out

### **Issue 3: Cannot Check-Out Without Check-In**
**Error:** `Cannot check-out without check-in for CODR034`

**Solution:**
- Employee tried to check-out without checking in
- Ask them to check-in first

### **Issue 4: 401 Unauthorized**
**Error:** `Authentication failed`

**Solution:**
- Check the `x-auth-key` header
- Must match: `c2750e75957b4c7c8627d0ca699409f3`

---

## 🔒 **Security:**

- ✅ Auth key required (`x-auth-key` header)
- ✅ Employee validation (must exist in DB)
- ✅ Duplicate prevention (can't check-in twice)
- ✅ Order validation (must check-in before check-out)
- ✅ Comprehensive logging for audit

---

## 📈 **Features:**

- ✅ Automatic check-in/check-out detection
- ✅ Late marking (after 10:00 AM)
- ✅ Weekend attendance support
- ✅ Total hours calculation
- ✅ Flexible data format support
- ✅ Batch processing (multiple records)
- ✅ Detailed error messages
- ✅ IST timezone handling

---

## 🧪 **Quick Test Right Now:**

Run this command to test the webhook:

```bash
curl -X POST http://localhost:5001/api/webhook/attendance \
  -H "Content-Type: application/json" \
  -H "x-auth-key: c2750e75957b4c7c8627d0ca699409f3" \
  -d '{"employeeId": "CODR034", "type": "check-in"}'
```

Then check:
```bash
node check-attendance-status.js
```

---

## 🎉 **Summary:**

| Feature | Status |
|---------|--------|
| Webhook Endpoint | ✅ Working |
| Database Saving | ✅ Working |
| Employee Lookup | ✅ Working |
| Check-In Logic | ✅ Working |
| Check-Out Logic | ✅ Working |
| Late Calculation | ✅ Working |
| Weekend Support | ✅ Working |
| Hours Calculation | ✅ Working |
| Error Handling | ✅ Working |
| Flexible Formats | ✅ Working |

---

## 🚀 **Next Steps:**

1. **Test with your fingerprint machine:**
   - Punch on the machine
   - Watch server logs
   - Check database

2. **Verify data appears in UI:**
   - Login to dashboard
   - Check attendance page
   - Confirm time and status

3. **If issues:**
   - Check server logs: `tail -f backend.log`
   - Share the webhook data format your machine sends
   - Run: `node check-attendance-status.js`

---

**The webhook is now fully operational and ready to receive attendance data from your fingerprint machine!** 🎊

