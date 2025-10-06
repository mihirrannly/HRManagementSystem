const mongoose = require('mongoose');
const ExitManagement = require('../models/ExitManagement');

const seedExitSurveyData = async () => {
  try {
    console.log('🌱 Seeding Exit Survey Data...');

    // Sample exit survey data based on the provided survey
    const sampleSurveyData = {
      submitted: true,
      submittedDate: new Date('2025-09-30'),
      submittedBy: new mongoose.Types.ObjectId(), // This would be the actual user ID
      
      // Section 1: Compensation & Benefits
      compensationBenefits: {
        remunerationSatisfaction: 3, // Based on "not achieving the target"
        achievementsRecognized: 'No',
        recognitionFrequency: 2, // Low frequency
        constructiveFeedback: 'No'
      },
      
      // Section 2: Team and Work Environment
      workEnvironment: {
        trainingSatisfaction: 4,
        workLifeBalance: 5,
        skillsUtilization: 6,
        jobHappiness: 4,
        managerTreatment: 5
      },
      
      // Section 3: Organization Culture
      organizationCulture: {
        companyHappiness: 5,
        recommendLikelihood: 4,
        rehireConsideration: 'No'
      },
      
      // Section 4: Trigger/Reason
      triggerReason: {
        leavingReason: 'not achieving the target.',
        concernsShared: 'No',
        improvementSuggestions: 'we can seamless the entire sales process end to end (means executive to founder) also address any insights, feedbacks, suggestions, updates from sales specially because they are the one who having direct interaction with new people.',
        futureContact: 'No'
      }
    };

    // Find an existing exit record to update (or create a new one for testing)
    let exitRecord = await ExitManagement.findOne();
    
    if (!exitRecord) {
      // Create a sample exit record for testing
      exitRecord = new ExitManagement({
        employee: new mongoose.Types.ObjectId(),
        employeeId: 'CODR001',
        employeeName: 'Sample Employee',
        department: new mongoose.Types.ObjectId(),
        designation: 'Sales Executive',
        exitType: 'resignation',
        lastWorkingDate: new Date('2025-10-15'),
        reasonForLeaving: 'Not achieving targets',
        initiatedBy: new mongoose.Types.ObjectId(),
        status: 'in_progress'
      });
    }

    // Update the exit record with survey data
    exitRecord.exitSurvey = sampleSurveyData;
    await exitRecord.save();

    console.log('✅ Exit survey data seeded successfully!');
    console.log('📊 Survey Summary:');
    console.log(`   - Remuneration Satisfaction: ${sampleSurveyData.compensationBenefits.remunerationSatisfaction}/10`);
    console.log(`   - Job Happiness: ${sampleSurveyData.workEnvironment.jobHappiness}/10`);
    console.log(`   - Company Happiness: ${sampleSurveyData.organizationCulture.companyHappiness}/10`);
    console.log(`   - Rehire Consideration: ${sampleSurveyData.organizationCulture.rehireConsideration}`);
    console.log(`   - Reason: ${sampleSurveyData.triggerReason.leavingReason}`);

  } catch (error) {
    console.error('❌ Error seeding exit survey data:', error);
    throw error;
  }
};

module.exports = seedExitSurveyData;

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedExitSurveyData();
    process.exit(0);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
}
