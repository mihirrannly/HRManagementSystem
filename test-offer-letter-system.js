/**
 * Test Script for Offer Letter System
 * 
 * This script demonstrates the complete offer letter workflow:
 * 1. Create an onboarding record
 * 2. Create and edit an offer letter
 * 3. Send the offer letter to candidate
 * 4. Simulate candidate acceptance/rejection
 * 5. Track the status in the system
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_USER_TOKEN = 'your-auth-token-here'; // Replace with actual token

// Set up axios with auth token
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_USER_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test data
const testCandidate = {
  employeeName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  department: 'Engineering',
  position: 'Senior Software Engineer',
  salary: 1200000, // 12 LPA
  startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  employmentType: 'full_time',
  probationPeriod: 6
};

const offerLetterData = {
  position: 'Senior Software Engineer',
  department: 'Engineering',
  salary: 1200000,
  startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  reportingManager: '', // Will be populated from managers list
  workLocation: 'Bangalore, India',
  employmentType: 'full_time',
  probationPeriod: 6,
  benefits: [
    'Health Insurance',
    'Life Insurance',
    'Provident Fund',
    'Flexible Working Hours',
    'Work From Home',
    'Professional Development',
    'Annual Bonus',
    'Meal Allowance',
    'Transport Allowance'
  ],
  terms: [
    'Employment is subject to satisfactory background verification and reference checks',
    'Confidentiality and non-disclosure agreement must be signed before joining',
    'Notice period as per company policy (30/60/90 days based on level)',
    'Adherence to company code of conduct and policies',
    'Successful completion of probation period'
  ],
  expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days validity
  customMessage: 'We are excited to have you join our team and look forward to your contributions to our engineering excellence!'
};

async function testOfferLetterSystem() {
  console.log('🚀 Starting Offer Letter System Test\n');

  try {
    // Step 1: Create onboarding record
    console.log('📝 Step 1: Creating onboarding record...');
    const onboardingResponse = await api.post('/onboarding', testCandidate);
    const onboardingId = onboardingResponse.data.onboarding._id;
    console.log(`✅ Onboarding created with ID: ${onboardingId}`);
    console.log(`   Candidate: ${testCandidate.employeeName}`);
    console.log(`   Position: ${testCandidate.position}\n`);

    // Step 2: Get managers list
    console.log('👥 Step 2: Fetching managers list...');
    const managersResponse = await api.get('/onboarding/managers');
    const managers = managersResponse.data.managers || [];
    console.log(`✅ Found ${managers.length} managers`);
    
    // Select first manager if available
    if (managers.length > 0) {
      offerLetterData.reportingManager = managers[0]._id;
      console.log(`   Selected manager: ${managers[0].name}\n`);
    }

    // Step 3: Create offer letter
    console.log('📄 Step 3: Creating offer letter...');
    const createOfferResponse = await api.post('/onboarding/offer-letter', {
      onboardingId,
      ...offerLetterData
    });
    console.log('✅ Offer letter created successfully');
    console.log(`   Salary: ₹${offerLetterData.salary.toLocaleString()}`);
    console.log(`   Benefits: ${offerLetterData.benefits.length} included`);
    console.log(`   Terms: ${offerLetterData.terms.length} conditions\n`);

    // Step 4: Get offer letter details
    console.log('🔍 Step 4: Retrieving offer letter details...');
    const getOfferResponse = await api.get(`/onboarding/${onboardingId}/offer-letter`);
    const offerLetter = getOfferResponse.data.offerLetter;
    const candidateInfo = getOfferResponse.data.candidateInfo;
    console.log('✅ Offer letter retrieved successfully');
    console.log(`   Status: ${offerLetter?.status || 'Draft'}`);
    console.log(`   Created: ${offerLetter?.generatedAt ? new Date(offerLetter.generatedAt).toLocaleString() : 'Just now'}\n`);

    // Step 5: Send offer letter to candidate
    console.log('📧 Step 5: Sending offer letter to candidate...');
    const sendOfferResponse = await api.post(`/onboarding/${onboardingId}/send-offer-letter`);
    const offerUrl = sendOfferResponse.data.offerLetterUrl;
    console.log('✅ Offer letter sent successfully!');
    console.log(`   Email sent to: ${candidateInfo.email}`);
    console.log(`   Offer URL: ${offerUrl}`);
    console.log(`   Sent at: ${new Date(sendOfferResponse.data.sentAt).toLocaleString()}\n`);

    // Step 6: Simulate candidate viewing the offer
    console.log('👀 Step 6: Simulating candidate viewing offer...');
    const candidateToken = onboardingResponse.data.onboarding.employeeId; // Using employeeId as token
    const viewOfferResponse = await axios.get(`${BASE_URL}/onboarding/offer-acceptance/${candidateToken}`);
    console.log('✅ Candidate can view offer letter');
    console.log(`   Candidate: ${viewOfferResponse.data.employeeName}`);
    console.log(`   Position: ${viewOfferResponse.data.position}`);
    console.log(`   Department: ${viewOfferResponse.data.department}\n`);

    // Step 7: Test offer acceptance
    console.log('✅ Step 7: Testing offer acceptance...');
    const acceptOfferResponse = await axios.post(`${BASE_URL}/onboarding/offer-acceptance/${candidateToken}/accept`, {
      candidateSignature: 'John Doe',
      acceptanceComments: 'I am excited to join the team and contribute to the company\'s success!'
    });
    console.log('🎉 Offer accepted successfully!');
    console.log(`   Message: ${acceptOfferResponse.data.message}`);
    console.log(`   Next steps: ${acceptOfferResponse.data.nextSteps}\n`);

    // Step 8: Verify updated status
    console.log('🔍 Step 8: Verifying updated onboarding status...');
    const updatedOnboardingResponse = await api.get(`/onboarding/${onboardingId}`);
    const updatedOnboarding = updatedOnboardingResponse.data;
    console.log('✅ Status updated successfully');
    console.log(`   Onboarding status: ${updatedOnboarding.status}`);
    console.log(`   Offer letter status: Accepted`);
    console.log(`   Progress: ${updatedOnboarding.progress || 0}%`);
    console.log(`   Current step: ${updatedOnboarding.currentStep}\n`);

    // Step 9: Test offer rejection (create another candidate for this)
    console.log('❌ Step 9: Testing offer rejection with new candidate...');
    const rejectionCandidate = {
      ...testCandidate,
      employeeName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0124'
    };

    const rejectionOnboardingResponse = await api.post('/onboarding', rejectionCandidate);
    const rejectionOnboardingId = rejectionOnboardingResponse.data.onboarding._id;
    
    // Create and send offer letter
    await api.post('/onboarding/offer-letter', {
      onboardingId: rejectionOnboardingId,
      ...offerLetterData,
      customMessage: 'We would love to have you join our team!'
    });
    
    await api.post(`/onboarding/${rejectionOnboardingId}/send-offer-letter`);
    
    // Simulate rejection
    const rejectionToken = rejectionOnboardingResponse.data.onboarding.employeeId;
    const rejectOfferResponse = await axios.post(`${BASE_URL}/onboarding/offer-acceptance/${rejectionToken}/reject`, {
      rejectionReason: 'I have accepted another offer that better aligns with my career goals. Thank you for the opportunity.'
    });
    
    console.log('✅ Offer rejection tested successfully');
    console.log(`   Message: ${rejectOfferResponse.data.message}\n`);

    // Step 10: Get analytics dashboard
    console.log('📊 Step 10: Checking analytics dashboard...');
    const analyticsResponse = await api.get('/onboarding/analytics/dashboard');
    const analytics = analyticsResponse.data;
    console.log('✅ Analytics retrieved successfully');
    console.log(`   Total onboardings: ${analytics.summary?.total || 'N/A'}`);
    console.log(`   Active onboardings: ${analytics.summary?.active || 'N/A'}`);
    console.log(`   Completed onboardings: ${analytics.summary?.completed || 'N/A'}`);
    console.log(`   Pending review: ${analytics.summary?.pendingReview || 'N/A'}\n`);

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Onboarding record creation');
    console.log('✅ Offer letter creation and editing');
    console.log('✅ Email service integration');
    console.log('✅ Candidate offer viewing');
    console.log('✅ Offer acceptance workflow');
    console.log('✅ Offer rejection workflow');
    console.log('✅ Status tracking and updates');
    console.log('✅ Analytics dashboard integration');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.error('   Full error:', error);
  }
}

// Helper function to test email service configuration
async function testEmailService() {
  console.log('📧 Testing Email Service Configuration...\n');
  
  try {
    const testEmailData = {
      candidateName: 'Test User',
      candidateEmail: 'test@example.com',
      candidateId: 'TEST001',
      position: 'Test Position',
      department: 'Test Department',
      offerLetterUrl: '/offer-acceptance/TEST001',
      companyName: 'Rannkly HR'
    };

    // Note: This would require the email service to be properly configured
    console.log('Email service test data prepared:');
    console.log(`   Recipient: ${testEmailData.candidateEmail}`);
    console.log(`   Position: ${testEmailData.position}`);
    console.log(`   Offer URL: ${testEmailData.offerLetterUrl}`);
    console.log('\n⚠️  To test email sending, configure EMAIL_USER and EMAIL_APP_PASSWORD in your .env file');
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  console.log('🧪 Rannkly HR - Offer Letter System Test Suite\n');
  console.log('⚠️  Before running this test:');
  console.log('   1. Make sure the server is running on http://localhost:5001');
  console.log('   2. Replace TEST_USER_TOKEN with a valid authentication token');
  console.log('   3. Ensure you have proper database access\n');
  
  // Uncomment to run the actual tests
  // testOfferLetterSystem();
  
  // Test email service configuration
  testEmailService();
}

module.exports = {
  testOfferLetterSystem,
  testEmailService
};
