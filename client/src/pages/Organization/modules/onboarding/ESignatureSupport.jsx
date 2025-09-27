import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import {
  Assignment as DocumentIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Cancel as DeclinedIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Description as TemplateIcon,
  Draw as SignatureIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`esignature-tabpanel-${index}`}
      aria-labelledby={`esignature-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ESignatureSupport = ({ onboarding, onUpdate, onComplete }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [config, setConfig] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // Dialog states
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Form states
  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    templateId: '',
    recipients: [{ email: '', name: '', role: 'signer' }],
    provider: 'internal',
    expiryDays: 30
  });
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'employment_contract',
    templateContent: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDocuments(),
        fetchTemplates(),
        fetchConfig(),
        fetchAnalytics()
      ]);
    } catch (error) {
      console.error('Error fetching e-signature data:', error);
      toast.error('Failed to load e-signature data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/esignature/documents');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/esignature/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/esignature/config');
      setConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/esignature/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateDocument = async () => {
    try {
      setLoading(true);
      
      // Add onboarding context if available
      const documentData = {
        ...documentForm,
        recipients: documentForm.recipients.map(recipient => ({
          ...recipient,
          onboardingId: onboarding?._id,
          employeeId: onboarding?.employeeId
        }))
      };
      
      const response = await axios.post('/esignature/documents', documentData);
      
      toast.success('Document created successfully');
      setCreateDocumentOpen(false);
      setDocumentForm({
        title: '',
        description: '',
        templateId: '',
        recipients: [{ email: '', name: '', role: 'signer' }],
        provider: 'internal',
        expiryDays: 30
      });
      
      await fetchDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDocument = async (documentId) => {
    try {
      setLoading(true);
      await axios.post(`/esignature/documents/${documentId}/send`);
      toast.success('Document sent for signing');
      await fetchDocuments();
    } catch (error) {
      console.error('Error sending document:', error);
      toast.error('Failed to send document');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      await axios.post('/esignature/templates', templateForm);
      toast.success('Template created successfully');
      setTemplateDialogOpen(false);
      setTemplateForm({
        name: '',
        description: '',
        category: 'employment_contract',
        templateContent: ''
      });
      await fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    setDocumentForm(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: '', role: 'signer' }]
    }));
  };

  const removeRecipient = (index) => {
    setDocumentForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index, field, value) => {
    setDocumentForm(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, [field]: value } : recipient
      )
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'declined':
        return <DeclinedIcon color="error" />;
      case 'sent':
      case 'in_progress':
        return <PendingIcon color="warning" />;
      default:
        return <DocumentIcon color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'declined':
        return 'error';
      case 'sent':
      case 'in_progress':
        return 'warning';
      case 'draft':
        return 'info';
      default:
        return 'default';
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'docusign':
        return <BusinessIcon />;
      case 'dropbox_sign':
        return <UploadIcon />;
      case 'internal':
      default:
        return <SecurityIcon />;
    }
  };

  if (!onboarding) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          Onboarding data not available. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
          }}>
            ✍️
          </Box>
          E-Signature Support
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Digital document signing with DocuSign and HelloSign integration for {onboarding.employeeName}
        </Typography>
        
        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">{documents.length}</Typography>
                <Typography variant="body2">Total Documents</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">
                  {documents.filter(d => d.status === 'completed').length}
                </Typography>
                <Typography variant="body2">Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">
                  {documents.filter(d => d.status === 'sent' || d.status === 'in_progress').length}
                </Typography>
                <Typography variant="body2">Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">{templates.length}</Typography>
                <Typography variant="body2">Templates</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 72,
              fontWeight: 600
            }
          }}
        >
          <Tab 
            icon={<DocumentIcon />} 
            label="Documents" 
            sx={{ gap: 1 }}
          />
          <Tab 
            icon={<TemplateIcon />} 
            label="Templates" 
            sx={{ gap: 1 }}
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Analytics" 
            sx={{ gap: 1 }}
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Settings" 
            sx={{ gap: 1 }}
          />
        </Tabs>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">E-Signature Documents</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDocumentOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Create Document
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {document.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {document.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(document.status)}
                        label={document.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(document.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {document.recipients.slice(0, 2).map((recipient, index) => (
                          <Avatar key={index} sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                            {recipient.name.charAt(0).toUpperCase()}
                          </Avatar>
                        ))}
                        {document.recipients.length > 2 && (
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                            +{document.recipients.length - 2}
                          </Avatar>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getProviderIcon(document.provider)}
                        label={document.provider.replace('_', ' ')}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {document.status === 'draft' && (
                          <Tooltip title="Send for Signing">
                            <IconButton
                              size="small"
                              onClick={() => handleSendDocument(document._id)}
                              color="primary"
                            >
                              <SendIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedDocument(document)}
                            color="info"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {document.status === 'completed' && (
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => window.open(`/api/esignature/documents/${document._id}/download`)}
                              color="success"
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No documents found. Create your first e-signature document.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Document Templates</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45b7b8 0%, #3d8b7a 100%)',
                }
              }}
            >
              Create Template
            </Button>
          </Box>

          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template._id}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title={template.name}
                    subheader={template.category.replace('_', ' ').toUpperCase()}
                    action={
                      <Chip
                        label={template.isActive ? 'Active' : 'Inactive'}
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {templates.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No templates found. Create your first document template to streamline the signing process.
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>E-Signature Analytics</Typography>
          
          {analytics ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Completion Rate" />
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={analytics.completionRate}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="h6" color="text.secondary">
                        {Math.round(analytics.completionRate)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {analytics.completedDocuments} of {analytics.totalDocuments} documents completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Status Breakdown" />
                  <CardContent>
                    {analytics.statusBreakdown.map((status) => (
                      <Box key={status._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {status._id.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {status.count}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">Loading analytics data...</Alert>
          )}
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>E-Signature Configuration</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Internal Signing" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use built-in signature capabilities
                  </Typography>
                  <Chip
                    label={config?.providers?.internal?.enabled ? 'Enabled' : 'Disabled'}
                    color={config?.providers?.internal?.enabled ? 'success' : 'default'}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="DocuSign" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Professional e-signature solution
                  </Typography>
                  <Chip
                    label={config?.providers?.docusign?.enabled ? 'Enabled' : 'Disabled'}
                    color={config?.providers?.docusign?.enabled ? 'success' : 'default'}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Dropbox Sign" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Simple and secure e-signatures
                  </Typography>
                  <Chip
                    label={config?.providers?.dropboxSign?.enabled ? 'Enabled' : 'Disabled'}
                    color={config?.providers?.dropboxSign?.enabled ? 'success' : 'default'}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setConfigDialogOpen(true)}
            >
              Configure Providers
            </Button>
          </Box>
        </TabPanel>
      </Paper>

      {/* Create Document Dialog */}
      <Dialog open={createDocumentOpen} onClose={() => setCreateDocumentOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create E-Signature Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Title"
                value={documentForm.title}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={documentForm.description}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={documentForm.templateId}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, templateId: e.target.value }))}
                >
                  <MenuItem value="">None</MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template._id} value={template._id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={documentForm.provider}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, provider: e.target.value }))}
                >
                  <MenuItem value="internal">Internal</MenuItem>
                  <MenuItem value="docusign">DocuSign</MenuItem>
                  <MenuItem value="dropbox_sign">Dropbox Sign</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Recipients */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Recipients</Typography>
              {documentForm.recipients.map((recipient, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={recipient.name}
                      onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={recipient.email}
                      onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={recipient.role}
                        onChange={(e) => updateRecipient(index, 'role', e.target.value)}
                      >
                        <MenuItem value="signer">Signer</MenuItem>
                        <MenuItem value="cc">CC</MenuItem>
                        <MenuItem value="approver">Approver</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => removeRecipient(index)}
                      disabled={documentForm.recipients.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addRecipient}
                variant="outlined"
                size="small"
              >
                Add Recipient
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDocumentOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateDocument}
            variant="contained"
            disabled={!documentForm.title || documentForm.recipients.some(r => !r.email || !r.name)}
          >
            Create Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Document Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="offer_letter">Offer Letter</MenuItem>
                  <MenuItem value="employment_contract">Employment Contract</MenuItem>
                  <MenuItem value="nda">NDA</MenuItem>
                  <MenuItem value="policy_acknowledgment">Policy Acknowledgment</MenuItem>
                  <MenuItem value="handbook_acknowledgment">Handbook Acknowledgment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Template Content"
                value={templateForm.templateContent}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, templateContent: e.target.value }))}
                helperText="Enter the document content. Use {{employee_name}}, {{position}}, etc. for dynamic fields."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTemplate}
            variant="contained"
            disabled={!templateForm.name || !templateForm.templateContent}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => fetchData()}
          disabled={loading}
        >
          Refresh Data
        </Button>
        <Button
          variant="contained"
          onClick={onComplete}
          disabled={loading}
          startIcon={<CompletedIcon />}
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
            }
          }}
        >
          Complete E-Signature Setup
        </Button>
      </Box>
    </Box>
  );
};

export default ESignatureSupport;