// Copy and paste this in your browser console (F12 → Console tab)
// This will show you your current user role

const user = JSON.parse(localStorage.getItem('user'));
console.log('=== YOUR USER INFO ===');
console.log('Role:', user?.role);
console.log('Email:', user?.email);
console.log('Name:', user?.name);
console.log('');

if (!user) {
  console.error('❌ No user found! You may need to log in.');
} else if (['admin', 'hr', 'manager'].includes(user.role)) {
  console.log('✅ YOU HAVE PERMISSION! You should see the Late Employees Report button.');
} else {
  console.error('❌ YOU DO NOT HAVE PERMISSION!');
  console.error('Your role is:', user.role);
  console.error('Required roles are: admin, hr, or manager');
  console.error('');
  console.error('The Reports page will show: "You don\'t have permission to view reports."');
}

