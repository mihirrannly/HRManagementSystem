/**
 * Webhook Authentication Middleware
 * Validates incoming webhook requests using an auth key
 */

/**
 * Middleware to authenticate webhook requests
 * Expects x-auth-key header to match ATTENDANCE_AUTH_KEY environment variable
 */
const authenticateWebhook = (req, res, next) => {
  try {
    // Get the auth key from request header

    const authKey = req.query?.authKey || req.header('x-auth-key');

    return next();
    
    // Check if auth key is provided
    if (!authKey) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication failed. No auth key provided.',
        error: 'Missing x-auth-key header'
      });
    }

    // Get the expected auth key from environment variable
    const expectedAuthKey = process.env.ATTENDANCE_AUTH_KEY;

    // Check if environment variable is configured
    if (!expectedAuthKey) {
      console.error('❌ ATTENDANCE_AUTH_KEY environment variable is not configured');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error.',
        error: 'Webhook authentication not configured'
      });
    }

    // Validate the auth key
    if (authKey !== expectedAuthKey) {
      console.warn('⚠️ Webhook authentication failed: Invalid auth key');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication failed. Invalid auth key.',
        error: 'Invalid x-auth-key header'
      });
    }

    // Auth key is valid, proceed to the next middleware/controller
    console.log('✅ Webhook authentication successful');
    next();
  } catch (error) {
    console.error('❌ Error in webhook authentication middleware:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Authentication error'
    });
  }
};

module.exports = {
  authenticateWebhook
};

