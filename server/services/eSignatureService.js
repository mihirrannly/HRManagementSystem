const { DocumentTemplate, ESignatureDocument, ESignatureConfig } = require('../models/ESignature');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Lazy load optional dependencies
let docusign = null;
let SignatureRequestApi = null;

try {
  docusign = require('docusign-esign');
} catch (error) {
  console.warn('DocuSign SDK not installed. DocuSign integration will be disabled.');
}

try {
  const dropboxSign = require('@dropbox/sign');
  SignatureRequestApi = dropboxSign.SignatureRequestApi;
} catch (error) {
  console.warn('Dropbox Sign SDK not installed. Dropbox Sign integration will be disabled.');
}

class ESignatureService {
  constructor() {
    this.docusignClient = null;
    this.dropboxSignClient = null;
    this.initializeClients();
  }

  async initializeClients() {
    try {
      // Initialize DocuSign client
      if (docusign && process.env.DOCUSIGN_INTEGRATION_KEY) {
        this.docusignClient = new docusign.ApiClient();
        this.docusignClient.setBasePath(process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi');
        console.log('✅ DocuSign client initialized');
      }

      // Initialize Dropbox Sign client
      if (SignatureRequestApi && process.env.DROPBOX_SIGN_API_KEY) {
        this.dropboxSignClient = new SignatureRequestApi();
        this.dropboxSignClient.username = process.env.DROPBOX_SIGN_API_KEY;
        console.log('✅ Dropbox Sign client initialized');
      }
    } catch (error) {
      console.error('Error initializing e-signature clients:', error);
    }
  }

  // Document Template Management
  async createTemplate(templateData, userId) {
    try {
      const template = new DocumentTemplate({
        ...templateData,
        createdBy: userId
      });
      await template.save();
      return template;
    } catch (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  async getTemplates(filters = {}) {
    try {
      const query = { isActive: true, ...filters };
      const templates = await DocumentTemplate.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      return templates;
    } catch (error) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }
  }

  async updateTemplate(templateId, updateData, userId) {
    try {
      const template = await DocumentTemplate.findByIdAndUpdate(
        templateId,
        { ...updateData, updatedAt: Date.now() },
        { new: true }
      );
      return template;
    } catch (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }
  }

  // E-Signature Document Management
  async createDocument(documentData, userId) {
    try {
      const document = new ESignatureDocument({
        ...documentData,
        createdBy: userId
      });
      
      document.addAuditEntry('created', {
        name: 'System',
        email: 'system@company.com'
      }, 'Document created');
      
      await document.save();
      return document;
    } catch (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }
  }

  async sendDocument(documentId, sendOptions = {}) {
    try {
      const document = await ESignatureDocument.findById(documentId)
        .populate('templateId')
        .populate('createdBy', 'name email');

      if (!document) {
        throw new Error('Document not found');
      }

      if (document.status !== 'draft') {
        throw new Error('Document has already been sent');
      }

      let result;
      switch (document.provider) {
        case 'docusign':
          result = await this.sendViaDocuSign(document, sendOptions);
          break;
        case 'dropbox_sign':
          result = await this.sendViaDropboxSign(document, sendOptions);
          break;
        case 'internal':
        default:
          result = await this.sendViaInternal(document, sendOptions);
          break;
      }

      // Update document status
      document.status = 'sent';
      document.sentAt = new Date();
      document.expiresAt = new Date(Date.now() + (sendOptions.expiryDays || 30) * 24 * 60 * 60 * 1000);
      
      document.addAuditEntry('sent', {
        name: document.createdBy.name,
        email: document.createdBy.email
      }, `Document sent via ${document.provider}`);
      
      await document.save();
      return { document, result };
    } catch (error) {
      throw new Error(`Failed to send document: ${error.message}`);
    }
  }

  // DocuSign Integration
  async sendViaDocuSign(document, options) {
    if (!docusign) {
      throw new Error('DocuSign SDK not available. Please install docusign-esign package.');
    }
    if (!this.docusignClient) {
      throw new Error('DocuSign client not initialized. Please check your configuration.');
    }

    try {
      // Create envelope definition
      const envelope = {
        emailSubject: document.title,
        documents: [{
          documentBase64: await this.generatePDFBase64(document),
          name: `${document.title}.pdf`,
          fileExtension: 'pdf',
          documentId: '1'
        }],
        recipients: {
          signers: document.recipients.map((recipient, index) => ({
            email: recipient.email,
            name: recipient.name,
            recipientId: (index + 1).toString(),
            tabs: {
              signHereTabs: [{
                documentId: '1',
                pageNumber: '1',
                xPosition: '100',
                yPosition: '100'
              }]
            }
          }))
        },
        status: 'sent'
      };

      const envelopesApi = new docusign.EnvelopesApi(this.docusignClient);
      const result = await envelopesApi.createEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, {
        envelopeDefinition: envelope
      });

      document.providerEnvelopeId = result.envelopeId;
      return result;
    } catch (error) {
      throw new Error(`DocuSign error: ${error.message}`);
    }
  }

  // Dropbox Sign Integration
  async sendViaDropboxSign(document, options) {
    if (!SignatureRequestApi) {
      throw new Error('Dropbox Sign SDK not available. Please install @dropbox/sign package.');
    }
    if (!this.dropboxSignClient) {
      throw new Error('Dropbox Sign client not initialized. Please check your configuration.');
    }

    try {
      const signatureRequest = {
        title: document.title,
        subject: document.title,
        message: document.description || 'Please sign this document',
        signers: document.recipients.map(recipient => ({
          email_address: recipient.email,
          name: recipient.name,
          order: recipient.order || 0
        })),
        files: [await this.generatePDFBuffer(document)],
        test_mode: process.env.NODE_ENV !== 'production'
      };

      const result = await this.dropboxSignClient.signatureRequestSend(signatureRequest);
      document.providerEnvelopeId = result.signature_request.signature_request_id;
      return result;
    } catch (error) {
      throw new Error(`Dropbox Sign error: ${error.message}`);
    }
  }

  // Internal E-Signature System
  async sendViaInternal(document, options) {
    try {
      // Generate signing URLs for each recipient
      const signingUrls = document.recipients.map(recipient => {
        const token = uuidv4();
        return {
          email: recipient.email,
          name: recipient.name,
          signingUrl: `${process.env.FRONTEND_URL}/sign/${document._id}?token=${token}`,
          token
        };
      });

      // Store tokens in document for validation
      document.customFields = document.customFields || [];
      signingUrls.forEach(({ email, token }) => {
        document.customFields.push({
          name: `signing_token_${email}`,
          value: token
        });
      });

      // Send emails to recipients
      await this.sendSigningEmails(document, signingUrls);

      return { signingUrls };
    } catch (error) {
      throw new Error(`Internal signing error: ${error.message}`);
    }
  }

  // Signature Processing
  async processSignature(documentId, signatureData, recipientInfo) {
    try {
      const document = await ESignatureDocument.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (!document.canSign(recipientInfo.email)) {
        throw new Error('Document cannot be signed by this user');
      }

      // Add signature to document
      document.signatures.push({
        recipientEmail: recipientInfo.email,
        recipientName: recipientInfo.name,
        signedAt: new Date(),
        signatureData: signatureData.data,
        ipAddress: recipientInfo.ipAddress,
        userAgent: recipientInfo.userAgent,
        method: signatureData.method
      });

      document.addAuditEntry('signed', {
        name: recipientInfo.name,
        email: recipientInfo.email,
        ipAddress: recipientInfo.ipAddress,
        userAgent: recipientInfo.userAgent
      }, 'Document signed');

      // Check if all recipients have signed
      const allSigned = document.recipients.every(recipient => 
        document.signatures.some(sig => sig.recipientEmail === recipient.email)
      );

      if (allSigned) {
        document.status = 'completed';
        document.completedAt = new Date();
        
        // Generate final signed document
        document.finalDocumentUrl = await this.generateSignedDocument(document);
        
        document.addAuditEntry('completed', {
          name: 'System',
          email: 'system@company.com'
        }, 'All signatures completed');
      }

      await document.save();
      return document;
    } catch (error) {
      throw new Error(`Failed to process signature: ${error.message}`);
    }
  }

  // Document Generation
  async generatePDFBase64(document) {
    const buffer = await this.generatePDFBuffer(document);
    return buffer.toString('base64');
  }

  async generatePDFBuffer(document) {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Letter size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;

      // Add document content
      let yPosition = 750;
      const lines = document.templateId ? 
        document.templateId.templateContent.split('\n') : 
        [document.title, document.description || ''];

      lines.forEach(line => {
        if (yPosition > 50) {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0)
          });
          yPosition -= 20;
        }
      });

      // Add signature placeholder
      page.drawText('Signature: ________________________', {
        x: 50,
        y: 100,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0)
      });

      page.drawText('Date: ________________________', {
        x: 350,
        y: 100,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0)
      });

      return await pdfDoc.save();
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  async generateSignedDocument(document) {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Add document content and signatures
      let yPosition = 750;
      
      // Title
      page.drawText(document.title, {
        x: 50,
        y: yPosition,
        size: 16,
        font: font,
        color: rgb(0, 0, 0)
      });
      yPosition -= 40;

      // Content
      const content = document.templateId ? 
        document.templateId.templateContent : 
        document.description || '';
      
      const lines = content.split('\n');
      lines.forEach(line => {
        if (yPosition > 200) {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0)
          });
          yPosition -= 20;
        }
      });

      // Add signatures
      yPosition = 150;
      document.signatures.forEach((signature, index) => {
        page.drawText(`Signed by: ${signature.recipientName}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        });
        
        page.drawText(`Date: ${signature.signedAt.toLocaleDateString()}`, {
          x: 300,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        });
        
        page.drawText(`IP: ${signature.ipAddress}`, {
          x: 450,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0)
        });
        
        yPosition -= 30;
      });

      const pdfBytes = await pdfDoc.save();
      
      // Save to file system (in production, use cloud storage)
      const filename = `signed_${document._id}_${Date.now()}.pdf`;
      const filepath = path.join(process.cwd(), 'uploads', 'signed_documents', filename);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, pdfBytes);
      
      return `/uploads/signed_documents/${filename}`;
    } catch (error) {
      throw new Error(`Failed to generate signed document: ${error.message}`);
    }
  }

  // Email Notifications
  async sendSigningEmails(document, signingUrls) {
    try {
      const emailService = require('./emailService');
      
      for (const { email, name, signingUrl } of signingUrls) {
        await emailService.sendEmail({
          to: email,
          subject: `Please sign: ${document.title}`,
          html: `
            <h2>Document Signature Request</h2>
            <p>Dear ${name},</p>
            <p>You have been requested to sign the following document:</p>
            <h3>${document.title}</h3>
            <p>${document.description || ''}</p>
            <p><a href="${signingUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign Document</a></p>
            <p>This link will expire in 30 days.</p>
            <p>Best regards,<br>HR Team</p>
          `
        });
      }
    } catch (error) {
      console.error('Error sending signing emails:', error);
      throw new Error(`Failed to send signing emails: ${error.message}`);
    }
  }

  // Status and Tracking
  async getDocumentStatus(documentId) {
    try {
      const document = await ESignatureDocument.findById(documentId)
        .populate('templateId')
        .populate('createdBy', 'name email');
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Sync status with provider if needed
      if (document.provider !== 'internal' && document.providerEnvelopeId) {
        await this.syncStatusWithProvider(document);
      }

      return document;
    } catch (error) {
      throw new Error(`Failed to get document status: ${error.message}`);
    }
  }

  async syncStatusWithProvider(document) {
    try {
      switch (document.provider) {
        case 'docusign':
          await this.syncDocuSignStatus(document);
          break;
        case 'dropbox_sign':
          await this.syncDropboxSignStatus(document);
          break;
      }
    } catch (error) {
      console.error('Error syncing status with provider:', error);
    }
  }

  async syncDocuSignStatus(document) {
    if (!this.docusignClient || !document.providerEnvelopeId) return;

    try {
      const envelopesApi = new docusign.EnvelopesApi(this.docusignClient);
      const envelope = await envelopesApi.getEnvelope(
        process.env.DOCUSIGN_ACCOUNT_ID, 
        document.providerEnvelopeId
      );

      // Update document status based on envelope status
      if (envelope.status === 'completed' && document.status !== 'completed') {
        document.status = 'completed';
        document.completedAt = new Date();
        await document.save();
      }
    } catch (error) {
      console.error('DocuSign sync error:', error);
    }
  }

  async syncDropboxSignStatus(document) {
    if (!this.dropboxSignClient || !document.providerEnvelopeId) return;

    try {
      const result = await this.dropboxSignClient.signatureRequestGet(document.providerEnvelopeId);
      
      // Update document status based on signature request status
      if (result.signature_request.is_complete && document.status !== 'completed') {
        document.status = 'completed';
        document.completedAt = new Date();
        await document.save();
      }
    } catch (error) {
      console.error('Dropbox Sign sync error:', error);
    }
  }

  // Configuration Management
  async getConfiguration(organizationId) {
    try {
      let config = await ESignatureConfig.findOne({ organizationId });
      
      if (!config) {
        config = new ESignatureConfig({
          organizationId,
          providers: {
            internal: { enabled: true }
          }
        });
        await config.save();
      }
      
      return config;
    } catch (error) {
      throw new Error(`Failed to get configuration: ${error.message}`);
    }
  }

  async updateConfiguration(organizationId, configData) {
    try {
      const config = await ESignatureConfig.findOneAndUpdate(
        { organizationId },
        { ...configData, updatedAt: Date.now() },
        { new: true, upsert: true }
      );
      
      return config;
    } catch (error) {
      throw new Error(`Failed to update configuration: ${error.message}`);
    }
  }

  // Analytics and Reporting
  async getAnalytics(filters = {}) {
    try {
      const pipeline = [
        { $match: filters },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgCompletionTime: {
              $avg: {
                $cond: [
                  { $and: ['$sentAt', '$completedAt'] },
                  { $subtract: ['$completedAt', '$sentAt'] },
                  null
                ]
              }
            }
          }
        }
      ];

      const statusCounts = await ESignatureDocument.aggregate(pipeline);
      
      const totalDocuments = await ESignatureDocument.countDocuments(filters);
      const completedDocuments = await ESignatureDocument.countDocuments({
        ...filters,
        status: 'completed'
      });

      return {
        totalDocuments,
        completedDocuments,
        completionRate: totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0,
        statusBreakdown: statusCounts
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }
}

module.exports = new ESignatureService();
