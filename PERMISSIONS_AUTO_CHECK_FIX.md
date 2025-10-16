# Permissions Auto-Check Fix

## Issue
When opening the "Edit Permissions" dialog for a user (e.g., Ajeet), no roles were being auto-checked even though the user had permissions to access various modules.

## Root Causes

### 1. Database Connection Mismatch
The diagnostic scripts were initially connecting to the wrong database (`hr-management` instead of `rannkly_hr`), which made it appear that no roles existed in the system.

### 2. Missing UserRole Assignment
Ajeet had:
- `user.role = "manager"` (basic role field in User model)
- **No UserRole assignments** (no connection to the "Manager" Role object)
- **No custom permissions** in `user.permissions` array

The permission system works with two separate concepts:
- **User.role**: A simple string field ('admin', 'hr', 'manager', 'employee') used for basic authorization
- **Role collection**: Permission templates with detailed module/action permissions
- **UserRole collection**: Junction table linking Users to Roles

Ajeet had the basic "manager" string role but was never assigned the "Manager" Role object through UserRole.

### 3. Backend Endpoint Missing Custom Permissions
The `/api/permissions/user-permissions/:userId` endpoint only returned permissions from role assignments, not direct custom permissions stored in `user.permissions`.

### 4. Manager Role Had Reports Permission
The "Manager" role included `reports: read` permission, but the navigation was restricted to Admin/HR only, creating an inconsistency.

## Changes Made

### 1. Backend - Include Custom Permissions
**File**: `server/routes/permissions.js`

Updated the `/api/permissions/user-permissions/:userId` endpoint to include both role-based AND direct custom permissions:

```javascript
// Add direct custom permissions from user.permissions array
if (user.permissions && user.permissions.length > 0) {
  user.permissions.forEach(perm => {
    const key = perm.module;
    if (allPermissions.has(key)) {
      // Merge actions (union)
      const existing = allPermissions.get(key);
      const combined = [...new Set([...existing.actions, ...perm.actions])];
      allPermissions.set(key, { module: perm.module, actions: combined });
    } else {
      allPermissions.set(key, { module: perm.module, actions: [...perm.actions] });
    }
  });
}
```

### 2. Database - Assign Manager Role to Ajeet
Assigned the "Manager" Role object (ID: 68dabffb9cb8dc2cbd3e277f) to Ajeet through a UserRole record.

The Manager role includes permissions for:
- dashboard: read
- employees: read
- attendance: read, approve
- leave: read, approve
- performance: read, create, update

### 3. Database - Remove Reports Permission from Manager Role
Removed `reports: read` from the Manager role to align with the navigation restriction (Reports should only be accessible to Admin and HR).

### 4. Frontend - Clean Up Debugging Logs
**File**: `client/src/pages/Permissions/PermissionsManagement.jsx`

Removed debugging `console.log` statements from:
- `handleEditPermissions` function
- Role rendering loop

## How It Works Now

1. When "Edit Permissions" dialog opens for a user:
   - Frontend calls `/api/permissions/user-permissions/:userId`
   - Backend returns:
     - `roles`: Array of assigned Role objects from UserRole collection
     - `effectivePermissions`: Combined permissions from roles + custom permissions
   
2. Frontend auto-checks the roles that the user has assigned

3. Frontend displays all effective permissions (both from roles and custom)

4. For Ajeet specifically:
   - Shows "Manager" role as checked
   - Shows 5 modules with their permissions
   - No "reports" permission shown (correctly restricted)

## Testing

1. Log in as Admin/HR
2. Go to Permissions Management
3. Click "Edit Permissions" on Ajeet Kumar Sharma (ajeetsharma@rannkly.com)
4. Verify:
   - ✅ "Manager" role checkbox is checked
   - ✅ "Manager" role card has blue border
   - ✅ Current Permissions section shows:
     - Dashboard (Read)
     - Employees (Read)
     - Attendance (Read, Approve)
     - Leave (Read, Approve)
     - Performance (Read, Create, Update)
   - ✅ No "Reports" permission shown

## Related Files

- `server/routes/permissions.js` - Added custom permissions to API response
- `client/src/pages/Permissions/PermissionsManagement.jsx` - Removed debug logs
- `client/src/components/Layout/Layout.jsx` - Restricted Reports/Assets/Exit Management to Admin/HR only

## Database Changes

1. **Created UserRole record** for Ajeet → Manager role
2. **Updated Manager Role** to remove reports permission

## Migration Note

If other users have `user.role = "manager"` but no UserRole assignments, they should also be assigned the "Manager" role for consistency. This can be done with a migration script that:
1. Finds all users with `user.role === 'manager'`
2. Finds the "Manager" Role object
3. Creates UserRole records linking them together

