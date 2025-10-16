# Leave Monthly Limit Fix - October 2025

## Issue Reported

**Problem:** Users were able to apply for more than the monthly limit of casual leaves (e.g., 5 casual leaves in the same month when only 1-3 should be allowed).

**Root Cause:** The system was only tracking "used" (approved) leaves in monthly usage, but not "pending" (awaiting approval) leaves. This allowed users to submit multiple leave requests in the same month because the validation only checked approved leaves.

---

## Solution Implemented

### Changes Made

#### 1. **Database Schema Update** (`server/models/Leave.js`)

Added pending leave tracking to monthly usage:

```javascript
monthlyUsage: [{
  month: { type: Number, required: true },
  casualUsed: { type: Number, default: 0 },
  casualPending: { type: Number, default: 0 },  // ✨ NEW
  sickUsed: { type: Number, default: 0 },
  sickPending: { type: Number, default: 0 },    // ✨ NEW
  specialUsed: { type: Number, default: 0 },
  specialPending: { type: Number, default: 0 }, // ✨ NEW
  casualAllocated: { type: Number, default: 1 },
  casualCarryForward: { type: Number, default: 0 },
  sickAllocated: { type: Number, default: 1 }
}]
```

#### 2. **Utility Function Update** (`server/utils/leaveUtils.js`)

Updated `calculateMonthlyAvailableLeaves()` to subtract pending leaves:

**Before:**
```javascript
const casualAvailable = currentMonthUsage.casualAllocated + casualCarryForward - currentMonthUsage.casualUsed;
```

**After:**
```javascript
const casualAvailable = currentMonthUsage.casualAllocated + casualCarryForward 
                       - currentMonthUsage.casualUsed 
                       - (currentMonthUsage.casualPending || 0);  // ✨ Subtract pending too!
```

#### 3. **Leave Request Submission** (`server/routes/leave.js`)

When a leave request is submitted, now updates monthly pending:

```javascript
// Update monthly pending
let monthlyUsage = balance.monthlyUsage.find(m => m.month === requestMonth);
if (!monthlyUsage) {
  monthlyUsage = { 
    month: requestMonth, 
    casualUsed: 0, 
    casualPending: 0,
    // ... other fields
  };
  balance.monthlyUsage.push(monthlyUsage);
}
monthlyUsage.casualPending = (monthlyUsage.casualPending || 0) + totalDays;
```

#### 4. **Leave Approval Flow** (`server/routes/leave.js`)

When a leave is approved, move from pending to used:

```javascript
// Move from pending to used
monthlyUsage.casualUsed += leaveRequest.totalDays;
monthlyUsage.casualPending = Math.max(0, (monthlyUsage.casualPending || 0) - leaveRequest.totalDays);
```

#### 5. **Leave Rejection Flow** (`server/routes/leave.js`)

When a leave is rejected, return pending balance:

```javascript
// Return pending balance
monthlyUsage.casualPending = Math.max(0, (monthlyUsage.casualPending || 0) - leaveRequest.totalDays);
```

#### 6. **Frontend Display** (`client/src/pages/Leave/Leave.jsx`)

Updated UI to show pending leaves in monthly view:

```jsx
<Typography variant="caption" display="block" color="text.secondary">
  Used: {balance.monthly.used || 0}
  {balance.monthly.pending > 0 && (
    <span style={{ color: 'orange', fontWeight: 'bold' }}>
      {' '}| Pending: {balance.monthly.pending}
    </span>
  )}
</Typography>
```

---

## How It Works Now

### Validation Flow

1. **User submits leave request** (e.g., 3 casual leaves)
   - System checks: `availableBalance = allocated + carryForward - used - pending`
   - If sufficient: Creates request and marks as "pending"
   - Monthly pending is updated: `casualPending += 3`

2. **User tries to submit another request** (e.g., 2 more casual leaves)
   - System recalculates: `availableBalance = 1 + 0 - 0 - 3 = -2` (negative!)
   - Validation fails: "Insufficient casual leave for this month"
   - Request is rejected ❌

3. **First request is approved**
   - Moves from pending to used: `casualUsed += 3`, `casualPending -= 3`
   - Now: `used = 3`, `pending = 0`
   - Next month starts fresh with new allocation

4. **First request is rejected**
   - Returns pending balance: `casualPending -= 3`
   - Now: `used = 0`, `pending = 0`
   - User can submit another request

---

## Example Scenarios

### Scenario 1: Multiple Requests in Same Month (Now Blocked)

| Action | Used | Pending | Available | Result |
|--------|------|---------|-----------|--------|
| Start of month | 0 | 0 | 1 | - |
| Request 1: 1 casual | 0 | 1 | 0 | ✅ Submitted |
| Request 2: 1 casual | 0 | 1 | 0 | ❌ **BLOCKED** (0 available) |

**Message:** "Insufficient casual leave for this month. Available: 0 day(s), Requested: 1 day(s)"

### Scenario 2: Reject and Resubmit

| Action | Used | Pending | Available | Result |
|--------|------|---------|-----------|--------|
| Start of month | 0 | 0 | 1 | - |
| Request 1: 1 casual | 0 | 1 | 0 | ✅ Submitted |
| Request 1 rejected | 0 | 0 | 1 | Pending returned |
| Request 2: 1 casual | 0 | 1 | 0 | ✅ Submitted |

### Scenario 3: With Carry Forward

| Action | Used | Pending | Available | Result |
|--------|------|---------|-----------|--------|
| Start of month (with 2 carry forward) | 0 | 0 | 3 | - |
| Request 1: 2 casual | 0 | 2 | 1 | ✅ Submitted |
| Request 2: 1 casual | 0 | 3 | 0 | ✅ Submitted |
| Request 3: 1 casual | 0 | 3 | 0 | ❌ **BLOCKED** |

---

## UI Changes

### Leave Balance Card - Monthly Section

**Before:**
- Only showed total available
- Didn't indicate pending requests
- Confusing why balance seemed incorrect

**After:**
```
This Month (October)
3 / 3 available
Base: 1 + 2 carry forward
Used: 0 | Pending: 2  ← 🆕 Shows pending!
```

Now users can clearly see:
- How many leaves are pending approval
- Why their available balance is reduced
- Total monthly allocation breakdown

---

## Testing Checklist

- [x] User cannot submit more leaves than monthly limit
- [x] Pending leaves are tracked in monthly usage
- [x] Approved leaves move from pending to used
- [x] Rejected leaves return pending balance
- [x] Carry forward logic still works correctly
- [x] UI displays pending leaves in orange
- [x] Multiple leave types tracked separately
- [x] Monthly limits reset each month

---

## Migration Notes

### For Existing Data

Existing `monthlyUsage` records won't have `casualPending`, `sickPending`, or `specialPending` fields. The code handles this gracefully:

```javascript
monthlyUsage.casualPending = (monthlyUsage.casualPending || 0) + totalDays;
```

The `|| 0` ensures that undefined values are treated as 0.

### No Database Migration Required

The schema change is additive (new optional fields with defaults), so no data migration is needed. Existing records will work fine and will be updated as new requests are created.

---

## API Response Changes

### GET /api/leave/balance

**New Response Format:**

```json
{
  "balances": [
    {
      "_id": "casual",
      "leaveType": { "name": "Casual Leave", "code": "CL", "color": "#4CAF50" },
      "allocated": 12,
      "used": 2,
      "pending": 1,
      "available": 9,
      "monthly": {
        "total": 1,
        "available": 0,
        "used": 0,
        "pending": 1,  // ✨ NEW
        "carryForward": 0,
        "base": 1
      }
    }
  ],
  "currentMonth": "October",
  "currentYear": 2025
}
```

---

## Related Documentation

- [LEAVE_CARRY_FORWARD_SYSTEM.md](LEAVE_CARRY_FORWARD_SYSTEM.md) - Main carry forward documentation
- [LEAVE_CARRY_FORWARD_QUICK_REFERENCE.md](LEAVE_CARRY_FORWARD_QUICK_REFERENCE.md) - User guide

---

## Issue Resolution

✅ **FIXED:** Users can now only apply for leaves within their monthly limit
✅ **IMPROVED:** System properly tracks pending leaves
✅ **ENHANCED:** UI shows pending leaves for better transparency

---

**Last Updated:** October 15, 2025  
**Fixed By:** HR Management System Development Team  
**Issue:** Monthly leave limit validation not considering pending requests

