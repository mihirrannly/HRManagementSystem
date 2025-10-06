# Exit Management - Troubleshooting Guide

## 🔧 Common Issues & Solutions

---

## 1. Employee Not Showing in Dropdown

### **Symptoms:**
- Can't find employee when creating exit record
- Dropdown shows "No employees found"
- Only some employees visible

### **Possible Causes & Solutions:**

#### **Cause 1: Employee is Inactive**
✅ **Solution:** 
- Go to Employees module
- Search for the employee
- Check if `isActive` is false
- Only active employees show in exit dropdown (by design)
- If needed, reactivate employee first, then create exit record

#### **Cause 2: API Pagination Limit**
✅ **Solution:**
- Already fixed with `limit=500` parameter
- If you have >500 active employees, contact IT to increase limit
- Check browser console for actual employee count

#### **Cause 3: Role Permissions**
✅ **Solution:**
- Only HR and Admin can see all employees
- Managers only see their team
- Check your role in user profile
- Contact HR for role elevation if needed

#### **Cause 4: Network/Loading Issue**
✅ **Solution:**
- Refresh the page
- Check browser console for errors
- Verify internet connection
- Clear browser cache (Ctrl+Shift+Del)

---

## 2. Clearance Items Not Updating

### **Symptoms:**
- Click on clearance item, nothing happens
- Status doesn't change from pending to completed
- Progress bar doesn't update

### **Possible Causes & Solutions:**

#### **Cause 1: No Permissions**
✅ **Solution:**
- Check if you have permission for that clearance type
- IT team → IT clearance only
- Finance team → Finance clearance only
- Contact HR if you need access

#### **Cause 2: Network Error**
✅ **Solution:**
- Check browser console for API errors
- Verify server is running (check backend logs)
- Test API endpoint manually: 
  ```bash
  curl http://localhost:5001/api/exit-management/{id}/clearance/itClearance
  ```

#### **Cause 3: Invalid Exit Record**
✅ **Solution:**
- Verify exit record exists
- Check exit record ID is correct
- Ensure exit record not in "completed" status
- Completed exits cannot be modified

#### **Cause 4: Frontend Caching**
✅ **Solution:**
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Open in incognito/private window
- Check if using latest code version

---

## 3. Exit Survey Not Submitting

### **Symptoms:**
- Click "Submit Survey" - nothing happens
- Error message: "Failed to submit exit survey"
- 400 Bad Request error

### **Possible Causes & Solutions:**

#### **Cause 1: Required Fields Missing**
✅ **Solution:**
- Scroll through all 4 sections
- Ensure all sliders have values
- Check all radio buttons are selected
- Fill all text fields

#### **Cause 2: Data Structure Mismatch**
✅ **Solution:**
- Already fixed with proper data structuring
- If issue persists, check browser console
- Verify survey data format matches API requirements:
  ```javascript
  {
    compensationBenefits: {...},
    workEnvironment: {...},
    organizationCulture: {...},
    triggerReason: {...}
  }
  ```

#### **Cause 3: Authentication Token Expired**
✅ **Solution:**
- Logout and login again
- Check if token is present: `localStorage.getItem('token')`
- Verify token is valid (not expired)

#### **Cause 4: API Endpoint Issue**
✅ **Solution:**
- Verify server is running
- Check API endpoint: `/api/exit-management/{id}/exit-survey`
- Test with curl/Postman
- Review server logs for errors

---

## 4. Final Settlement Calculation Wrong

### **Symptoms:**
- Settlement amount doesn't match expectations
- Missing components in calculation
- Deductions not applied

### **Possible Causes & Solutions:**

#### **Cause 1: Pro-rata Not Calculated**
✅ **Solution:**
- Verify working days in month
- Check attendance records
- Ensure last working date is correct
- Formula: (Monthly salary / Total days) × Days worked

#### **Cause 2: Leave Balance Incorrect**
✅ **Solution:**
- Check leave balance in system
- Verify leave encashment policy
- Ensure leave taken is deducted
- Contact HR for manual adjustment if needed

#### **Cause 3: Loan Recovery Not Included**
✅ **Solution:**
- Check if employee has pending loans
- Verify loan amount in Finance module
- Ensure loan recovery is configured
- Manual deduction if needed

#### **Cause 4: Notice Period Shortfall**
✅ **Solution:**
- Calculate actual notice period served
- Check company policy for shortfall deduction
- Formula: (Monthly salary / 30) × Days short
- Document reason for shortfall

---

## 5. Access Still Working After Exit

### **Symptoms:**
- Employee can still login
- Email still active
- Building access still works

### **Possible Causes & Solutions:**

#### **Cause 1: IT Clearance Not Completed**
✅ **Solution:**
- Go to Clearance tab
- Check IT clearance items
- Click "Email Account Deactivation"
- Click "System Access Revocation"
- Verify changes applied

#### **Cause 2: Active Directory Sync Delay**
✅ **Solution:**
- Wait for AD sync (usually 15 minutes)
- Force sync if possible
- Contact IT support for immediate revocation
- Verify in AD management console

#### **Cause 3: Exit Date in Future**
✅ **Solution:**
- Check last working date
- Access typically revoked on last day EOD
- For immediate revocation, update status manually
- Contact IT for emergency revocation

#### **Cause 4: Multiple Accounts**
✅ **Solution:**
- List all employee accounts
- Revoke access for all accounts
- Check alternative email addresses
- Verify VPN access also revoked

---

## 6. Documents Not Generating

### **Symptoms:**
- Relieving letter not available
- Experience certificate missing
- Settlement statement not generated

### **Possible Causes & Solutions:**

#### **Cause 1: Template Not Configured**
✅ **Solution:**
- Check if templates exist in system
- Verify template placeholders
- Contact IT to configure templates
- Use manual templates if needed

#### **Cause 2: Exit Not Completed**
✅ **Solution:**
- Verify all clearances completed
- Check exit status is "completed"
- Ensure settlement processed
- Complete all pending items first

#### **Cause 3: Missing Employee Data**
✅ **Solution:**
- Check employee profile completeness
- Verify joining date exists
- Ensure department/designation filled
- Update missing fields in employee record

#### **Cause 4: Permission Issue**
✅ **Solution:**
- Only HR/Admin can generate documents
- Check your role permissions
- Request access from HR
- Use document generation feature in HR module

---

## 7. Exit Survey Data Not Showing

### **Symptoms:**
- Survey submitted but no data visible
- Survey tab shows "not completed"
- Analytics missing survey responses

### **Possible Causes & Solutions:**

#### **Cause 1: Survey Not Saved to Database**
✅ **Solution:**
- Check browser console for errors
- Verify API response after submission
- Look for 200 OK status
- Resubmit survey if needed

#### **Cause 2: Data Mapping Issue**
✅ **Solution:**
- Check if survey data structure changed
- Verify field names match database schema
- Contact IT to verify data mapping
- Check database directly: 
  ```javascript
  exitRecord.exitSurvey.compensationBenefits
  ```

#### **Cause 3: Caching Issue**
✅ **Solution:**
- Refresh page
- Force data reload
- Check if latest data fetched from API
- Clear Redux/state cache if applicable

#### **Cause 4: Display Component Issue**
✅ **Solution:**
- Check ExitSurveySummary component
- Verify props passed correctly
- Check for console errors
- Test with different browser

---

## 8. Performance Issues

### **Symptoms:**
- Page loading slowly
- Dropdown takes time to populate
- Clearance updates lag

### **Possible Causes & Solutions:**

#### **Cause 1: Too Many Records**
✅ **Solution:**
- Implement pagination for exit records
- Add filters (date range, status)
- Archive old exits (>1 year)
- Optimize database queries

#### **Cause 2: Large Employee List**
✅ **Solution:**
- Already optimized with limit=500
- Consider virtual scrolling for >1000 employees
- Add search-as-you-type
- Cache employee list locally

#### **Cause 3: Slow API Response**
✅ **Solution:**
- Check server performance
- Add database indexing
- Implement API caching
- Use CDN for static assets

#### **Cause 4: Heavy UI Rendering**
✅ **Solution:**
- Optimize React components
- Use React.memo for expensive components
- Implement lazy loading
- Reduce unnecessary re-renders

---

## 9. Mobile/Responsive Issues

### **Symptoms:**
- UI broken on mobile
- Buttons not clickable
- Text overlapping

### **Possible Causes & Solutions:**

#### **Cause 1: Viewport Issues**
✅ **Solution:**
- Ensure responsive design implemented
- Test on different screen sizes
- Use MUI Grid system properly
- Add mobile-specific styles

#### **Cause 2: Touch Events Not Working**
✅ **Solution:**
- Add touch event listeners
- Increase button/link tap areas
- Test on actual mobile devices
- Consider mobile-first design

---

## 10. Export/Report Issues

### **Symptoms:**
- Export button not working
- CSV/PDF incomplete
- Wrong data in export

### **Possible Causes & Solutions:**

#### **Cause 1: Export Function Not Implemented**
✅ **Solution:**
- Check if export functionality exists
- Implement CSV export using library
- Add PDF generation for reports
- Use proper data formatting

#### **Cause 2: Data Filter Not Applied**
✅ **Solution:**
- Verify filter parameters passed to export
- Check if date range applied
- Ensure status filter working
- Test with different filter combinations

---

## 🔍 Debugging Checklist

When facing any issue, check these in order:

1. **Browser Console**
   ```
   F12 → Console tab → Look for errors (red text)
   Check network tab for failed API calls
   Verify console.log debugging messages
   ```

2. **Network Tab**
   ```
   F12 → Network tab → Look for failed requests
   Check request payload (what you're sending)
   Check response (what server returns)
   Verify status codes (200 OK, 400 Bad Request, etc.)
   ```

3. **Local Storage**
   ```
   F12 → Application → Local Storage → Check token
   Verify token exists and not expired
   Check other stored data
   ```

4. **Server Logs**
   ```
   Check terminal running server
   Look for error stack traces
   Verify API endpoints being hit
   Check database connection
   ```

5. **Database**
   ```
   Connect to MongoDB
   Verify data exists
   Check data structure
   Run test queries
   ```

---

## 📞 Escalation Path

### **Level 1: Self-Service**
- Check this troubleshooting guide
- Search browser console for errors
- Try basic fixes (refresh, logout/login)

### **Level 2: IT Support**
- Create support ticket
- Provide error details from console
- Include steps to reproduce
- Share screenshots

### **Level 3: HR Department**
- For policy/process questions
- For access/permission issues
- For manual workarounds
- For urgent employee issues

### **Level 4: Development Team**
- For bug fixes
- For feature requests
- For system enhancements
- For critical production issues

---

## 🛠️ Developer Debug Commands

```javascript
// Check exit record
console.log('Exit Record:', selectedExit);

// Check employees list
console.log('Employees:', employees);

// Check clearance data
console.log('Clearance:', selectedExit.clearance);

// Check survey data
console.log('Survey:', selectedExit.exitSurvey);

// Test API manually
fetch('/api/exit-management', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## 📝 Reporting Bugs

When reporting a bug, include:

1. **Steps to Reproduce**
   - Exact clicks/actions taken
   - Order of operations
   - Starting state

2. **Expected Behavior**
   - What should happen
   - Desired outcome

3. **Actual Behavior**
   - What actually happens
   - Error messages
   - Unexpected results

4. **Environment**
   - Browser (Chrome 120, Firefox 119, etc.)
   - Operating System (Windows 11, macOS 14, etc.)
   - Screen size (desktop/tablet/mobile)
   - User role (HR/Admin/Manager)

5. **Screenshots/Videos**
   - Screen recording of issue
   - Console errors screenshot
   - Network tab screenshot

6. **Additional Context**
   - When did it start happening?
   - Does it happen every time?
   - Any recent changes?

---

## ✅ Preventive Measures

### **For HR/Admin:**
- Regular system health checks
- Monthly data cleanup
- Quarterly process review
- Training for new features

### **For IT:**
- Monitor server performance
- Regular database maintenance
- Keep dependencies updated
- Scheduled backups

### **For All Users:**
- Keep browser updated
- Clear cache monthly
- Report issues immediately
- Document workarounds

---

**Need Help? Contact IT Support: itsupport@company.com 📧**

