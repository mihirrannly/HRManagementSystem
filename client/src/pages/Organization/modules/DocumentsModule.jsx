import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Paper,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  TableChart as TableChartIcon,
  TextSnippet as TextSnippetIcon,
  UploadFile as UploadFileIcon,
  DriveFolderUpload as DriveFolderUploadIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const DocumentsModule = () => {
  const [selectedFolder, setSelectedFolder] = useState('policies');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    file: null,
    fileName: '',
    fileType: '',
    targetFolder: 'policies',
    description: '',
    tags: '',
    shared: false
  });
  const [bulkFiles, setBulkFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Supported file formats
  const supportedFormats = [
    { value: 'pdf', label: 'PDF Documents', accept: '.pdf', icon: <PictureAsPdfIcon /> },
    { value: 'doc', label: 'Word Documents', accept: '.doc,.docx', icon: <TextSnippetIcon /> },
    { value: 'excel', label: 'Excel Spreadsheets', accept: '.xls,.xlsx', icon: <TableChartIcon /> },
    { value: 'image', label: 'Images', accept: '.jpg,.jpeg,.png,.gif', icon: <ImageIcon /> },
    { value: 'text', label: 'Text Files', accept: '.txt', icon: <DescriptionIcon /> },
    { value: 'all', label: 'All Formats', accept: '*/*', icon: <UploadFileIcon /> }
  ];

  const folders = [
    { id: 'policies', name: 'Company Policies', count: 12, icon: <FolderIcon /> },
    { id: 'contracts', name: 'Employment Contracts', count: 45, icon: <FolderIcon /> },
    { id: 'forms', name: 'HR Forms', count: 23, icon: <FolderIcon /> },
    { id: 'templates', name: 'Templates', count: 18, icon: <FolderIcon /> },
    { id: 'compliance', name: 'Compliance Documents', count: 8, icon: <FolderIcon /> },
  ];

  const documents = {
    policies: [
      { id: 1, name: 'Employee Handbook 2024.pdf', type: 'pdf', size: '2.4 MB', modified: '2024-11-15', shared: true },
      { id: 2, name: 'Code of Conduct.pdf', type: 'pdf', size: '1.8 MB', modified: '2024-11-10', shared: true },
      { id: 3, name: 'Remote Work Policy.docx', type: 'doc', size: '856 KB', modified: '2024-11-08', shared: false },
    ],
    contracts: [
      { id: 4, name: 'Employment Contract Template.pdf', type: 'pdf', size: '1.2 MB', modified: '2024-11-20', shared: false },
      { id: 5, name: 'NDA Template.pdf', type: 'pdf', size: '645 KB', modified: '2024-11-18', shared: true },
    ],
    forms: [
      { id: 6, name: 'Leave Application Form.pdf', type: 'pdf', size: '234 KB', modified: '2024-11-12', shared: true },
      { id: 7, name: 'Expense Claim Form.xlsx', type: 'excel', size: '187 KB', modified: '2024-11-09', shared: true },
    ]
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: <PictureAsPdfIcon color="error" />,
      doc: <TextSnippetIcon color="primary" />,
      excel: <TableChartIcon color="success" />,
      image: <ImageIcon color="warning" />
    };
    return icons[type] || <DescriptionIcon />;
  };

  // Handle file selection for single upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      let detectedType = 'other';
      
      if (['pdf'].includes(fileExtension)) detectedType = 'pdf';
      else if (['doc', 'docx'].includes(fileExtension)) detectedType = 'doc';
      else if (['xls', 'xlsx'].includes(fileExtension)) detectedType = 'excel';
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) detectedType = 'image';
      else if (['txt'].includes(fileExtension)) detectedType = 'text';

      setUploadFormData(prev => ({
        ...prev,
        file,
        fileName: file.name,
        fileType: detectedType
      }));
    }
  };

  // Handle bulk file selection
  const handleBulkFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setBulkFiles(files);
  };

  // Handle single document upload
  const handleSingleUpload = async () => {
    if (!uploadFormData.file) return;

    setUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically upload to your backend
      console.log('Uploading file:', uploadFormData);
      
      // Reset form and close dialog
      setUploadFormData({
        file: null,
        fileName: '',
        fileType: '',
        targetFolder: 'policies',
        description: '',
        tags: '',
        shared: false
      });
      setOpenUploadDialog(false);
      
      // Show success message (you can add toast notification here)
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) return;

    setUploading(true);
    try {
      // Simulate bulk upload process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Here you would typically upload all files to your backend
      console.log('Bulk uploading files:', bulkFiles);
      
      // Reset and close dialog
      setBulkFiles([]);
      setOpenBulkUploadDialog(false);
      
      // Show success message
      alert(`${bulkFiles.length} documents uploaded successfully!`);
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
            Document Management
          </Typography>
          <Stack direction="row" spacing={0.75}>
            <Button 
              variant="outlined" 
              startIcon={<FolderIcon sx={{ fontSize: 16 }} />}
              size="small"
              sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5 }}
            >
              New Folder
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
              onClick={() => setOpenUploadDialog(true)}
              size="small"
              sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5 }}
            >
              Upload Document
            </Button>
            <Button 
              variant="contained" 
              startIcon={<DriveFolderUploadIcon sx={{ fontSize: 16 }} />}
              onClick={() => setOpenBulkUploadDialog(true)}
              size="small"
              sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5 }}
            >
              Bulk Upload
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 1
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <FolderIcon sx={{ fontSize: 24, mb: 0.5, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ fontSize: '1.1rem', mb: 0.25 }}>
                  {folders.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Total Folders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 1
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <DescriptionIcon sx={{ fontSize: 24, mb: 0.5, color: 'info.main' }} />
                <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ fontSize: '1.1rem', mb: 0.25 }}>
                  {Object.values(documents).flat().length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Total Documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 1
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <ShareIcon sx={{ fontSize: 24, mb: 0.5, color: 'success.main' }} />
                <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ fontSize: '1.1rem', mb: 0.25 }}>
                  {Object.values(documents).flat().filter(doc => doc.shared).length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Shared Documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 1
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <CloudUploadIcon sx={{ fontSize: 24, mb: 0.5, color: 'warning.main' }} />
                <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ fontSize: '1.1rem', mb: 0.25 }}>
                  15.7 MB
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Storage Used
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={1.5}>
          {/* Folders */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: 500, overflow: 'auto' }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
                  Document Folders
                </Typography>
              </Box>
              
              <List sx={{ py: 0 }}>
                {folders.map((folder) => (
                  <ListItem key={folder.id} disablePadding>
                    <ListItemButton
                      onClick={() => setSelectedFolder(folder.id)}
                      selected={selectedFolder === folder.id}
                      sx={{ py: 1, px: 1.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28 }}>
                          {React.cloneElement(folder.icon, { sx: { fontSize: 16 } })}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                            {folder.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {folder.count} documents
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Documents */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: 500, overflow: 'auto' }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '0.9rem' }}>
                  {folders.find(f => f.id === selectedFolder)?.name} Documents
                </Typography>
              </Box>
              
              <List sx={{ py: 0 }}>
                {(documents[selectedFolder] || []).map((document) => (
                  <ListItem
                    key={document.id}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <DownloadIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <ShareIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" color="error" sx={{ p: 0.5 }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    }
                    sx={{ py: 1, px: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {React.cloneElement(getFileIcon(document.type), { sx: { fontSize: 20 } })}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem', mb: 0.25 }}>
                          {document.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {document.size} • Modified {document.modified}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {document.shared && (
                              <Chip 
                                size="small" 
                                label="Shared" 
                                color="success" 
                                sx={{ 
                                  height: 16, 
                                  fontSize: '0.6rem',
                                  '& .MuiChip-label': { px: 0.5 }
                                }} 
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {(!documents[selectedFolder] || documents[selectedFolder].length === 0) && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2" sx={{ fontSize: '0.8rem' }}>
                    No documents in this folder
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Single Document Upload Dialog */}
        <Dialog 
          open={openUploadDialog} 
          onClose={() => setOpenUploadDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UploadFileIcon sx={{ fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Upload Document
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Select a file format and upload your document. Supported formats include PDF, Word, Excel, Images, and Text files.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>File Format</InputLabel>
                  <Select
                    value={uploadFormData.fileType}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, fileType: e.target.value }))}
                    label="File Format"
                  >
                    {supportedFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {format.icon}
                          {format.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Folder</InputLabel>
                  <Select
                    value={uploadFormData.targetFolder}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, targetFolder: e.target.value }))}
                    label="Target Folder"
                  >
                    {folders.map((folder) => (
                      <MenuItem key={folder.id} value={folder.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {folder.icon}
                          {folder.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <input
                  type="file"
                  accept={supportedFormats.find(f => f.value === uploadFormData.fileType)?.accept || '*/*'}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-upload-input"
                />
                <label htmlFor="file-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ py: 2 }}
                  >
                    {uploadFormData.fileName || 'Choose File'}
                  </Button>
                </label>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={3}
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (Optional)"
                  placeholder="Enter tags separated by commas"
                  value={uploadFormData.tags}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSingleUpload}
              disabled={!uploadFormData.file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog 
          open={openBulkUploadDialog} 
          onClose={() => setOpenBulkUploadDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DriveFolderUploadIcon sx={{ fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Bulk Document Upload
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Select multiple files to upload at once. All files will be uploaded to the selected folder.
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Target Folder</InputLabel>
                  <Select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    label="Target Folder"
                  >
                    {folders.map((folder) => (
                      <MenuItem key={folder.id} value={folder.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {folder.icon}
                          {folder.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={handleBulkFileSelect}
                  style={{ display: 'none' }}
                  id="bulk-file-upload-input"
                />
                <label htmlFor="bulk-file-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ py: 2 }}
                  >
                    {bulkFiles.length > 0 ? `${bulkFiles.length} files selected` : 'Choose Multiple Files'}
                  </Button>
                </label>
              </Grid>

              {bulkFiles.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Selected Files:
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                    {bulkFiles.map((file, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
                        <DescriptionIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{file.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBulkUploadDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleBulkUpload}
              disabled={bulkFiles.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : `Upload ${bulkFiles.length} Files`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default DocumentsModule;
