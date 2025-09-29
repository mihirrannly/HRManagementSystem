# Organizational Roles & Permissions Guide

## Overview

The HR Management System now includes a comprehensive role-based access control system with custom organizational roles tailored to your company's structure and needs.

## 🎭 Custom Organizational Roles

### **1. Asset Manager**
- **Description**: An asset manager has all the permissions to manage the assets in the organization
- **Scope**: Across all employees
- **Permissions**:
  - Dashboard access (read)
  - Organization management (full access)
  - Employee information (read-only)
  - Reports generation and export
- **Assigned Users**: Kashish Ahuja (hr@rannkly.com)

### **2. Expense Manager**
- **Description**: An Expense Manager has all permissions to manage expenses of all employees
- **Scope**: Across all employees
- **Permissions**:
  - Dashboard access (read)
  - Employee information (read-only)
  - Payroll management (full access)
  - Reports generation and export
- **Assigned Users**: Kunika Baghel

### **3. Global Admin**
- **Description**: A global admin has all permissions across the system including finances and executive dashboards
- **Scope**: Across all employees
- **Permissions**: **ALL SYSTEM PERMISSIONS**
- **Assigned Users**: 
  - Kunika Baghel
  - Mihir Bhardwaj (Co-founder)
  - Vishnu Sharma (Co-founder)
  - Shobhit Singh (Co-founder)

### **4. HR Executive**
- **Description**: A HR Executive has access to manage all employee information except financial information
- **Scope**: Across all employees
- **Permissions**:
  - Dashboard access (read)
  - Employee management (full access except delete)
  - Attendance management (read, update, approve, export)
  - Leave management (read, approve, update)
  - Performance management (read, create, update)
  - Recruitment management (full access)
  - Onboarding management (full access)
  - Reports generation and export
- **Assigned Users**: Kashish Ahuja (hr@rannkly.com)

### **5. HR Manager**
- **Description**: A HR manager has access to manage all employee information including employee financial information
- **Scope**: Across all employees
- **Permissions**:
  - All HR Executive permissions PLUS:
  - Payroll management (read, create, update, export)
  - Permission management (full access)
- **Assigned Users**: Kashish Ahuja (hr@rannkly.com)

### **6. IT Admin**
- **Description**: Role for IT administration with elevated privileges
- **Scope**: Across all employees
- **Permissions**:
  - Dashboard access (read)
  - Employee information (read, update)
  - Organization management (full access)
  - System settings (read, update)
  - Permission management (full access)
  - Reports generation and export
- **Assigned Users**: Kashish Ahuja (hr@rannkly.com)

### **7. Learn Admin**
- **Description**: A Learn Admin has all permissions related to learn
- **Permissions**:
  - Dashboard access (read)
  - Employee information (read-only)
  - Performance management (full access)
  - Reports generation and export
- **Assigned Users**: Available for assignment

### **8. Payroll Admin**
- **Description**: A payroll administrator has all permissions to manage payroll
- **Scope**: Across all employees
- **Permissions**:
  - Dashboard access (read)
  - Employee information (read-only)
  - Attendance records (read, export)
  - Leave information (read-only)
  - Payroll management (full access)
  - Reports generation and export
- **Assigned Users**: 
  - Kashish Ahuja (hr@rannkly.com)
  - Kunika Baghel

### **9. Travel Desk Manager**
- **Description**: An travel desk admin has access to manage the travel booking requests made by employees
- **Permissions**:
  - Dashboard access (read)
  - Employee information (read-only)
  - Reports generation and export
- **Assigned Users**: Available for assignment

## 👥 User Role Assignments

### **Kashish Ahuja (hr@rannkly.com)**
- **System Role**: HR
- **Custom Roles**:
  - Asset Manager
  - HR Executive
  - HR Manager
  - IT Admin
  - Payroll Admin
- **Access Level**: Comprehensive HR and administrative access

### **Kunika Baghel**
- **System Role**: HR
- **Custom Roles**:
  - Expense Manager
  - Global Admin
  - Payroll Admin
- **Access Level**: Full financial and administrative access

### **Co-Founders**
#### **Mihir Bhardwaj (mihir@rannkly.com)**
- **System Role**: Admin
- **Custom Roles**: Global Admin
- **Access Level**: Full system access

#### **Vishnu Sharma (vishnu@rannkly.com)**
- **System Role**: Admin
- **Custom Roles**: Global Admin
- **Access Level**: Full system access

#### **Shobhit Singh (shobhit@rannkly.com)**
- **System Role**: Admin
- **Custom Roles**: Global Admin
- **Access Level**: Full system access

## 🔐 Permission Matrix

| Role | Dashboard | Employees | Attendance | Leave | Payroll | Performance | Recruitment | Reports | Organization | Onboarding | Settings | Permissions |
|------|-----------|-----------|------------|-------|---------|-------------|-------------|---------|--------------|------------|----------|-------------|
| **Asset Manager** | Read | Read | - | - | - | - | - | Full | Full | - | - | - |
| **Expense Manager** | Read | Read | - | - | Full | - | - | Full | - | - | - | - |
| **Global Admin** | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| **HR Executive** | Read | Full* | Manage | Approve | - | Manage | Full | Full | - | Full | - | - |
| **HR Manager** | Read | Full* | Manage | Approve | Manage | Manage | Full | Full | - | Full | - | Full |
| **IT Admin** | Read | Update | - | - | - | - | - | Full | Full | - | Full | Full |
| **Learn Admin** | Read | Read | - | - | - | Full | - | Full | - | - | - | - |
| **Payroll Admin** | Read | Read | Read | Read | Full | - | - | Full | - | - | - | - |
| **Travel Desk Manager** | Read | Read | - | - | - | - | - | Full | - | - | - | - |

*Full = Create, Read, Update, Delete, Approve, Export, Import (where applicable)
*Manage = Read, Update, Approve, Export
*HR Executive/Manager "Full" excludes Delete for employees

## 🚀 How to Use the Permission System

### **For Administrators:**
1. **Navigate to Permissions** in the sidebar
2. **View Roles & Permissions** tab to see all available roles
3. **User Management** tab to assign/remove roles from users
4. **Create custom roles** as needed for your organization

### **For Role Assignment:**
1. Go to **User Management** tab
2. Find the user in the list
3. Click the **assignment icon**
4. Select the appropriate role(s)
5. Roles are immediately active

### **For Role Creation:**
1. Click **"Create Role"** button
2. Fill in role details (name, description)
3. Use the **permission matrix** to select specific permissions
4. Save the role
5. Assign to users as needed

## 🔍 Role Hierarchy

### **System Roles (Built-in)**
1. **Super Admin** - Full system access (protected)
2. **Admin** - Administrative access (Co-founders)
3. **HR** - Human resources access (Kashish, Kunika)
4. **Manager** - Team management access
5. **Employee** - Basic employee access

### **Custom Roles (Organizational)**
- Built on top of system roles
- Can be assigned in addition to system roles
- Provide granular permissions for specific functions
- Can be created, modified, and deleted by admins

## 📊 Benefits

### **For Management:**
- **Clear role definitions** with specific responsibilities
- **Audit trail** of who has access to what
- **Flexible permission system** that grows with the organization
- **Compliance-ready** access controls

### **For Users:**
- **Role-appropriate access** - users see only what they need
- **Multiple role support** - users can have multiple responsibilities
- **Clear permission boundaries** - no confusion about access rights

### **For Security:**
- **Principle of least privilege** - minimum required access
- **Granular controls** - module and action-level permissions
- **Role expiration support** - temporary access controls
- **Protected system roles** - core roles cannot be accidentally deleted

## 🛠️ Technical Implementation

### **Database Structure:**
- **Roles Collection** - Stores role definitions and permissions
- **UserRole Collection** - Tracks role assignments to users
- **Permission Collection** - Defines available modules and actions

### **Frontend Integration:**
- **Permission Guards** - Conditional rendering based on permissions
- **Role-based Navigation** - Menu items shown based on user roles
- **Real-time Updates** - Changes reflect immediately

### **Backend Security:**
- **Middleware Protection** - All routes protected by permission checks
- **Role Validation** - Server-side permission verification
- **Audit Logging** - Track permission changes and access

## 📞 Support

For questions about roles and permissions:
1. **Check this documentation** first
2. **Contact IT Admin** (Kashish Ahuja) for role assignments
3. **Contact Global Admin** (Co-founders) for system-level changes

---

**Last Updated**: September 2025  
**Version**: 1.0.0  
**System**: Rannkly HR Management
