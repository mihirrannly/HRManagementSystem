# Announcement & Poll System - Complete Guide

## Overview

The Announcement & Poll System allows HR and Admin users to create and manage company-wide announcements and polls that are displayed on the dashboard for all employees. This feature enables effective communication and engagement across the organization.

## Key Features

### 📢 **Announcement Management**
- Create, edit, and delete announcements
- Pin important announcements to the top
- Set priority levels (Low, Medium, High, Urgent)
- Categorize announcements (General, Policy, Event, Update, Urgent, Celebration)
- Schedule announcements with start and end dates
- Target specific audiences (All, Department, Location, Role)

### 🗳️ **Poll Functionality**
- Create polls with multiple options
- Allow single or multiple choice voting
- View real-time poll results with percentages
- Track who has voted
- Visual representation of poll results

### 💬 **Engagement Features**
- React to announcements (Like, Love, Celebrate, Support, Insightful)
- Track views and reactions
- Show engagement statistics
- Display announcement creator and timestamp

## System Architecture

### Backend Components

#### 1. **Announcement Model** (`server/models/Announcement.js`)
```javascript
{
  title: String,
  content: String,
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  category: Enum ['general', 'policy', 'event', 'update', 'urgent', 'celebration'],
  targetAudience: Enum ['all', 'department', 'location', 'role'],
  targetDepartments: [String],
  targetLocations: [String],
  targetRoles: [String],
  createdBy: ObjectId,
  createdByName: String,
  isActive: Boolean,
  isPinned: Boolean,
  startDate: Date,
  endDate: Date,
  isPoll: Boolean,
  pollOptions: [{
    option: String,
    votes: [{ user: ObjectId, votedAt: Date }]
  }],
  pollMultipleChoice: Boolean,
  views: [{ user: ObjectId, viewedAt: Date }],
  reactions: [{ user: ObjectId, type: String, reactedAt: Date }]
}
```

#### 2. **Announcement Routes** (`server/routes/announcements.js`)
- `POST /api/announcements` - Create announcement (HR/Admin)
- `GET /api/announcements` - Get all announcements (filtered by visibility)
- `GET /api/announcements/:id` - Get single announcement
- `PUT /api/announcements/:id` - Update announcement (HR/Admin)
- `DELETE /api/announcements/:id` - Delete announcement (HR/Admin)
- `POST /api/announcements/:id/react` - Add/update reaction
- `POST /api/announcements/:id/vote` - Vote on poll
- `GET /api/announcements/stats/dashboard` - Get statistics (HR/Admin)

### Frontend Components

#### 1. **AnnouncementManagement.jsx** (`client/src/pages/Announcements/AnnouncementManagement.jsx`)
HR/Admin interface for creating and managing announcements:
- Dashboard with statistics
- List view of all announcements
- Create/Edit dialog with comprehensive options
- Toggle active/inactive status
- Delete announcements
- View engagement metrics

#### 2. **Announcement Display in Dashboards**
Both main Dashboard and Employee Dashboard show announcements:
- Displays up to 5 most recent announcements
- Pinned announcements shown first
- Interactive polls with voting
- Reaction buttons (Like, Love, Celebrate, Support, Insightful)
- Visual indicators for priority and category

## User Roles & Permissions

### Admin & HR
- Full access to create, edit, and delete announcements
- View all announcements (including inactive)
- Access announcement management page
- View detailed statistics

### All Employees (Including Managers)
- View announcements on dashboard
- Vote on polls
- React to announcements
- View poll results

## How to Use

### For HR/Admin: Creating an Announcement

1. **Navigate to Announcements**
   - Click "Announcements" in the sidebar menu
   - Or go to `/announcements`

2. **Click "New Announcement"**
   - Fill in the title and content
   - Select category and priority
   - Choose target audience

3. **Configure Targeting** (Optional)
   - Select "All Employees" for company-wide
   - Or choose specific departments, locations, or roles

4. **Set Schedule** (Optional)
   - Set start date (defaults to now)
   - Optionally set end date for auto-expiry

5. **Create a Poll** (Optional)
   - Toggle "Make this a poll"
   - Add poll options (minimum 2)
   - Choose single or multiple choice

6. **Additional Options**
   - Pin to top for visibility
   - Set as active/inactive

7. **Click "Create"**

### For HR/Admin: Managing Announcements

1. **View All Announcements**
   - See list with status, views, and reactions
   - Filter by active/inactive status

2. **Edit Announcement**
   - Click the edit icon
   - Modify any field except poll votes
   - Save changes

3. **Toggle Active/Inactive**
   - Use the switch to activate/deactivate
   - Inactive announcements hidden from employees

4. **Delete Announcement**
   - Click delete icon
   - Confirm deletion

### For Employees: Viewing Announcements

1. **Dashboard View**
   - Announcements appear automatically on dashboard
   - Pinned announcements shown with orange border
   - See priority and category badges

2. **Voting on Polls**
   - Click "Vote for this" button on desired option
   - View results in real-time
   - "You voted" badge appears after voting

3. **Reacting to Announcements**
   - Click reaction icons (👍 ❤️ 🎉 🤝 💡)
   - Your reaction is highlighted
   - See total reaction count

## Features in Detail

### Priority Levels
- **Urgent** (Red) - Critical announcements requiring immediate attention
- **High** (Orange) - Important but not critical
- **Medium** (Blue) - Standard announcements
- **Low** (Default) - General information

### Categories
- **General** (Blue) - General company news
- **Policy** (Purple) - Policy changes and updates
- **Event** (Orange) - Company events and activities
- **Update** (Cyan) - System or process updates
- **Urgent** (Red) - Urgent notifications
- **Celebration** (Green) - Achievements and celebrations

### Targeting Options

#### All Employees
- Visible to everyone in the organization

#### Department-Based
- Select specific departments
- Employees only see announcements for their department

#### Location-Based
- Target specific office locations
- Useful for location-specific information

#### Role-Based
- Target by role (Admin, HR, Manager, Employee)
- Control who sees sensitive information

### Engagement Tracking

#### Views
- Automatically tracked when user views announcement
- Displayed in management interface

#### Reactions
Five reaction types:
- **Like** (👍) - General approval
- **Love** (❤️) - Strong positive sentiment
- **Celebrate** (🎉) - Celebration and excitement
- **Support** (🤝) - Show support
- **Insightful** (💡) - Found it helpful/informative

#### Poll Results
- Real-time vote counting
- Percentage calculation
- Visual progress bars
- Anonymous voting (names not shown in results)

## Best Practices

### Creating Effective Announcements

1. **Use Clear Titles**
   - Make titles descriptive and concise
   - Include key information in title

2. **Keep Content Focused**
   - One main message per announcement
   - Use bullet points for multiple items

3. **Choose Appropriate Priority**
   - Reserve "Urgent" for critical matters
   - Use "Low" for informational content

4. **Target Correctly**
   - Only target relevant audience
   - Avoid announcement fatigue

5. **Pin Strategically**
   - Only pin truly important announcements
   - Unpin when no longer critical

### Creating Effective Polls

1. **Clear Questions**
   - Make poll question obvious in title/content
   - Provide context

2. **Balanced Options**
   - Offer reasonable choices
   - Include "Other" if appropriate

3. **Timing**
   - Set end date for polls
   - Give adequate time for responses

4. **Follow Up**
   - Share results after poll closes
   - Explain decisions based on poll

### Scheduling

1. **Start Dates**
   - Use for future announcements
   - Coordinate with events

2. **End Dates**
   - Set for time-sensitive information
   - Auto-hide after date passes

3. **Regular Updates**
   - Review and remove old announcements
   - Keep dashboard fresh

## Dashboard Display

### Location
- Announcements appear in a dedicated section on the dashboard
- Positioned before Employee Overview section
- Visible to all users based on targeting

### Layout
- Grid layout (2 columns on desktop, 1 on mobile)
- Maximum 5 announcements shown
- Pinned announcements displayed first

### Visual Indicators
- **Pinned**: Orange border with pin icon
- **Category**: Colored chip badge
- **Priority**: Colored priority badge
- **Poll**: Blue "Poll" badge with icon

## API Integration

### Creating an Announcement (Example)
```javascript
const response = await axios.post('/announcements', {
  title: 'Company All-Hands Meeting',
  content: 'Join us for our quarterly all-hands meeting this Friday at 3 PM',
  category: 'event',
  priority: 'high',
  targetAudience: 'all',
  isPinned: true
});
```

### Creating a Poll (Example)
```javascript
const response = await axios.post('/announcements', {
  title: 'Team Building Activity',
  content: 'Vote for your preferred team building activity next month',
  category: 'event',
  priority: 'medium',
  isPoll: true,
  pollOptions: ['Bowling', 'Escape Room', 'Picnic', 'Game Night'],
  pollMultipleChoice: false,
  endDate: '2025-11-01'
});
```

### Voting on a Poll (Example)
```javascript
const response = await axios.post('/announcements/:id/vote', {
  optionIndex: 1 // Voting for "Escape Room"
});
```

### Adding a Reaction (Example)
```javascript
const response = await axios.post('/announcements/:id/react', {
  type: 'celebrate'
});
```

## Navigation & Access

### Menu Item
- **Location**: Sidebar menu
- **Label**: "Announcements"
- **Icon**: Campaign icon (📢)
- **Access**: Admin, HR only
- **Route**: `/announcements`

### Dashboard Section
- **Location**: Main Dashboard and Employee Dashboard
- **Visibility**: All users (filtered by targeting)
- **Position**: After statistics, before Employee Overview

## Technical Details

### Database Collections
- **announcements** - Main collection for all announcements

### Indexes
- `isActive` + `createdAt` - For active announcements query
- `priority` + `isActive` - For priority filtering
- `isPinned` + `isActive` - For pinned announcements

### Middleware
- `authenticate` - Required for all routes
- `authorize(['admin', 'hr'])` - For management routes

### File Structure
```
server/
├── models/
│   └── Announcement.js
└── routes/
    └── announcements.js

client/src/
├── pages/
│   ├── Announcements/
│   │   └── AnnouncementManagement.jsx
│   └── Dashboard/
│       ├── Dashboard.jsx (includes AnnouncementsSection)
│       └── EmployeeDashboard.jsx (includes AnnouncementsSection)
└── components/
    └── Layout/
        └── Layout.jsx (menu item added)
```

## Troubleshooting

### Announcements Not Showing

**Problem**: Users can't see announcements on dashboard

**Solutions**:
1. Check announcement is active (`isActive: true`)
2. Verify date range (within start/end dates)
3. Check targeting matches user profile
4. Ensure user is logged in and authenticated

### Can't Vote on Poll

**Problem**: Vote button doesn't work or shows error

**Solutions**:
1. Check if already voted (single-choice polls)
2. Verify poll is still active
3. Ensure user is authenticated
4. Check network connection

### Management Page Not Accessible

**Problem**: Can't access `/announcements` page

**Solutions**:
1. Verify user has Admin or HR role
2. Check authentication token is valid
3. Clear browser cache and reload
4. Verify route is registered in App.jsx

## Future Enhancements (Potential)

- Email notifications for urgent announcements
- Comments on announcements
- File attachments support
- Rich text editor for content
- Announcement templates
- Analytics and insights
- Export poll results
- Scheduled auto-posting
- Multi-language support
- Announcement categories customization

## Security Considerations

- All routes require authentication
- Management routes restricted to Admin/HR
- User can only vote once per poll (single-choice)
- Visibility automatically filtered by targeting
- Reactions and votes are user-specific
- No sensitive data exposed in API responses

## Support

For issues or questions about the Announcement System:
1. Check this documentation
2. Review error logs in browser console
3. Contact your system administrator
4. Check API response for error messages

---

**Created**: October 2025
**Version**: 1.0
**Last Updated**: October 14, 2025

