import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Paper,
  TextField,
  LinearProgress,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

// Organization Tree Component with Interactive Hierarchy
const OrganizationTreeModule = () => {
  const [hierarchyData, setHierarchyData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const clearCacheAndRefresh = async () => {
    try {
      // Clear the server-side cache first
      await axios.post('/organization/clear-hierarchy-cache');
      toast.success('Cache cleared, refreshing...');
      // Then fetch fresh data
      await fetchHierarchy();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache, but fetching fresh data...');
      await fetchHierarchy();
    }
  };

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/organization/hierarchy');
      setHierarchyData(response.data.hierarchy);
      setStats(response.data.stats);
      
      // Auto-expand first level
      const firstLevelIds = new Set();
      response.data.hierarchy.forEach(root => {
        firstLevelIds.add(root.id);
        root.children.forEach(child => firstLevelIds.add(child.id));
      });
      setExpandedNodes(firstLevelIds);
      
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('Failed to load organization hierarchy');
      
      // Fallback to demo data
      const demoHierarchy = [
        {
          id: 'ceo-1',
          name: 'John Smith',
          designation: 'Chief Executive Officer',
          department: 'Executive',
          employeeId: 'EMP001',
          location: 'HQ',
          children: [
            {
              id: 'eng-1',
              name: 'Bob Wilson',
              designation: 'Engineering Director',
              department: 'Engineering',
              employeeId: 'EMP002',
              location: 'HQ',
              children: [
                {
                  id: 'dev-2',
                  name: 'Carol Davis',
                  designation: 'Frontend Lead',
                  department: 'Engineering',
                  employeeId: 'EMP003',
                  location: 'HQ',
                  children: []
                }
              ]
            },
            {
              id: 'hr-1',
              name: 'David Brown',
              designation: 'HR Director',
              department: 'Human Resources',
              employeeId: 'EMP004',
              location: 'HQ',
              children: [
                {
                  id: 'hr-2',
                  name: 'Emma Wilson',
                  designation: 'HR Manager',
                  department: 'Human Resources',
                  employeeId: 'EMP005',
                  location: 'HQ',
                  children: []
                }
              ]
            }
          ]
        }
      ];
      setHierarchyData(demoHierarchy);
      
      // Auto-expand first level for demo
      const firstLevelIds = new Set();
      demoHierarchy.forEach(root => {
        firstLevelIds.add(root.id);
        root.children.forEach(child => firstLevelIds.add(child.id));
      });
      setExpandedNodes(firstLevelIds);
      
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set();
    const collectIds = (nodes) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(hierarchyData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const searchInHierarchy = (nodes, term) => {
    const results = [];
    const search = (nodeList) => {
      nodeList.forEach(node => {
        const matchesSearch = term === '' || 
          node.name.toLowerCase().includes(term.toLowerCase()) ||
          node.designation.toLowerCase().includes(term.toLowerCase()) ||
          node.department.toLowerCase().includes(term.toLowerCase()) ||
          node.employeeId.toLowerCase().includes(term.toLowerCase());
        
        if (matchesSearch || (node.children && node.children.some(child => searchInHierarchy([child], term).length > 0))) {
          results.push(node);
        }
      });
    };
    search(nodes);
    return results;
  };

  const filteredHierarchy = searchTerm ? searchInHierarchy(hierarchyData, searchTerm) : hierarchyData;

  const getNodeIcon = (designation) => {
    const title = designation.toLowerCase();
    if (title.includes('ceo') || title.includes('chief')) return '👑';
    if (title.includes('director') || title.includes('vp')) return '🎯';
    if (title.includes('manager')) return '👔';
    if (title.includes('lead') || title.includes('senior')) return '🔧';
    if (title.includes('intern') || title.includes('trainee')) return '🎓';
    return '👤';
  };

  const getNodeColor = (level) => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];
    return colors[level % colors.length];
  };

  const EmployeeNode = ({ employee, level = 0, isLastChild = false, parentPath = [] }) => {
    const isExpanded = expandedNodes.has(employee.id);
    const hasChildren = employee.children && employee.children.length > 0;
    const nodeColor = getNodeColor(level);

    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        mb: 4
      }}>
        {/* Dotted Line from Parent */}
        {level > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: -40,
              width: 2,
              height: 40,
              background: `repeating-linear-gradient(
                to bottom,
                ${nodeColor} 0px,
                ${nodeColor} 6px,
                transparent 6px,
                transparent 12px
              )`,
              transform: 'translateX(-50%)',
              zIndex: 0
            }}
          />
        )}

        {/* Circular Employee Node */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover .employee-circle': {
              transform: 'scale(1.1)',
              boxShadow: `0 8px 25px ${alpha(nodeColor, 0.4)}`
            }
          }}
          onClick={() => setSelectedEmployee(employee)}
        >
          {/* Circular Avatar */}
          <Box
            className="employee-circle"
            sx={{
              width: level === 0 ? 70 : 50,
              height: level === 0 ? 70 : 50,
              borderRadius: '50%',
              bgcolor: nodeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(nodeColor, 0.25)}`,
              border: `3px solid white`,
              position: 'relative',
              transition: 'all 0.3s ease',
              zIndex: 2
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontSize: level === 0 ? '1.1rem' : '0.8rem',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1
              }}
            >
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Typography>

            {/* Executive Badge */}
            {level === 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '2px solid white'
                }}
              >
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  bgcolor: 'white' 
                }} />
              </Box>
            )}

            {/* Expand/Collapse Button */}
            {hasChildren && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: `2px solid ${nodeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(nodeColor, 0.1),
                    transform: 'translateX(-50%) scale(1.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(employee.id);
                }}
              >
                {isExpanded ? (
                  <ExpandLessIcon sx={{ fontSize: 16, color: nodeColor }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 16, color: nodeColor }} />
                )}
              </Box>
            )}
          </Box>

          {/* Employee Name and Info */}
          <Box sx={{ textAlign: 'center', mt: 1.5, maxWidth: 120 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: level === 0 ? '0.8rem' : '0.7rem',
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
                lineHeight: 1.2
              }}
            >
              {employee.name}
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                color: nodeColor,
                fontWeight: 500,
                display: 'block',
                mb: 0.5
              }}
            >
              {employee.designation}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6rem',
                color: 'text.secondary',
                display: 'block',
                mb: 0.5
              }}
            >
              {employee.department}
            </Typography>

            {hasChildren && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.55rem',
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5
                }}
              >
                {employee.children.length} report{employee.children.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Render Children in Horizontal Layout */}
        {hasChildren && isExpanded && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: 6,
            flexWrap: 'wrap',
            position: 'relative',
            mt: 4,
            width: '100%'
          }}>
            {/* Horizontal dotted line connecting children */}
            {employee.children.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: '15%',
                  right: '15%',
                  height: 2,
                  background: `repeating-linear-gradient(
                    to right,
                    ${nodeColor} 0px,
                    ${nodeColor} 6px,
                    transparent 6px,
                    transparent 12px
                  )`,
                  zIndex: 1
                }}
              />
            )}

            {employee.children.map((child, index) => (
              <Box key={child.id} sx={{ position: 'relative' }}>
                {/* Individual vertical line to each child */}
                {employee.children.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: -20,
                      width: 2,
                      height: 20,
                      background: `repeating-linear-gradient(
                        to bottom,
                        ${nodeColor} 0px,
                        ${nodeColor} 6px,
                        transparent 6px,
                        transparent 12px
                      )`,
                      transform: 'translateX(-50%)',
                      zIndex: 1
                    }}
                  />
                )}
                <EmployeeNode 
                  employee={child} 
                  level={level + 1}
                  isLastChild={index === employee.children.length - 1}
                  parentPath={[...parentPath, employee.id]}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading organization hierarchy...</Typography>
      </Box>
    );
  }

  if (hierarchyData.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          No Organizational Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Import employee data to see the organizational hierarchy
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Compact Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        pb: 1,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Organization Tree
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Interactive organizational hierarchy
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            placeholder="Search employees..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.8rem',
                height: 36
              }
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
            }}
          />
          <IconButton
            size="small"
            onClick={clearCacheAndRefresh}
            sx={{ 
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.lighter' }
            }}
            title="Refresh hierarchy"
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setExpandedNodes(new Set());
              setSearchTerm('');
            }}
            sx={{ fontSize: '0.75rem' }}
          >
            Collapse All
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              const allIds = new Set();
              const collectIds = (nodes) => {
                nodes.forEach(node => {
                  allIds.add(node.id);
                  if (node.children) collectIds(node.children);
                });
              };
              collectIds(hierarchyData);
              setExpandedNodes(allIds);
            }}
            sx={{ fontSize: '0.75rem' }}
          >
            Expand All
          </Button>
        </Box>
      </Box>

      {/* Compact Stats */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Paper sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontSize: '1.1rem' }}>
            {hierarchyData.length}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Executives
          </Typography>
        </Paper>
        <Paper sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'success.main', fontSize: '1.1rem' }}>
            {hierarchyData.reduce((total, emp) => total + (emp.children?.length || 0), 0)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Reports
          </Typography>
        </Paper>
        <Paper sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'warning.main', fontSize: '1.1rem' }}>
            {expandedNodes.size}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Expanded
          </Typography>
        </Paper>
      </Box>

      {selectedEmployee ? (
        <Box sx={{ 
          p: 3, 
          border: '1px solid #e5e7eb', 
          borderRadius: 2,
          backgroundColor: '#f8fafc'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Employee Details
            </Typography>
            <IconButton size="small" onClick={() => setSelectedEmployee(null)}>
              ✕
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56 }}>
              {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedEmployee.name}</Typography>
              <Typography color="text.secondary">{selectedEmployee.designation}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee.department} • {selectedEmployee.location}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ minWidth: 'fit-content' }}>
          {/* Enhanced Organization Tree Header */}
          <Box sx={{ 
            mb: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
            borderRadius: 2,
            p: 2.5,
            border: '1px solid rgba(25, 118, 210, 0.1)'
          }}>
            <Typography variant="h5" sx={{ 
              fontSize: '1.2rem', 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2, #2e7d32)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Organizational Tree Structure
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ 
              fontSize: '0.9rem',
              mb: 2
            }}>
              {filteredHierarchy.length} top-level executive{filteredHierarchy.length !== 1 ? 's' : ''} • 
              {hierarchyData.reduce((total, emp) => total + emp.children.length, 0)} total reporting relationship{hierarchyData.reduce((total, emp) => total + emp.children.length, 0) !== 1 ? 's' : ''}
            </Typography>
            
            {/* Tree Legend */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 3, 
              flexWrap: 'wrap',
              mt: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#1976d2',
                  border: '2px solid rgba(25, 118, 210, 0.3)'
                }} />
                <Typography variant="caption" color="text.secondary">Executives</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#2e7d32',
                  border: '2px solid rgba(46, 125, 50, 0.3)'
                }} />
                <Typography variant="caption" color="text.secondary">Managers</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#ed6c02',
                  border: '2px solid rgba(237, 108, 2, 0.3)'
                }} />
                <Typography variant="caption" color="text.secondary">Team Members</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 2, 
                  backgroundColor: 'rgba(25, 118, 210, 0.4)',
                  borderRadius: 1
                }} />
                <Typography variant="caption" color="text.secondary">Reporting Lines</Typography>
              </Box>
            </Box>
          </Box>

          {/* Beautiful Dotted Tree Structure */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            p: 4,
            minHeight: '60vh'
          }}>
            <Typography variant="h5" sx={{ 
              mb: 4, 
              color: 'primary.main', 
              fontWeight: 700,
              textAlign: 'center',
              fontSize: '1.4rem'
            }}>
              Organizational Hierarchy
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap',
              width: '100%'
            }}>
              {filteredHierarchy.map((rootEmployee, index) => (
                <EmployeeNode 
                  key={rootEmployee.id}
                  employee={rootEmployee} 
                  level={0} 
                  isLastChild={index === filteredHierarchy.length - 1}
                  parentPath={[]}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OrganizationTreeModule;
