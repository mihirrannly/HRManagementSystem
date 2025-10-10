# Designation Management System - User Guide

## 🎯 Overview

The Designation Management System allows HR and Admin users to create and manage job designations that automatically populate in employee forms throughout the application.

---

## ✨ Features

- ✅ Create custom designations
- ✅ Organize by levels (Entry, Junior, Mid, Senior, Manager, Director, Executive, C-Level)
- ✅ Auto-populate in employee forms
- ✅ Edit and update existing designations
- ✅ Delete unused designations
- ✅ Seed default designations with one click
- ✅ Prevents deletion of designations in use

---

## 📍 How to Access

1. **Login** as HR or Admin
2. Navigate to **Organization** → **Designations**
3. The Designations Management panel will open

---

## 🚀 Quick Start

### Adding Your First Designations

**Option 1: Add Default Designations (Recommended)**
1. Click the **"Seed Defaults"** button
2. This adds 20 common designations like:
   - Software Engineer
   - HR Manager
   - Product Manager
   - Business Analyst
   - etc.

**Option 2: Create Custom Designation**
1. Click **"Add Designation"** button
2. Fill in the details:
   - **Name**: Job title (e.g., "Senior Data Scientist")
   - **Description**: Brief role description
   - **Level**: Choose from dropdown (Entry to C-Level)
3. Click **"Create"**

---

## 📋 Managing Designations

### Edit a Designation
1. Click the **Edit icon** (pencil) next to any designation
2. Update the fields
3. Click **"Update"**

### Delete a Designation
1. Click the **Delete icon** (trash) next to any designation
2. Confirm deletion
3. ⚠️ **Note**: You cannot delete a designation that is assigned to employees

### View Designation Details
- **Name**: The job title
- **Description**: Role description (optional)
- **Level**: Organizational level with color coding
- **Status**: Active/Inactive

---

## 💼 Using Designations in Employee Management

### When Adding New Employees

1. Go to **Organization** → **Employees** → **Add Employee**
2. In the **Employment Information** tab:
   - The **Designation** field is now a dropdown
   - Select from your created designations
   - Required field - must select one

### When Editing Existing Employees

1. Find an employee in the employee list
2. Click **Edit** mode
3. Click on the designation field
4. Select a new designation from the dropdown

### Designation Display

Designations appear in:
- ✅ Employee profile cards
- ✅ Employee list view
- ✅ Employee dashboard
- ✅ Organization charts
- ✅ Reports

---

## 🎨 Designation Levels Explained

| Level | Description | Color | Examples |
|-------|-------------|-------|----------|
| **C-Level** | Chief Executive positions | Red | CEO, CTO, CFO, COO |
| **Executive** | Executive management | Red | VP of Engineering |
| **Director** | Director-level roles | Red | Director of Sales |
| **Manager** | Management positions | Green | Engineering Manager, HR Manager |
| **Team Lead** | Team leadership | Orange | Tech Lead, Team Lead |
| **Senior** | Senior-level roles | Purple | Senior Engineer, Sr. Analyst |
| **Mid** | Mid-level positions | Blue | Software Engineer, HR Executive |
| **Junior** | Junior positions | Light Blue | Junior Developer, Associate |
| **Entry** | Entry-level roles | Gray | Intern, Trainee |

---

## 🔒 Permissions

### Who Can Manage Designations?
- ✅ **Admin** - Full access
- ✅ **HR** - Full access
- ❌ **Manager** - View only (in employee forms)
- ❌ **Employee** - View only (in their profile)

---

## 💡 Best Practices

### 1. **Start with Seed Data**
Use the "Seed Defaults" button to get started quickly with common designations.

### 2. **Use Clear Names**
- ✅ Good: "Senior Software Engineer"
- ❌ Bad: "SSE" or "Eng III"

### 3. **Add Descriptions**
Help users understand each role:
```
Name: Product Manager
Description: Manages product development lifecycle and coordinates with cross-functional teams
Level: Manager
```

### 4. **Organize by Levels**
Assign appropriate levels to maintain hierarchy:
- CEO → C-Level
- Engineering Manager → Manager
- Software Engineer → Mid
- Intern → Entry

### 5. **Clean Up Unused Designations**
Regularly review and delete designations that are no longer used (system will prevent deletion if in use).

### 6. **Standardize Naming**
Maintain consistency:
- Use title case: "Software Engineer" not "software engineer"
- Be specific: "Senior Marketing Manager" not just "Manager"

---

## 🔄 Workflow Example

### Setting Up for a New Company

1. **Initial Setup**
   ```
   Click "Seed Defaults" → Review list → Delete unwanted ones
   ```

2. **Add Company-Specific Roles**
   ```
   Add Designation:
   - Name: "Cloud Architect"
   - Description: "Designs and implements cloud infrastructure"
   - Level: Senior
   ```

3. **Organize Employees**
   ```
   Edit each employee → Assign appropriate designation
   ```

4. **Maintain**
   ```
   Add new designations as roles evolve
   Update descriptions as needed
   Review quarterly
   ```

---

## 📊 Technical Details

### API Endpoints

```
GET    /api/designations           # Get all designations
POST   /api/designations           # Create new designation
PUT    /api/designations/:id       # Update designation
DELETE /api/designations/:id       # Delete designation
POST   /api/designations/seed      # Seed default designations
```

### Database Schema

```javascript
{
  name: String,              // Required, unique
  description: String,       // Optional
  level: String,            // entry, junior, mid, senior, lead, manager, director, executive, c-level
  isActive: Boolean,        // Default: true
  createdBy: ObjectId,      // User who created it
  createdAt: Date,
  updatedAt: Date
}
```

---

## ❓ FAQ

### Q: What happens to existing employees when I delete a designation?
**A:** You cannot delete a designation that is currently assigned to employees. You must reassign all employees first.

### Q: Can I have duplicate designation names?
**A:** No, designation names must be unique (case-insensitive).

### Q: Can employees see the designations list?
**A:** Employees can see their own designation in their profile, but cannot access the management interface.

### Q: How many designations can I create?
**A:** There's no limit! Create as many as your organization needs.

### Q: Can I import designations from a file?
**A:** Not currently, but you can use the API to bulk-create them programmatically.

### Q: Will old employees automatically show the new designations?
**A:** Existing employee records keep their current designation text. You need to edit them to assign a designation from the new system.

---

## 🐛 Troubleshooting

### Issue: Designations not showing in dropdown
**Solution:** 
- Refresh the page
- Check if any designations exist (if not, seed defaults)
- Verify you're logged in as HR/Admin

### Issue: Cannot delete designation
**Solution:**
- Check if it's assigned to any employees
- Go to Employees → Search for designation → Reassign them
- Then try deleting again

### Issue: Dropdown is empty
**Solution:**
- No designations exist yet
- Click "Seed Defaults" to add common ones
- Or create your first designation manually

---

## 🎉 Benefits

### For HR/Admin
- ✅ Standardize job titles across organization
- ✅ Maintain consistency in hiring
- ✅ Easy to update org-wide
- ✅ Better reporting and analytics

### For Managers
- ✅ Clear employee levels
- ✅ Easy to understand hierarchy
- ✅ Consistent across teams

### For Employees
- ✅ Clear career progression paths
- ✅ Understand their level in organization
- ✅ Professional job titles

---

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Verify your permissions (HR/Admin required)
3. Check console for errors
4. Contact your system administrator

---

**Version:** 1.0  
**Last Updated:** October 8, 2025  
**Created By:** Development Team

