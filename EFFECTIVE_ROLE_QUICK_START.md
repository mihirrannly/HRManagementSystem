# Effective Role System - Quick Start Guide

## What Changed?

Now when you assign a role like "HR Manager" to a user through the Permissions Management dialog, that user will **immediately** (after login/refresh) see the appropriate navigation items and have access to the correct routes.

## How to Assign HR Access to Ajeet

### Step 1: Assign the HR Manager Role
1. Log in as **Admin** or **HR**
2. Go to **Permissions Management**
3. Find **Ajeet Kumar Sharma** (ajeetsharma@rannkly.com)
4. Click **"Edit Permissions"** button
5. Check the box for **"HR Manager"** role
6. Click **"Save Changes"**
7. You should see: "Permissions updated successfully"

### Step 2: Ajeet Logs Out and Logs Back In
1. Ajeet needs to **log out** and **log back in** for changes to take effect
   - OR wait 5 minutes for auth cache to refresh
   - OR hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

### Step 3: Verify Changes
After logging back in, Ajeet should now see:
- ✅ **Reports** in navigation
- ✅ **Asset Management** in navigation  
- ✅ **Exit Management** in navigation
- ✅ **Permissions** in navigation (if HR Manager role includes it)

## What Roles to Assign for Different Access Levels

### HR Access
Assign any of these roles:
- **HR Manager** (recommended) - Full HR permissions
- **HR Executive** - Basic HR permissions
- **HR** (the base HR role)

Result: `effectiveRole = 'hr'`

### Admin Access
Assign any of these roles:
- **Super Administrator** (recommended) - All permissions
- **Global Admin** - All permissions
- **Administrator** - Admin permissions

Result: `effectiveRole = 'admin'`

### Manager Access
The "Manager" role is automatically implied by the base `user.role` field.
- If user.role = "manager", they already have manager access
- No need to assign the "Manager" role unless you want explicit tracking

## How Effective Role Works

### Visual Example:

```
User: Ajeet Kumar Sharma
├─ user.role = "manager" (base role, set in User model)
├─ Assigned Roles:
│  ├─ ✅ "Manager" role (assigned via Permissions)
│  └─ ✅ "HR Manager" role (assigned via Permissions)
└─ effectiveRole = "hr" ✨ (calculated: HR takes priority)
```

### Priority Order:
1. **Admin** roles → effectiveRole = 'admin' (highest)
2. **HR** roles → effectiveRole = 'hr'
3. **Base role** → effectiveRole = user.role

## Common Scenarios

### Scenario 1: Manager Needs HR Access
**Goal:** Ajeet (manager) needs to access HR features

**Solution:**
1. Assign "HR Manager" role to Ajeet
2. Ajeet logs out/in
3. Ajeet's effectiveRole = 'hr'
4. Ajeet can now access Reports, Asset Management, Exit Management

### Scenario 2: HR Needs Admin Access
**Goal:** An HR person needs full admin permissions

**Solution:**
1. Assign "Super Administrator" or "Global Admin" role
2. User logs out/in
3. User's effectiveRole = 'admin'
4. User has full system access

### Scenario 3: Temporary HR Access
**Goal:** Give someone HR access for 30 days

**Solution:**
1. Assign "HR Manager" role
2. Set expiration date to 30 days from now
3. After 30 days, role expires automatically
4. User's effectiveRole reverts to base role

### Scenario 4: Remove HR Access
**Goal:** Remove HR access from someone

**Solution:**
1. Go to Permissions Management
2. Edit permissions for the user
3. Uncheck the "HR Manager" (or other HR role)
4. Save changes
5. User logs out/in
6. User's effectiveRole reverts to base role

## Troubleshooting

### Issue: Assigned role but nothing changed
**Solution:** User needs to log out and log back in, or wait 5 minutes for cache refresh.

### Issue: User doesn't see expected navigation items
**Check:**
1. Verify role was saved (Edit Permissions should show it checked)
2. Verify user logged out and back in
3. Check browser console for `effectiveRole` value
4. Check `user.effectiveRole` in the network tab (look for /api/auth/me response)

### Issue: User gets "Insufficient permissions" error
**Check:**
1. Verify role is active (`isActive: true`)
2. Verify role hasn't expired (check `expiresAt` field)
3. Verify the route requires the correct role (check Layout.jsx `roles` array)

## Checking Effective Role in Console

To see what effectiveRole is being used:

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Filter for "me"** (to find /api/auth/me requests)
4. **Click on the request**
5. **Go to Response tab**
6. Look for:
   ```json
   {
     "user": {
       "role": "manager",
       "effectiveRole": "hr",  ← This is what matters!
       "assignedRoles": [
         { "name": "manager", "displayName": "Manager" },
         { "name": "hr_manager", "displayName": "HR Manager" }
       ]
     }
   }
   ```

## Quick Reference

| Base Role | Assigned Role | Effective Role | Navigation Access |
|-----------|---------------|----------------|-------------------|
| employee  | None          | employee       | Basic (Dashboard, Attendance, Leave) |
| manager   | None          | manager        | + Employees, Performance |
| manager   | HR Manager    | **hr**         | + Reports, Assets, Exit Management |
| manager   | Super Admin   | **admin**      | Everything |
| hr        | None          | hr             | HR features |
| hr        | Super Admin   | **admin**      | Everything |
| admin     | Any           | admin          | Everything |

## Summary

✅ **DO**: Assign "HR Manager" or "HR Executive" role for HR access
✅ **DO**: Tell user to log out and log back in after role changes
✅ **DO**: Check "Edit Permissions" to verify roles are saved
❌ **DON'T**: Expect changes without logout/login
❌ **DON'T**: Manually edit user.role field (use role assignments instead)
❌ **DON'T**: Forget that role changes take up to 5 minutes or require logout

For detailed technical information, see `EFFECTIVE_ROLE_IMPLEMENTATION.md`.

