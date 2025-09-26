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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
  Print as PrintIcon,
  Chair as ChairIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const AssetsModule = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const assetCategories = [
    { id: 'laptops', name: 'Laptops', count: 45, icon: <ComputerIcon />, color: '#1976d2' },
    { id: 'mobiles', name: 'Mobile Devices', count: 38, icon: <SmartphoneIcon />, color: '#388e3c' },
    { id: 'printers', name: 'Printers', count: 12, icon: <PrintIcon />, color: '#f57c00' },
    { id: 'furniture', name: 'Furniture', count: 85, icon: <ChairIcon />, color: '#7b1fa2' },
  ];

  const assets = [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      category: 'laptops',
      serialNumber: 'MBP2024001',
      assignedTo: 'Alice Johnson',
      employeeId: 'EMP001',
      status: 'assigned',
      purchaseDate: '2024-01-15',
      warranty: '2027-01-15',
      value: 250000
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      category: 'mobiles',
      serialNumber: 'IP15P001',
      assignedTo: 'Bob Wilson',
      employeeId: 'EMP002',
      status: 'assigned',
      purchaseDate: '2024-03-10',
      warranty: '2025-03-10',
      value: 120000
    },
    {
      id: 3,
      name: 'HP LaserJet Pro',
      category: 'printers',
      serialNumber: 'HP2024001',
      assignedTo: 'Unassigned',
      employeeId: null,
      status: 'available',
      purchaseDate: '2024-02-20',
      warranty: '2026-02-20',
      value: 35000
    },
    {
      id: 4,
      name: 'Dell Laptop',
      category: 'laptops',
      serialNumber: 'DELL2024002',
      assignedTo: 'Carol Davis',
      employeeId: 'EMP003',
      status: 'maintenance',
      purchaseDate: '2024-01-20',
      warranty: '2027-01-20',
      value: 80000
    }
  ];

  const getStatusChip = (status) => {
    const statusConfig = {
      'assigned': { color: 'success', label: 'Assigned' },
      'available': { color: 'info', label: 'Available' },
      'maintenance': { color: 'warning', label: 'Maintenance' },
      'retired': { color: 'error', label: 'Retired' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getCategoryIcon = (category) => {
    const categoryData = assetCategories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : <DevicesIcon />;
  };

  const renderAssetsTab = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
            <TableCell>Asset</TableCell>
            <TableCell>Serial Number</TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Purchase Date</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {getCategoryIcon(asset.category)}
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium">
                    {asset.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{asset.serialNumber}</TableCell>
              <TableCell>
                {asset.assignedTo}
                {asset.employeeId && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {asset.employeeId}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{getStatusChip(asset.status)}</TableCell>
              <TableCell>{asset.purchaseDate}</TableCell>
              <TableCell>₹{asset.value.toLocaleString()}</TableCell>
              <TableCell>
                <Button size="small" variant="outlined">
                  Manage
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCategoriesTab = () => (
    <Grid container spacing={3}>
      {assetCategories.map((category) => (
        <Grid item xs={12} md={6} key={category.id}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: category.color, mr: 2, width: 48, height: 48 }}>
                  {category.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count} items
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2">
                  Assigned: {assets.filter(a => a.category === category.id && a.status === 'assigned').length}
                </Typography>
                <Typography variant="body2">
                  Available: {assets.filter(a => a.category === category.id && a.status === 'available').length}
                </Typography>
              </Box>
              
              <Button size="small" variant="outlined" sx={{ mt: 2 }}>
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Asset Management
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AssignmentIcon />}>
              Asset Report
            </Button>
            <Button variant="contained" startIcon={<AddIcon />}>
              Add Asset
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #bf360c 0%, #d84315 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <DevicesIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {assets.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Assets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {assets.filter(a => a.status === 'assigned').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Assigned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <DevicesIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {assets.filter(a => a.status === 'available').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {assets.filter(a => a.status === 'maintenance').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Maintenance
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Assets" icon={<DevicesIcon />} iconPosition="start" />
            <Tab label="Categories" icon={<AssignmentIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && renderAssetsTab()}
        {tabValue === 1 && renderCategoriesTab()}
      </Box>
    </Fade>
  );
};

export default AssetsModule;
