import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Avatar,
  Chip,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  AccountTree as AccountTreeIcon,
  Apartment as ApartmentIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
  ChevronRight,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const OrganizationSimple = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [orgChart, setOrgChart] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    fetchAnalytics();
    fetchDepartments();
    fetchOrgChart();
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/organization/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch organization analytics');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/organization/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchOrgChart = async () => {
    try {
      // Mock data for organizational structure
      const mockOrgChart = [
        {
          id: 'ceo',
          name: 'CEO Office',
          head: 'John Smith',
          employees: 1,
          children: [
            {
              id: 'engineering',
              name: 'Engineering',
              head: 'Alice Johnson',
              employees: 25,
              children: [
                { id: 'frontend', name: 'Frontend Team', head: 'Bob Wilson', employees: 8 },
                { id: 'backend', name: 'Backend Team', head: 'Carol Davis', employees: 10 },
                { id: 'devops', name: 'DevOps Team', head: 'David Brown', employees: 7 }
              ]
            },
            {
              id: 'hr',
              name: 'Human Resources',
              head: 'Emma Wilson',
              employees: 8,
              children: [
                { id: 'recruitment', name: 'Recruitment', head: 'Frank Miller', employees: 3 },
                { id: 'operations', name: 'HR Operations', head: 'Grace Lee', employees: 5 }
              ]
            },
            {
              id: 'sales',
              name: 'Sales & Marketing',
              head: 'Henry Taylor',
              employees: 15,
              children: [
                { id: 'sales-team', name: 'Sales Team', head: 'Ivy Chen', employees: 8 },
                { id: 'marketing', name: 'Marketing Team', head: 'Jack Davis', employees: 7 }
              ]
            }
          ]
        }
      ];
      setOrgChart(mockOrgChart);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching org chart:', error);
      setLoading(false);
    }
  };

  const renderTreeItem = (node, level = 0) => (
    <Box key={node.id}>
      <ListItemButton
        sx={{
          pl: 2 + level * 3,
          py: 1.5,
          borderRadius: 1,
          mb: 0.5,
          backgroundColor: level === 0 ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          }
        }}
      >
        <Avatar 
          sx={{ 
            mr: 2, 
            bgcolor: level === 0 ? 'primary.main' : 'secondary.main', 
            width: 36, 
            height: 36 
          }}
        >
          {node.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" fontWeight={level === 0 ? 'bold' : 'medium'}>
            {node.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {node.head} • {node.employees} employees
          </Typography>
        </Box>
        {node.children && (
          <ChevronRight sx={{ color: 'text.secondary' }} />
        )}
      </ListItemButton>
      {node.children && node.children.map(child => renderTreeItem(child, level + 1))}
    </Box>
  );

  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Organization Structure
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your company's organizational hierarchy and departments
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add Department
          </Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Manage Structure
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ApartmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {departments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SupervisedUserCircleIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team Leads
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {analytics?.totalEmployees || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                4
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hierarchy Levels
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Organization Hierarchy */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 600, overflow: 'auto' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Organization Hierarchy
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              {orgChart.map(node => renderTreeItem(node))}
            </List>
          </Paper>
        </Grid>

        {/* Department Details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 600, overflow: 'auto' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Departments
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              {departments.map((dept) => (
                <ListItem key={dept._id} disablePadding>
                  <ListItemButton
                    onClick={() => setSelectedDept(dept)}
                    selected={selectedDept?._id === dept._id}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {dept.name.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={dept.name}
                      secondary={`${dept.code} • ${dept.employeeCount || 0} employees`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {selectedDept && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {selectedDept.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedDept.description}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip size="small" label={`Code: ${selectedDept.code}`} />
                  <Chip size="small" label={`${selectedDept.employeeCount || 0} employees`} color="primary" />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<GroupIcon />}>
                    View Team
                  </Button>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrganizationSimple;
