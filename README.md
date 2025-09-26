# Rannkly HR Management System

A comprehensive Human Resource Management System built with Node.js, Express, MongoDB, and React. This system provides complete HR functionality including employee management, attendance tracking, leave management, payroll processing, and reporting.

## 🚀 Features

### Core Modules

#### 1. Employee Management
- **Employee Profiles**: Complete employee information with personal, contact, and employment details
- **Document Management**: Upload and manage employee documents (resume, contracts, ID proofs)
- **Organizational Chart**: Hierarchical view of company structure
- **Employee Directory**: Search and filter employees
- **Audit Logging**: Track all changes to employee data

#### 2. Attendance & Leave Management
- **Real-time Attendance**: Check-in/check-out with location tracking
- **Attendance Reports**: Daily, weekly, monthly attendance analytics
- **Leave Types**: Configurable leave types (sick, casual, earned, etc.)
- **Leave Requests**: Apply, approve, and track leave requests
- **Leave Balance**: Automatic calculation of leave balances
- **Holiday Management**: Company holiday calendar

#### 3. Payroll Management
- **Salary Structure**: Configurable salary components and calculations
- **Payroll Processing**: Automated monthly payroll generation
- **Payslip Generation**: PDF payslips with detailed breakdowns
- **Tax Calculations**: TDS, PF, ESI calculations
- **Salary Revisions**: Track salary increments and promotions

#### 4. Organization Management (Admin Only)
- **Comprehensive Analytics**: Total employees, new additions, exits, probation status
- **Detailed Employee Data**: All employee fields with salary breakdowns
- **Department Breakdown**: Employee distribution across departments
- **Recent Changes Tracking**: Monitor all data modifications
- **CSV Export**: Export complete organization data
- **Advanced Filtering**: Filter by department, status, search terms

#### 5. Reports & Analytics
- **Dashboard**: Real-time HR metrics and KPIs
- **Attendance Reports**: Detailed attendance analytics
- **Leave Reports**: Leave utilization and trends
- **Payroll Reports**: Salary and cost analysis
- **Export Options**: Download reports in various formats

#### 5. User Management & Security
- **Role-based Access Control**: Admin, HR, Manager, Employee roles
- **Permission Management**: Granular permissions for different modules
- **Secure Authentication**: JWT-based authentication
- **Password Management**: Secure password handling

### Additional Features
- **Mobile Responsive**: Works seamlessly on all devices
- **Modern UI**: Clean and intuitive Material-UI design
- **RESTful APIs**: Well-structured API endpoints
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Proper error handling and user feedback

## 🛠 Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **PDFKit**: PDF generation
- **Multer**: File uploads
- **Moment.js**: Date handling

### Frontend
- **React 18**: UI library
- **Material-UI (MUI)**: Component library
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Hook Form**: Form handling
- **Recharts**: Data visualization
- **React Toastify**: Notifications

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rannkly-hr-management
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/rannkly_hr
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo service mongod start
   
   # Or using MongoDB Compass/Atlas
   # Update MONGODB_URI in .env file
   ```

5. **Start the backend server**
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

### Full Application Setup

1. **Install all dependencies**
   ```bash
   npm run install-all
   ```

2. **Start both servers**
   ```bash
   npm run dev
   ```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Employee Endpoints
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `POST /api/employees/:id/upload` - Upload employee document

### Attendance Endpoints
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/status` - Get current status
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/manual` - Manual attendance entry

### Leave Endpoints
- `GET /api/leave/types` - Get leave types
- `GET /api/leave/balance` - Get leave balance
- `POST /api/leave/request` - Submit leave request
- `GET /api/leave/requests` - Get leave requests
- `PUT /api/leave/requests/:id/approve` - Approve/reject leave

### Payroll Endpoints
- `GET /api/payroll/payslips` - Get payslips
- `GET /api/payroll/payslips/:id/pdf` - Download payslip PDF
- `POST /api/payroll/cycles` - Create payroll cycle
- `POST /api/payroll/cycles/:id/process` - Process payroll

### Reports Endpoints
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/leave` - Leave reports
- `GET /api/reports/payroll` - Payroll reports

### Organization Endpoints (Admin Only)
- `GET /api/organization/analytics` - Comprehensive organization analytics
- `GET /api/organization/employees` - Detailed employee data with all fields
- `GET /api/organization/departments` - Department information with employee counts
- `GET /api/organization/recent-changes` - Recent employee data changes

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All reports and analytics

### HR
- Employee management
- Payroll processing
- Leave management
- HR reports
- User creation

### Manager
- Team member management
- Attendance approval
- Leave approval
- Team reports

### Employee
- Personal profile management
- Attendance check-in/out
- Leave applications
- Payslip access

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Role-based Access**: Granular permission control
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API rate limiting protection
- **CORS Protection**: Cross-origin request security
- **Helmet.js**: Security headers

## 📱 Demo Credentials

### Admin Account
- **Email**: admin@rannkly.com
- **Password**: admin123

### HR Account
- **Email**: hr@rannkly.com
- **Password**: hr123

### Employee Account
- **Email**: employee@rannkly.com
- **Password**: emp123

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rannkly_hr
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

### Build Commands
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

## 📈 Future Enhancements

### Planned Features
- **Performance Management**: OKRs, KPIs, and appraisal cycles
- **Recruitment Management**: Job postings and candidate tracking
- **Training Management**: Employee training and certification tracking
- **Asset Management**: Company asset allocation and tracking
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: AI-powered HR insights
- **Integration APIs**: Third-party system integrations

### Technical Improvements
- **Microservices Architecture**: Service-based architecture
- **Real-time Features**: WebSocket integration
- **Advanced Security**: Two-factor authentication
- **Performance Optimization**: Caching and optimization
- **Testing Suite**: Comprehensive test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@rannkly.com
- **Documentation**: [Wiki](https://github.com/rannkly/hr-management/wiki)
- **Issues**: [GitHub Issues](https://github.com/rannkly/hr-management/issues)

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- MongoDB team for the robust database solution
- React team for the amazing frontend framework
- All contributors who helped build this system

---

**Rannkly HR Management System** - Streamlining HR operations with modern technology.
# HRManagementSystem
