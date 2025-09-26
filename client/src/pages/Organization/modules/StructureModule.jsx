import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Stack,
  Paper,
  Fade,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  AccountTree as AccountTreeIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore,
  ChevronRight,
  Apartment,
  SupervisedUserCircle,
} from '@mui/icons-material';
// TreeView component will be implemented with basic List components
import axios from 'axios';
import { toast } from 'react-toastify';
import OrganizationTreeModule from './OrganizationTreeModule';

const StructureModule = () => {
  const [departments, setDepartments] = useState([]);
  const [orgChart, setOrgChart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchOrgChart();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/organization/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgChart = async () => {
    try {
      // Mock data for now - will be replaced with actual API
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
    } catch (error) {
      console.error('Error fetching org chart:', error);
    }
  };

  const renderTreeItem = (node, level = 0) => (
    <Box key={node.id}>
      <ListItemButton
        sx={{
          pl: 2 + level * 3,
          py: 1,
          borderRadius: 1,
          mb: 0.5,
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          }
        }}
      >
        <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
          {node.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" fontWeight="medium">
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

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Organization Structure
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
            >
              Add Department
            </Button>
            <Button
              variant="contained"
              startIcon={<AccountTreeIcon />}
            >
              Manage Structure
            </Button>
          </Stack>
        </Box>

        {/* Department Overview at Top - Horizontal Layout */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Departments Overview
          </Typography>
          
          <Grid container spacing={1}>
            {departments.map((dept, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={dept._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedDept?._id === dept._id ? '2px solid' : '1px solid',
                    borderColor: selectedDept?._id === dept._id ? 'primary.main' : 'divider',
                    height: '100%',
                    minHeight: '80px',
                    '&:hover': {
                      boxShadow: 2,
                      transform: 'translateY(-1px)'
                    }
                  }}
                  onClick={() => setSelectedDept(dept)}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 20, height: 20, mr: 0.75, fontSize: '0.65rem' }}>
                        {dept.name.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" fontWeight="bold" noWrap sx={{ fontSize: '0.75rem' }}>
                        {dept.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                      {dept.code}
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
                      {dept.employeeCount || 0} emp
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Organization Tree - Full Width */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, minHeight: 600, overflow: 'hidden' }}>
              <OrganizationTreeModule />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default StructureModule;

