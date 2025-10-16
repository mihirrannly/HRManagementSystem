# Permissions Fix - Quick Start Guide

## What Was Fixed

The "Edit Permissions" dialog now correctly auto-checks roles and displays permissions that are assigned to users.

## Changes Summary

1. **Backend**: API now includes both role-based AND custom permissions
2. **Database**: Ajeet has been assigned the "Manager" role 
3. **Database**: Manager role no longer includes "reports" permission
4. **Navigation**: Reports, Asset Management, and Exit Management are restricted to Admin/HR only

## How to Test

### Option 1: Test with Ajeet's Account
1. **Log in as Ajeet** (ajeetsharma@rannkly.com)
2. Verify navigation:
   - ✅ CAN see: Dashboard, Attendance, Leave, Performance, Employees
   - ❌ CANNOT see: Reports, Asset Management, Exit Management

### Option 2: Test Permissions Dialog
1. **Log in as Admin or HR**
2. Go to **Permissions Management**
3. Find **Ajeet Kumar Sharma** in the user list
4. Click the **edit icon** (✏️) or "Edit Permissions" button
5. Verify in the dialog:
   - ✅ **"Manager" role is checked** (blue checkbox, blue border on card)
   - ✅ **Current Permissions section shows**:
     - Dashboard (Read)
     - Employees (Read)
     - Attendance (Read, Approve)
     - Leave (Read, Approve)
     - Performance (Read, Create, Update)
   - ✅ **No "Reports" permission** is shown

## User Roles vs Role Objects

The system has two separate concepts:

### User.role (Basic Role)
- Simple string field: 'admin', 'hr', 'manager', 'employee'
- Used for basic authorization and navigation
- Set in User model

### Role Objects (Permission Templates)
- Detailed permission templates with module/action permissions
- Examples: "Manager", "HR Manager", "Super Administrator"
- Assigned through UserRole junction table
- Shown in Edit Permissions dialog

**Important**: Having `user.role = "manager"` doesn't automatically mean the user has the "Manager" Role object assigned. They need to be linked through UserRole.

## Navigation Access Rules

| Section | Who Can Access |
|---------|----------------|
| Dashboard | All users |
| Attendance | All users |
| Leave | All users |
| Employees | Managers, HR, Admin |
| Performance | Managers, HR, Admin |
| **Reports** | **Admin, HR only** |
| **Asset Management** | **Admin, HR only** |
| **Exit Management** | **Admin, HR only** |
| Organization | Admin only |
| Permissions | Admin, HR only |

## If You See Issues

### Role Not Auto-Checked
- Verify the user has a UserRole assignment (not just user.role field)
- Check if the role is active (`isActive: true`)
- Check if the role hasn't expired (`expiresAt` is null or future date)

### Permissions Not Showing
- User needs either:
  - Role assignments in UserRole collection, OR
  - Custom permissions in user.permissions array
- If neither exists, the permissions section will be empty (this is correct)

### Navigation Items Missing
- Check user.role field (admin/hr/manager/employee)
- Check Layout.jsx `roles` array for each navigation item
- Some items are restricted to specific roles only

## Need More Information?

See `PERMISSIONS_AUTO_CHECK_FIX.md` for detailed technical information.

