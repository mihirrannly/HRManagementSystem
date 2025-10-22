const axios = require('axios');

async function testPendingDocumentsAPI() {
  try {
    console.log('🧪 Testing Pending Documents API...');
    
    // Test the new API endpoint
    const response = await axios.get('http://localhost:5001/employees/pending-documents', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('✅ API Response:', response.data);
    
    if (response.data.success) {
      console.log(`📄 Pending Documents: ${response.data.pendingDocuments.length}`);
      console.log(`📊 Completion Percentage: ${response.data.completionPercentage}%`);
      console.log(`📋 Total Required: ${response.data.totalRequired}`);
      console.log(`📤 Total Submitted: ${response.data.totalSubmitted}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

// Run the test
testPendingDocumentsAPI();
