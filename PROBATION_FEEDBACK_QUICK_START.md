# Probation Feedback System - Quick Start Guide

## 🚀 What Is This?

An **automated system** that triggers feedback forms when employees complete their 3-month probation period. No manual tracking needed!

## ⚡ Quick Setup (Already Done!)

The system is **already integrated** and will start working immediately. Here's what was set up:

### Backend ✅
- Model for storing feedback data
- Daily scheduler (runs at 9 AM)
- API routes for form submission
- Email & notification system

### Frontend ✅
- Employee self-assessment form
- Manager evaluation form
- Routes added to the app

### Server ✅
- Scheduler starts automatically with server
- No manual configuration needed!

## 🔄 How It Works (Automatic!)

### Day 90 - Probation Completion
```
9:00 AM → System detects employee completed 90 days
        ↓
        Creates feedback forms
        ↓
        Sends notifications:
        - Employee: "Complete your feedback"
        - Manager: "Review your team member"
        ↓
        Sends emails to both
```

### Day 93+ - Reminders
```
10:00 AM → System checks for pending forms
         ↓
         Sends reminders if not submitted
```

## 📝 User Journeys

### For Employees

1. **Day 90**: Get notification "🎓 Probation Feedback Required"
2. **Click** notification or email link
3. **Fill** 4 sections:
   - Learning & Development
   - Job Performance
   - Work Environment
   - Future Outlook
4. **Submit** within 7 days
5. **Done!** Manager gets notified

### For Managers

1. **Day 90**: Get notification "📋 Assessment Required for [Name]"
2. **Click** notification or email link
3. **Fill** 5 sections:
   - Performance Evaluation (ratings)
   - Behavioral Assessment (ratings)
   - Overall Assessment (detailed feedback)
   - Recommendation (Confirm/Extend/Terminate)
   - Future Planning
4. **Submit** within 7 days
5. **Done!** HR gets notified

### For HR

1. **Get notification** when both feedbacks submitted
2. **Review** both employee and manager responses
3. **Make final decision**:
   - Confirmed
   - Extended
   - Terminated
4. **Add HR comments**
5. **Submit** - Employee gets notified

## 🎯 Key Features

### Automatic Detection
- ✅ Checks daily at 9 AM
- ✅ Finds employees who joined exactly 90 days ago
- ✅ Creates feedback forms automatically

### Notifications
- ✅ In-app notifications with action buttons
- ✅ Email notifications with beautiful templates
- ✅ Reminders after 3 days if not submitted

### Comprehensive Forms
- ✅ Employee: Self-assessment with sliders and text
- ✅ Manager: Detailed evaluation with recommendation
- ✅ HR: Final review and decision

### Smart Status Tracking
- `pending` - Not started
- `employee_completed` - Employee submitted
- `manager_completed` - Manager submitted
- `both_completed` - Both submitted, awaiting HR
- `reviewed` - HR completed

## 🧪 Testing the System

### Quick Test (Manual Trigger)

1. **Create test employee** with joining date 90 days ago:
```javascript
// In MongoDB or employee creation form
employmentInfo.dateOfJoining = new Date('2025-07-17') // 90 days before Oct 15
```

2. **Trigger the scheduler manually**:
```bash
# Option 1: Restart server (scheduler runs on startup checks)
npm run dev

# Option 2: Call the scheduler directly (if exposed)
# Add this temporary route in server/index.js for testing:
app.get('/api/test/trigger-probation-check', async (req, res) => {
  const probationScheduler = require('./services/probationScheduler');
  await probationScheduler.runProbationCheck();
  res.json({ message: 'Probation check triggered' });
});
```

3. **Check results**:
   - Look for feedback form in database
   - Check notifications for employee and manager
   - Check email inbox (if configured)

### Email Testing

Email notifications require configuration:

```bash
# .env file
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
COMPANY_NAME=Your Company
CLIENT_URL=http://localhost:5173
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password (not regular password)

## 📱 Accessing Forms

### Employee Access
- **URL**: `/probation-feedback/:id`
- **From**: Notification click or email link
- **Can**: Fill and submit own feedback

### Manager Access
- **URL**: `/probation-feedback/manager/:id`
- **From**: Notification click or email link
- **Can**: Fill and submit assessment for reportee

### HR Access
- **URL**: `/probation-feedback/:id`
- **From**: Organization dashboard or notifications
- **Can**: View all feedbacks and make final decision

## 🎨 What Users See

### Employee Form Preview
```
🎓 Probation Feedback
Share Your Experience

[Purple gradient header]

Sections:
1. Learning & Development
   - Skills acquired (required)
   - Training effectiveness slider
   - Challenges, needs

2. Job Performance
   - Achievements (required)
   - Challenges faced
   - Support & clarity sliders

3. Work Environment
   - Team integration slider
   - Work-life balance slider
   - Resources slider

4. Future Outlook
   - Career goals (required)
   - Improvement areas
   - Continuation interest (required)
   - Comments

[Cancel] [Submit Feedback]
```

### Manager Form Preview
```
📋 Manager Assessment
Probation Review for John Doe

[Pink gradient header]

Sections:
1. Performance Evaluation
   - Technical skills (1-10)
   - Work quality (1-10)
   - Productivity (1-10)
   - Learning ability (1-10)

2. Behavioral Assessment
   - Communication (1-10)
   - Teamwork (1-10)
   - Initiative (1-10)
   - Reliability (1-10)
   - Adaptability (1-10)

3. Overall Assessment
   - Key strengths (required)
   - Areas for improvement
   - Training recommendations
   - Achievements (required)
   - Concerns

4. Recommendation (required)
   ○ Confirm ✅
   ○ Extend Probation ⏳
   ○ Terminate ❌

5. Future Planning
   - Role expectations
   - Development plan

[Cancel] [Submit Assessment]
```

## 🔔 Notification Examples

### Employee Notification
```
Title: 🎓 Probation Period Completed - Feedback Required
Message: Congratulations! You have completed your probation period. 
         Please submit your self-assessment feedback form.
Action: Complete Feedback Form →
Priority: High
```

### Manager Notification
```
Title: 📋 Probation Review Required - John Doe
Message: John Doe has completed their probation period. 
         Please submit your manager assessment feedback form.
Action: Complete Assessment →
Priority: High
```

### HR Notification
```
Title: Probation Review Completed - John Doe
Message: Both employee and manager feedbacks submitted. 
         Review and take action.
Action: Review Feedback →
Priority: High
```

## 📊 Monitoring

### Check Scheduler Status

In server console, you should see:
```
🎓 Starting Probation Scheduler...
✅ Probation Scheduler started successfully
```

Daily logs:
```
🔄 Running daily probation check...
📅 Checking for probation completions on 2025-10-15
👥 Found 2 employee(s) completing probation today
📝 Created feedback form for EMP001
📬 Created notification for employee EMP001
📧 Sent email to EMP001
✅ Probation completion check completed
```

### Database Queries

Check feedback forms:
```javascript
// In MongoDB
db.probationfeedbacks.find().sort({ createdAt: -1 })

// Count by status
db.probationfeedbacks.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

Check notifications:
```javascript
db.notifications.find({ type: 'probation_completed' }).sort({ createdAt: -1 })
```

## ⚠️ Common Issues & Fixes

### Issue: No feedbacks created
**Check:**
- Is any employee exactly 90 days from joining?
- Is scheduler running? (check console logs)
- Any errors in server logs?

**Fix:**
- Create test employee with date 90 days ago
- Restart server to trigger check
- Check probationScheduler.js for errors

### Issue: Emails not sending
**Check:**
- Are EMAIL_* env variables set?
- Is email service configured correctly?
- Check console for email errors

**Fix:**
- Set up email credentials in .env
- Test email service separately
- Check emailService.js configuration

### Issue: Notifications not appearing
**Check:**
- Is Notification model imported correctly?
- Are notifications being created? (check DB)
- Is user logged in?

**Fix:**
- Check notification creation logs
- Verify notification routes
- Test notification API directly

## 🎯 Success Criteria

System is working correctly when:

✅ **Day 90:**
- Feedback form created in database
- Employee receives in-app notification
- Manager receives in-app notification
- Both receive emails (if configured)

✅ **User Actions:**
- Employee can open and submit form
- Manager can open and submit assessment
- Forms save correctly to database

✅ **Day 93:**
- Reminder notifications sent (if not submitted)
- Only sent once per user

✅ **Completion:**
- HR notified when both submitted
- Status updates correctly
- Employee notified of final decision

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] Email service configured and tested
- [ ] Scheduler verified working
- [ ] Test with actual employee data
- [ ] Forms tested on all devices
- [ ] Notification system working
- [ ] Database indexed properly
- [ ] HR team trained
- [ ] Managers briefed
- [ ] Employees informed

### Launch Communication

**To All Staff:**
> "Starting today, our probation feedback process is automated. When you complete 90 days, you'll receive a notification to submit your feedback. Managers will also receive a notification to complete an assessment. This helps us ensure structured feedback for everyone."

**To Managers:**
> "You'll now receive automated notifications when your team members complete probation. Please complete the assessment form within 7 days of receiving the notification."

**To HR:**
> "The system runs automatically at 9 AM daily. You'll be notified when both feedbacks are submitted. Review and make final decisions from the probation feedback section."

## 📚 Quick Links

- **Full Documentation**: `PROBATION_FEEDBACK_SYSTEM.md`
- **Employee Model**: `server/models/Employee.js`
- **Feedback Model**: `server/models/ProbationFeedback.js`
- **Scheduler**: `server/services/probationScheduler.js`
- **API Routes**: `server/routes/probationFeedback.js`
- **Employee Form**: `client/src/pages/ProbationFeedback/EmployeeFeedbackForm.jsx`
- **Manager Form**: `client/src/pages/ProbationFeedback/ManagerFeedbackForm.jsx`

## 💡 Pro Tips

1. **Test thoroughly** with manual triggers before relying on daily automation
2. **Monitor logs** for the first few weeks to catch any issues
3. **Set up email** properly for better user experience
4. **Train HR and managers** on using the system
5. **Review feedback regularly** to identify patterns and improve onboarding

## 🎉 That's It!

The system is **ready to go** and requires **no manual intervention**. It will:
- Automatically detect probation completions every day
- Send notifications and emails
- Track submissions
- Send reminders
- Notify HR when ready for review

Just let it run! 🚀

---

**Quick Help**: If you need assistance, check the full documentation or contact the technical team.

**Last Updated**: October 15, 2025

