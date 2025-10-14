const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly_hr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Announcement = require('./server/models/Announcement');
const User = require('./server/models/User');

async function checkPollVotes() {
  try {
    console.log('🗳️  Checking poll votes...\n');
    
    // Find all polls
    const polls = await Announcement.find({ isPoll: true });
    
    console.log(`📊 Total polls in database: ${polls.length}\n`);
    
    if (polls.length === 0) {
      console.log('❌ No polls found in database!');
      process.exit(0);
    }
    
    for (const poll of polls) {
      console.log('=' .repeat(60));
      console.log(`📋 Poll: ${poll.title}`);
      console.log(`ID: ${poll._id}`);
      console.log(`Active: ${poll.isActive}`);
      console.log(`Created By: ${poll.createdByName}`);
      console.log(`Multiple Choice: ${poll.pollMultipleChoice}`);
      console.log('');
      
      if (!poll.pollOptions || poll.pollOptions.length === 0) {
        console.log('⚠️  No poll options found!');
        continue;
      }
      
      console.log('📊 Poll Options and Votes:\n');
      
      let totalVotes = 0;
      
      for (let i = 0; i < poll.pollOptions.length; i++) {
        const option = poll.pollOptions[i];
        const votes = option.votes || [];
        totalVotes += votes.length;
        
        console.log(`  Option ${i + 1}: "${option.option}"`);
        console.log(`  Votes: ${votes.length}`);
        
        if (votes.length > 0) {
          console.log('  Voted by:');
          for (const vote of votes) {
            try {
              const user = await User.findById(vote.user).select('email role');
              console.log(`    - ${user ? user.email : 'Unknown user'} (${user ? user.role : 'N/A'}) at ${vote.votedAt || 'N/A'}`);
            } catch (err) {
              console.log(`    - User ID: ${vote.user} (Error fetching details)`);
            }
          }
        }
        console.log('');
      }
      
      console.log(`📈 Total votes across all options: ${totalVotes}\n`);
      
      // Calculate results using the model method
      const results = poll.getPollResults();
      console.log('🎯 Poll Results (calculated):');
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.option}: ${result.votes} votes (${result.percentage}%)`);
      });
      
      console.log('\n');
    }
    
    console.log('=' .repeat(60));
    console.log('\n✅ Poll check complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPollVotes();

