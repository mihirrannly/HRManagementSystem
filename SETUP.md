# 🚀 Quick Setup Guide

Follow these steps to get the Rannkly HR Management System up and running on your local machine.

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🛠 Installation Steps

### 1. Clone and Setup Project
```bash
# Navigate to the project directory
cd "Rannkly HR Management"

# Install all dependencies (backend + frontend)
npm run install-all
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# The .env file is already configured with default values for local development
# You can modify it if needed, but defaults should work fine
```

### 3. Start MongoDB
```bash
# Option 1: If MongoDB is installed locally
sudo service mongod start

# Option 2: Use MongoDB Compass or Atlas (cloud)
# Update MONGODB_URI in .env file with your connection string
```

### 4. Seed Database with Demo Data
```bash
# This will create demo users, departments, and sample data
npm run seed
```

You should see output like:
```
🌱 Starting to seed database...
✅ Cleared existing data
✅ Created departments
✅ Created leave types
✅ Created salary components
✅ Created users and employees

🎉 Database seeding completed successfully!

📋 Demo Login Credentials:
👤 Admin: admin@rannkly.com / admin123456
👤 HR: hr@rannkly.com / hr123456
👤 Manager: manager@rannkly.com / manager123456
👤 Employee: employee@rannkly.com / employee123456
```

### 5. Start the Application
```bash
# Start both backend and frontend servers
npm run dev
```

This will start:
- **Backend server** on http://localhost:5001
- **Frontend application** on http://localhost:5173

## 🎯 Access the Application

1. Open your browser and go to http://localhost:5173
2. Use any of the demo credentials to login:

### Demo Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@rannkly.com | admin123456 | Full system access |
| **HR** | hr@rannkly.com | hr123456 | Employee management, payroll |
| **Manager** | manager@rannkly.com | manager123456 | Team management, approvals |
| **Employee** | employee@rannkly.com | employee123456 | Personal data, attendance |

## 🔧 Development Commands

```bash
# Start only backend server
npm run server

# Start only frontend
npm run client

# Build frontend for production
npm run build

# Start production server
npm start

# Re-seed database (clears all data)
npm run seed
```

## 📱 Features to Explore

### As Admin/HR:
- **Dashboard**: View company-wide statistics
- **Employee Management**: Add, edit, view employee profiles
- **Payroll**: Process payroll and generate payslips
- **Reports**: Access detailed analytics

### As Manager:
- **Team Overview**: Monitor team attendance and leaves
- **Approvals**: Approve/reject leave requests
- **Reports**: View team-specific reports

### As Employee:
- **Attendance**: Check-in/out daily
- **Leave Management**: Apply for leaves and track balance
- **Payslips**: Download monthly payslips
- **Profile**: Update personal information

## 🐛 Troubleshooting

### Common Issues:

**1. MongoDB Connection Error**
```bash
# Make sure MongoDB is running
sudo service mongod status

# Or check if using MongoDB Atlas
# Verify connection string in .env file
```

**2. Port Already in Use**
```bash
# Kill process using port 5000 or 5173
sudo lsof -ti:5000 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

**3. Dependencies Issues**
```bash
# Clean install
rm -rf node_modules client/node_modules
npm run install-all
```

**4. Database Seeding Fails**
```bash
# Make sure MongoDB is running and accessible
# Check MONGODB_URI in .env file
# Try running seed script directly:
node server/seeds/seedData.js
```

## 🎨 Customization

### Adding New Departments
1. Login as Admin
2. Go to Employee Management
3. Create new departments via API or directly in database

### Modifying Leave Types
1. Access `/api/leave/types` endpoint
2. Add/modify leave types as needed
3. Update leave balances accordingly

### Changing Salary Structure
1. Modify salary components in `/api/payroll/components`
2. Update payroll calculation logic if needed

## 📚 Next Steps

1. **Explore the Dashboard** - Get familiar with the interface
2. **Test Employee Workflows** - Try check-in/out, leave applications
3. **Review Admin Features** - Employee management, payroll processing
4. **Check API Documentation** - Available in README.md
5. **Customize for Your Needs** - Modify configurations and add features

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the main README.md for detailed documentation
3. Check browser console for error messages
4. Ensure all prerequisites are properly installed

## 🎉 You're All Set!

The Rannkly HR Management System is now running on your local machine. Start exploring the features and customize it according to your needs!

Happy coding! 🚀
