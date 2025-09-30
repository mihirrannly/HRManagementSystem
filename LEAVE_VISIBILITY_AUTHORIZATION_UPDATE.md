# Leave Visibility and Authorization Update

## Requirements Implemented
Based on the user requirement: "All the leaves should be visible to all the admins and the HR. But only the Manager of that employee who applied the leave can approve the leave along with the HR"

## Changes Made

### 1. Enhanced Visibility Rules ✅

**Backend Changes (`server/routes/leave.js`):**
- **Admins and HR can VIEW ALL leave requests** - No filter applied for admin/hr roles
- **Managers can VIEW their team members' requests** - Filter by reporting manager
- **Employees can VIEW only their own requests** - Filter by employee ID

**Code Location:** Lines 477-481
```javascript
} else if (req.user.role === 'hr' || req.user.role === 'admin') {
  // HR and Admins can see ALL leave requests
  // No filter applied - they see everything
  console.log(`📋 ${req.user.role.toUpperCase()} user viewing all leave requests`);
}
```

### 2. Restricted Approval Authorization ✅

**Backend Changes (`server/routes/leave.js`):**

**Manager Authorization (Lines 591-613):**
- **Only the SPECIFIC reporting manager** can approve manager approvals
- **Other managers CANNOT approve** requests from employees who don't report to them
- Strict validation: `leaveRequest.employee.employmentInfo.reportingManager?.toString() === approverEmployee._id.toString()`

**HR Authorization (Lines 615-633):**
- **Only employees with HR role** can approve HR approvals
- **Admins CANNOT approve** any leave requests (view only)
- Clear separation between viewing and approval permissions

**Admin Restriction:**
- **Admins can VIEW all requests** but **CANNOT APPROVE any requests**
- Clear error message: "Admins can view all leave requests but cannot approve them"

### 3. Frontend Updates ✅

**Frontend Changes (`client/src/pages/Leave/Leave.jsx`):**

**Approval Button Logic (Lines 163-201):**
- **Admins**: `return false` - No approval buttons shown
- **HR**: Can only approve HR approvals that are pending
- **Managers**: Can only approve manager approvals for their direct reports

**Visual Indicators (Lines 420-426):**
- **Admin users see "👁️ View Only"** message instead of approval buttons
- **Tooltip explains**: "Admins can view all leave requests but cannot approve them"

### 4. Leave Request Creation ✅

**Approval Flow Setup (Lines 381-398):**
- **Only HR employees** (not admins) are added to approval flow
- **Specific reporting manager** is added for manager approval
- **Warning logged** if no HR employee found

## Authorization Matrix

| Role | View Own Requests | View Team Requests | View All Requests | Approve Manager | Approve HR |
|------|------------------|-------------------|------------------|----------------|------------|
| **Employee** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Manager** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes (if reporting manager) | ❌ No |
| **HR** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |

## Key Features

### ✅ Enhanced Visibility
- **Admins and HR see ALL leave requests** across the organization
- **Comprehensive oversight** for administrative roles
- **No filtering restrictions** for admin/hr roles

### ✅ Strict Approval Control
- **Only specific reporting manager** can approve manager approvals
- **Only HR employees** can approve HR approvals
- **Admins have view-only access** - cannot approve any requests

### ✅ Clear User Experience
- **"View Only" indicator** for admins on pending requests
- **Detailed error messages** explaining authorization restrictions
- **Tooltips and visual cues** to guide user understanding

### ✅ Security & Compliance
- **Role-based access control** with clear boundaries
- **Audit trail maintained** with specific approver information
- **Prevents unauthorized approvals** while maintaining visibility

## Error Messages

### For Admins:
- "Admins can view all leave requests but cannot approve them. Only the reporting manager and HR can approve leave requests."

### For Managers:
- "You are not the reporting manager for [Employee Name]. Only the direct reporting manager can approve this leave request."

### For HR:
- "You are not listed as the HR approver in the approval flow for this request."

## Testing Results ✅

**Visibility Tests:**
- ✅ Admins can view all leave requests
- ✅ HR can view all leave requests  
- ✅ Managers can view team requests
- ✅ Employees can view own requests

**Authorization Tests:**
- ✅ Mihir (Admin) cannot approve any requests
- ✅ HR can approve HR approvals
- ✅ Reporting managers can approve manager approvals
- ✅ Non-reporting managers cannot approve

**Frontend Tests:**
- ✅ Admin users see "View Only" instead of approval buttons
- ✅ Appropriate tooltips and error messages displayed
- ✅ Authorization restrictions properly enforced

## Summary

The system now perfectly implements the requirement:
- **"All the leaves should be visible to all the admins and the HR"** ✅
- **"But only the Manager of that employee who applied the leave can approve the leave along with the HR"** ✅

Admins have full visibility for oversight purposes but cannot interfere with the approval process, ensuring proper authorization hierarchy is maintained.
