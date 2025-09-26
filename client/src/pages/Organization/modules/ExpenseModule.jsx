import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  Paper,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  LocalAirport as LocalAirportIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Hotel as HotelIcon,
  DirectionsCar as DirectionsCarIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import moment from 'moment';

const ExpenseModule = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [travels, setTravels] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Mock data for expenses and travel
    const mockExpenses = [
      {
        id: 1,
        employeeName: 'Alice Johnson',
        employeeId: 'EMP001',
        amount: 2500,
        category: 'meals',
        description: 'Client dinner meeting',
        date: '2024-11-20',
        status: 'pending',
        receipts: 2
      },
      {
        id: 2,
        employeeName: 'Bob Wilson',
        employeeId: 'EMP002',
        amount: 15000,
        category: 'travel',
        description: 'Conference travel expenses',
        date: '2024-11-18',
        status: 'approved',
        receipts: 5
      },
      {
        id: 3,
        employeeName: 'Carol Davis',
        employeeId: 'EMP003',
        amount: 800,
        category: 'office',
        description: 'Office supplies',
        date: '2024-11-15',
        status: 'rejected',
        receipts: 1
      }
    ];

    const mockTravels = [
      {
        id: 1,
        employeeName: 'David Brown',
        employeeId: 'EMP004',
        destination: 'Mumbai',
        purpose: 'Client meeting',
        startDate: '2024-12-01',
        endDate: '2024-12-03',
        status: 'approved',
        estimatedCost: 25000,
        actualCost: 23500
      },
      {
        id: 2,
        employeeName: 'Emma Wilson',
        employeeId: 'EMP005',
        destination: 'Bangalore',
        purpose: 'Training program',
        startDate: '2024-12-10',
        endDate: '2024-12-12',
        status: 'pending',
        estimatedCost: 18000,
        actualCost: null
      }
    ];

    setExpenses(mockExpenses);
    setTravels(mockTravels);
    setSelectedItem(mockExpenses[0]);
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', label: 'Pending' },
      'approved': { color: 'success', label: 'Approved' },
      'rejected': { color: 'error', label: 'Rejected' },
      'processing': { color: 'info', label: 'Processing' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'meals': <RestaurantIcon />,
      'travel': <LocalAirportIcon />,
      'office': <ReceiptIcon />,
      'transport': <DirectionsCarIcon />,
      'accommodation': <HotelIcon />
    };
    return icons[category] || <ReceiptIcon />;
  };

  const renderExpensesTab = () => (
    <Grid container spacing={3}>
      {/* Expense List */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ height: 500, overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Expenses
            </Typography>
          </Box>
          
          <List>
            {expenses.map((expense) => (
              <ListItem key={expense.id} disablePadding>
                <ListItemButton
                  onClick={() => setSelectedItem(expense)}
                  selected={selectedItem?.id === expense.id && tabValue === 0}
                  sx={{ p: 2 }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getCategoryIcon(expense.category)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={expense.employeeName}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          ₹{expense.amount.toLocaleString()} • {expense.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                          {getStatusChip(expense.status)}
                          <Typography variant="caption">
                            {moment(expense.date).format('MMM DD')}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Expense Details */}
      <Grid item xs={12} md={8}>
        {selectedItem && tabValue === 0 && (
          <Paper sx={{ height: 500, overflow: 'auto' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {getCategoryIcon(selectedItem.category)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedItem.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.employeeName} • {selectedItem.employeeId}
                  </Typography>
                </Box>
                {getStatusChip(selectedItem.status)}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{selectedItem.amount.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {moment(selectedItem.date).format('MMM DD, YYYY')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedItem.category}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Receipts</Typography>
                  <Typography variant="body1">
                    {selectedItem.receipts} attached
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Actions
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>
                  Approve
                </Button>
                <Button variant="outlined" color="error">
                  Reject
                </Button>
                <Button variant="outlined">
                  Request Info
                </Button>
              </Stack>
            </Box>
          </Paper>
        )}
      </Grid>
    </Grid>
  );

  const renderTravelTab = () => (
    <Grid container spacing={3}>
      {/* Travel List */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ height: 500, overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="bold">
              Travel Requests
            </Typography>
          </Box>
          
          <List>
            {travels.map((travel) => (
              <ListItem key={travel.id} disablePadding>
                <ListItemButton
                  onClick={() => setSelectedItem(travel)}
                  selected={selectedItem?.id === travel.id && tabValue === 1}
                  sx={{ p: 2 }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <FlightTakeoffIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={travel.employeeName}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {travel.destination} • {travel.purpose}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                          {getStatusChip(travel.status)}
                          <Typography variant="caption">
                            {moment(travel.startDate).format('MMM DD')}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Travel Details */}
      <Grid item xs={12} md={8}>
        {selectedItem && tabValue === 1 && (
          <Paper sx={{ height: 500, overflow: 'auto' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <FlightTakeoffIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedItem.destination} Trip
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.employeeName} • {selectedItem.employeeId}
                  </Typography>
                </Box>
                {getStatusChip(selectedItem.status)}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Destination</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedItem.destination}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Purpose</Typography>
                  <Typography variant="body1">
                    {selectedItem.purpose}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">
                    {moment(selectedItem.startDate).format('MMM DD, YYYY')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">End Date</Typography>
                  <Typography variant="body1">
                    {moment(selectedItem.endDate).format('MMM DD, YYYY')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Estimated Cost</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ₹{selectedItem.estimatedCost.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Actual Cost</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedItem.actualCost ? `₹${selectedItem.actualCost.toLocaleString()}` : 'TBD'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Actions
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>
                  Approve
                </Button>
                <Button variant="outlined" color="error">
                  Reject
                </Button>
                <Button variant="outlined">
                  Request Changes
                </Button>
              </Stack>
            </Box>
          </Paper>
        )}
      </Grid>
    </Grid>
  );

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Expense & Travel Management
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ReceiptIcon />}>
              Reports
            </Button>
            <Button variant="contained" startIcon={<AddIcon />}>
              New Request
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AttachMoneyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Expenses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {expenses.filter(e => e.status === 'pending').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pending Approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocalAirportIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {travels.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Travel Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {[...expenses, ...travels].filter(item => item.status === 'approved').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Expenses" icon={<ReceiptIcon />} iconPosition="start" />
            <Tab label="Travel" icon={<LocalAirportIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && renderExpensesTab()}
        {tabValue === 1 && renderTravelTab()}
      </Box>
    </Fade>
  );
};

export default ExpenseModule;
