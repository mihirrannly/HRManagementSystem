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
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  PersonOff as PersonOffIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import moment from 'moment';

const ExitsModule = () => {
  const [exits, setExits] = useState([]);
  const [selectedExit, setSelectedExit] = useState(null);

  useEffect(() => {
    // Mock data for exits
    const mockExits = [
      {
        id: 1,
        employeeName: 'John Wilson',
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Senior Developer',
        exitDate: '2024-12-15',
        lastWorkingDay: '2024-12-13',
        exitType: 'resignation',
        status: 'in-progress',
        reason: 'Better opportunity',
        email: 'john.wilson@company.com',
        phone: '+91-9876543210',
        checklist: [
          { item: 'Asset return', completed: true },
          { item: 'Knowledge transfer', completed: false },
          { item: 'Exit interview', completed: false },
          { item: 'Final settlement', completed: false },
        ]
      },
      {
        id: 2,
        employeeName: 'Sarah Miller',
        employeeId: 'EMP002',
        department: 'Marketing',
        position: 'Marketing Executive',
        exitDate: '2024-11-30',
        lastWorkingDay: '2024-11-28',
        exitType: 'termination',
        status: 'completed',
        reason: 'Performance issues',
        email: 'sarah.miller@company.com',
        phone: '+91-9876543211',
        checklist: [
          { item: 'Asset return', completed: true },
          { item: 'Knowledge transfer', completed: true },
          { item: 'Exit interview', completed: true },
          { item: 'Final settlement', completed: true },
        ]
      }
    ];
    setExits(mockExits);
    if (mockExits.length > 0) {
      setSelectedExit(mockExits[0]);
    }
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', label: 'Pending' },
      'in-progress': { color: 'info', label: 'In Progress' },
      'completed': { color: 'success', label: 'Completed' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getExitTypeChip = (type) => {
    const typeConfig = {
      'resignation': { color: 'info', label: 'Resignation' },
      'termination': { color: 'error', label: 'Termination' },
      'retirement': { color: 'success', label: 'Retirement' },
      'layoff': { color: 'warning', label: 'Layoff' }
    };
    
    const config = typeConfig[type] || { color: 'default', label: type };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Employee Exits
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AssignmentIcon />}>
              Exit Checklist
            </Button>
            <Button variant="contained" startIcon={<ExitToAppIcon />}>
              Process Exit
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ExitToAppIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {exits.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Exits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {exits.filter(e => e.status === 'in-progress').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {exits.filter(e => e.status === 'completed').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonOffIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {exits.filter(e => e.exitType === 'resignation').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Resignations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Exit List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: 600, overflow: 'auto' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Exits
                </Typography>
              </Box>
              
              <List>
                {exits.map((exit) => (
                  <ListItem key={exit.id} disablePadding>
                    <ListItemButton
                      onClick={() => setSelectedExit(exit)}
                      selected={selectedExit?.id === exit.id}
                      sx={{ p: 2 }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          {exit.employeeName.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={exit.employeeName}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {exit.position} • {exit.department}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                              {getStatusChip(exit.status)}
                              {getExitTypeChip(exit.exitType)}
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

          {/* Exit Details */}
          <Grid item xs={12} md={8}>
            {selectedExit && (
              <Paper sx={{ height: 600, overflow: 'auto' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2, width: 56, height: 56 }}>
                      {selectedExit.employeeName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedExit.employeeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedExit.position} • {selectedExit.department}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Employee ID: {selectedExit.employeeId}
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      {getStatusChip(selectedExit.status)}
                      {getExitTypeChip(selectedExit.exitType)}
                    </Stack>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Exit Date</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {moment(selectedExit.exitDate).format('MMM DD, YYYY')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Last Working Day</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {moment(selectedExit.lastWorkingDay).format('MMM DD, YYYY')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Reason</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedExit.reason}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Exit Checklist
                  </Typography>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedExit.checklist.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.item}</TableCell>
                            <TableCell>
                              {item.completed ? (
                                <Chip size="small" color="success" label="Completed" />
                              ) : (
                                <Chip size="small" color="warning" label="Pending" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined">
                                {item.completed ? 'View' : 'Complete'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default ExitsModule;

