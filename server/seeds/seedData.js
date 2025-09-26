const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { LeaveType } = require('../models/Leave');
const { SalaryComponent } = require('../models/Payroll');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed database...');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await LeaveType.deleteMany({});
    await SalaryComponent.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create Departments
    const departments = await Department.insertMany([
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software Development and Engineering',
        budget: { annual: 5000000, currency: 'INR' }
      },
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Human Resource Management',
        budget: { annual: 1500000, currency: 'INR' }
      },
      {
        name: 'Sales',
        code: 'SALES',
        description: 'Sales and Business Development',
        budget: { annual: 3000000, currency: 'INR' }
      },
      {
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing and Brand Management',
        budget: { annual: 2000000, currency: 'INR' }
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Finance and Accounting',
        budget: { annual: 1200000, currency: 'INR' }
      }
    ]);

    console.log('✅ Created departments');

    // Create Leave Types
    await LeaveType.insertMany([
      {
        name: 'Sick Leave',
        code: 'SL',
        description: 'Medical leave for illness',
        maxDaysPerYear: 12,
        carryForward: false,
        color: '#f44336'
      },
      {
        name: 'Casual Leave',
        code: 'CL',
        description: 'Personal and casual leave',
        maxDaysPerYear: 12,
        carryForward: false,
        color: '#2196f3'
      },
      {
        name: 'Earned Leave',
        code: 'EL',
        description: 'Annual earned leave',
        maxDaysPerYear: 21,
        carryForward: true,
        maxCarryForward: 10,
        color: '#4caf50'
      },
      {
        name: 'Maternity Leave',
        code: 'ML',
        description: 'Maternity leave',
        maxDaysPerYear: 180,
        applicableFor: 'female',
        color: '#ff9800'
      },
      {
        name: 'Paternity Leave',
        code: 'PL',
        description: 'Paternity leave',
        maxDaysPerYear: 15,
        applicableFor: 'male',
        color: '#9c27b0'
      }
    ]);

    console.log('✅ Created leave types');

    // Create Salary Components
    await SalaryComponent.insertMany([
      {
        name: 'Basic Salary',
        code: 'BASIC',
        type: 'earning',
        category: 'basic',
        calculationType: 'fixed',
        isTaxable: true
      },
      {
        name: 'House Rent Allowance',
        code: 'HRA',
        type: 'earning',
        category: 'allowance',
        calculationType: 'percentage',
        calculationBase: 'basic',
        percentage: 40,
        isTaxable: true
      },
      {
        name: 'Transport Allowance',
        code: 'TA',
        type: 'earning',
        category: 'allowance',
        calculationType: 'fixed',
        isTaxable: false
      },
      {
        name: 'Medical Allowance',
        code: 'MA',
        type: 'earning',
        category: 'allowance',
        calculationType: 'fixed',
        isTaxable: false
      },
      {
        name: 'Provident Fund',
        code: 'PF',
        type: 'deduction',
        category: 'statutory',
        calculationType: 'percentage',
        calculationBase: 'basic',
        percentage: 12,
        isStatutory: true
      },
      {
        name: 'Employee State Insurance',
        code: 'ESI',
        type: 'deduction',
        category: 'statutory',
        calculationType: 'percentage',
        calculationBase: 'gross',
        percentage: 0.75,
        isStatutory: true
      },
      {
        name: 'Tax Deducted at Source',
        code: 'TDS',
        type: 'deduction',
        category: 'tax',
        calculationType: 'formula',
        isStatutory: true
      }
    ]);

    console.log('✅ Created salary components');

    // Create Users and Employees
    const users = [];
    const employees = [];

    // Admin User
    const adminUser = new User({
      email: 'admin@rannkly.com',
      password: 'admin123456',
      role: 'admin',
      permissions: [
        { module: 'employees', actions: ['read', 'write', 'delete'] },
        { module: 'attendance', actions: ['read', 'write', 'approve'] },
        { module: 'leave', actions: ['read', 'write', 'approve'] },
        { module: 'payroll', actions: ['read', 'write', 'approve'] },
        { module: 'reports', actions: ['read', 'write'] }
      ]
    });
    await adminUser.save();
    users.push(adminUser);

    const adminEmployee = new Employee({
      employeeId: 'CODR0001',
      user: adminUser._id,
      personalInfo: {
        firstName: 'System',
        lastName: 'Administrator',
        dateOfBirth: new Date('1985-01-01'),
        gender: 'male',
        maritalStatus: 'married',
        nationality: 'Indian'
      },
      contactInfo: {
        personalEmail: 'admin.personal@gmail.com',
        phone: '+91-9876543210',
        address: {
          street: '123 Admin Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        }
      },
      employmentInfo: {
        department: departments[1]._id, // HR Department
        designation: 'System Administrator',
        employeeType: 'full-time',
        dateOfJoining: new Date('2020-01-01'),
        confirmationDate: new Date('2020-04-01'),
        isActive: true
      },
      salaryInfo: {
        currentSalary: {
          basic: 80000,
          hra: 32000,
          allowances: 18000,
          grossSalary: 130000,
          ctc: 1560000
        }
      }
    });
    await adminEmployee.save();
    employees.push(adminEmployee);

    // HR User
    const hrUser = new User({
      email: 'hr@rannkly.com',
      password: 'hr123456',
      role: 'hr',
      permissions: [
        { module: 'employees', actions: ['read', 'write', 'delete'] },
        { module: 'attendance', actions: ['read', 'write', 'approve'] },
        { module: 'leave', actions: ['read', 'write', 'approve'] },
        { module: 'payroll', actions: ['read', 'write'] },
        { module: 'reports', actions: ['read'] }
      ]
    });
    await hrUser.save();
    users.push(hrUser);

    const hrEmployee = new Employee({
      employeeId: 'CODR0002',
      user: hrUser._id,
      personalInfo: {
        firstName: 'Priya',
        lastName: 'Sharma',
        dateOfBirth: new Date('1990-03-15'),
        gender: 'female',
        maritalStatus: 'single',
        nationality: 'Indian'
      },
      contactInfo: {
        personalEmail: 'priya.sharma@gmail.com',
        phone: '+91-9876543211',
        address: {
          street: '456 HR Colony',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India'
        }
      },
      employmentInfo: {
        department: departments[1]._id, // HR Department
        designation: 'HR Manager',
        employeeType: 'full-time',
        dateOfJoining: new Date('2021-06-01'),
        confirmationDate: new Date('2021-09-01'),
        isActive: true
      },
      salaryInfo: {
        currentSalary: {
          basic: 60000,
          hra: 24000,
          allowances: 16000,
          grossSalary: 100000,
          ctc: 1200000
        }
      }
    });
    await hrEmployee.save();
    employees.push(hrEmployee);

    // Manager User
    const managerUser = new User({
      email: 'manager@rannkly.com',
      password: 'manager123456',
      role: 'manager',
      permissions: [
        { module: 'employees', actions: ['read'] },
        { module: 'attendance', actions: ['read', 'approve'] },
        { module: 'leave', actions: ['read', 'approve'] },
        { module: 'reports', actions: ['read'] }
      ]
    });
    await managerUser.save();
    users.push(managerUser);

    const managerEmployee = new Employee({
      employeeId: 'CODR0003',
      user: managerUser._id,
      personalInfo: {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        dateOfBirth: new Date('1985-07-20'),
        gender: 'male',
        maritalStatus: 'married',
        nationality: 'Indian'
      },
      contactInfo: {
        personalEmail: 'rajesh.kumar@gmail.com',
        phone: '+91-9876543212',
        address: {
          street: '789 Manager Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        }
      },
      employmentInfo: {
        department: departments[0]._id, // Engineering Department
        designation: 'Engineering Manager',
        employeeType: 'full-time',
        dateOfJoining: new Date('2019-03-01'),
        confirmationDate: new Date('2019-06-01'),
        isActive: true
      },
      salaryInfo: {
        currentSalary: {
          basic: 90000,
          hra: 36000,
          allowances: 24000,
          grossSalary: 150000,
          ctc: 1800000
        }
      }
    });
    await managerEmployee.save();
    employees.push(managerEmployee);

    // Employee User
    const employeeUser = new User({
      email: 'employee@rannkly.com',
      password: 'employee123456',
      role: 'employee',
      permissions: [
        { module: 'attendance', actions: ['read', 'write'] },
        { module: 'leave', actions: ['read', 'write'] }
      ]
    });
    await employeeUser.save();
    users.push(employeeUser);

    const regularEmployee = new Employee({
      employeeId: 'CODR0004',
      user: employeeUser._id,
      personalInfo: {
        firstName: 'Amit',
        lastName: 'Patel',
        dateOfBirth: new Date('1995-11-10'),
        gender: 'male',
        maritalStatus: 'single',
        nationality: 'Indian'
      },
      contactInfo: {
        personalEmail: 'amit.patel@gmail.com',
        phone: '+91-9876543213',
        address: {
          street: '321 Employee Street',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001',
          country: 'India'
        }
      },
      employmentInfo: {
        department: departments[0]._id, // Engineering Department
        designation: 'Software Developer',
        employeeType: 'full-time',
        dateOfJoining: new Date('2022-01-15'),
        confirmationDate: new Date('2022-04-15'),
        reportingManager: managerEmployee._id,
        isActive: true
      },
      salaryInfo: {
        currentSalary: {
          basic: 50000,
          hra: 20000,
          allowances: 10000,
          grossSalary: 80000,
          ctc: 960000
        }
      },
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      education: [{
        degree: 'Bachelor of Engineering',
        institution: 'Pune University',
        yearOfPassing: 2017,
        percentage: 75,
        specialization: 'Computer Science'
      }]
    });
    await regularEmployee.save();
    employees.push(regularEmployee);

    // Additional Employees
    const additionalEmployees = [
      {
        firstName: 'Sneha',
        lastName: 'Reddy',
        email: 'sneha.reddy@rannkly.com',
        department: departments[2]._id, // Sales
        designation: 'Sales Executive',
        reportingManager: null
      },
      {
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@rannkly.com',
        department: departments[3]._id, // Marketing
        designation: 'Marketing Specialist',
        reportingManager: null
      },
      {
        firstName: 'Anita',
        lastName: 'Gupta',
        email: 'anita.gupta@rannkly.com',
        department: departments[4]._id, // Finance
        designation: 'Financial Analyst',
        reportingManager: null
      }
    ];

    for (let i = 0; i < additionalEmployees.length; i++) {
      const emp = additionalEmployees[i];
      const user = new User({
        email: emp.email,
        password: 'password123456',
        role: 'employee'
      });
      await user.save();

      const employee = new Employee({
        employeeId: `CODR000${i + 5}`,
        user: user._id,
        personalInfo: {
          firstName: emp.firstName,
          lastName: emp.lastName,
          dateOfBirth: new Date('1992-05-15'),
          gender: emp.firstName === 'Sneha' || emp.firstName === 'Anita' ? 'female' : 'male',
          maritalStatus: 'single',
          nationality: 'Indian'
        },
        contactInfo: {
          personalEmail: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@gmail.com`,
          phone: `+91-987654321${Math.floor(Math.random() * 10)}`,
          address: {
            street: `${Math.floor(Math.random() * 999)} Random Street`,
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India'
          }
        },
        employmentInfo: {
          department: emp.department,
          designation: emp.designation,
          employeeType: 'full-time',
          dateOfJoining: new Date('2022-06-01'),
          confirmationDate: new Date('2022-09-01'),
          reportingManager: emp.reportingManager,
          isActive: true
        },
        salaryInfo: {
          currentSalary: {
            basic: 45000,
            hra: 18000,
            allowances: 12000,
            grossSalary: 75000,
            ctc: 900000
          }
        }
      });
      await employee.save();
    }

    console.log('✅ Created users and employees');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('👤 Admin: admin@rannkly.com / admin123456');
    console.log('👤 HR: hr@rannkly.com / hr123456');
    console.log('👤 Manager: manager@rannkly.com / manager123456');
    console.log('👤 Employee: employee@rannkly.com / employee123456');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedData();
