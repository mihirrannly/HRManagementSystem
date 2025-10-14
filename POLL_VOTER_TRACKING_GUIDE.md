# Poll Voter Tracking - Feature Guide

## Overview

HR and Admin users can now see exactly who voted for each option in polls. This feature provides complete transparency while maintaining a user-friendly interface.

## 🎯 How to View Poll Voters

### Step 1: Go to Announcements Management
1. Login as HR or Admin
2. Navigate to `/announcements`
3. Find polls in the list (they have a 🗳️ Poll icon)

### Step 2: View Poll Results
Polls display a gray box with results showing:
- Each poll option
- Number of votes per option
- Total votes count

### Step 3: Expand to See Voters
1. Look for the **expand arrow** (▼) in the top-right of the poll results box
2. Click the arrow to expand and see detailed voter information
3. Click again (▲) to collapse the details

### What You'll See When Expanded:
```
Poll Results:                          ▲
• Yes: 1 vote
  👤 Mihir Bhardwaj (CODR034)
• No: 0 votes
```

## 📊 Information Displayed

For each voter, you'll see:
- ✅ **Full Name** (e.g., "Mihir Bhardwaj")
- ✅ **Employee ID** (e.g., "CODR034") 
- ✅ **Which option they voted for**

## 🔄 Real-Time Updates

- Page auto-refreshes every 30 seconds
- Click "Refresh Now" button for instant update
- Voter details are fetched automatically
- Expanded state persists during navigation

## 💻 Technical Details

### Backend API

New endpoint added: `GET /api/employees/user/:userId`

Returns:
```json
{
  "success": true,
  "user": {
    "email": "mihir@rannkly.com",
    "role": "admin"
  },
  "employee": {
    "employeeId": "CODR034",
    "personalInfo": {
      "firstName": "Mihir",
      "lastName": "Bhardwaj"
    }
  }
}
```

### Frontend Features

1. **Expand/Collapse Toggle**
   - Click arrow icon to toggle
   - Only one poll expanded at a time
   - Smooth animation

2. **Voter Details Fetching**
   - Automatically fetched when announcements load
   - Cached for performance
   - Shows "Unknown User" if fetch fails

3. **Visual Indicators**
   - 👤 Person icon for each voter
   - Blue color for voter names
   - Indented under each option

## 📋 Example Use Cases

### Use Case 1: Office Reopening Survey
**Poll**: "When should we return to office?"
**Options**:
- Immediately (5 votes)
  - John Doe (EMP001)
  - Jane Smith (EMP002)
  - ...
- In 2 weeks (12 votes)
  - ...
- Stay remote (3 votes)

### Use Case 2: Team Building Activity
**Poll**: "Which activity do you prefer?"
**Options**:
- Bowling (8 votes)
- Escape Room (15 votes)
- Picnic (5 votes)

HR can see who voted for what and make informed decisions based on department preferences.

## 🔒 Privacy & Security

- **Only HR/Admin can see voter details**
- Employees only see vote counts, not names
- Voter information is securely stored
- No personal data beyond name and employee ID shown

## 🎨 UI Features

### Poll Results Box
```
┌─────────────────────────────────────┐
│ Poll Results:                    ▼  │
│ • Yes: 1 vote                       │
│ • No: 0 votes                       │
│ 🗳️ 1 total votes                    │
└─────────────────────────────────────┘
```

### Expanded View
```
┌─────────────────────────────────────┐
│ Poll Results:                    ▲  │
│ • Yes: 1 vote                       │
│   👤 Mihir Bhardwaj (CODR034)      │
│ • No: 0 votes                       │
│ 🗳️ 1 total votes                    │
└─────────────────────────────────────┘
```

## 🚀 Quick Commands

### View All Poll Voters (CLI)
Create and run this script to see all voters:

```javascript
// check-voters.js
const mongoose = require('mongoose');
const Announcement = require('./server/models/Announcement');

mongoose.connect('mongodb://localhost:27017/rannkly_hr');

Announcement.find({ isPoll: true })
  .then(polls => {
    polls.forEach(poll => {
      console.log(`\nPoll: ${poll.title}`);
      poll.pollOptions.forEach((opt, i) => {
        console.log(`  ${i+1}. ${opt.option}: ${opt.votes.length} votes`);
      });
    });
    process.exit(0);
  });
```

Run: `node check-voters.js`

## 📊 Voter Statistics

The system tracks:
- Who voted (User ID, Name, Employee ID)
- When they voted (Timestamp)
- What they voted for (Option index)
- Total votes per option
- Percentage distribution

## 🔧 Troubleshooting

### Voters Not Showing
1. **Check if expanded** - Click the arrow icon
2. **Refresh the page** - Click "Refresh Now"
3. **Wait for auto-refresh** - Takes up to 30 seconds
4. **Check permissions** - Must be HR or Admin

### "Unknown User" Shows
- User account deleted or not found
- Employee record not linked
- Database sync issue

### Expand Arrow Not Working
- Hard refresh browser (Ctrl+Shift+R)
- Clear cache
- Check browser console for errors

## 📝 Best Practices

### For HR/Admin:
1. **Review voters before decisions** - See who participated
2. **Check department distribution** - Understand preferences by team
3. **Follow up with non-voters** - Encourage participation
4. **Export results** - Keep records of important polls

### For Creating Polls:
1. **Clear options** - Make choices obvious
2. **Reasonable deadline** - Give time to vote
3. **Single choice** - For most polls (unless multiple opinions needed)
4. **Follow up** - Share results and actions taken

## 🎓 Training Tips

### For HR Team:
1. Practice expanding/collapsing poll results
2. Understand the voter information displayed
3. Know how to refresh for latest data
4. Learn to interpret results for decision-making

### For Employees:
- They only see vote counts, not who voted
- Can vote once per single-choice poll
- Can see their own vote marked with "You voted"

## ✅ Feature Checklist

- ✅ Expand/collapse voter details
- ✅ See voter name and employee ID
- ✅ Auto-refresh every 30 seconds
- ✅ Manual refresh button
- ✅ Privacy: Only HR/Admin can see
- ✅ Secure API endpoint
- ✅ Error handling
- ✅ Loading states
- ✅ Visual indicators

## 🔮 Future Enhancements

Potential additions:
- Export voter list to CSV
- Filter voters by department
- Show vote timestamps
- Anonymous voting toggle
- Voter demographics charts
- Email notifications to non-voters

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Verify user has HR/Admin role
3. Test with hard refresh
4. Check network tab for API errors
5. Contact system administrator

---

**Feature Status**: ✅ LIVE  
**Access Level**: HR/Admin Only  
**Version**: 1.2.0  
**Last Updated**: October 14, 2025

