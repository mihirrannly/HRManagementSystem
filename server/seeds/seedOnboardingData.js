const mongoose = require('mongoose');
const Onboarding = require('../models/Onboarding');
require('dotenv').config();

const sampleOnboardings = [
  {
    employeeId: 'CODR0001',
    employeeName: 'Rajesh Kumar',
    email: 'rajesh.kumar@company.com',
    phone: '+91-9876543210',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'male',
    maritalStatus: 'married',
    currentAddress: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001'
    },
    department: 'IT',
    position: 'Senior Software Engineer',
    startDate: new Date('2024-01-15'),
    employmentType: 'full_time',
    probationPeriod: 6,
    salary: 1200000,
    status: 'in_progress',
    currentStep: 'it_setup',
    progress: 60,
    stepProgress: {
      offer_letter: { completed: true, completedAt: new Date('2024-01-01') },
      document_collection: { completed: true, completedAt: new Date('2024-01-05') },
      background_verification: { completed: true, completedAt: new Date('2024-01-08') },
      it_setup: { completed: false },
      hr_setup: { completed: false },
      orientation: { completed: false },
      manager_introduction: { completed: false },
      workspace_setup: { completed: false },
      training_schedule: { completed: false },
      completion: { completed: false }
    },
    offerLetter: {
      position: 'Senior Software Engineer',
      department: 'IT',
      salary: 1200000,
      startDate: new Date('2024-01-15'),
      reportingManager: 'John Smith',
      workLocation: 'Bangalore Office',
      employmentType: 'full_time',
      probationPeriod: 6,
      benefits: [
        'Health Insurance',
        'Provident Fund',
        'Flexible Working Hours',
        'Learning & Development Budget'
      ],
      terms: [
        'Employment is subject to successful completion of background verification',
        'Probation period of 6 months applies',
        'Notice period of 2 months after confirmation'
      ],
      sentAt: new Date('2023-12-20'),
      expiryDate: new Date('2024-01-10'),
      acceptedAt: new Date('2024-01-01')
    },
    documents: [
      {
        type: 'resume',
        name: 'Rajesh_Kumar_Resume.pdf',
        url: 'uploads/onboarding/resume_rajesh.pdf',
        uploadedAt: new Date('2024-01-02'),
        status: 'verified'
      },
      {
        type: 'id_proof',
        name: 'Aadhar_Card.pdf',
        url: 'uploads/onboarding/aadhar_rajesh.pdf',
        uploadedAt: new Date('2024-01-02'),
        status: 'verified'
      }
    ],
    emergencyContacts: [
      {
        name: 'Priya Kumar',
        relationship: 'Spouse',
        phone: '+91-9876543211',
        email: 'priya.kumar@gmail.com'
      }
    ],
    education: [
      {
        degree: 'B.Tech Computer Science',
        institution: 'IIT Delhi',
        yearOfPassing: 2012,
        percentage: 85.5,
        specialization: 'Computer Science'
      }
    ],
    experience: [
      {
        company: 'TCS',
        position: 'Software Engineer',
        startDate: new Date('2012-07-01'),
        endDate: new Date('2018-12-31'),
        salary: 800000,
        reasonForLeaving: 'Career Growth'
      }
    ],
    bankDetails: {
      accountNumber: '1234567890',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Rajesh Kumar',
      branch: 'MG Road Branch'
    },
    panNumber: 'ABCDE1234F',
    aadharNumber: '1234-5678-9012',
    nationality: 'Indian',
    tasks: [
      {
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Setup Laptop and Software',
        description: 'Install required software and development tools',
        department: 'IT',
        dueDate: new Date('2024-01-12'),
        status: 'in_progress',
        priority: 'high'
      },
      {
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Create Email Account',
        description: 'Setup company email account and access',
        department: 'IT',
        dueDate: new Date('2024-01-10'),
        status: 'completed',
        completedAt: new Date('2024-01-09'),
        priority: 'high'
      }
    ],
    notes: [
      {
        content: 'Candidate has excellent technical background',
        createdAt: new Date('2024-01-01'),
        type: 'note'
      },
      {
        content: 'All documents verified successfully',
        createdAt: new Date('2024-01-05'),
        type: 'update'
      }
    ]
  },
  {
    employeeId: 'CODR0002',
    employeeName: 'Priya Sharma',
    email: 'priya.sharma@company.com',
    phone: '+91-9876543220',
    dateOfBirth: new Date('1992-08-22'),
    gender: 'female',
    maritalStatus: 'single',
    currentAddress: {
      street: '456 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001'
    },
    department: 'HR',
    position: 'HR Business Partner',
    startDate: new Date('2024-02-01'),
    employmentType: 'full_time',
    probationPeriod: 6,
    salary: 1000000,
    status: 'offer_accepted',
    currentStep: 'document_collection',
    progress: 20,
    stepProgress: {
      offer_letter: { completed: true, completedAt: new Date('2024-01-15') },
      document_collection: { completed: false },
      background_verification: { completed: false },
      it_setup: { completed: false },
      hr_setup: { completed: false },
      orientation: { completed: false },
      manager_introduction: { completed: false },
      workspace_setup: { completed: false },
      training_schedule: { completed: false },
      completion: { completed: false }
    },
    offerLetter: {
      position: 'HR Business Partner',
      department: 'HR',
      salary: 1000000,
      startDate: new Date('2024-02-01'),
      reportingManager: 'Sarah Johnson',
      workLocation: 'Mumbai Office',
      employmentType: 'full_time',
      probationPeriod: 6,
      benefits: [
        'Health Insurance',
        'Provident Fund',
        'Flexible Working Hours',
        'Professional Development'
      ],
      terms: [
        'Employment is subject to successful completion of background verification',
        'Probation period of 6 months applies',
        'Notice period of 1 month during probation, 2 months after confirmation'
      ],
      sentAt: new Date('2024-01-10'),
      expiryDate: new Date('2024-01-25'),
      acceptedAt: new Date('2024-01-15')
    },
    documents: [
      {
        type: 'resume',
        name: 'Priya_Sharma_Resume.pdf',
        url: 'uploads/onboarding/resume_priya.pdf',
        uploadedAt: new Date('2024-01-16'),
        status: 'uploaded'
      }
    ],
    emergencyContacts: [
      {
        name: 'Raj Sharma',
        relationship: 'Father',
        phone: '+91-9876543221',
        email: 'raj.sharma@gmail.com'
      }
    ],
    education: [
      {
        degree: 'MBA Human Resources',
        institution: 'XLRI Jamshedpur',
        yearOfPassing: 2016,
        percentage: 88.2,
        specialization: 'Human Resources'
      },
      {
        degree: 'B.Com',
        institution: 'Delhi University',
        yearOfPassing: 2014,
        percentage: 82.5,
        specialization: 'Commerce'
      }
    ],
    experience: [
      {
        company: 'Infosys',
        position: 'HR Specialist',
        startDate: new Date('2016-08-01'),
        endDate: new Date('2023-12-31'),
        salary: 850000,
        reasonForLeaving: 'Better Opportunity'
      }
    ],
    bankDetails: {
      accountNumber: '9876543210',
      bankName: 'SBI',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Priya Sharma',
      branch: 'Park Street Branch'
    },
    panNumber: 'FGHIJ5678K',
    aadharNumber: '9876-5432-1098',
    nationality: 'Indian',
    tasks: [],
    notes: [
      {
        content: 'Offer accepted, waiting for document submission',
        createdAt: new Date('2024-01-15'),
        type: 'update'
      }
    ]
  },
  {
    employeeId: 'CODR0003',
    employeeName: 'Amit Patel',
    email: 'amit.patel@company.com',
    phone: '+91-9876543230',
    dateOfBirth: new Date('1988-12-10'),
    gender: 'male',
    maritalStatus: 'married',
    currentAddress: {
      street: '789 Ring Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380001'
    },
    department: 'Finance',
    position: 'Finance Manager',
    startDate: new Date('2024-01-20'),
    employmentType: 'full_time',
    probationPeriod: 6,
    salary: 1500000,
    status: 'completed',
    currentStep: 'completed',
    progress: 100,
    employeeCreated: true,
    stepProgress: {
      offer_letter: { completed: true, completedAt: new Date('2023-12-15') },
      document_collection: { completed: true, completedAt: new Date('2023-12-20') },
      background_verification: { completed: true, completedAt: new Date('2023-12-25') },
      it_setup: { completed: true, completedAt: new Date('2024-01-18') },
      hr_setup: { completed: true, completedAt: new Date('2024-01-19') },
      orientation: { completed: true, completedAt: new Date('2024-01-20') },
      manager_introduction: { completed: true, completedAt: new Date('2024-01-21') },
      workspace_setup: { completed: true, completedAt: new Date('2024-01-22') },
      training_schedule: { completed: true, completedAt: new Date('2024-01-25') },
      completion: { completed: true, completedAt: new Date('2024-01-26') }
    },
    offerLetter: {
      position: 'Finance Manager',
      department: 'Finance',
      salary: 1500000,
      startDate: new Date('2024-01-20'),
      reportingManager: 'Michael Brown',
      workLocation: 'Ahmedabad Office',
      employmentType: 'full_time',
      probationPeriod: 6,
      benefits: [
        'Health Insurance',
        'Provident Fund',
        'Performance Bonus',
        'Stock Options'
      ],
      terms: [
        'Employment is subject to successful completion of background verification',
        'Probation period of 6 months applies',
        'Notice period of 3 months after confirmation'
      ],
      sentAt: new Date('2023-12-10'),
      expiryDate: new Date('2023-12-20'),
      acceptedAt: new Date('2023-12-15')
    },
    documents: [
      {
        type: 'resume',
        name: 'Amit_Patel_Resume.pdf',
        url: 'uploads/onboarding/resume_amit.pdf',
        uploadedAt: new Date('2023-12-16'),
        status: 'verified'
      },
      {
        type: 'id_proof',
        name: 'Passport.pdf',
        url: 'uploads/onboarding/passport_amit.pdf',
        uploadedAt: new Date('2023-12-16'),
        status: 'verified'
      },
      {
        type: 'educational',
        name: 'CA_Certificate.pdf',
        url: 'uploads/onboarding/ca_cert_amit.pdf',
        uploadedAt: new Date('2023-12-17'),
        status: 'verified'
      }
    ],
    emergencyContacts: [
      {
        name: 'Kavita Patel',
        relationship: 'Spouse',
        phone: '+91-9876543231',
        email: 'kavita.patel@gmail.com'
      }
    ],
    education: [
      {
        degree: 'CA (Chartered Accountant)',
        institution: 'ICAI',
        yearOfPassing: 2012,
        percentage: 92.0,
        specialization: 'Accounting & Finance'
      },
      {
        degree: 'B.Com',
        institution: 'Gujarat University',
        yearOfPassing: 2009,
        percentage: 85.5,
        specialization: 'Commerce'
      }
    ],
    experience: [
      {
        company: 'KPMG',
        position: 'Senior Associate',
        startDate: new Date('2012-09-01'),
        endDate: new Date('2023-11-30'),
        salary: 1300000,
        reasonForLeaving: 'Career Advancement'
      }
    ],
    bankDetails: {
      accountNumber: '5555666677',
      bankName: 'ICICI Bank',
      ifscCode: 'ICIC0001234',
      accountHolderName: 'Amit Patel',
      branch: 'Ring Road Branch'
    },
    panNumber: 'KLMNO9876P',
    aadharNumber: '5555-6666-7777',
    nationality: 'Indian',
    tasks: [
      {
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Complete Finance System Training',
        description: 'Training on company financial systems and processes',
        department: 'Finance',
        dueDate: new Date('2024-01-25'),
        status: 'completed',
        completedAt: new Date('2024-01-24'),
        priority: 'high'
      }
    ],
    notes: [
      {
        content: 'Excellent candidate with strong finance background',
        createdAt: new Date('2023-12-15'),
        type: 'note'
      },
      {
        content: 'Onboarding completed successfully, employee record created',
        createdAt: new Date('2024-01-26'),
        type: 'update'
      }
    ]
  }
];

async function seedOnboardingData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly_hr');
    console.log('✅ Connected to MongoDB');

    // Clear existing onboarding data
    await Onboarding.deleteMany({});
    console.log('🧹 Cleared existing onboarding data');

    // Insert sample onboarding data
    const insertedOnboardings = await Onboarding.insertMany(sampleOnboardings);
    console.log(`✅ Inserted ${insertedOnboardings.length} sample onboarding records`);

    // Display summary
    console.log('\n📊 Onboarding Data Summary:');
    insertedOnboardings.forEach((onboarding, index) => {
      console.log(`${index + 1}. ${onboarding.employeeName} (${onboarding.position}) - Status: ${onboarding.status}`);
    });

    console.log('\n🎉 Onboarding seed data created successfully!');
    console.log('💡 You can now view and manage onboarding processes in the application');

  } catch (error) {
    console.error('❌ Error seeding onboarding data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  console.log('⚠️  Onboarding seed script is DISABLED to prevent dummy data creation');
  console.log('💡 To run seeds manually, uncomment the seedOnboardingData() call');
  // seedOnboardingData();
}

module.exports = { seedOnboardingData, sampleOnboardings };
