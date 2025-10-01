const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Test route is working!', 
    timestamp: new Date(),
    path: req.path,
    method: req.method
  });
});

console.log('🔥 TEST ROUTES LOADED!');
module.exports = router;
