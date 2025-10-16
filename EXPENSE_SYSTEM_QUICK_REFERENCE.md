# Expense Management System - Quick Reference Card

## 📍 Access
**URL**: Organization → Expense Management  
**Module**: `client/src/pages/Organization/modules/ExpenseModule.jsx`

---

## 🎯 For Employees

### Submit Expense
```
Click "Submit Expense" → Fill Form → Upload Receipts → Submit
```

**Required Fields**:
- Category (meals/travel/accommodation/transport/office/medical/communication/other)
- Amount (₹)
- Description
- Expense Date
- At least 1 receipt (image/PDF)

**Optional**:
- Employee notes
- Reimbursement details (bank/UPI)

### View Status
- **Pending**: Under review
- **Approved**: Payment coming
- **Rejected**: See reason, resubmit if needed
- **Reimbursed**: Payment done ✓

### Edit/Delete
- Only **pending** expenses can be modified
- Click expense → Delete button

---

## 🎯 For HR/Admin

### Dashboard View
- Total Expenses (₹)
- Pending Approval (count)
- Approved (count)
- Reimbursed (count)

### Review Process
```
Click Expense → View Details → Review Receipts → Approve/Reject
```

### Actions
- **Approve**: Click "Approve" → Add notes (optional) → Confirm
- **Reject**: Click "Reject" → Enter reason (required) → Confirm
- **Reimburse**: Use API endpoint (after payment processed)

---

## 🔌 API Quick Reference

### Base URL
```
http://localhost:5001/api/expenses
```

### Key Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/expenses` | Employee | Create expense |
| GET | `/api/expenses` | All | List expenses |
| GET | `/api/expenses/my` | Employee | My expenses |
| GET | `/api/expenses/stats` | HR/Admin | Statistics |
| PUT | `/api/expenses/:id/approve` | HR/Admin | Approve |
| PUT | `/api/expenses/:id/reject` | HR/Admin | Reject |
| DELETE | `/api/expenses/:id` | Owner/HR | Delete |

### Headers
```javascript
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "multipart/form-data" // for file uploads
}
```

---

## 📁 Files Structure

### Backend
```
server/
├── models/Expense.js          (Database model)
├── routes/expenses.js         (API endpoints)
└── index.js                   (Route registration)
```

### Frontend
```
client/src/pages/Organization/modules/
└── ExpenseModule.jsx          (Complete UI)
```

---

## 🗄️ Database Model (Quick)

```javascript
Expense {
  employee: ObjectId
  category: String (8 types)
  amount: Number
  description: String
  expenseDate: Date
  receipts: Array<File>
  reimbursement: Object
  status: String (5 states)
  approvedBy: ObjectId
  rejectionReason: String
  adminNotes: String
  isDeleted: Boolean
}
```

---

## 🎨 Categories

| Value | Label | Icon |
|-------|-------|------|
| meals | Meals & Entertainment | 🍽️ |
| travel | Travel | ✈️ |
| accommodation | Accommodation | 🏨 |
| transport | Transport | 🚗 |
| office | Office Supplies | 🏢 |
| medical | Medical | ⚕️ |
| communication | Communication | 📞 |
| other | Other | 📋 |

---

## 🔒 Permissions

| Role | Create | View Own | View All | Approve | Reject | Delete Own |
|------|--------|----------|----------|---------|--------|------------|
| Employee | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (pending) |
| HR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📊 Status Colors

- 🟡 **Pending** - Yellow (warning)
- 🟢 **Approved** - Green (success)
- 🔴 **Rejected** - Red (error)
- 🔵 **Processing** - Blue (info)
- 🟢 **Reimbursed** - Green (success)

---

## 🚀 Quick Test

### Test Employee Submission
```bash
# 1. Login as employee
# 2. Go to Organization → Expense Management
# 3. Click "Submit Expense"
# 4. Fill: Category=Meals, Amount=1000, Description="Lunch", Date=Today
# 5. Upload a receipt image
# 6. Click Submit
# 7. Verify: Shows in list with "Pending" status
```

### Test HR Approval
```bash
# 1. Login as HR/Admin
# 2. Go to Organization → Expense Management
# 3. See dashboard stats
# 4. Click on pending expense
# 5. Click "Approve"
# 6. Verify: Status changes to "Approved"
```

---

## 💡 Common Tasks

### Employee: Submit Travel Expense
```
Category: Travel
Amount: 5000
Description: "Mumbai client visit"
Date: Trip date
Receipts: Flight ticket + Hotel bill
Reimbursement: Add bank details
```

### HR: Batch Approve
```
For each pending expense:
1. Click expense
2. Review receipts
3. Click "Approve"
4. Add note if needed
5. Confirm
```

### Finance: Mark Reimbursed
```http
PUT /api/expenses/:id/reimburse
{
  "reimbursedAmount": 5000,
  "transactionId": "TXN123456",
  "adminNotes": "Payment processed via NEFT"
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Error creating expense" | Fill all required fields + upload receipt |
| "Access denied" | Check login role (HR/Admin for approvals) |
| "Cannot update expense" | Only pending expenses can be edited |
| Receipts not showing | Check CORS + file upload path |
| API not responding | Verify server running + JWT token valid |

---

## 📖 Full Documentation

- **Complete Guide**: `EXPENSE_MANAGEMENT_GUIDE.md`
- **Quick Start**: `EXPENSE_QUICK_START.md`
- **Implementation**: `EXPENSE_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Checklist: Is It Working?

### Backend
- [ ] Server running (`npm start` in server/)
- [ ] MongoDB connected
- [ ] `/api/expenses` routes registered
- [ ] Auth middleware working
- [ ] File upload configured

### Frontend
- [ ] Frontend running (`npm run dev` in client/)
- [ ] Can navigate to Expense Management
- [ ] Submit button visible
- [ ] Form fields working
- [ ] File upload button present

### Integration
- [ ] Can submit expense
- [ ] Can view expense list
- [ ] HR can see all expenses
- [ ] Can approve/reject
- [ ] Status updates reflect
- [ ] Receipts visible

---

## 🎯 Key Features at a Glance

✅ Submit expenses with receipts  
✅ Multiple categories (8 types)  
✅ Upload multiple files (10 max)  
✅ Reimbursement details (bank/UPI)  
✅ HR approval workflow  
✅ Rejection with reasons  
✅ Dashboard statistics  
✅ Status tracking  
✅ Audit trail  
✅ Role-based access  
✅ Secure file storage (S3/local)

---

## 📱 UI Components

1. **Header** - Title + Submit button
2. **Stats Cards** - 4 metric cards (HR/Admin only)
3. **Expense List** - All expenses with details
4. **Submit Dialog** - Form + file upload
5. **View Dialog** - Details + receipts + actions
6. **Approval Dialog** - Approve/reject confirmation
7. **Snackbar** - Success/error notifications

---

## 🔐 Security Features

- JWT authentication required
- Role-based authorization
- Input validation (frontend + backend)
- File type validation
- File size limits (10MB)
- Soft delete (data retention)
- Audit trail (who/when)
- CORS protection

---

## 📈 Metrics Available

### Via Dashboard:
- Total expense amount
- Pending count
- Approved count  
- Reimbursed count

### Via API (`/api/expenses/stats`):
- Status breakdown
- Category breakdown
- Total amounts by status/category

---

## 🎓 Best Practices Summary

**Employees**:
- Submit within 30 days
- Clear receipt images
- Detailed descriptions
- Accurate amounts

**HR/Admin**:
- Review within 2-3 days
- Clear rejection reasons
- Document decisions
- Process payments promptly

---

## ⚡ Quick Commands

### Start Backend
```bash
cd server
npm start
```

### Start Frontend
```bash
cd client
npm run dev
```

### Test API
```bash
curl -X GET http://localhost:5001/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎉 You're All Set!

Everything is implemented and ready to use. Start submitting and managing expenses now!

**Quick Start**: Go to Organization → Expense Management → Click "Submit Expense"

---

**Last Updated**: October 15, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready


