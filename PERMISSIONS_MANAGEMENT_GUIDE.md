# 🔐 Permissions Management System - Complete Guide

## Overview
A comprehensive, clean, and fully functional permissions management system for admins to control employee access across all modules.

---

## ✨ Key Features

### 1. **Clean Modern UI**
- Beautiful card-based interface
- Real-time stats dashboard
- Easy-to-use search and filtering
- Color-coded permissions for quick identification

### 2. **Complete Module Coverage**
All system modules are covered:
- ✅ Dashboard
- ✅ Employee Management
- ✅ Attendance
- ✅ Leave Management
- ✅ Payroll
- ✅ Performance Management
- ✅ Recruitment
- ✅ Reports
- ✅ Organization
- ✅ Onboarding
- ✅ Exit Management
- ✅ Asset Management
- ✅ Settings
- ✅ Permissions Management

### 3. **Granular Action Control**
For each module, you can control:
- 👁️ **View** - Read access
- ➕ **Create** - Create new records
- ✏️ **Edit** - Update existing records
- 🗑️ **Delete** - Remove records
- ✅ **Approve** - Approval authority
- 📤 **Export** - Export data
- 📥 **Import** - Import data

### 4. **Role-Based Access Control**
- Create custom roles with specific permissions
- Assign multiple roles to users
- System calculates effective permissions automatically
- Preview permissions before saving

---

## 🎯 How to Use

### **Access the Permissions Screen**
1. Log in as **Admin** or **HR**
2. Navigate to **Settings** → **Permissions** (or go to `/permissions`)

### **Managing User Permissions**

#### **View All Users**
The main screen shows a comprehensive table with:
- Employee name and ID
- Email address
- System role (Admin, HR, Employee)
- Assigned custom roles
- Number of accessible modules
- Edit action button

#### **Edit User Permissions**
1. Click the **Edit** icon (✏️) next to any user
2. You'll see a dialog with:
   - **User information** at the top
   - **Assign Roles** section with all available roles
   - **Effective Permissions Preview** showing what access they'll have

3. **Select/Deselect Roles**:
   - Click on any role card to select/deselect it
   - The checkbox indicates selection
   - You can assign multiple roles to one user

4. **Preview Permissions**:
   - Scroll down to see what modules and actions the user will have access to
   - Permissions from all selected roles are combined
   - Color-coded chips show different action types

5. Click **"Save Permissions"** to apply changes

### **Creating Custom Roles**

#### **Create a New Role**
1. Click **"Create Role"** button in the top right
2. Fill in the form:
   - **Role Name (Internal)**: Use lowercase with underscores (e.g., `team_lead`, `project_manager`)
   - **Display Name**: User-friendly name (e.g., "Team Lead", "Project Manager")
   - **Description**: What this role is for

3. **Assign Permissions**:
   - Each module has a card with all available actions
   - Click on action chips to toggle them on/off
   - Selected actions are highlighted with color
   - Use "Select All" checkbox to quickly grant all permissions for a module

4. Click **"Create Role"** to save

---

## 📊 Dashboard Stats

The permissions screen shows real-time statistics:
- **Total Users**: Number of active users in the system
- **Active Roles**: Number of custom roles created
- **Modules**: Total modules available for access control

---

## 🎨 UI Elements Explained

### **Action Colors**
- 🔵 **Blue (View)**: Read-only access
- 🟢 **Green (Create)**: Can add new records
- 🟠 **Orange (Edit)**: Can modify existing records
- 🔴 **Red (Delete)**: Can remove records
- 🟣 **Purple (Approve)**: Can approve requests
- 🔷 **Cyan (Export)**: Can export data
- 🟤 **Brown (Import)**: Can import data

### **System Role Badges**
- 🔴 **ADMIN**: Full system access (red)
- 🔵 **HR**: HR department access (blue)
- ⚫ **EMPLOYEE**: Standard employee access (gray)

### **Module Access Count**
- Shows number of modules a user has access to
- Displayed as a green chip in the table
- Calculated automatically based on assigned roles

---

## 💡 Best Practices

### **1. Use Roles for Common Access Patterns**
Instead of manually setting permissions for each user, create roles:
- **Team Lead**: View + Create + Edit for team-related modules
- **Manager**: Team Lead permissions + Approve + Reports
- **Accountant**: Payroll + Reports (Export)
- **Recruiter**: Recruitment (Full access) + Onboarding (Full access)

### **2. Combine Roles for Flexibility**
Users can have multiple roles. For example:
- A team lead who also handles recruitment = `team_lead` + `recruiter` roles
- An HR manager = `hr_manager` + `recruiter` + `exit_coordinator` roles

### **3. System Roles vs Custom Roles**
- **System Roles** (Admin, HR, Employee): Define the base access level
- **Custom Roles**: Add specific module permissions on top
- Custom roles complement system roles, they don't replace them

### **4. Regular Access Reviews**
- Periodically review user permissions
- Remove roles when employees change positions
- Update role permissions as system evolves

---

## 🔧 Technical Details

### **Backend Endpoints**
- `GET /api/permissions/users` - Get all users with roles
- `GET /api/permissions/roles` - Get all roles
- `GET /api/permissions/modules` - Get available modules and actions
- `POST /api/permissions/roles` - Create new role
- `POST /api/permissions/users/:userId/roles` - Assign role to user
- `DELETE /api/permissions/users/:userId/roles/:roleId` - Remove role from user
- `GET /api/permissions/user-permissions/:userId` - Get effective permissions

### **Models**
- **Role**: Defines a set of permissions
- **UserRole**: Assigns roles to users
- **Permission**: Defines available modules and actions

### **Permission Calculation**
- When a user has multiple roles, permissions are **merged**
- If Role A grants "View" and Role B grants "Create", user gets both
- More permissions = more access (permissions are additive)

---

## 🚨 Troubleshooting

### **Can't see the Permissions menu?**
- Only Admin and HR roles can access permissions management
- Check your system role in the User model

### **Changes not reflecting?**
- Ask the user to **log out and log back in**
- Auth tokens cache role information
- Fresh login = fresh permissions

### **Role assignment failed?**
- Check if the role still exists and is active
- Verify you have admin/hr access
- Check browser console for error details

### **User still can't access a module?**
1. Verify the role has the required permissions
2. Check if the user's role assignment is active
3. Ensure the user has logged out and back in
4. Check the module's permission middleware

---

## 📝 Example Scenarios

### **Scenario 1: New HR Manager**
**Need**: Full HR access + Reports
**Solution**:
1. Create role `hr_manager` with:
   - Employees: View, Create, Edit
   - Leave: View, Approve
   - Attendance: View
   - Reports: View, Export
   - Exit Management: All permissions
   - Onboarding: All permissions
2. Assign role to the user

### **Scenario 2: Finance Team Member**
**Need**: Payroll + Reports
**Solution**:
1. Create role `finance_member` with:
   - Payroll: View, Edit, Export
   - Reports: View, Export
   - Employees: View only
2. Assign role to all finance team members

### **Scenario 3: Department Manager**
**Need**: View team info, approve leaves, see reports
**Solution**:
1. Create role `department_manager` with:
   - Dashboard: View
   - Employees: View
   - Attendance: View
   - Leave: View, Approve
   - Reports: View, Export
   - Performance: View, Edit
2. Assign to all managers

---

## 🎉 Summary

The new permissions management system provides:
- ✅ Clean, intuitive interface
- ✅ Complete module coverage
- ✅ Granular action-level control
- ✅ Flexible role-based system
- ✅ Real-time preview of permissions
- ✅ Easy user management
- ✅ Custom role creation
- ✅ Color-coded visual feedback

**Next Steps**:
1. Review existing users and their access needs
2. Create custom roles for common job functions
3. Assign roles to users
4. Verify users can access their required modules
5. Regularly audit and update permissions

---

**Questions or Issues?**  
Check the browser console for detailed error messages, and verify backend routes are working properly.

