const express = require('express');
const router = express.Router();
const { authenticate: auth, authorize } = require('../middleware/auth');
const eSignatureService = require('../services/eSignatureService');
const { DocumentTemplate, ESignatureDocument, ESignatureConfig } = require('../models/ESignature');
const { createUpload, getFileUrl } = require('../middleware/s3Upload');

// Configure S3-enabled upload for e-signature documents
const upload = createUpload('esignature-templates', {
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Document Templates Routes
// GET /api/esignature/templates - Get all templates
router.get('/templates', auth, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const templates = await eSignatureService.getTemplates(filters);
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get templates',
      error: error.message
    });
  }
});

// POST /api/esignature/templates - Create new template
router.post('/templates', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const templateData = req.body;
    const template = await eSignatureService.createTemplate(templateData, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
});

// PUT /api/esignature/templates/:id - Update template
router.put('/templates/:id', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const template = await eSignatureService.updateTemplate(req.params.id, req.body, req.user.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
});

// DELETE /api/esignature/templates/:id - Delete (deactivate) template
router.delete('/templates/:id', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const template = await DocumentTemplate.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Template deactivated successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
});

// E-Signature Documents Routes
// GET /api/esignature/documents - Get documents
router.get('/documents', auth, async (req, res) => {
  try {
    const { status, recipient, page = 1, limit = 10 } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (recipient) filters['recipients.email'] = recipient;
    
    // Add user-specific filters based on role
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      filters['recipients.email'] = req.user.email;
    }
    
    const documents = await ESignatureDocument.find(filters)
      .populate('templateId', 'name category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ESignatureDocument.countDocuments(filters);
    
    res.json({
      success: true,
      documents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: error.message
    });
  }
});

// POST /api/esignature/documents - Create new document
router.post('/documents', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const documentData = req.body;
    const document = await eSignatureService.createDocument(documentData, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document',
      error: error.message
    });
  }
});

// GET /api/esignature/documents/:id - Get document details
router.get('/documents/:id', auth, async (req, res) => {
  try {
    const document = await eSignatureService.getDocumentStatus(req.params.id);
    
    // Check if user has access to this document
    const hasAccess = req.user.role === 'admin' || 
                     req.user.role === 'hr' || 
                     document.createdBy._id.toString() === req.user.id ||
                     document.recipients.some(r => r.email === req.user.email);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document',
      error: error.message
    });
  }
});

// POST /api/esignature/documents/:id/send - Send document for signing
router.post('/documents/:id/send', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const { expiryDays = 30, reminderDays = 3 } = req.body;
    const result = await eSignatureService.sendDocument(req.params.id, {
      expiryDays,
      reminderDays
    });
    
    res.json({
      success: true,
      message: 'Document sent successfully',
      document: result.document,
      details: result.result
    });
  } catch (error) {
    console.error('Send document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send document',
      error: error.message
    });
  }
});

// POST /api/esignature/documents/:id/sign - Sign document
router.post('/documents/:id/sign', async (req, res) => {
  try {
    const { signatureData, recipientInfo, token } = req.body;
    
    // Validate signing token for internal documents
    const document = await ESignatureDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    if (document.provider === 'internal') {
      const expectedToken = document.customFields?.find(
        field => field.name === `signing_token_${recipientInfo.email}`
      )?.value;
      
      if (!expectedToken || expectedToken !== token) {
        return res.status(403).json({
          success: false,
          message: 'Invalid signing token'
        });
      }
    }
    
    const signedDocument = await eSignatureService.processSignature(
      req.params.id,
      signatureData,
      {
        ...recipientInfo,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    );
    
    res.json({
      success: true,
      message: 'Document signed successfully',
      document: signedDocument
    });
  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign document',
      error: error.message
    });
  }
});

// POST /api/esignature/documents/:id/decline - Decline to sign document
router.post('/documents/:id/decline', async (req, res) => {
  try {
    const { reason, recipientInfo, token } = req.body;
    
    const document = await ESignatureDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Validate token for internal documents
    if (document.provider === 'internal') {
      const expectedToken = document.customFields?.find(
        field => field.name === `signing_token_${recipientInfo.email}`
      )?.value;
      
      if (!expectedToken || expectedToken !== token) {
        return res.status(403).json({
          success: false,
          message: 'Invalid token'
        });
      }
    }
    
    document.status = 'declined';
    document.addAuditEntry('declined', {
      name: recipientInfo.name,
      email: recipientInfo.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }, reason || 'Document declined');
    
    await document.save();
    
    res.json({
      success: true,
      message: 'Document declined',
      document
    });
  } catch (error) {
    console.error('Decline document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline document',
      error: error.message
    });
  }
});

// GET /api/esignature/documents/:id/download - Download signed document
router.get('/documents/:id/download', auth, async (req, res) => {
  try {
    const document = await ESignatureDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check access permissions
    const hasAccess = req.user.role === 'admin' || 
                     req.user.role === 'hr' || 
                     document.createdBy.toString() === req.user.id ||
                     document.recipients.some(r => r.email === req.user.email);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (document.status !== 'completed' || !document.finalDocumentUrl) {
      return res.status(400).json({
        success: false,
        message: 'Document not ready for download'
      });
    }
    
    const filePath = path.join(process.cwd(), document.finalDocumentUrl);
    res.download(filePath, `${document.title}_signed.pdf`);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
});

// Configuration Routes
// GET /api/esignature/config - Get e-signature configuration
router.get('/config', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const config = await eSignatureService.getConfiguration(req.user.organizationId);
    
    // Don't expose sensitive keys in response
    const safeConfig = {
      ...config.toObject(),
      providers: {
        ...config.providers,
        docusign: {
          ...config.providers.docusign,
          secretKey: config.providers.docusign?.secretKey ? '***' : undefined
        },
        dropboxSign: {
          ...config.providers.dropboxSign,
          apiKey: config.providers.dropboxSign?.apiKey ? '***' : undefined
        }
      }
    };
    
    res.json({
      success: true,
      config: safeConfig
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get configuration',
      error: error.message
    });
  }
});

// PUT /api/esignature/config - Update e-signature configuration
router.put('/config', auth, authorize(['admin']), async (req, res) => {
  try {
    const config = await eSignatureService.updateConfiguration(
      req.user.organizationId,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      config
    });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      error: error.message
    });
  }
});

// Analytics Routes
// GET /api/esignature/analytics - Get e-signature analytics
router.get('/analytics', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const { startDate, endDate, status, provider } = req.query;
    const filters = {};
    
    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) filters.status = status;
    if (provider) filters.provider = provider;
    
    const analytics = await eSignatureService.getAnalytics(filters);
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

// Webhook Routes for Provider Integrations
// POST /api/esignature/webhooks/docusign - DocuSign webhook
router.post('/webhooks/docusign', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature (implement based on DocuSign documentation)
    const event = req.body;
    
    if (event.event === 'envelope-completed') {
      const envelopeId = event.data.envelopeId;
      const document = await ESignatureDocument.findOne({ providerEnvelopeId: envelopeId });
      
      if (document) {
        document.status = 'completed';
        document.completedAt = new Date();
        document.addAuditEntry('completed', {
          name: 'DocuSign',
          email: 'webhook@docusign.com'
        }, 'Document completed via DocuSign');
        
        await document.save();
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('DocuSign webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// POST /api/esignature/webhooks/dropbox-sign - Dropbox Sign webhook
router.post('/webhooks/dropbox-sign', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature (implement based on Dropbox Sign documentation)
    const event = req.body;
    
    if (event.event.event_type === 'signature_request_all_signed') {
      const signatureRequestId = event.signature_request.signature_request_id;
      const document = await ESignatureDocument.findOne({ providerEnvelopeId: signatureRequestId });
      
      if (document) {
        document.status = 'completed';
        document.completedAt = new Date();
        document.addAuditEntry('completed', {
          name: 'Dropbox Sign',
          email: 'webhook@dropboxsign.com'
        }, 'Document completed via Dropbox Sign');
        
        await document.save();
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Dropbox Sign webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Public signing page route (no auth required)
// GET /api/esignature/sign/:id - Get document for signing (public route)
router.get('/sign/:id', async (req, res) => {
  try {
    const { token } = req.query;
    const document = await ESignatureDocument.findById(req.params.id)
      .populate('templateId');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // For internal documents, validate token
    if (document.provider === 'internal' && token) {
      const validToken = document.customFields?.some(
        field => field.name.startsWith('signing_token_') && field.value === token
      );
      
      if (!validToken) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired signing link'
        });
      }
    }
    
    // Check if document is still signable
    if (document.status !== 'sent' || document.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Document is no longer available for signing'
      });
    }
    
    // Return document details for signing page
    res.json({
      success: true,
      document: {
        _id: document._id,
        title: document.title,
        description: document.description,
        status: document.status,
        expiresAt: document.expiresAt,
        templateContent: document.templateId?.templateContent,
        recipients: document.recipients,
        provider: document.provider
      }
    });
  } catch (error) {
    console.error('Get signing document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document for signing',
      error: error.message
    });
  }
});

module.exports = router;
