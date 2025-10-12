const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const payrollRoutes = require('./routes/payroll');
const performanceRoutes = require('./routes/performance');
const recruitmentRoutes = require('./routes/recruitment');
const reportRoutes = require('./routes/reports');
const helpdeskRoutes = require('./routes/helpdesk');
const organizationRoutes = require('./routes/organization');
const onboardingRoutes = require('./routes/onboarding');
const candidatePortalRoutes = require('./routes/candidatePortal');
const eSignatureRoutes = require('./routes/eSignature');
const permissionRoutes = require('./routes/permissions');
const assetRoutes = require('./routes/assets');
const shiftRoutes = require('./routes/shifts');
const testRoutes = require('./routes/test');
const faceDetectionRoutes = require('./routes/faceDetection');
const exitManagementRoutes = require('./routes/exitManagement');
const salaryManagementRoutes = require('./routes/salaryManagement');
const designationRoutes = require('./routes/designations');
const webhookRoutes = require('./routes/webhook');

// Import services
const attendanceScheduler = require('./services/attendanceScheduler');

const app = express();

// Trust proxy - Required for rate limiting and getting real IP addresses
app.set('trust proxy', true);

// Security middleware with custom configuration for CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin requests for static files
}));
app.use(compression());

// Rate limiting - More generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs (increased for bulk imports)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  // Skip rate limiting for import endpoints
  skip: (req) => req.path.includes('/import')
});
app.use(limiter);

// CORS configuration - Allow local network access in development
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

// In development, also allow network IP access
// if (process.env.NODE_ENV === 'development') {
//   allowedOrigins.push('http://192.168.68.133:5173');
//   // Allow any local network IP for development
//   app.use(cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (mobile apps, Postman, etc.)
//       if (!origin) return callback(null, true);
      
//       // Check if origin is in allowed list or matches local network pattern
//       if (allowedOrigins.includes(origin) || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-key']
//   }));
// } else {
//   app.use(cors({
//     origin: allowedOrigins,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-key']
//   }));
// }

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with CORS headers and proper MIME types
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  
  // In development, allow any local network origin
  if (process.env.NODE_ENV === 'development' && origin) {
    if (allowedOrigins.includes(origin) || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  } else {
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Set proper content disposition for images to allow inline viewing
  const ext = req.path.toLowerCase();
  if (ext.includes('.jpg') || ext.includes('.jpeg') || ext.includes('.png') || 
      ext.includes('.gif') || ext.includes('.webp') || ext.includes('.pdf')) {
    // For images and PDFs, allow inline viewing
    res.header('Content-Disposition', 'inline');
  }
  
  next();
}, express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly_hr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/candidate-portal', candidatePortalRoutes);
app.use('/api/esignature', eSignatureRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/test', testRoutes);
app.use('/api/face-detection', faceDetectionRoutes);
app.use('/api/exit-management', exitManagementRoutes);
app.use('/api/salary-management', salaryManagementRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Accessible on: http://localhost:${PORT}`);
  
  // In development, show network URL
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Network URL: http://192.168.68.133:${PORT}`);
  }
  
  // Start attendance scheduler
  attendanceScheduler.start();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Server will continue running...');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  // Don't exit - let nodemon handle restarts if needed
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION! Server will continue running...');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  // Don't exit - let nodemon handle restarts if needed
});

