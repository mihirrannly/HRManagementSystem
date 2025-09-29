# Permission Management System Guide

## Overview

The HR Management System now includes a comprehensive permission management system that allows super administrators to create custom roles, assign granular permissions, and manage user access across all system modules.

## Key Features

### 🔐 **Role-Based Access Control (RBAC)**
- Create custom roles with specific permissions
- Assign multiple roles to users
- System roles (protected from deletion)
- Role expiration support

### 🎯 **Granular Permissions**
- Module-based permissions (Dashboard, Employees, Attendance, etc.)
- Action-based permissions (Read, Create, Update, Delete, Approve, Export, Import)
- Fine-grained access control

### 👥 **User Management**
- Assign/remove roles from users
- View effective permissions for any user
- Track role assignment history

### 🛡️ **Security Features**
- Permission inheritance and merging
- Backward compatibility with legacy roles
- Admin bypass for system operations
- Audit trail for permission changes

## System Architecture

### Database Models

#### **Permission Model**
```javascript
{
  module: String,           // e.g., 'employees', 'attendance'
  name: String,            // Display name
  description: String,     // Description of the module
  availableActions: [{     // Actions available for this module
    action: String,        // e.g., 'read', 'create', 'update'
    description: String    // Description of the action
  }]
}
```

#### **Role Model**
```javascript
{
  name: String,            // Unique role identifier
  displayName: String,     // Human-readable name
  description: String,     // Role description
  permissions: [{          // Assigned permissions
    module: String,        // Module name
    actions: [String]      // Array of allowed actions
  }],
  isSystemRole: Boolean,   // Protected system role
  isActive: Boolean        // Active status
}
```

#### **UserRole Model**
```javascript
{
  user: ObjectId,          // Reference to User
  role: ObjectId,          // Reference to Role
  assignedBy: ObjectId,    // Who assigned the role
  assignedAt: Date,        // When assigned
  expiresAt: Date,         // Optional expiration
  isActive: Boolean        // Active status
}
```

## Available Modules & Actions

### **Modules**
- `dashboard` - Main dashboard access
- `employees` - Employee management
- `attendance` - Attendance tracking
- `leave` - Leave management
- `payroll` - Payroll processing
- `performance` - Performance reviews
- `recruitment` - Job postings and applications
- `reports` - Reports and analytics
- `organization` - Organizational structure
- `onboarding` - Employee onboarding
- `settings` - System settings
- `permissions` - Permission management

### **Actions**
- `read` - View/access data
- `create` - Add new records
- `update` - Modify existing records
- `delete` - Remove records
- `approve` - Approve requests/changes
- `export` - Export data
- `import` - Import data

## Default System Roles

### **Super Administrator**
- **Access**: Full system access
- **Permissions**: All modules, all actions
- **Protected**: Cannot be deleted or modified

### **Administrator**
- **Access**: Administrative functions
- **Permissions**: Most modules with create/update/approve
- **Restrictions**: Cannot manage permissions

### **HR Manager**
- **Access**: Human resources functions
- **Permissions**: Employee, leave, payroll, recruitment management
- **Focus**: People management

### **Manager**
- **Access**: Team management
- **Permissions**: View team data, approve requests
- **Scope**: Limited to team oversight

### **Employee**
- **Access**: Personal functions
- **Permissions**: Own attendance, leave requests, performance view
- **Scope**: Self-service only

## API Endpoints

### **Permission Management**
```
GET    /api/permissions/modules          # Get available modules/actions
GET    /api/permissions/roles            # List all roles
POST   /api/permissions/roles            # Create new role
PUT    /api/permissions/roles/:id        # Update role
DELETE /api/permissions/roles/:id        # Delete role
```

### **User Management**
```
GET    /api/permissions/users                    # List users with roles
POST   /api/permissions/users/:id/roles         # Assign role to user
DELETE /api/permissions/users/:id/roles/:roleId # Remove role from user
GET    /api/permissions/user-permissions/:id    # Get user's effective permissions
```

## Frontend Components

### **Permission Guard**
```jsx
import PermissionGuard from '../components/PermissionGuard';

<PermissionGuard module="employees" action="create">
  <Button>Add Employee</Button>
</PermissionGuard>
```

### **Permission Hook**
```jsx
import { usePermissions } from '../components/PermissionGuard';

const { hasPermission, canAccess } = usePermissions();

if (hasPermission('employees', 'create')) {
  // Show create button
}
```

## Usage Examples

### **Creating a Custom Role**

1. **Navigate to Permissions** (Admin only)
2. **Click "Create Role"**
3. **Fill in role details**:
   - Name: `department_manager`
   - Display Name: `Department Manager`
   - Description: `Manages specific department operations`
4. **Select permissions** by checking module/action combinations
5. **Save the role**

### **Assigning Roles to Users**

1. **Go to User Management tab**
2. **Find the user** in the list
3. **Click "Assign Role" button**
4. **Select role** from available options
5. **Role is immediately active**

### **Checking Permissions in Code**

#### Backend (Express Route)
```javascript
const { checkPermissions, MODULES, ACTIONS } = require('../middleware/permissions');

router.get('/employees', [
  authenticate,
  checkPermissions(MODULES.EMPLOYEES, ACTIONS.READ)
], async (req, res) => {
  // Route handler
});
```

#### Frontend (React Component)
```jsx
import PermissionGuard from '../components/PermissionGuard';

const EmployeeList = () => {
  return (
    <div>
      <PermissionGuard module="employees" action="read">
        <EmployeeTable />
      </PermissionGuard>
      
      <PermissionGuard module="employees" action="create">
        <AddEmployeeButton />
      </PermissionGuard>
    </div>
  );
};
```

## Security Considerations

### **Permission Inheritance**
- Users can have multiple roles
- Permissions are merged (union of all role permissions)
- Most permissive access wins

### **System Role Protection**
- System roles cannot be deleted
- System roles cannot be modified
- Ensures system stability

### **Admin Bypass**
- Admins bypass all permission checks
- Ensures system administration is always possible
- Use with caution

### **Backward Compatibility**
- Legacy role-based permissions still work
- Gradual migration to new system
- No breaking changes

## Best Practices

### **Role Design**
1. **Principle of Least Privilege**: Give minimum required permissions
2. **Role Hierarchy**: Create roles that build upon each other
3. **Clear Naming**: Use descriptive role names and descriptions
4. **Regular Review**: Periodically audit role permissions

### **User Assignment**
1. **Single Primary Role**: Assign one main role per user
2. **Temporary Roles**: Use expiration for temporary access
3. **Documentation**: Document why specific roles were assigned
4. **Regular Cleanup**: Remove unused role assignments

### **Development**
1. **Permission Checks**: Always check permissions in both frontend and backend
2. **Error Handling**: Provide clear error messages for permission denials
3. **Testing**: Test with different role combinations
4. **Logging**: Log permission-related activities for audit

## Troubleshooting

### **Common Issues**

#### **User Can't Access Feature**
1. Check user's assigned roles
2. Verify role has required permissions
3. Check if role is active and not expired
4. Verify module/action combination exists

#### **Permission Check Fails**
1. Ensure middleware is properly imported
2. Check module and action constants
3. Verify database connection
4. Check for typos in permission names

#### **Role Assignment Not Working**
1. Verify user exists and is active
2. Check role exists and is active
3. Ensure assigning user has admin privileges
4. Check for database constraints

### **Debug Commands**

```javascript
// Check user's effective permissions
const permissions = await getUserPermissions(userId);
console.log('User permissions:', permissions);

// Check specific permission
const canEdit = await hasPermission(userId, 'employees', 'update');
console.log('Can edit employees:', canEdit);
```

## Migration Guide

### **From Legacy Roles**
1. **Audit Current Roles**: Document existing role usage
2. **Create New Roles**: Map legacy roles to new permission system
3. **Assign New Roles**: Assign new roles to users
4. **Test Thoroughly**: Verify all functionality works
5. **Remove Legacy**: Gradually phase out old role checks

### **Database Migration**
```javascript
// Run the permission seeding script
node server/seeds/seedPermissions.js

// Assign default roles to existing users
// (This should be done carefully with proper backup)
```

## Support

For questions or issues with the permission system:

1. **Check this documentation** first
2. **Review the code** in `/server/models/Permission.js` and `/server/middleware/permissions.js`
3. **Test with admin account** to isolate permission issues
4. **Check server logs** for detailed error messages

---

**Last Updated**: September 2025  
**Version**: 1.0.0
