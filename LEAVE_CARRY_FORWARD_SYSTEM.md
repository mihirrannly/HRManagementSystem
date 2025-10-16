# Leave Carry Forward System - Complete Guide

## Overview

The HR Management System now features an intelligent leave carry-forward system that rewards employees for not using their casual leaves. This document explains how the system works, its implementation, and how to use it.

---

## 🎯 Key Features

### Monthly Leave Allocation

**Base Allocation (Every Month):**
- **1 Casual Leave** per month
- **1 Sick Leave** per month

### Carry Forward Rules

**Casual Leaves:**
- ✅ **Carry forward enabled**
- If an employee doesn't use their casual leave for **2 consecutive months**, they receive **extra leaves** in the 3rd month
- Maximum carry forward: **2 leaves** (from 2 unused months)

**Example Scenarios:**

| Scenario | June | July | August Result |
|----------|------|------|---------------|
| No leaves used | 0 used | 0 used | **3 casual leaves** (1 base + 2 carry forward) |
| Used June only | 1 used | 0 used | **2 casual leaves** (1 base + 1 carry forward) |
| Used both months | 1 used | 1 used | **1 casual leave** (1 base only) |
| Used July only | 0 used | 1 used | **2 casual leaves** (1 base + 1 carry forward) |

**Sick Leaves:**
- ❌ **No carry forward**
- Always 1 sick leave per month, regardless of previous usage
- Sick leaves don't accumulate

**Special Leaves (Marriage/Bereavement):**
- ❌ **No carry forward**
- No monthly limits
- Only yearly allocation applies (3 days per year)

---

## 📊 How It Works

### Calculation Logic

The system checks the previous two months' usage for casual leaves:

```
Month N casual leaves = Base (1) + Carry Forward

Where Carry Forward is calculated as:
- If Month N-2 unused AND Month N-1 unused: Carry Forward = 2
- If Month N-2 unused OR Month N-1 unused: Carry Forward = 1
- If both months used: Carry Forward = 0
```

### Monthly Timeline Example (2025)

| Month | Base | Unused from Jan | Unused from Feb | Total Available |
|-------|------|----------------|----------------|-----------------|
| **January** | 1 | - | - | **1** (start of year) |
| **February** | 1 | - | - | **1** (only 1 previous month) |
| **March** | 1 | ✓ (if unused) | ✓ (if unused) | **3** (if Jan & Feb unused) |
| **April** | 1 | - | ✓ (if unused) | **2** (if Feb & Mar unused) |

### Edge Cases

1. **Start of Year (January):**
   - No carry forward (no previous months in the year)
   - Only base allocation: 1 casual leave

2. **Second Month (February):**
   - Can carry forward from January only
   - Maximum: 1 base + 1 carry forward = 2 leaves

3. **Mid-Year onwards (March+):**
   - Full carry-forward logic applies
   - Maximum: 1 base + 2 carry forward = 3 leaves

---

## 💻 Technical Implementation

### Backend Components

#### 1. Database Schema Updates

**File:** `server/models/Leave.js`

```javascript
monthlyUsage: [{
  month: { type: Number, required: true }, // 1-12
  casualUsed: { type: Number, default: 0 },
  sickUsed: { type: Number, default: 0 },
  specialUsed: { type: Number, default: 0 },
  casualAllocated: { type: Number, default: 1 }, // Base monthly allocation
  casualCarryForward: { type: Number, default: 0 }, // Carry forward amount
  sickAllocated: { type: Number, default: 1 } // Base monthly allocation
}]
```

#### 2. Utility Functions

**File:** `server/utils/leaveUtils.js`

Three main functions:

1. **`calculateMonthlyAvailableLeaves(leaveBalance, currentMonth, currentYear)`**
   - Calculates available leaves for a specific month
   - Determines carry-forward amount
   - Returns: `{ casualAvailable, sickAvailable, casualCarryForward, ... }`

2. **`getMonthlyLeaveSummary(leaveBalance, currentMonth, currentYear)`**
   - Formats leave data for display
   - Returns monthly and yearly balance information

3. **`validateMonthlyLeaveRequest(leaveBalance, leaveType, requestedDays, requestMonth, requestYear)`**
   - Validates leave requests against monthly limits
   - Checks both monthly and yearly balances
   - Returns: `{ valid, message, availableBalance }`

#### 3. API Endpoints

**Endpoint:** `GET /api/leave/balance`

**Response Format:**
```json
{
  "balances": [
    {
      "_id": "casual",
      "leaveType": { "name": "Casual Leave", "code": "CL", "color": "#4CAF50" },
      "allocated": 12,
      "used": 2,
      "pending": 0,
      "available": 10,
      "monthly": {
        "total": 3,
        "available": 3,
        "used": 0,
        "carryForward": 2,
        "base": 1
      }
    },
    {
      "_id": "sick",
      "leaveType": { "name": "Sick Leave", "code": "SL", "color": "#FF9800" },
      "allocated": 12,
      "used": 1,
      "pending": 0,
      "available": 11,
      "monthly": {
        "total": 1,
        "available": 1,
        "used": 0,
        "base": 1
      }
    }
  ],
  "currentMonth": "October",
  "currentYear": 2025
}
```

**Endpoint:** `POST /api/leave/request`

**Validation:**
- Checks monthly available balance with carry-forward
- Validates against yearly balance
- Returns clear error messages if limits exceeded

### Frontend Components

#### 1. Leave Balance Display

**File:** `client/src/pages/Leave/Leave.jsx`

**Features:**
- Shows current month and year
- Displays monthly allocation with carry-forward breakdown
- Highlights carried forward leaves with success badge
- Shows both monthly and yearly balances

**UI Sections:**

1. **Monthly Section (Highlighted):**
   - Current month's available leaves
   - Base allocation
   - Carry forward amount (if any)
   - Special badge for carry forward bonuses

2. **Yearly Section:**
   - Total yearly allocation
   - Used and pending leaves
   - Progress bar showing usage

---

## 🎨 User Interface

### Leave Balance Cards

Each leave type displays:

```
┌─────────────────────────────────────┐
│ 🟢 Casual Leave                      │
│                                      │
│ This Month (October)                 │
│ ╔═══════════════════════════════╗   │
│ ║ 3 / 3 available               ║   │
│ ║ Base: 1 + 2 carry forward     ║   │
│ ║ 🎉 Extra 2 leave(s) carried!  ║   │
│ ╚═══════════════════════════════╝   │
│                                      │
│ Yearly Balance                       │
│ 10 available out of 12               │
│ Used: 2 | Pending: 0                 │
│ ████████░░░░ 17% used                │
└─────────────────────────────────────┘
```

### Visual Indicators

- **Green Badge:** Carry forward bonus notification
- **Color Coding:** Each leave type has distinct colors
- **Progress Bars:** Visual representation of yearly usage
- **Month Chip:** Shows current month and year

---

## 📝 Usage Examples

### Example 1: Standard Monthly Usage

**Employee:** John Doe
**Scenario:** Takes 1 casual leave every month

| Month | Action | Available Before | Available After |
|-------|--------|-----------------|-----------------|
| Jan | Takes 1 CL | 1 | 0 |
| Feb | Takes 1 CL | 1 | 0 |
| Mar | Takes 1 CL | 1 (no carry forward) | 0 |
| Apr | Takes 1 CL | 1 (no carry forward) | 0 |

**Result:** Regular usage, no bonuses

### Example 2: Smart Leave Planning

**Employee:** Jane Smith
**Scenario:** Strategic leave usage

| Month | Action | Available Before | Available After |
|-------|--------|-----------------|-----------------|
| Jan | No leave | 1 | 1 (used: 0) |
| Feb | No leave | 1 | 1 (used: 0) |
| Mar | Takes 3 CL | 3 (1 + 2 carry) | 0 |
| Apr | No leave | 1 | 1 (used: 0) |
| May | No leave | 1 | 1 (used: 0) |
| Jun | Takes 3 CL | 3 (1 + 2 carry) | 0 |

**Result:** Gets 3-day breaks by planning ahead!

### Example 3: Partial Carry Forward

**Employee:** Mike Johnson
**Scenario:** Mixed usage pattern

| Month | Action | Available Before | Available After |
|-------|--------|-----------------|-----------------|
| Jan | Takes 1 CL | 1 | 0 |
| Feb | No leave | 1 | 1 (used: 0) |
| Mar | No leave | 1 | 1 (used: 0) |
| Apr | Takes 2 CL | 2 (1 + 1 carry) | 0 |

**Result:** Gets 2 leaves in April (carry forward from Feb & Mar)

---

## 🔧 Configuration

### Customizing Allocation

To change monthly allocations, update these values in `server/models/Leave.js`:

```javascript
casualAllocated: { type: Number, default: 1 }, // Change base monthly casual leaves
sickAllocated: { type: Number, default: 1 }    // Change base monthly sick leaves
```

### Modifying Carry Forward Logic

To adjust carry forward rules, edit `server/utils/leaveUtils.js`:

```javascript
function calculateMonthlyAvailableLeaves(leaveBalance, currentMonth, currentYear) {
  // Modify these conditions to change carry forward behavior
  const month1NotUsed = !prevMonth1Usage || prevMonth1Usage.casualUsed === 0;
  const month2NotUsed = !prevMonth2Usage || prevMonth2Usage.casualUsed === 0;
  
  if (month1NotUsed && month2NotUsed) {
    casualCarryForward = 2; // Adjust carry forward amount
  }
}
```

---

## 🧪 Testing the System

### Manual Testing Steps

1. **Create Test Employee Account**
   ```bash
   # Login as test employee
   ```

2. **Check Initial Balance**
   - Navigate to Leave Management
   - Verify monthly allocation shows correctly
   - Confirm no carry forward in first month

3. **Test Carry Forward (Requires Time Travel or DB manipulation)**
   ```javascript
   // Update monthlyUsage in database for testing
   db.leavebalances.updateOne(
     { employee: ObjectId("employee_id") },
     { 
       $push: { 
         monthlyUsage: [
           { month: 1, casualUsed: 0, sickUsed: 0, specialUsed: 0, casualAllocated: 1, casualCarryForward: 0, sickAllocated: 1 },
           { month: 2, casualUsed: 0, sickUsed: 0, specialUsed: 0, casualAllocated: 1, casualCarryForward: 1, sickAllocated: 1 }
         ]
       }
     }
   )
   ```

4. **Test Leave Request**
   - Try requesting more leaves than monthly limit
   - Verify error message mentions carry forward
   - Request within limit and verify approval flow

### Automated Test Cases

```javascript
// Test case examples
describe('Leave Carry Forward System', () => {
  test('Should allow 1 casual leave in January', async () => {
    // Test base allocation
  });
  
  test('Should carry forward 2 leaves if unused for 2 months', async () => {
    // Test carry forward calculation
  });
  
  test('Should not carry forward sick leaves', async () => {
    // Test sick leave behavior
  });
  
  test('Should validate monthly limits correctly', async () => {
    // Test validation logic
  });
});
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Carry forward not showing**
   - **Cause:** Monthly usage data not initialized
   - **Solution:** Fetch balance again to initialize

2. **Wrong carry forward amount**
   - **Cause:** Previous months' data missing
   - **Solution:** Check `monthlyUsage` array in database

3. **Unable to request carried leaves**
   - **Cause:** Yearly balance insufficient
   - **Solution:** Verify both monthly and yearly balances

### Database Queries for Debugging

```javascript
// Check employee's leave balance
db.leavebalances.findOne({ 
  employee: ObjectId("employee_id"),
  year: 2025 
})

// View monthly usage breakdown
db.leavebalances.aggregate([
  { $match: { employee: ObjectId("employee_id") } },
  { $unwind: "$monthlyUsage" },
  { $project: { 
    month: "$monthlyUsage.month",
    casualUsed: "$monthlyUsage.casualUsed",
    casualCarryForward: "$monthlyUsage.casualCarryForward"
  }}
])
```

---

## 📈 Benefits

### For Employees

1. **Flexibility:** Can accumulate leaves for longer breaks
2. **Reward:** Incentivizes not taking unnecessary leaves
3. **Planning:** Encourages strategic leave planning
4. **Transparency:** Clear visibility of monthly allocations

### For Organization

1. **Attendance:** Encourages better attendance
2. **Planning:** Reduces last-minute leave requests
3. **Fairness:** Systematic and transparent policy
4. **Tracking:** Better leave pattern analysis

---

## 🔄 Future Enhancements

### Potential Improvements

1. **Annual Carry Forward**
   - Allow unused leaves to carry to next year (up to limit)

2. **Team-Based Limits**
   - Restrict concurrent leaves in same team

3. **Leave Encashment**
   - Allow employees to encash unused leaves

4. **Advanced Analytics**
   - Leave usage patterns and predictions
   - Team leave calendars
   - Shortage alerts

5. **Notifications**
   - Alert employees about carry forward opportunities
   - Remind about expiring carry forwards

6. **Calendar Integration**
   - Sync with Google/Outlook calendars
   - Team leave visibility

---

## 📚 Related Documentation

- [LEAVE_VISIBILITY_AUTHORIZATION_UPDATE.md](LEAVE_VISIBILITY_AUTHORIZATION_UPDATE.md) - Leave approval workflows
- [PERMISSION_SYSTEM_GUIDE.md](PERMISSION_SYSTEM_GUIDE.md) - Role-based access control
- [LEAVE_APPROVAL_FIX.md](LEAVE_APPROVAL_FIX.md) - Leave approval system

---

## 🆘 Support

### Questions?

- Check existing leave requests to see the system in action
- Review the UI - it clearly shows monthly vs yearly balances
- Inspect the API response for detailed breakdown

### Report Issues

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify database records
3. Check browser console for errors
4. Review server logs for validation errors

---

## 📜 Version History

### v1.0.0 (October 2025)
- Initial implementation of carry forward system
- Monthly allocation tracking
- UI updates for monthly/yearly display
- Validation logic for carry forward leaves

---

**Last Updated:** October 15, 2025
**Implemented By:** HR Management System Development Team

