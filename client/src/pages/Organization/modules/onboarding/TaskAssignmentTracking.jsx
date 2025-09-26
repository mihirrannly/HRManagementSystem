import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
  Divider,
  Avatar,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import { LocalizationProvider, DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Computer as ComputerIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Update as UpdateIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const TaskAssignmentTracking = ({ onboardingId, employeeData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    assignee: 'all',
    priority: 'all'
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    department: '',
    assignedTo: '',
    dueDate: null,
    priority: 'medium',
    category: 'general',
    estimatedHours: '',
    dependencies: [],
    checklist: [],
    attachments: [],
    autoAssign: false
  });

  const taskCategories = [
    { id: 'hr', name: 'HR Tasks', icon: <PersonIcon />, color: '#1976d2' },
    { id: 'it', name: 'IT Tasks', icon: <ComputerIcon />, color: '#388e3c' },
    { id: 'admin', name: 'Admin Tasks', icon: <AdminIcon />, color: '#f57c00' },
    { id: 'manager', name: 'Manager Tasks', icon: <GroupIcon />, color: '#7b1fa2' },
    { id: 'general', name: 'General Tasks', icon: <AssignmentIcon />, color: '#5d4037' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'info' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'critical', label: 'Critical', color: 'error' }
  ];

  const taskStatuses = [
    { value: 'pending', label: 'Pending', color: 'default' },
    { value: 'in_progress', label: 'In Progress', color: 'primary' },
    { value: 'review', label: 'Under Review', color: 'warning' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  // Pre-defined task templates for different departments
  const defaultTaskTemplates = {
    hr: [
      {
        title: 'Create Employee Record',
        description: 'Create official employee record in HRMS',
        priority: 'high',
        estimatedHours: 2,
        daysFromStart: 1
      },
      {
        title: 'Assign Employee ID',
        description: 'Generate and assign unique employee ID',
        priority: 'high',
        estimatedHours: 1,
        daysFromStart: 1
      },
      {
        title: 'Setup Payroll',
        description: 'Configure payroll details and salary structure',
        priority: 'high',
        estimatedHours: 3,
        daysFromStart: 2
      },
      {
        title: 'Benefits Enrollment',
        description: 'Enroll employee in company benefits program',
        priority: 'medium',
        estimatedHours: 2,
        daysFromStart: 3
      },
      {
        title: 'Policy Acknowledgment',
        description: 'Ensure all policies are read and acknowledged',
        priority: 'medium',
        estimatedHours: 1,
        daysFromStart: 5
      }
    ],
    it: [
      {
        title: 'Create User Account',
        description: 'Create domain user account and email',
        priority: 'critical',
        estimatedHours: 1,
        daysFromStart: 1
      },
      {
        title: 'Laptop Assignment',
        description: 'Assign and configure laptop with necessary software',
        priority: 'high',
        estimatedHours: 4,
        daysFromStart: 1
      },
      {
        title: 'Software Access',
        description: 'Provide access to required software and systems',
        priority: 'high',
        estimatedHours: 2,
        daysFromStart: 2
      },
      {
        title: 'Security Setup',
        description: 'Configure VPN, security certificates, and access controls',
        priority: 'high',
        estimatedHours: 2,
        daysFromStart: 2
      },
      {
        title: 'Mobile Setup',
        description: 'Configure mobile device and corporate apps if required',
        priority: 'medium',
        estimatedHours: 1,
        daysFromStart: 3
      }
    ],
    admin: [
      {
        title: 'Desk Assignment',
        description: 'Assign desk and workspace to new employee',
        priority: 'high',
        estimatedHours: 1,
        daysFromStart: 1
      },
      {
        title: 'Access Cards',
        description: 'Issue building and office access cards',
        priority: 'high',
        estimatedHours: 1,
        daysFromStart: 1
      },
      {
        title: 'Parking Allocation',
        description: 'Assign parking space if applicable',
        priority: 'low',
        estimatedHours: 0.5,
        daysFromStart: 2
      },
      {
        title: 'Office Supplies',
        description: 'Provide necessary office supplies and stationery',
        priority: 'medium',
        estimatedHours: 1,
        daysFromStart: 1
      },
      {
        title: 'Cafeteria Setup',
        description: 'Setup meal card and cafeteria access',
        priority: 'low',
        estimatedHours: 0.5,
        daysFromStart: 2
      }
    ],
    manager: [
      {
        title: 'Welcome Meeting',
        description: 'Conduct welcome meeting and team introduction',
        priority: 'critical',
        estimatedHours: 2,
        daysFromStart: 1
      },
      {
        title: 'Role Clarification',
        description: 'Discuss role expectations and responsibilities',
        priority: 'high',
        estimatedHours: 2,
        daysFromStart: 2
      },
      {
        title: 'Goal Setting',
        description: 'Set initial goals and performance metrics',
        priority: 'high',
        estimatedHours: 1,
        daysFromStart: 5
      },
      {
        title: 'Team Integration',
        description: 'Facilitate integration with team members',
        priority: 'medium',
        estimatedHours: 2,
        daysFromStart: 3
      },
      {
        title: '30-Day Check-in',
        description: 'Schedule 30-day performance and feedback meeting',
        priority: 'medium',
        estimatedHours: 1,
        daysFromStart: 30
      }
    ]
  };

  useEffect(() => {
    fetchTasks();
    fetchDepartments();
    fetchUsers();
    generateTasksFromTemplates();
  }, [onboardingId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/onboarding/${onboardingId}/tasks`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/departments');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const generateTasksFromTemplates = () => {
    if (!employeeData?.startDate) return;

    const startDate = moment(employeeData.startDate);
    const generatedTasks = [];

    Object.entries(defaultTaskTemplates).forEach(([department, templates]) => {
      templates.forEach((template) => {
        const dueDate = startDate.clone().add(template.daysFromStart, 'days');
        generatedTasks.push({
          ...template,
          id: `${department}-${template.title.replace(/\s+/g, '-').toLowerCase()}`,
          department,
          category: department,
          dueDate: dueDate.toDate(),
          status: 'pending',
          assignedTo: null,
          createdAt: new Date(),
          progress: 0
        });
      });
    });

    setTaskTemplates(generatedTasks);
  };

  const createTask = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/onboarding/${onboardingId}/tasks`, newTask);
      setTasks(prev => [...prev, response.data.task]);
      setDialogOpen(false);
      resetNewTask();
      toast.success('Task created successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status, progress = null) => {
    try {
      await axios.put(`/onboarding/${onboardingId}/tasks/${taskId}`, {
        status,
        progress: progress !== null ? progress : undefined,
        completedAt: status === 'completed' ? new Date() : null
      });
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status, 
              progress: progress !== null ? progress : task.progress,
              completedAt: status === 'completed' ? new Date() : task.completedAt
            }
          : task
      ));
      
      toast.success('Task updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const assignTasksFromTemplate = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/onboarding/${onboardingId}/tasks/bulk`, {
        tasks: taskTemplates.map(template => ({
          ...template,
          autoAssigned: true
        }))
      });
      
      setTasks(prev => [...prev, ...response.data.tasks]);
      toast.success(`${response.data.tasks.length} tasks created from templates`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error creating tasks from template:', error);
      toast.error('Failed to create tasks from template');
    } finally {
      setLoading(false);
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      department: '',
      assignedTo: '',
      dueDate: null,
      priority: 'medium',
      category: 'general',
      estimatedHours: '',
      dependencies: [],
      checklist: [],
      attachments: [],
      autoAssign: false
    });
  };

  const getStatusColor = (status) => {
    const statusObj = taskStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'default';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorityLevels.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'default';
  };

  const getCategoryIcon = (category) => {
    const categoryObj = taskCategories.find(c => c.id === category);
    return categoryObj ? categoryObj.icon : <AssignmentIcon />;
  };

  const getCategoryColor = (category) => {
    const categoryObj = taskCategories.find(c => c.id === category);
    return categoryObj ? categoryObj.color : '#5d4037';
  };

  const filteredTasks = tasks.filter(task => {
    return (filters.department === 'all' || task.department === filters.department) &&
           (filters.status === 'all' || task.status === filters.status) &&
           (filters.assignee === 'all' || task.assignedTo === filters.assignee) &&
           (filters.priority === 'all' || task.priority === filters.priority);
  });

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && 
      moment(t.dueDate).isBefore(moment(), 'day')
    ).length;

    return { total, completed, inProgress, overdue };
  };

  const stats = getTaskStats();

  const renderTaskOverview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Task Overview & Analytics
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main">
                {stats.overdue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress by Department */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progress by Department
          </Typography>
          {taskCategories.map(category => {
            const categoryTasks = tasks.filter(t => t.category === category.id);
            const completedTasks = categoryTasks.filter(t => t.status === 'completed');
            const progress = categoryTasks.length > 0 ? 
              Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;

            return (
              <Box key={category.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: category.color, width: 32, height: 32 }}>
                      {category.icon}
                    </Avatar>
                    <Typography variant="body1" fontWeight="600">
                      {category.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {completedTasks.length}/{categoryTasks.length} completed ({progress}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: category.color,
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* Task Templates */}
      {taskTemplates.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Pre-defined Task Templates
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={assignTasksFromTemplate}
                disabled={loading}
              >
                Create All Template Tasks
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {taskTemplates.length} tasks will be automatically created based on the employee's role and start date
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  View Template Tasks ({taskTemplates.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {taskTemplates.slice(0, 10).map((template, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getCategoryIcon(template.category)}
                      </ListItemIcon>
                      <ListItemText
                        primary={template.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {template.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={template.department.toUpperCase()}
                                size="small"
                                sx={{ bgcolor: getCategoryColor(template.category), color: 'white' }}
                              />
                              <Chip
                                label={template.priority}
                                size="small"
                                color={getPriorityColor(template.priority)}
                              />
                              <Chip
                                label={`Due: ${moment(template.dueDate).format('MMM DD')}`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {taskTemplates.length > 10 && (
                    <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>
                      +{taskTemplates.length - 10} more tasks...
                    </Typography>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderTaskList = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Task Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Create Task
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  label="Department"
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {taskCategories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {taskStatuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  {priorityLevels.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>{priority.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTasks}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first task or generate tasks from templates
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredTasks.map((task, index) => (
                <React.Fragment key={task.id || index}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getCategoryColor(task.category), width: 40, height: 40 }}>
                        {getCategoryIcon(task.category)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {task.title}
                          </Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {task.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                              label={task.status.replace('_', ' ').toUpperCase()}
                              size="small"
                              color={getStatusColor(task.status)}
                            />
                            <Chip
                              label={task.department?.toUpperCase() || task.category?.toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                            {task.dueDate && (
                              <Chip
                                icon={<CalendarIcon />}
                                label={`Due: ${moment(task.dueDate).format('MMM DD')}`}
                                size="small"
                                variant="outlined"
                                color={moment(task.dueDate).isBefore(moment(), 'day') ? 'error' : 'default'}
                              />
                            )}
                            {task.estimatedHours && (
                              <Chip
                                icon={<TimeIcon />}
                                label={`${task.estimatedHours}h`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          {task.progress > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={task.progress}
                                sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                              />
                              <Typography variant="caption">
                                {task.progress}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {task.status === 'pending' && (
                          <Tooltip title="Start Task">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => updateTaskStatus(task.id, 'in_progress', 10)}
                            >
                              <StartIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {task.status === 'in_progress' && (
                          <Tooltip title="Complete Task">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => updateTaskStatus(task.id, 'completed', 100)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit Task">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTask(task);
                              setDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderTaskTimeline = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Task Timeline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Chronological view of all onboarding tasks and their completion status
      </Typography>

      <Stack spacing={2}>
        {tasks
          .sort((a, b) => moment(a.dueDate).diff(moment(b.dueDate)))
          .map((task, index) => (
            <Card key={task.id || index} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: task.status === 'completed' ? 'success.main' :
                               task.status === 'in_progress' ? 'primary.main' :
                               moment(task.dueDate).isBefore(moment(), 'day') ? 'error.main' : 'grey.500',
                      width: 40,
                      height: 40
                    }}
                  >
                    {task.status === 'completed' ? <CheckCircleIcon /> : getCategoryIcon(task.category)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {task.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Due: {moment(task.dueDate).format('MMM DD, YYYY')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={task.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={getStatusColor(task.status)}
                      />
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                      />
                      <Chip
                        label={task.category?.toUpperCase()}
                        size="small"
                        sx={{ bgcolor: getCategoryColor(task.category), color: 'white' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        {tasks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No tasks scheduled yet
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );

  const tabContent = [
    { label: 'Overview', content: renderTaskOverview() },
    { label: 'Task List', content: renderTaskList() },
    { label: 'Timeline', content: renderTaskTimeline() }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📋 Task Assignment & Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive task management system for HR, IT, Admin, and Manager responsibilities
        </Typography>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          {tabContent.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>

        {/* Tab Content */}
        {tabContent[activeTab].content}

        {/* Create/Edit Task Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedTask(null);
            resetNewTask();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Task Title"
                  required
                  value={selectedTask ? selectedTask.title : newTask.title}
                  onChange={(e) => {
                    if (selectedTask) {
                      setSelectedTask({ ...selectedTask, title: e.target.value });
                    } else {
                      setNewTask({ ...newTask, title: e.target.value });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={selectedTask ? selectedTask.description : newTask.description}
                  onChange={(e) => {
                    if (selectedTask) {
                      setSelectedTask({ ...selectedTask, description: e.target.value });
                    } else {
                      setNewTask({ ...newTask, description: e.target.value });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedTask ? selectedTask.category : newTask.category}
                    label="Category"
                    onChange={(e) => {
                      if (selectedTask) {
                        setSelectedTask({ ...selectedTask, category: e.target.value });
                      } else {
                        setNewTask({ ...newTask, category: e.target.value });
                      }
                    }}
                  >
                    {taskCategories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={selectedTask ? selectedTask.priority : newTask.priority}
                    label="Priority"
                    onChange={(e) => {
                      if (selectedTask) {
                        setSelectedTask({ ...selectedTask, priority: e.target.value });
                      } else {
                        setNewTask({ ...newTask, priority: e.target.value });
                      }
                    }}
                  >
                    {priorityLevels.map(priority => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Due Date"
                  value={selectedTask ? selectedTask.dueDate : newTask.dueDate}
                  onChange={(date) => {
                    if (selectedTask) {
                      setSelectedTask({ ...selectedTask, dueDate: date });
                    } else {
                      setNewTask({ ...newTask, dueDate: date });
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Hours"
                  type="number"
                  value={selectedTask ? selectedTask.estimatedHours : newTask.estimatedHours}
                  onChange={(e) => {
                    if (selectedTask) {
                      setSelectedTask({ ...selectedTask, estimatedHours: e.target.value });
                    } else {
                      setNewTask({ ...newTask, estimatedHours: e.target.value });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    value={selectedTask ? selectedTask.assignedTo : newTask.assignedTo}
                    label="Assign To"
                    onChange={(e) => {
                      if (selectedTask) {
                        setSelectedTask({ ...selectedTask, assignedTo: e.target.value });
                      } else {
                        setNewTask({ ...newTask, assignedTo: e.target.value });
                      }
                    }}
                  >
                    {users.map(user => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.profile?.firstName} {user.profile?.lastName} - {user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDialogOpen(false);
              setSelectedTask(null);
              resetNewTask();
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={createTask}
              disabled={loading}
            >
              {selectedTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogActions>
        </Dialog>

        {loading && (
          <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default TaskAssignmentTracking;
