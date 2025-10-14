const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly_hr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Announcement = require('./server/models/Announcement');
const User = require('./server/models/User');
const Employee = require('./server/models/Employee');

async function checkPollVoters() {
  try {
    console.log('🗳️  Detailed Poll Voter Information\n');
    console.log('=' .repeat(70));
    
    // Find all polls
    const polls = await Announcement.find({ isPoll: true });
    
    if (polls.length === 0) {
      console.log('❌ No polls found in database!');
      process.exit(0);
    }
    
    for (const poll of polls) {
      console.log(`\n📋 Poll: ${poll.title}`);
      console.log(`   ID: ${poll._id}`);
      console.log(`   Created by: ${poll.createdByName}`);
      console.log(`   Active: ${poll.isActive ? '✅' : '❌'}`);
      console.log('\n' + '-'.repeat(70));
      
      if (!poll.pollOptions || poll.pollOptions.length === 0) {
        console.log('⚠️  No poll options found!\n');
        continue;
      }
      
      let totalVotes = 0;
      
      for (let i = 0; i < poll.pollOptions.length; i++) {
        const option = poll.pollOptions[i];
        const votes = option.votes || [];
        totalVotes += votes.length;
        
        console.log(`\n📊 Option ${i + 1}: "${option.option}"`);
        console.log(`   Total Votes: ${votes.length}`);
        
        if (votes.length === 0) {
          console.log('   👥 No votes yet\n');
          continue;
        }
        
        console.log('   👥 Voters:');
        
        for (const vote of votes) {
          try {
            const user = await User.findById(vote.user).select('email role');
            const employee = await Employee.findOne({ user: vote.user })
              .select('personalInfo.firstName personalInfo.lastName employeeId department');
            
            const userName = employee 
              ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}` 
              : (user ? user.email : 'Unknown');
            
            const empId = employee ? employee.employeeId : 'N/A';
            const dept = employee ? employee.department : 'N/A';
            const role = user ? user.role : 'N/A';
            const voteTime = vote.votedAt ? new Date(vote.votedAt).toLocaleString() : 'N/A';
            
            console.log(`      • ${userName}`);
            console.log(`        Email: ${user ? user.email : 'N/A'}`);
            console.log(`        Employee ID: ${empId}`);
            console.log(`        Department: ${dept}`);
            console.log(`        Role: ${role}`);
            console.log(`        Voted at: ${voteTime}`);
            console.log('');
          } catch (err) {
            console.log(`      • User ID: ${vote.user} (Error fetching details: ${err.message})`);
          }
        }
      }
      
      console.log('-'.repeat(70));
      console.log(`📈 Total Votes: ${totalVotes}`);
      
      // Show percentage breakdown
      if (totalVotes > 0) {
        console.log('\n📊 Results Breakdown:');
        poll.pollOptions.forEach((opt, idx) => {
          const percentage = totalVotes > 0 ? ((opt.votes.length / totalVotes) * 100).toFixed(1) : 0;
          console.log(`   ${idx + 1}. ${opt.option}: ${opt.votes.length} votes (${percentage}%)`);
        });
      }
      
      console.log('\n' + '=' .repeat(70));
    }
    
    console.log('\n✅ Report complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPollVoters();

