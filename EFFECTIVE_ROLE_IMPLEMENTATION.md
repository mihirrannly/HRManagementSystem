# Effective Role Implementation

## Problem
When assigning a role like "HR Manager" to a user (e.g., Ajeet) through the Permissions Management dialog, the user's login did not reflect the new permissions. The navigation didn't show the expected items (like Reports) because the authorization system only checked the basic `user.role` field, not the assigned Role objects from the UserRole collection.

## Solution
Implemented an **"Effective Role"** system that calculates the user's actual role based on both their base `user.role` field AND their assigned roles from the UserRole collection.

## How It Works

### 1. Role Priority Hierarchy
When a user has multiple roles assigned, the system uses this priority:
1. **Admin** roles (highest priority): `admin`, `super_admin`, `global_admin`
2. **HR** roles: `hr`, `hr_manager`, `hr_executive`
3. **Base role**: Whatever is set in `user.role` field

### 2. Effective Role Calculation
The `effectiveRole` is calculated by:
- Starting with the base `user.role`
- Checking all assigned roles from UserRole collection
- Upgrading to 'hr' if any HR-related role is assigned
- Upgrading to 'admin' if any admin role is assigned

**Example:**
- Ajeet has `user.role = "manager"`
- Admin assigns "HR Manager" role to Ajeet
- Ajeet's `effectiveRole` becomes `"hr"`
- Ajeet now sees HR navigation items and can access HR routes

## Changes Made

### Backend Changes

#### 1. Authentication Middleware (`server/middleware/auth.js`)
**Updated** `authenticate` middleware to:
- Fetch assigned roles from UserRole collection
- Calculate `effectiveRole` based on role hierarchy
- Set `req.user.effectiveRole` for all subsequent middleware

```javascript
// Get assigned roles from UserRole collection
const roleAssignments = await UserRole.find({
  user: user._id,
  isActive: true,
  $or: [
    { expiresAt: { $exists: false } },
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } }
  ]
}).populate('role', 'name');

// Calculate effective role based on assigned roles
let effectiveRole = user.role;
const assignedRoleNames = roleAssignments.map(ra => ra.role.name);

if (assignedRoleNames.some(name => ['hr', 'hr_manager', 'hr_executive'].includes(name))) {
  effectiveRole = 'hr';
}
if (assignedRoleNames.some(name => ['admin', 'super_admin', 'global_admin'].includes(name))) {
  effectiveRole = 'admin';
}

req.user.effectiveRole = effectiveRole;
```

#### 2. Authorization Middleware (`server/middleware/auth.js`)
**Updated** all authorization functions to use `effectiveRole`:
- `authorize(roles)` - Checks effectiveRole for route access
- `checkPermission(module, action)` - Uses effectiveRole for permission checks
- `canAccessEmployee()` - Uses effectiveRole for employee data access
- `canAccessEmployeeWithFilter()` - Uses effectiveRole with access level filtering

```javascript
// Use effectiveRole if available, otherwise fall back to role
const userRole = req.user.effectiveRole || req.user.role;

if (!roles.includes(userRole)) {
  return res.status(403).json({ message: 'Insufficient permissions.' });
}
```

#### 3. Auth Endpoint (`server/routes/auth.js`)
**Updated** `/api/auth/me` endpoint to:
- Fetch assigned roles from UserRole collection
- Calculate and return `effectiveRole`
- Return list of `assignedRoles` for display purposes

```javascript
// Get assigned roles and calculate effective role
const roleAssignments = await UserRole.find({ /* ... */ }).populate('role');

let effectiveRole = req.user.role;
// ... calculation logic ...

res.json({
  user: {
    id: req.user._id,
    email: req.user.email,
    role: req.user.role, // Original role
    effectiveRole: effectiveRole, // Computed role
    assignedRoles: roleAssignments.map(/* ... */),
    // ...
  }
});
```

### Frontend Changes

#### 1. AuthContext (`client/src/contexts/AuthContext.jsx`)
**Updated** to use `effectiveRole` for role checks:

```javascript
// Use effectiveRole if available, otherwise fall back to role
const userRole = user?.effectiveRole || user?.role;

const value = {
  // ...
  isAdmin: userRole === 'admin' || userRole === 'hr',
  isHR: userRole === 'hr' || userRole === 'admin',
  isManager: userRole === 'manager' || userRole === 'hr' || userRole === 'admin',
  isEmployee: userRole === 'employee'
};
```

#### 2. Layout Navigation (`client/src/components/Layout/Layout.jsx`)
**Updated** navigation filtering to use `effectiveRole`:

```javascript
const filteredMenuItems = menuItems.filter(item => {
  // Use effectiveRole if available, otherwise fall back to role
  const userRole = user?.effectiveRole || user?.role;
  
  const hasRole = item.roles.includes(userRole);
  // ...
});
```

## Usage Example

### Scenario: Assigning HR Manager Role to Ajeet

**Before:**
- Ajeet has `user.role = "manager"`
- Navigation shows: Dashboard, Attendance, Leave, Employees, Performance
- Cannot access: Reports, Asset Management, Exit Management

**Steps:**
1. Admin opens Permissions Management
2. Clicks "Edit Permissions" on Ajeet
3. Checks "HR Manager" role
4. Clicks "Save Changes"
5. Ajeet logs out and logs back in (or refreshes auth data)

**After:**
- Ajeet still has `user.role = "manager"` (base role unchanged)
- Ajeet now has `effectiveRole = "hr"` (calculated from assigned roles)
- Navigation now shows: Dashboard, Attendance, Leave, Employees, Performance, **Reports**, **Asset Management**, **Exit Management**, Permissions
- Can access all HR routes and features

## Testing

### Test 1: Verify Effective Role Calculation
1. Log in as Ajeet
2. Open browser DevTools Console
3. Check the auth response: Look for `effectiveRole` field
4. Should show: `effectiveRole: "hr"`

### Test 2: Verify Navigation Access
1. Log in as Ajeet
2. Check the sidebar navigation
3. Should see HR-specific items: Reports, Asset Management, Exit Management

### Test 3: Verify Route Access
1. Log in as Ajeet
2. Navigate to `/reports`
3. Should successfully load (not get 403 error)

### Test 4: Verify Permissions Dialog
1. Log in as Admin/HR
2. Go to Permissions Management
3. Click "Edit Permissions" on Ajeet
4. Should see "HR Manager" role checked
5. Should show current permissions from that role

## Important Notes

### 1. Base Role vs Effective Role
- **Base Role** (`user.role`): The simple field in the User model ('admin', 'hr', 'manager', 'employee')
- **Effective Role** (`user.effectiveRole`): Calculated based on base role + assigned roles
- **Always use `effectiveRole`** for authorization checks
- **Base role is kept** for backward compatibility and as a fallback

### 2. Role Hierarchy
The system automatically "upgrades" users based on assigned roles:
- Assigning any admin role → effectiveRole = 'admin'
- Assigning any HR role → effectiveRole = 'hr'
- Manager and employee roles don't auto-upgrade

### 3. Performance Consideration
The `authenticate` middleware now does an additional database query to fetch UserRole assignments. This happens on every authenticated request. The query is optimized with:
- Index on `user` field in UserRole collection
- Only fetching active, non-expired roles
- Only populating the `name` field from Role

### 4. Logout/Login Requirement
When roles are assigned/removed through Permissions Management, users need to:
- Log out and log back in, OR
- Refresh the page (auth data refreshes every 5 minutes)

The frontend caches auth data for 5 minutes, so changes may take up to 5 minutes to reflect, or require a logout/login.

## Related Files

**Backend:**
- `server/middleware/auth.js` - Authentication and authorization middleware
- `server/routes/auth.js` - Auth endpoints including /me
- `server/routes/permissions.js` - Permissions management endpoints

**Frontend:**
- `client/src/contexts/AuthContext.jsx` - Authentication context
- `client/src/components/Layout/Layout.jsx` - Navigation layout
- `client/src/pages/Permissions/PermissionsManagement.jsx` - Permissions UI

## Future Enhancements

1. **Real-time Role Updates**: Implement WebSocket or polling to notify users of role changes without requiring logout
2. **Role Combination Logic**: Support more complex role combinations (e.g., "Manager + Expense Manager" = special permissions)
3. **Role Expiration Notifications**: Notify users when their roles are about to expire
4. **Audit Log**: Track all role assignments/removals for compliance

