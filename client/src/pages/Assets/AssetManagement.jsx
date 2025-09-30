import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
  Badge,
  InputAdornment,
  Autocomplete,
  Avatar,
  Fade,
  Zoom,
  Slide,
  Collapse,
  LinearProgress,
  Divider,
  Stack,
  Container,
  Breadcrumbs,
  Link,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Unarchive as ReturnIcon,
  Build as MaintenanceIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Computer as ComputerIcon,
  Phone as PhoneIcon,
  Print as PrintIcon,
  Camera as CameraIcon,
  Chair as ChairIcon,
  More as MoreIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  CloudUpload as ImportIcon,
  QrCode as QrCodeIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Sort as SortIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import moment from 'moment';

const AssetManagement = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Assets state
  const [assets, setAssets] = useState([]);
  const [assetStats, setAssetStats] = useState({});
  const [pagination, setPagination] = useState({});

  // Dialog states
  const [assetDialog, setAssetDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states
  const [assetForm, setAssetForm] = useState({
    assetId: '',
    name: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    vendor: '',
    warrantyExpiry: '',
    condition: 'good',
    location: '',
    description: '',
    specifications: {
      processor: '',
      ram: '',
      storage: '',
      graphics: '',
      os: '',
      other: ''
    }
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: null,
    notes: ''
  });

  const [returnForm, setReturnForm] = useState({
    condition: 'good',
    returnNotes: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'repair',
    description: '',
    cost: '',
    vendor: '',
    date: moment().format('YYYY-MM-DD')
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employees, setEmployees] = useState([]);

  // Enhanced UI states
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState(false);

  const categories = [
    { value: 'laptop', label: 'Laptop', icon: <ComputerIcon /> },
    { value: 'desktop', label: 'Desktop', icon: <ComputerIcon /> },
    { value: 'monitor', label: 'Monitor', icon: <ComputerIcon /> },
    { value: 'keyboard', label: 'Keyboard', icon: <ComputerIcon /> },
    { value: 'mouse', label: 'Mouse', icon: <ComputerIcon /> },
    { value: 'headphones', label: 'Headphones', icon: <ComputerIcon /> },
    { value: 'mobile', label: 'Mobile', icon: <PhoneIcon /> },
    { value: 'tablet', label: 'Tablet', icon: <PhoneIcon /> },
    { value: 'printer', label: 'Printer', icon: <PrintIcon /> },
    { value: 'scanner', label: 'Scanner', icon: <PrintIcon /> },
    { value: 'projector', label: 'Projector', icon: <CameraIcon /> },
    { value: 'camera', label: 'Camera', icon: <CameraIcon /> },
    { value: 'furniture', label: 'Furniture', icon: <ChairIcon /> },
    { value: 'software_license', label: 'Software License', icon: <ComputerIcon /> },
    { value: 'other', label: 'Other', icon: <MoreIcon /> }
  ];

  const statusColors = {
    available: 'success',
    assigned: 'primary',
    maintenance: 'warning',
    retired: 'default',
    lost: 'error'
  };

  const conditionColors = {
    excellent: 'success',
    good: 'primary',
    fair: 'warning',
    poor: 'error',
    damaged: 'error'
  };

  useEffect(() => {
    fetchAssets();
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchAssets = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await axios.get('/assets', { params });
      setAssets(response.data.assets);
      setPagination(response.data.pagination);
      setAssetStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const searchEmployees = async (searchValue) => {
    try {
      const response = await axios.get('/assets/search/employees', {
        params: { search: searchValue }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error searching employees:', error);
    }
  };

  const handleCreateAsset = async () => {
    try {
      const assetData = {
        ...assetForm,
        purchasePrice: assetForm.purchasePrice ? parseFloat(assetForm.purchasePrice) : undefined,
        purchaseDate: assetForm.purchaseDate || undefined,
        warrantyExpiry: assetForm.warrantyExpiry || undefined
      };

      if (editingAsset) {
        await axios.put(`/assets/${editingAsset._id}`, assetData);
        setSuccessMessage('Asset updated successfully');
      } else {
        await axios.post('/assets', assetData);
        setSuccessMessage('Asset created successfully');
      }

      setAssetDialog(false);
      setEditingAsset(null);
      resetAssetForm();
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      setError(error.response?.data?.message || 'Failed to save asset');
    }
  };

  const handleAssignAsset = async () => {
    try {
      await axios.post(`/assets/${selectedAsset._id}/assign`, {
        employeeId: assignForm.employeeId._id,
        notes: assignForm.notes
      });

      setSuccessMessage('Asset assigned successfully');
      setAssignDialog(false);
      setSelectedAsset(null);
      resetAssignForm();
      fetchAssets();
    } catch (error) {
      console.error('Error assigning asset:', error);
      setError(error.response?.data?.message || 'Failed to assign asset');
    }
  };

  const handleReturnAsset = async () => {
    try {
      await axios.post(`/assets/${selectedAsset._id}/return`, returnForm);

      setSuccessMessage('Asset returned successfully');
      setReturnDialog(false);
      setSelectedAsset(null);
      resetReturnForm();
      fetchAssets();
    } catch (error) {
      console.error('Error returning asset:', error);
      setError(error.response?.data?.message || 'Failed to return asset');
    }
  };

  const handleAddMaintenance = async () => {
    try {
      await axios.post(`/assets/${selectedAsset._id}/maintenance`, {
        ...maintenanceForm,
        cost: maintenanceForm.cost ? parseFloat(maintenanceForm.cost) : undefined
      });

      setSuccessMessage('Maintenance record added successfully');
      setMaintenanceDialog(false);
      setSelectedAsset(null);
      resetMaintenanceForm();
      fetchAssets();
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      setError(error.response?.data?.message || 'Failed to add maintenance record');
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axios.delete(`/assets/${assetId}`);
        setSuccessMessage('Asset deleted successfully');
        fetchAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
        setError(error.response?.data?.message || 'Failed to delete asset');
      }
    }
  };

  const resetAssetForm = () => {
    setAssetForm({
      assetId: '',
      name: '',
      category: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchasePrice: '',
      vendor: '',
      warrantyExpiry: '',
      condition: 'good',
      location: '',
      description: '',
      specifications: {
        processor: '',
        ram: '',
        storage: '',
        graphics: '',
        os: '',
        other: ''
      }
    });
  };

  const resetAssignForm = () => {
    setAssignForm({
      employeeId: null,
      notes: ''
    });
  };

  const resetReturnForm = () => {
    setReturnForm({
      condition: 'good',
      returnNotes: ''
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceForm({
      type: 'repair',
      description: '',
      cost: '',
      vendor: '',
      date: moment().format('YYYY-MM-DD')
    });
  };

  const openEditDialog = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      assetId: asset.assetId,
      name: asset.name,
      category: asset.category,
      brand: asset.brand || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      purchaseDate: asset.purchaseDate ? moment(asset.purchaseDate).format('YYYY-MM-DD') : '',
      purchasePrice: asset.purchasePrice || '',
      vendor: asset.vendor || '',
      warrantyExpiry: asset.warrantyExpiry ? moment(asset.warrantyExpiry).format('YYYY-MM-DD') : '',
      condition: asset.condition,
      location: asset.location || '',
      description: asset.description || '',
      specifications: asset.specifications || {
        processor: '',
        ram: '',
        storage: '',
        graphics: '',
        os: '',
        other: ''
      }
    });
    setAssetDialog(true);
  };

  const openAssignDialog = (asset) => {
    setSelectedAsset(asset);
    setAssignDialog(true);
    searchEmployees(''); // Load initial employees
  };

  const openReturnDialog = (asset) => {
    setSelectedAsset(asset);
    setReturnDialog(true);
  };

  const openMaintenanceDialog = (asset) => {
    setSelectedAsset(asset);
    setMaintenanceDialog(true);
  };

  const getCategoryIcon = (category) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : <MoreIcon />;
  };

  const getStatusChip = (status) => (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={statusColors[status]}
      size="small"
    />
  );

  const getConditionChip = (condition) => (
    <Chip
      label={condition.charAt(0).toUpperCase() + condition.slice(1)}
      color={conditionColors[condition]}
      size="small"
      variant="outlined"
    />
  );

  // Enhanced helper functions
  const getAssetIcon = (category) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : <MoreIcon />;
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: <CheckCircleIcon sx={{ color: 'success.main' }} />,
      assigned: <AssignmentIcon sx={{ color: 'primary.main' }} />,
      maintenance: <MaintenanceIcon sx={{ color: 'warning.main' }} />,
      retired: <ScheduleIcon sx={{ color: 'text.disabled' }} />,
      lost: <WarningIcon sx={{ color: 'error.main' }} />
    };
    return icons[status] || <MoreIcon />;
  };

  const getAssetValue = (assets) => {
    return assets.reduce((total, asset) => total + (asset.purchasePrice || 0), 0);
  };

  const sortAssets = (assetsToSort) => {
    return [...assetsToSort].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'purchaseDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredAndSortedAssets = sortAssets(assets);

  if (loading && assets.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading Asset Management System...
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400, mt: 2 }}>
            <LinearProgress />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Professional Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InventoryIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Asset Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                IT Asset Tracking & Management
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAssetDialog(true)}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                px: 2
              }}
            >
              Add Asset
            </Button>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
            >
              <ToggleButton value="table">
                <ListViewIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="grid">
                <GridViewIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>

        {/* Professional Statistics Cards */}
        <Grid container spacing={2}>
          {assetStats.byStatus?.map((stat) => (
            <Grid item xs={12} sm={6} md={2.4} key={stat._id}>
              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 1
                  }
                }}
                onClick={() => setStatusFilter(stat._id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    {getStatusIcon(stat._id)}
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                      {stat._id}
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {stat.count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${(stat.totalValue || 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Professional Search and Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {React.cloneElement(category.icon, { fontSize: 'small' })}
                      <Typography sx={{ ml: 1 }}>{category.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="assetId">Asset ID</MenuItem>
                <MenuItem value="purchaseDate">Purchase Date</MenuItem>
                <MenuItem value="purchasePrice">Price</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={<ExportIcon />}
                sx={{ textTransform: 'none' }}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => fetchAssets()}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <RefreshIcon fontSize="small" />
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Dynamic Content Area */}
      <Fade in={true}>
        <Box>
          {viewMode === 'grid' ? (
            /* Professional Grid View */
            <Grid container spacing={2}>
              {filteredAndSortedAssets.map((asset) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={asset._id}>
                  <Card
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 1
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Box
                          sx={{
                            background: 'primary.main',
                            borderRadius: 1,
                            p: 0.5,
                            color: 'white'
                          }}
                        >
                          {React.cloneElement(getAssetIcon(asset.category), { fontSize: 'small' })}
                        </Box>
                        {getStatusChip(asset.status)}
                      </Stack>
                      
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {asset.name}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {asset.assetId}
                      </Typography>
                      
                      {asset.brand && asset.model && (
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                          {asset.brand} {asset.model}
                        </Typography>
                      )}
                      
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          Condition
                        </Typography>
                        {getConditionChip(asset.condition)}
                      </Stack>
                      
                      {asset.currentAssignment?.employee ? (
                        <Stack direction="row" alignItems="center" mb={1}>
                          <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: '0.7rem' }}>
                            {asset.currentAssignment.employee.personalInfo.firstName[0]}
                          </Avatar>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {asset.currentAssignment.employee.personalInfo.firstName}{' '}
                            {asset.currentAssignment.employee.personalInfo.lastName}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Unassigned
                        </Typography>
                      )}
                      
                      {asset.purchasePrice && (
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                          ${asset.purchasePrice.toLocaleString()}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Stack direction="row" spacing={0.5} sx={{ width: '100%' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(asset)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {asset.status === 'available' ? (
                          <Tooltip title="Assign">
                            <IconButton
                              size="small"
                              onClick={() => openAssignDialog(asset)}
                              color="success"
                            >
                              <AssignmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : asset.status === 'assigned' ? (
                          <Tooltip title="Return">
                            <IconButton
                              size="small"
                              onClick={() => openReturnDialog(asset)}
                              color="warning"
                            >
                              <ReturnIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                        
                        <Tooltip title="Maintenance">
                          <IconButton
                            size="small"
                            onClick={() => openMaintenanceDialog(asset)}
                            color="info"
                          >
                            <MaintenanceIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            /* Professional Table View */
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Asset</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Purchase Info</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedAssets.map((asset) => (
                      <TableRow
                        key={asset._id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'grey.50'
                          }
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                background: 'primary.main',
                                borderRadius: 1,
                                p: 0.5,
                                color: 'white'
                              }}
                            >
                              {React.cloneElement(getAssetIcon(asset.category), { fontSize: 'small' })}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {asset.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {asset.assetId}
                              </Typography>
                              {asset.brand && asset.model && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {asset.brand} {asset.model}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {categories.find(cat => cat.value === asset.category)?.label || asset.category}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusChip(asset.status)}
                        </TableCell>
                        
                        <TableCell>
                          {getConditionChip(asset.condition)}
                        </TableCell>
                        
                        <TableCell>
                          {asset.currentAssignment?.employee ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {asset.currentAssignment.employee.personalInfo.firstName[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {asset.currentAssignment.employee.personalInfo.firstName}{' '}
                                  {asset.currentAssignment.employee.personalInfo.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {asset.currentAssignment.employee.employeeId}
                                </Typography>
                              </Box>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Unassigned
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Stack spacing={0.5}>
                            {asset.purchasePrice && (
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                ${asset.purchasePrice.toLocaleString()}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {asset.purchaseDate ? moment(asset.purchaseDate).format('MMM DD, YYYY') : 'No date'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEditDialog(asset)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {asset.status === 'available' ? (
                              <Tooltip title="Assign">
                                <IconButton
                                  size="small"
                                  onClick={() => openAssignDialog(asset)}
                                  color="success"
                                >
                                  <AssignmentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : asset.status === 'assigned' ? (
                              <Tooltip title="Return">
                                <IconButton
                                  size="small"
                                  onClick={() => openReturnDialog(asset)}
                                  color="warning"
                                >
                                  <ReturnIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            
                            <Tooltip title="Maintenance">
                              <IconButton
                                size="small"
                                onClick={() => openMaintenanceDialog(asset)}
                                color="info"
                              >
                                <MaintenanceIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteAsset(asset._id)}
                                  disabled={asset.status === 'assigned'}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      </Fade>


      {/* Professional Add/Edit Asset Dialog */}
      <Dialog 
        open={assetDialog} 
        onClose={() => setAssetDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InventoryIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Asset ID"
                value={assetForm.assetId}
                onChange={(e) => setAssetForm({ ...assetForm, assetId: e.target.value })}
                disabled={editingAsset}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Asset Name"
                value={assetForm.name}
                onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={assetForm.category}
                  onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {category.icon}
                        <Typography sx={{ ml: 1 }}>{category.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                value={assetForm.brand}
                onChange={(e) => setAssetForm({ ...assetForm, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                value={assetForm.model}
                onChange={(e) => setAssetForm({ ...assetForm, model: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={assetForm.serialNumber}
                onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Date"
                type="date"
                value={assetForm.purchaseDate}
                onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={assetForm.purchasePrice}
                onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor"
                value={assetForm.vendor}
                onChange={(e) => setAssetForm({ ...assetForm, vendor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warranty Expiry"
                type="date"
                value={assetForm.warrantyExpiry}
                onChange={(e) => setAssetForm({ ...assetForm, warrantyExpiry: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={assetForm.condition}
                  onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
                  label="Condition"
                >
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                  <MenuItem value="damaged">Damaged</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={assetForm.location}
                onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={assetForm.description}
                onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
              />
            </Grid>
            
            {/* Specifications for tech assets */}
            {['laptop', 'desktop', 'mobile', 'tablet'].includes(assetForm.category) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Technical Specifications
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Processor"
                    value={assetForm.specifications.processor}
                    onChange={(e) => setAssetForm({
                      ...assetForm,
                      specifications: { ...assetForm.specifications, processor: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="RAM"
                    value={assetForm.specifications.ram}
                    onChange={(e) => setAssetForm({
                      ...assetForm,
                      specifications: { ...assetForm.specifications, ram: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Storage"
                    value={assetForm.specifications.storage}
                    onChange={(e) => setAssetForm({
                      ...assetForm,
                      specifications: { ...assetForm.specifications, storage: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Operating System"
                    value={assetForm.specifications.os}
                    onChange={(e) => setAssetForm({
                      ...assetForm,
                      specifications: { ...assetForm.specifications, os: e.target.value }
                    })}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}>
          <Button 
            onClick={() => setAssetDialog(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateAsset} 
            variant="contained"
            startIcon={editingAsset ? <EditIcon /> : <AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            {editingAsset ? 'Update Asset' : 'Create Asset'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Professional Assign Asset Dialog */}
      <Dialog 
        open={assignDialog} 
        onClose={() => setAssignDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentIcon color="success" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Assign Asset
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Assigning: {selectedAsset?.name} ({selectedAsset?.assetId})
          </Typography>
          
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => `${option.name} (${option.employeeId})`}
            value={assignForm.employeeId}
            onChange={(event, newValue) => {
              setAssignForm({ ...assignForm, employeeId: newValue });
            }}
            onInputChange={(event, newInputValue) => {
              if (newInputValue) {
                searchEmployees(newInputValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Employee"
                fullWidth
                margin="normal"
                required
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.875rem' }}>
                  {option.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.employeeId} • {option.designation}
                  </Typography>
                </Box>
              </Box>
            )}
          />
          
          <TextField
            fullWidth
            label="Assignment Notes"
            multiline
            rows={3}
            value={assignForm.notes}
            onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}>
          <Button 
            onClick={() => setAssignDialog(false)}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignAsset} 
            variant="contained"
            disabled={!assignForm.employeeId}
            startIcon={<AssignmentIcon />}
            color="success"
            sx={{ textTransform: 'none' }}
          >
            Assign Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Return Asset Dialog */}
      <Dialog 
        open={returnDialog} 
        onClose={() => setReturnDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              p: 1,
              backdropFilter: 'blur(10px)'
            }}
          >
            <ReturnIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Return Asset
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Process asset return and update condition
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Returning: {selectedAsset?.name} ({selectedAsset?.assetId})
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Return Condition</InputLabel>
            <Select
              value={returnForm.condition}
              onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
              label="Return Condition"
            >
              <MenuItem value="excellent">Excellent</MenuItem>
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="fair">Fair</MenuItem>
              <MenuItem value="poor">Poor</MenuItem>
              <MenuItem value="damaged">Damaged</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Return Notes"
            multiline
            rows={3}
            value={returnForm.returnNotes}
            onChange={(e) => setReturnForm({ ...returnForm, returnNotes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialog(false)}>Cancel</Button>
          <Button onClick={handleReturnAsset} variant="contained">
            Return Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceDialog} onClose={() => setMaintenanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Maintenance Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Asset: {selectedAsset?.name} ({selectedAsset?.assetId})
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Maintenance Type</InputLabel>
            <Select
              value={maintenanceForm.type}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })}
              label="Maintenance Type"
            >
              <MenuItem value="repair">Repair</MenuItem>
              <MenuItem value="upgrade">Upgrade</MenuItem>
              <MenuItem value="cleaning">Cleaning</MenuItem>
              <MenuItem value="inspection">Inspection</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={maintenanceForm.description}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Cost"
            type="number"
            value={maintenanceForm.cost}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          
          <TextField
            fullWidth
            label="Vendor"
            value={maintenanceForm.vendor}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vendor: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={maintenanceForm.date}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMaintenance} variant="contained">
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssetManagement;
