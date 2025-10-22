const cron = require('node-cron');
const moment = require('moment');
const Employee = require('../models/Employee');
const ProbationFeedback = require('../models/ProbationFeedback');
const Notification = require('../models/Notification');
const emailService = require('./emailService');

class ProbationScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the probation scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('Probation scheduler is already running');
      return;
    }

    console.log('🎓 Starting Probation Scheduler...');

    // Run daily at 9:00 AM to check for probation completions
    cron.schedule('0 9 * * *', async () => {
      console.log('🔄 Running daily probation check...');
      await this.checkProbationCompletions();
    });

    // Run daily at 10:00 AM to send reminders
    cron.schedule('0 10 * * *', async () => {
      console.log('🔔 Sending probation feedback reminders...');
      await this.sendPendingFeedbackReminders();
    });

    this.isRunning = true;
    console.log('✅ Probation Scheduler started successfully');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    this.isRunning = false;
    console.log('⏹️ Probation Scheduler stopped');
  }

  /**
   * Check for employees completing probation today
   */
  async checkProbationCompletions() {
    try {
      const today = moment().startOf('day');
      const todayEnd = moment().endOf('day');

      console.log(`📅 Checking for probation completions on ${today.format('YYYY-MM-DD')}`);

      // Find employees who are completing probation today (90 days from joining)
      const threeMonthsAgo = moment().subtract(90, 'days').startOf('day');
      const threeMonthsAgoEnd = moment().subtract(90, 'days').endOf('day');

      const completingEmployees = await Employee.find({
        'employmentInfo.isActive': true,
        'employmentInfo.dateOfJoining': {
          $gte: threeMonthsAgo.toDate(),
          $lte: threeMonthsAgoEnd.toDate()
        }
      })
      .populate('employmentInfo.reportingTo', 'personalInfo.firstName personalInfo.lastName employeeId user')
      .populate('employmentInfo.department', 'name')
      .lean();

      console.log(`👥 Found ${completingEmployees.length} employee(s) completing probation today`);

      for (const employee of completingEmployees) {
        await this.createFeedbackFormsAndNotify(employee);
      }

      console.log(`✅ Probation completion check completed`);

    } catch (error) {
      console.error('❌ Error checking probation completions:', error);
    }
  }

  /**
   * Create feedback forms and send notifications
   */
  async createFeedbackFormsAndNotify(employee) {
    try {
      const joiningDate = new Date(employee.employmentInfo.dateOfJoining);
      const probationEndDate = moment(joiningDate).add(90, 'days').toDate();

      // Check if feedback form already exists
      const existingFeedback = await ProbationFeedback.findOne({
        employee: employee._id
      });

      if (existingFeedback) {
        console.log(`⚠️ Feedback form already exists for ${employee.employeeId}`);
        return;
      }

      // Create feedback form
      const feedbackForm = new ProbationFeedback({
        employee: employee._id,
        employeeId: employee.employeeId,
        employeeName: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        manager: employee.employmentInfo.reportingTo?._id,
        managerName: employee.employmentInfo.reportingTo 
          ? `${employee.employmentInfo.reportingTo.personalInfo.firstName} ${employee.employmentInfo.reportingTo.personalInfo.lastName}`
          : null,
        department: employee.employmentInfo.department?.name,
        designation: employee.employmentInfo.designation,
        joiningDate: joiningDate,
        probationEndDate: probationEndDate,
        status: 'pending'
      });

      await feedbackForm.save();
      console.log(`📝 Created feedback form for ${employee.employeeId}`);

      // Send notification and email to employee
      await this.notifyEmployee(employee, feedbackForm._id);

      // Send notification and email to manager
      if (employee.employmentInfo.reportingTo) {
        await this.notifyManager(employee, employee.employmentInfo.reportingTo, feedbackForm._id);
      }

      // Mark notifications as sent
      feedbackForm.notificationsSent.employeeNotified = true;
      feedbackForm.notificationsSent.managerNotified = true;
      await feedbackForm.save();

    } catch (error) {
      console.error(`❌ Error creating feedback for ${employee.employeeId}:`, error);
    }
  }

  /**
   * Send notification to employee
   */
  async notifyEmployee(employee, feedbackId) {
    try {
      const employeeName = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;

      // Create in-app notification
      const notification = new Notification({
        recipient: employee._id,
        recipientRole: 'employee',
        type: 'probation_completed',
        title: '🎓 Probation Period Completed - Feedback Required',
        message: `Congratulations! You have completed your probation period. Please submit your self-assessment feedback form to help us understand your experience.`,
        metadata: {
          employeeId: employee.employeeId,
          employeeName: employeeName,
          feedbackId: feedbackId.toString()
        },
        actionRequired: true,
        actionUrl: `/probation-feedback/${feedbackId}`,
        priority: 'high'
      });

      await notification.save();
      console.log(`📬 Created notification for employee ${employee.employeeId}`);

      // Send email notification
      try {
        const emailData = {
          to: employee.personalInfo.email || employee.contactInfo.personalEmail,
          subject: 'Probation Period Completed - Feedback Form',
          employeeName: employeeName,
          feedbackId: feedbackId.toString(),
          portalUrl: process.env.CLIENT_URL || 'http://localhost:5173'
        };

        await this.sendEmployeeFeedbackEmail(emailData);
        console.log(`📧 Sent email to ${employee.employeeId}`);
      } catch (emailError) {
        console.error(`⚠️ Failed to send email to ${employee.employeeId}:`, emailError.message);
      }

    } catch (error) {
      console.error(`❌ Error notifying employee ${employee.employeeId}:`, error);
    }
  }

  /**
   * Send notification to manager
   */
  async notifyManager(employee, manager, feedbackId) {
    try {
      const employeeName = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
      const managerName = `${manager.personalInfo.firstName} ${manager.personalInfo.lastName}`;

      // Create in-app notification
      const notification = new Notification({
        recipient: manager._id,
        recipientRole: 'manager',
        type: 'probation_completed',
        title: `📋 Probation Review Required - ${employeeName}`,
        message: `${employeeName} has completed their probation period. Please submit your manager assessment feedback form.`,
        relatedEmployee: employee._id,
        metadata: {
          employeeId: employee.employeeId,
          employeeName: employeeName,
          feedbackId: feedbackId.toString()
        },
        actionRequired: true,
        actionUrl: `/probation-feedback/manager/${feedbackId}`,
        priority: 'high'
      });

      await notification.save();
      console.log(`📬 Created notification for manager of ${employee.employeeId}`);

      // Send email notification
      try {
        const managerEmail = manager.personalInfo.email || manager.contactInfo?.personalEmail;
        
        if (managerEmail) {
          const emailData = {
            to: managerEmail,
            subject: `Probation Review Required - ${employeeName}`,
            managerName: managerName,
            employeeName: employeeName,
            feedbackId: feedbackId.toString(),
            portalUrl: process.env.CLIENT_URL || 'http://localhost:5173'
          };

          await this.sendManagerFeedbackEmail(emailData);
          console.log(`📧 Sent email to manager of ${employee.employeeId}`);
        }
      } catch (emailError) {
        console.error(`⚠️ Failed to send email to manager:`, emailError.message);
      }

    } catch (error) {
      console.error(`❌ Error notifying manager:`, error);
    }
  }

  /**
   * Send pending feedback reminders (for forms not completed after 3 days)
   */
  async sendPendingFeedbackReminders() {
    try {
      const threeDaysAgo = moment().subtract(3, 'days').startOf('day').toDate();

      // Find pending or partially completed feedback forms older than 3 days
      const pendingFeedbacks = await ProbationFeedback.find({
        status: { $in: ['pending', 'employee_completed', 'manager_completed'] },
        createdAt: { $lte: threeDaysAgo }
      })
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId personalInfo.email contactInfo.personalEmail')
      .populate('manager', 'personalInfo.firstName personalInfo.lastName personalInfo.email contactInfo.personalEmail');

      console.log(`📨 Found ${pendingFeedbacks.length} pending feedback form(s) requiring reminders`);

      for (const feedback of pendingFeedbacks) {
        // Send reminder to employee if not submitted
        if (!feedback.employeeFeedback.submitted && !feedback.notificationsSent.employeeReminderSent) {
          await this.sendEmployeeReminder(feedback);
          feedback.notificationsSent.employeeReminderSent = true;
        }

        // Send reminder to manager if not submitted
        if (!feedback.managerFeedback.submitted && !feedback.notificationsSent.managerReminderSent && feedback.manager) {
          await this.sendManagerReminder(feedback);
          feedback.notificationsSent.managerReminderSent = true;
        }

        await feedback.save();
      }

      console.log(`✅ Reminder sending completed`);

    } catch (error) {
      console.error('❌ Error sending reminders:', error);
    }
  }

  /**
   * Send reminder to employee
   */
  async sendEmployeeReminder(feedback) {
    try {
      const notification = new Notification({
        recipient: feedback.employee._id,
        recipientRole: 'employee',
        type: 'probation_completed',
        title: '⏰ Reminder: Probation Feedback Form Pending',
        message: 'This is a friendly reminder to complete your probation feedback form. Your input is valuable to us!',
        metadata: {
          feedbackId: feedback._id.toString()
        },
        actionRequired: true,
        actionUrl: `/probation-feedback/${feedback._id}`,
        priority: 'high'
      });

      await notification.save();
      console.log(`🔔 Sent reminder to employee ${feedback.employeeId}`);

    } catch (error) {
      console.error(`❌ Error sending employee reminder:`, error);
    }
  }

  /**
   * Send reminder to manager
   */
  async sendManagerReminder(feedback) {
    try {
      const notification = new Notification({
        recipient: feedback.manager._id,
        recipientRole: 'manager',
        type: 'probation_completed',
        title: `⏰ Reminder: Probation Review Pending - ${feedback.employeeName}`,
        message: `Please complete the probation assessment for ${feedback.employeeName}. This is important for their confirmation.`,
        relatedEmployee: feedback.employee._id,
        metadata: {
          feedbackId: feedback._id.toString(),
          employeeName: feedback.employeeName
        },
        actionRequired: true,
        actionUrl: `/probation-feedback/manager/${feedback._id}`,
        priority: 'high'
      });

      await notification.save();
      console.log(`🔔 Sent reminder to manager for ${feedback.employeeId}`);

    } catch (error) {
      console.error(`❌ Error sending manager reminder:`, error);
    }
  }

  /**
   * Email template for employee feedback
   */
  async sendEmployeeFeedbackEmail(data) {
    const { to, employeeName, feedbackId, portalUrl } = data;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Rannkly HR'} Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '🎓 Probation Period Completed - Feedback Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🎓</div>
              <h1>Congratulations!</h1>
              <p>You've Completed Your Probation Period</p>
            </div>
            
            <div class="content">
              <h2>Dear ${employeeName},</h2>
              
              <p>Congratulations on successfully completing your 3-month probation period! We're excited about your journey with us so far.</p>
              
              <div class="info-box">
                <h3>📝 Action Required: Self-Assessment Feedback</h3>
                <p>To help us understand your experience and support your growth, please complete your probation self-assessment form. This is an opportunity to:</p>
                <ul>
                  <li>Share your achievements and learning</li>
                  <li>Highlight challenges you've faced</li>
                  <li>Provide feedback on your onboarding experience</li>
                  <li>Discuss your future goals and development needs</li>
                </ul>
              </div>
              
              <center>
                <a href="${portalUrl}/probation-feedback/${feedbackId}" class="button">
                  Complete Feedback Form →
                </a>
              </center>
              
              <p><strong>Important:</strong> Please complete the form within the next 7 days. Your honest feedback is valuable and will be kept confidential.</p>
              
              <div class="info-box">
                <p><strong>💡 Tip:</strong> Take some time to reflect on your experience before filling out the form. Be honest and constructive in your responses.</p>
              </div>
              
              <p>If you have any questions about the feedback form or the confirmation process, please don't hesitate to reach out to the HR team.</p>
              
              <p>Thank you for being part of our team!</p>
              
              <p>Best regards,<br>
              <strong>HR Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated notification. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Company'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Use the existing email service
    const transporter = emailService.createTransporter();
    if (transporter) {
      await transporter.sendMail(mailOptions);
    }
  }

  /**
   * Email template for manager feedback
   */
  async sendManagerFeedbackEmail(data) {
    const { to, managerName, employeeName, feedbackId, portalUrl } = data;

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Rannkly HR'} Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `📋 Probation Review Required - ${employeeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">📋</div>
              <h1>Probation Review Required</h1>
              <p>Manager Assessment Form</p>
            </div>
            
            <div class="content">
              <h2>Dear ${managerName},</h2>
              
              <p><strong>${employeeName}</strong> has completed their 3-month probation period, and it's time for you to provide your assessment.</p>
              
              <div class="info-box">
                <h3>📊 Manager Assessment Required</h3>
                <p>As their reporting manager, please complete the probation assessment form covering:</p>
                <ul>
                  <li><strong>Performance:</strong> Technical skills, work quality, and productivity</li>
                  <li><strong>Behavior:</strong> Communication, teamwork, and reliability</li>
                  <li><strong>Growth:</strong> Learning ability and adaptability</li>
                  <li><strong>Recommendation:</strong> Confirmation, extension, or other decision</li>
                  <li><strong>Future Planning:</strong> Development areas and expectations</li>
                </ul>
              </div>
              
              <center>
                <a href="${portalUrl}/probation-feedback/manager/${feedbackId}" class="button">
                  Complete Assessment Form →
                </a>
              </center>
              
              <p><strong>Important:</strong> Please complete the form within the next 7 days. Your assessment is crucial for the employee's confirmation decision.</p>
              
              <div class="info-box">
                <p><strong>💡 Guidelines:</strong></p>
                <ul>
                  <li>Be objective and fair in your assessment</li>
                  <li>Provide specific examples where possible</li>
                  <li>Be constructive in highlighting improvement areas</li>
                  <li>Consider their growth trajectory over the probation period</li>
                </ul>
              </div>
              
              <p>Your feedback will help us make the right decision regarding ${employeeName}'s confirmation. If you need any support or have questions, please contact the HR team.</p>
              
              <p>Thank you for your valuable input!</p>
              
              <p>Best regards,<br>
              <strong>HR Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated notification. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Company'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Use the existing email service
    const transporter = emailService.createTransporter();
    if (transporter) {
      await transporter.sendMail(mailOptions);
    }
  }

  /**
   * Manual trigger for checking probation completions (for testing)
   */
  async runProbationCheck() {
    console.log('🔧 Manual trigger: Running probation completion check...');
    await this.checkProbationCompletions();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRuns: {
        probationCheck: '9:00 AM daily',
        reminderSending: '10:00 AM daily'
      }
    };
  }
}

module.exports = new ProbationScheduler();


