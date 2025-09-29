import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Avatar
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
  More as MoreIcon
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

  if (loading && assets.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading assets...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Asset Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAssetDialog(true)}
        >
          Add Asset
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {assetStats.byStatus?.map((stat) => (
          <Grid item xs={12} sm={6} md={2.4} key={stat._id}>
            <Card sx={{ border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}
                </Typography>
                <Typography variant="h6" fontWeight="500">
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

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchAssets()}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Assets Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getCategoryIcon(asset.category)}
                    <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
                      {asset.assetId}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {asset.name}
                  </Typography>
                  {asset.brand && asset.model && (
                    <Typography variant="caption" color="textSecondary">
                      {asset.brand} {asset.model}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {categories.find(cat => cat.value === asset.category)?.label || asset.category}
                </TableCell>
                <TableCell>
                  {getStatusChip(asset.status)}
                </TableCell>
                <TableCell>
                  {getConditionChip(asset.condition)}
                </TableCell>
                <TableCell>
                  {asset.currentAssignment?.employee ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                        {asset.currentAssignment.employee.personalInfo.firstName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {asset.currentAssignment.employee.personalInfo.firstName}{' '}
                          {asset.currentAssignment.employee.personalInfo.lastName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {asset.currentAssignment.employee.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {asset.purchaseDate ? moment(asset.purchaseDate).format('MMM DD, YYYY') : '-'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit Asset">
                      <IconButton size="small" onClick={() => openEditDialog(asset)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {asset.status === 'available' ? (
                      <Tooltip title="Assign Asset">
                        <IconButton size="small" onClick={() => openAssignDialog(asset)}>
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    ) : asset.status === 'assigned' ? (
                      <Tooltip title="Return Asset">
                        <IconButton size="small" onClick={() => openReturnDialog(asset)}>
                          <ReturnIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    
                    <Tooltip title="Add Maintenance">
                      <IconButton size="small" onClick={() => openMaintenanceDialog(asset)}>
                        <MaintenanceIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Asset">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteAsset(asset._id)}
                        disabled={asset.status === 'assigned'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Asset Dialog */}
      <Dialog open={assetDialog} onClose={() => setAssetDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
        <DialogActions>
          <Button onClick={() => setAssetDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAsset} variant="contained">
            {editingAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Asset Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Asset</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignAsset} 
            variant="contained"
            disabled={!assignForm.employeeId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Asset Dialog */}
      <Dialog open={returnDialog} onClose={() => setReturnDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Return Asset</DialogTitle>
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
    </Box>
  );
};

export default AssetManagement;
