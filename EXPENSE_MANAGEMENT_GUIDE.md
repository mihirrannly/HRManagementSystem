# Expense Management System - Complete Guide

## 🎯 Overview

The Expense Management System allows employees to submit expenses with bill images/receipts, and HR/Admins can view, approve, reject, and manage reimbursements for all expenses.

---

## ✨ Features

### For Employees:
- ✅ Submit expenses with multiple categories
- ✅ Upload multiple receipt images/documents
- ✅ Add reimbursement details (bank/UPI)
- ✅ View their own expense history
- ✅ Track approval status
- ✅ Add notes and descriptions
- ✅ Edit pending expenses
- ✅ Delete pending expenses

### For HR/Admin:
- ✅ View all employee expenses
- ✅ Approve/reject expenses with reasons
- ✅ View expense statistics dashboard
- ✅ Add admin notes to expenses
- ✅ Track reimbursement status
- ✅ View all receipt images
- ✅ Filter by status, category, date range

---

## 📦 Files Created/Modified

### Backend Files:
1. **`server/models/Expense.js`** - Mongoose model for expenses
2. **`server/routes/expenses.js`** - API endpoints for expense management
3. **`server/index.js`** - Updated to include expense routes

### Frontend Files:
1. **`client/src/pages/Organization/modules/ExpenseModule.jsx`** - Complete UI for expense management

---

## 🗄️ Database Schema

### Expense Model

```javascript
{
  employee: ObjectId (ref: User) - Employee who submitted
  employeeName: String - Employee name
  employeeId: String - Employee ID
  category: String (enum) - meals, travel, accommodation, transport, office, medical, communication, other
  amount: Number - Expense amount
  description: String - Expense description
  expenseDate: Date - When expense was incurred
  
  receipts: [{
    filename: String
    originalName: String
    url: String
    key: String (S3 key if using S3)
    size: Number
    mimetype: String
    uploadedAt: Date
  }]
  
  reimbursement: {
    accountHolderName: String
    accountNumber: String
    bankName: String
    ifscCode: String
    upiId: String
    paymentMethod: String (bank_transfer, upi, cheque, cash)
  }
  
  status: String (enum) - pending, approved, rejected, processing, reimbursed
  approvedBy: ObjectId (ref: User)
  approvedAt: Date
  rejectionReason: String
  
  reimbursedAmount: Number
  reimbursedAt: Date
  transactionId: String
  
  employeeNotes: String
  adminNotes: String
  
  isDeleted: Boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### 1. Create Expense
**POST** `/api/expenses`
- **Auth**: Required (Employee)
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```javascript
  {
    category: 'meals',
    amount: 2500,
    description: 'Client dinner meeting',
    expenseDate: '2025-01-15',
    employeeNotes: 'Meeting with ABC Corp',
    reimbursement: {
      accountHolderName: 'John Doe',
      accountNumber: '1234567890',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      paymentMethod: 'bank_transfer'
    },
    receipts: [File, File] // Multiple files
  }
  ```
- **Response**:
  ```javascript
  {
    message: 'Expense submitted successfully',
    expense: { ... }
  }
  ```

### 2. Get All Expenses
**GET** `/api/expenses?status=pending&category=meals&startDate=2025-01-01&endDate=2025-01-31&page=1&limit=50`
- **Auth**: Required
- **Access**: 
  - Employees see their own expenses
  - HR/Admin see all expenses
- **Query Params**:
  - `status` - pending, approved, rejected, processing, reimbursed
  - `category` - Filter by category
  - `startDate` - Filter from date
  - `endDate` - Filter to date
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 50)

### 3. Get My Expenses
**GET** `/api/expenses/my?status=pending`
- **Auth**: Required (Employee)
- **Returns**: Current user's expenses only

### 4. Get Expense Statistics
**GET** `/api/expenses/stats`
- **Auth**: Required (HR/Admin only)
- **Response**:
  ```javascript
  {
    statusStats: [
      { _id: 'pending', count: 5, totalAmount: 25000 },
      { _id: 'approved', count: 10, totalAmount: 50000 }
    ],
    categoryStats: [
      { _id: 'meals', count: 8, totalAmount: 15000 }
    ]
  }
  ```

### 5. Get Single Expense
**GET** `/api/expenses/:id`
- **Auth**: Required
- **Access**: Employee can see own, HR/Admin can see all

### 6. Update Expense
**PUT** `/api/expenses/:id`
- **Auth**: Required (Employee - own expense, pending status only)
- **Content-Type**: `multipart/form-data`
- **Note**: Can only update pending expenses

### 7. Approve Expense
**PUT** `/api/expenses/:id/approve`
- **Auth**: Required (HR/Admin only)
- **Body**:
  ```javascript
  {
    adminNotes: 'Approved as per policy'
  }
  ```

### 8. Reject Expense
**PUT** `/api/expenses/:id/reject`
- **Auth**: Required (HR/Admin only)
- **Body**:
  ```javascript
  {
    rejectionReason: 'Missing proper receipt',
    adminNotes: 'Please resubmit with valid receipt'
  }
  ```

### 9. Mark as Reimbursed
**PUT** `/api/expenses/:id/reimburse`
- **Auth**: Required (HR/Admin only)
- **Body**:
  ```javascript
  {
    reimbursedAmount: 2500,
    transactionId: 'TXN123456',
    adminNotes: 'Payment processed'
  }
  ```

### 10. Delete Expense
**DELETE** `/api/expenses/:id`
- **Auth**: Required
- **Access**: 
  - Employee can delete own pending expenses
  - HR/Admin can delete any expense
- **Note**: Soft delete (sets isDeleted: true)

### 11. Delete Receipt
**DELETE** `/api/expenses/:expenseId/receipts/:receiptId`
- **Auth**: Required (Employee - own expense, pending status only)

---

## 🎨 Frontend Usage

### Accessing the Expense Module

The Expense Module is accessible from the Organization section:

1. Navigate to **Organization** → **Expense Management**
2. The module is located at: `client/src/pages/Organization/modules/ExpenseModule.jsx`

### Employee Workflow

#### 1. Submit an Expense

```
1. Click "Submit Expense" button
2. Fill in the form:
   - Select category (meals, travel, accommodation, etc.)
   - Enter amount
   - Add description
   - Select expense date
   - Upload receipt images (multiple allowed)
   - Add any notes
   - (Optional) Add reimbursement details:
     * Choose payment method (bank transfer, UPI, cheque, cash)
     * Enter account details or UPI ID
3. Click "Submit Expense"
```

#### 2. View Expenses

```
- All your expenses are listed on the main page
- Click on any expense to view full details
- See status: pending, approved, rejected, reimbursed
- View all uploaded receipts
- Read admin notes or rejection reasons
```

#### 3. Edit/Delete Pending Expenses

```
- Open expense details
- Only "pending" expenses can be edited or deleted
- Click "Delete" to remove
- Click "Edit" to modify (if implemented)
```

### HR/Admin Workflow

#### 1. View Dashboard Statistics

```
Dashboard shows:
- Total Expenses (amount)
- Pending Approval (count)
- Approved (count)
- Reimbursed (count)
```

#### 2. Review Expenses

```
1. View all employee expenses in the list
2. Click on any expense to see details:
   - Employee information
   - Expense details
   - All receipt images
   - Reimbursement details
   - Employee notes
```

#### 3. Approve Expense

```
1. Open expense details
2. Click "Approve" button
3. (Optional) Add admin notes
4. Confirm approval
```

#### 4. Reject Expense

```
1. Open expense details
2. Click "Reject" button
3. Enter rejection reason (required)
4. (Optional) Add admin notes
5. Confirm rejection
```

#### 5. Mark as Reimbursed

```
(After approval, through backend API)
PUT /api/expenses/:id/reimburse
{
  reimbursedAmount: 2500,
  transactionId: 'TXN123456'
}
```

---

## 💡 Expense Categories

| Category | Icon | Use Case |
|----------|------|----------|
| **Meals** | 🍽️ | Client dinners, team meals, food expenses |
| **Travel** | ✈️ | Flight tickets, train tickets, travel bookings |
| **Accommodation** | 🏨 | Hotel stays, lodging expenses |
| **Transport** | 🚗 | Taxi, cab, local transport, fuel |
| **Office** | 🏢 | Office supplies, stationery, equipment |
| **Medical** | ⚕️ | Medical expenses, health checkups |
| **Communication** | 📞 | Phone bills, internet, communication tools |
| **Other** | 📋 | Any other business expense |

---

## 🔒 Security & Permissions

### Access Control:
- **Employees**: Can create and view own expenses
- **HR/Admin**: Can view all expenses, approve/reject, manage reimbursements
- **Authentication**: JWT token required for all endpoints
- **File Upload**: Uses multer with S3 integration (or local storage fallback)

### Validation:
- Required fields validation
- File type validation (images and PDFs only)
- File size limits (configured in middleware)
- Status transition validation (can only approve/reject pending expenses)

---

## 📁 File Upload Configuration

### Using S3 (Recommended for Production):
Files are stored in S3 under the `documents/` folder with the configured upload middleware.

### Using Local Storage:
If S3 is not configured, files are stored locally in `uploads/documents/` folder.

### Supported File Types:
- Images: JPG, JPEG, PNG, GIF, WEBP
- Documents: PDF

### File Size Limit:
- Default: 10MB per file
- Configurable in `server/middleware/s3Upload.js`

---

## 🎯 Status Workflow

```
PENDING → APPROVED → REIMBURSED
    ↓
  REJECTED
```

### Status Meanings:
- **Pending**: Submitted by employee, awaiting review
- **Approved**: Approved by HR/Admin, ready for payment
- **Rejected**: Rejected by HR/Admin with reason
- **Processing**: (Optional) Payment is being processed
- **Reimbursed**: Payment completed

---

## 🧪 Testing the System

### 1. Test Employee Submission

```javascript
// Using Postman or similar tool
POST http://localhost:5001/api/expenses
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data

Body (form-data):
  category: meals
  amount: 2500
  description: Client dinner
  expenseDate: 2025-01-15
  employeeNotes: Important client meeting
  receipts: [file1.jpg, file2.jpg]
  reimbursement: {"paymentMethod":"bank_transfer","accountHolderName":"John Doe","accountNumber":"1234567890","bankName":"HDFC","ifscCode":"HDFC0001234"}
```

### 2. Test HR Approval

```javascript
PUT http://localhost:5001/api/expenses/EXPENSE_ID/approve
Headers:
  Authorization: Bearer HR_ADMIN_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "adminNotes": "Approved as per company policy"
}
```

### 3. Test Rejection

```javascript
PUT http://localhost:5001/api/expenses/EXPENSE_ID/reject
Headers:
  Authorization: Bearer HR_ADMIN_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "rejectionReason": "Receipt not clear",
  "adminNotes": "Please upload a clearer receipt"
}
```

---

## 🔧 Configuration

### Environment Variables
No additional environment variables are needed. The system uses existing configurations:
- MongoDB connection
- JWT authentication
- S3 configuration (if enabled)

### CORS Configuration
Ensure the frontend URL is allowed in the backend CORS settings (already configured in `server/index.js`).

---

## 📊 Sample Data Flow

### Employee Submits Expense:
```
1. Employee fills form with expense details
2. Uploads receipt images
3. Submits to backend
4. Files uploaded to S3/local storage
5. Expense record created in MongoDB
6. Status set to "pending"
```

### HR Reviews and Approves:
```
1. HR views all pending expenses
2. Clicks on expense to see details
3. Reviews receipts and information
4. Clicks "Approve"
5. Adds optional admin notes
6. Status changed to "approved"
7. Employee notified (via UI)
```

### Payment Processing:
```
1. Finance team views approved expenses
2. Processes payment to employee account
3. Updates expense via API:
   PUT /api/expenses/:id/reimburse
4. Status changed to "reimbursed"
5. Transaction ID stored
```

---

## 🚀 Quick Start

### 1. Start the Backend:
```bash
cd server
npm install
npm start
```

### 2. Start the Frontend:
```bash
cd client
npm install
npm run dev
```

### 3. Access the System:
```
1. Login to the application
2. Navigate to Organization → Expense Management
3. Click "Submit Expense" to create your first expense
```

---

## 📱 UI Features

### For All Users:
- Modern, responsive Material-UI design
- Real-time status updates
- Image preview for receipts
- Mobile-friendly interface
- Snackbar notifications for actions

### Dashboard Cards (HR/Admin only):
- Total Expenses (₹)
- Pending Approval count
- Approved count
- Reimbursed count

### Expense List:
- Sortable and filterable
- Shows category icons
- Status badges with color coding
- Quick view of amount and date
- Receipt count indicator

---

## 🐛 Troubleshooting

### Issue: "Error creating expense"
**Solution**: Check that all required fields are filled and at least one receipt is uploaded.

### Issue: "Access denied"
**Solution**: Ensure you're logged in with the correct role (HR/Admin for approval features).

### Issue: "Cannot update expense"
**Solution**: Only pending expenses can be updated/deleted by employees.

### Issue: Receipts not showing
**Solution**: 
- Check CORS configuration
- Ensure S3 bucket permissions are correct
- Verify file upload paths in backend

### Issue: "Cannot modify processed expense"
**Solution**: Approved/rejected expenses cannot be modified by employees. Contact HR.

---

## 🎓 Best Practices

### For Employees:
1. Always upload clear, legible receipts
2. Provide detailed descriptions
3. Submit expenses promptly (don't wait months)
4. Include all relevant information upfront
5. Add reimbursement details accurately

### For HR/Admin:
1. Review expenses within 2-3 business days
2. Provide clear rejection reasons
3. Add notes for clarity
4. Process reimbursements promptly
5. Maintain audit trail with admin notes

---

## 📈 Future Enhancements

Possible additions:
- Email notifications on status changes
- Expense reports and analytics
- Budget tracking per department
- Recurring expenses
- Multi-level approval workflow
- Mobile app integration
- OCR for automatic receipt data extraction
- Integration with accounting software

---

## 📝 Notes

- All receipts are stored securely (S3 or local storage)
- Soft delete ensures data integrity
- Audit trail maintained with timestamps and approver info
- Supports multiple payment methods
- Scalable for large organizations

---

## ✅ Implementation Complete

The Expense Management System is now fully functional with:
- ✅ Backend API with authentication and authorization
- ✅ Database model with comprehensive fields
- ✅ Frontend UI with submission and management features
- ✅ File upload for receipts (S3/local)
- ✅ Approval workflow
- ✅ Role-based access control
- ✅ Statistics dashboard for HR/Admin

Employees can now submit expenses with receipts, and HR/Admins can review and manage them efficiently!

---

**For Support**: Check the API documentation above or contact your system administrator.





