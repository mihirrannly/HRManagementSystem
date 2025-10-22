const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Payroll Setup...\n');

// Check 1: Payroll component exists
const payrollPath = 'client/src/pages/Payroll/Payroll.jsx';
if (fs.existsSync(payrollPath)) {
  console.log('✅ Payroll component exists');
  
  // Check if it has the Run Payroll button
  const payrollContent = fs.readFileSync(payrollPath, 'utf8');
  if (payrollContent.includes('Run Payroll')) {
    console.log('✅ Run Payroll button found in component');
  } else {
    console.log('❌ Run Payroll button not found');
  }
  
  if (payrollContent.includes('handleRunPayroll')) {
    console.log('✅ Run Payroll handler found');
  } else {
    console.log('❌ Run Payroll handler not found');
  }
} else {
  console.log('❌ Payroll component not found');
}

// Check 2: Layout navigation
const layoutPath = 'client/src/components/Layout/Layout.jsx';
if (fs.existsSync(layoutPath)) {
  console.log('✅ Layout component exists');
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes("text: 'Payroll'")) {
    console.log('✅ Payroll menu item found in navigation');
  } else {
    console.log('❌ Payroll menu item not found in navigation');
  }
} else {
  console.log('❌ Layout component not found');
}

// Check 3: App routing
const appPath = 'client/src/App.jsx';
if (fs.existsSync(appPath)) {
  console.log('✅ App component exists');
  
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('path="payroll"')) {
    console.log('✅ Payroll route found in App.jsx');
  } else {
    console.log('❌ Payroll route not found in App.jsx');
  }
} else {
  console.log('❌ App component not found');
}

// Check 4: Backend routes
const payrollRoutePath = 'server/routes/payroll.js';
if (fs.existsSync(payrollRoutePath)) {
  console.log('✅ Payroll routes exist');
  
  const routeContent = fs.readFileSync(payrollRoutePath, 'utf8');
  if (routeContent.includes('/employee-salaries')) {
    console.log('✅ Employee salaries endpoint found');
  } else {
    console.log('❌ Employee salaries endpoint not found');
  }
} else {
  console.log('❌ Payroll routes not found');
}

// Check 5: Package.json scripts
const packagePath = 'package.json';
if (fs.existsSync(packagePath)) {
  console.log('✅ Package.json exists');
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (packageContent.scripts && packageContent.scripts.dev) {
    console.log('✅ Dev script found:', packageContent.scripts.dev);
  } else {
    console.log('❌ Dev script not found');
  }
} else {
  console.log('❌ Package.json not found');
}

console.log('\n🎯 Setup Verification Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Run: npm run dev');
console.log('2. Open: http://localhost:3000');
console.log('3. Login with admin/hr user');
console.log('4. Look for "Payroll" in left sidebar');
console.log('5. Click "Run Payroll" button');
