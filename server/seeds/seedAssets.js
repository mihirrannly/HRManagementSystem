const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const User = require('../models/User');

const seedAssets = async () => {
  try {
    console.log('🏢 Starting to seed assets...');

    // Clear existing assets
    await Asset.deleteMany({});
    console.log('✅ Cleared existing assets');

    // Get admin user for createdBy field
    console.log('🔍 Looking for admin user...');
    let adminUser = await User.findOne({ email: 'admin@rannkly.com' });
    
    if (!adminUser) {
      // Try to find any admin user
      adminUser = await User.findOne({ role: 'admin' });
      console.log('Using admin user:', adminUser?.email);
    }
    
    if (!adminUser) {
      console.log('Available users:');
      const allUsers = await User.find({}, 'email role');
      allUsers.forEach(user => console.log(`- ${user.email} (${user.role})`));
      throw new Error('No admin user found. Please run user seeding first.');
    }

    // Sample assets data
    const assetsData = [
      {
        assetId: 'LAP001',
        name: 'MacBook Pro 16-inch',
        category: 'laptop',
        brand: 'Apple',
        model: 'MacBook Pro M2',
        serialNumber: 'MBP2023001',
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: 2499,
        vendor: 'Apple Store',
        warrantyExpiry: new Date('2026-01-15'),
        condition: 'excellent',
        status: 'available',
        location: 'IT Storage Room',
        description: 'High-performance laptop for development work',
        specifications: {
          processor: 'Apple M2 Pro',
          ram: '16GB',
          storage: '512GB SSD',
          graphics: 'Apple M2 Pro GPU',
          os: 'macOS Ventura',
          other: '16-inch Liquid Retina XDR display'
        },
        createdBy: adminUser._id
      },
      {
        assetId: 'LAP002',
        name: 'Dell XPS 13',
        category: 'laptop',
        brand: 'Dell',
        model: 'XPS 13 9320',
        serialNumber: 'DLL2023002',
        purchaseDate: new Date('2023-02-20'),
        purchasePrice: 1299,
        vendor: 'Dell Direct',
        warrantyExpiry: new Date('2026-02-20'),
        condition: 'good',
        status: 'available',
        location: 'IT Storage Room',
        description: 'Ultrabook for business use',
        specifications: {
          processor: 'Intel Core i7-1250U',
          ram: '16GB',
          storage: '512GB SSD',
          graphics: 'Intel Iris Xe',
          os: 'Windows 11 Pro',
          other: '13.4-inch FHD+ display'
        },
        createdBy: adminUser._id
      },
      {
        assetId: 'DSK001',
        name: 'iMac 24-inch',
        category: 'desktop',
        brand: 'Apple',
        model: 'iMac M1',
        serialNumber: 'IMC2023001',
        purchaseDate: new Date('2023-03-10'),
        purchasePrice: 1499,
        vendor: 'Apple Store',
        warrantyExpiry: new Date('2026-03-10'),
        condition: 'excellent',
        status: 'available',
        location: 'Design Department',
        description: 'All-in-one desktop for design work',
        specifications: {
          processor: 'Apple M1',
          ram: '16GB',
          storage: '512GB SSD',
          graphics: 'Apple M1 GPU',
          os: 'macOS Monterey',
          other: '24-inch 4.5K Retina display'
        },
        createdBy: adminUser._id
      },
      {
        assetId: 'MON001',
        name: 'Dell UltraSharp 27"',
        category: 'monitor',
        brand: 'Dell',
        model: 'U2723QE',
        serialNumber: 'MON2023001',
        purchaseDate: new Date('2023-01-25'),
        purchasePrice: 599,
        vendor: 'Dell Direct',
        warrantyExpiry: new Date('2026-01-25'),
        condition: 'excellent',
        status: 'available',
        location: 'IT Storage Room',
        description: '4K USB-C monitor with excellent color accuracy',
        createdBy: adminUser._id
      },
      {
        assetId: 'MON002',
        name: 'LG UltraWide 34"',
        category: 'monitor',
        brand: 'LG',
        model: '34WN80C-B',
        serialNumber: 'LG2023001',
        purchaseDate: new Date('2023-02-15'),
        purchasePrice: 449,
        vendor: 'Amazon Business',
        warrantyExpiry: new Date('2026-02-15'),
        condition: 'good',
        status: 'available',
        location: 'Development Floor',
        description: 'Ultrawide monitor for productivity',
        createdBy: adminUser._id
      },
      {
        assetId: 'PHN001',
        name: 'iPhone 14 Pro',
        category: 'mobile',
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        serialNumber: 'IPH2023001',
        purchaseDate: new Date('2023-04-01'),
        purchasePrice: 999,
        vendor: 'Apple Store',
        warrantyExpiry: new Date('2024-04-01'),
        condition: 'excellent',
        status: 'available',
        location: 'HR Department',
        description: 'Company mobile phone for executives',
        specifications: {
          storage: '256GB',
          os: 'iOS 16',
          other: '6.1-inch Super Retina XDR display'
        },
        createdBy: adminUser._id
      },
      {
        assetId: 'TAB001',
        name: 'iPad Pro 12.9"',
        category: 'tablet',
        brand: 'Apple',
        model: 'iPad Pro M2',
        serialNumber: 'IPD2023001',
        purchaseDate: new Date('2023-03-20'),
        purchasePrice: 1099,
        vendor: 'Apple Store',
        warrantyExpiry: new Date('2024-03-20'),
        condition: 'excellent',
        status: 'available',
        location: 'Marketing Department',
        description: 'Tablet for presentations and creative work',
        specifications: {
          processor: 'Apple M2',
          ram: '8GB',
          storage: '256GB',
          os: 'iPadOS 16',
          other: '12.9-inch Liquid Retina XDR display'
        },
        createdBy: adminUser._id
      },
      {
        assetId: 'PRN001',
        name: 'HP LaserJet Pro',
        category: 'printer',
        brand: 'HP',
        model: 'LaserJet Pro M404dn',
        serialNumber: 'HP2023001',
        purchaseDate: new Date('2023-01-30'),
        purchasePrice: 299,
        vendor: 'HP Direct',
        warrantyExpiry: new Date('2024-01-30'),
        condition: 'good',
        status: 'available',
        location: 'Office Floor 1',
        description: 'Network laser printer for office use',
        createdBy: adminUser._id
      },
      {
        assetId: 'CHR001',
        name: 'Herman Miller Aeron Chair',
        category: 'furniture',
        brand: 'Herman Miller',
        model: 'Aeron Size B',
        serialNumber: 'HM2023001',
        purchaseDate: new Date('2023-02-10'),
        purchasePrice: 1395,
        vendor: 'Herman Miller Store',
        warrantyExpiry: new Date('2035-02-10'),
        condition: 'excellent',
        status: 'available',
        location: 'Executive Office',
        description: 'Ergonomic office chair',
        createdBy: adminUser._id
      },
      {
        assetId: 'SW001',
        name: 'Adobe Creative Suite',
        category: 'software_license',
        brand: 'Adobe',
        model: 'Creative Cloud All Apps',
        serialNumber: 'ADO2023001',
        purchaseDate: new Date('2023-01-01'),
        purchasePrice: 599,
        vendor: 'Adobe Direct',
        warrantyExpiry: new Date('2024-01-01'),
        condition: 'excellent',
        status: 'available',
        location: 'Digital License',
        description: 'Annual subscription for creative software',
        createdBy: adminUser._id
      }
    ];

    // Insert assets
    const createdAssets = await Asset.insertMany(assetsData);
    console.log(`✅ Created ${createdAssets.length} assets`);

    // Optionally assign some assets to employees for testing
    const employees = await Employee.find({ 'employmentInfo.isActive': true }).limit(3);
    
    if (employees.length > 0) {
      console.log('📋 Assigning some assets to employees for testing...');
      
      // Assign laptop to first employee
      if (employees[0]) {
        const laptop = await Asset.findOne({ assetId: 'LAP001' });
        if (laptop) {
          await laptop.assignToEmployee(employees[0]._id, adminUser._id, 'Initial assignment for development work');
          console.log(`✅ Assigned ${laptop.name} to ${employees[0].personalInfo.firstName} ${employees[0].personalInfo.lastName}`);
        }
      }

      // Assign monitor to second employee
      if (employees[1]) {
        const monitor = await Asset.findOne({ assetId: 'MON001' });
        if (monitor) {
          await monitor.assignToEmployee(employees[1]._id, adminUser._id, 'Monitor for workstation setup');
          console.log(`✅ Assigned ${monitor.name} to ${employees[1].personalInfo.firstName} ${employees[1].personalInfo.lastName}`);
        }
      }

      // Assign mobile to third employee
      if (employees[2]) {
        const mobile = await Asset.findOne({ assetId: 'PHN001' });
        if (mobile) {
          await mobile.assignToEmployee(employees[2]._id, adminUser._id, 'Company mobile for business use');
          console.log(`✅ Assigned ${mobile.name} to ${employees[2].personalInfo.firstName} ${employees[2].personalInfo.lastName}`);
        }
      }
    }

    console.log('\n🎉 Asset seeding completed successfully!');
    console.log('\n📊 Asset Summary:');
    console.log(`📱 Total Assets: ${createdAssets.length}`);
    console.log(`💻 Laptops: ${createdAssets.filter(a => a.category === 'laptop').length}`);
    console.log(`🖥️  Desktops: ${createdAssets.filter(a => a.category === 'desktop').length}`);
    console.log(`📺 Monitors: ${createdAssets.filter(a => a.category === 'monitor').length}`);
    console.log(`📱 Mobile Devices: ${createdAssets.filter(a => ['mobile', 'tablet'].includes(a.category)).length}`);
    console.log(`🖨️  Office Equipment: ${createdAssets.filter(a => ['printer', 'furniture'].includes(a.category)).length}`);
    console.log(`💿 Software Licenses: ${createdAssets.filter(a => a.category === 'software_license').length}`);

  } catch (error) {
    console.error('❌ Error seeding assets:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr')
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return seedAssets();
    })
    .then(() => {
      console.log('✅ Asset seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Asset seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAssets;
