import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import moment from 'moment';

const SalaryManagement = () => {
  // State management
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    status: '',
    employeeId: ''
  });
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({});
  
  // CSV upload
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalRecords: 0,
    pendingPayments: 0,
    paidPayments: 0,
    totalPayable: 0,
    totalPaid: 0
  });
  
  const [tabValue, setTabValue] = useState(0);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // VERSION CHECK - This proves new code is loaded
  useEffect(() => {
    console.log('🔥🔥🔥 SALARY MANAGEMENT - NEW VERSION LOADED - 6 COLUMNS ONLY 🔥🔥🔥');
    console.log('📊 Table shows: Employee ID, Name, Job Title, Period, Total CTC, Gross Salary, Actions');
    console.log('📋 Department, Basic, HRA visible ONLY in details dialog');
    console.log('⏰ Loaded at:', new Date().toLocaleTimeString());
  }, []);

  // Fetch salary records
  const fetchSalaryRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        ...filters
      };

      const response = await axios.get('/salary-management', { params });
      setSalaryRecords(response.data.salaryRecords);
      setTotalRecords(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      toast.error('Failed to fetch salary records');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const params = {
        month: filters.month,
        year: filters.year
      };
      const response = await axios.get('/salary-management/stats/overview', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchSalaryRecords();
    fetchStats();
  }, [page, rowsPerPage, filters]);

  // Handle search
  const handleSearch = () => {
    setPage(0);
    fetchSalaryRecords();
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      month: '',
      year: new Date().getFullYear(),
      status: '',
      employeeId: ''
    });
    setSearchTerm('');
    setPage(0);
  };

  // Open add/edit dialog
  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        employeeId: record.employeeId || '',
        month: record.month || '',
        year: record.year || new Date().getFullYear(),
        basicSalary: record.earnings?.basicSalary || 0,
        hra: record.earnings?.hra || 0,
        conveyanceAllowance: record.earnings?.conveyanceAllowance || 0,
        medicalAllowance: record.earnings?.medicalAllowance || 0,
        specialAllowance: record.earnings?.specialAllowance || 0,
        performanceBonus: record.earnings?.performanceBonus || 0,
        overtimePay: record.earnings?.overtimePay || 0,
        otherAllowances: record.earnings?.otherAllowances || 0,
        providentFund: record.deductions?.providentFund || 0,
        esi: record.deductions?.employeeStateInsurance || 0,
        professionalTax: record.deductions?.professionalTax || 0,
        incomeTax: record.deductions?.incomeTax || 0,
        loanRepayment: record.deductions?.loanRepayment || 0,
        advanceDeduction: record.deductions?.advanceDeduction || 0,
        lopAmount: record.deductions?.lopAmount || 0,
        otherDeductions: record.deductions?.otherDeductions || 0,
        totalWorkingDays: record.attendance?.totalWorkingDays || 0,
        daysPresent: record.attendance?.daysPresent || 0,
        paidLeaves: record.attendance?.paidLeaves || 0,
        paymentStatus: record.paymentStatus || 'pending',
        paymentMode: record.paymentMode || 'bank-transfer',
        remarks: record.remarks || ''
      });
    } else {
      setEditingRecord(null);
      setFormData({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: 0,
        hra: 0,
        conveyanceAllowance: 0,
        medicalAllowance: 0,
        specialAllowance: 0,
        performanceBonus: 0,
        overtimePay: 0,
        otherAllowances: 0,
        providentFund: 0,
        esi: 0,
        professionalTax: 0,
        incomeTax: 0,
        loanRepayment: 0,
        advanceDeduction: 0,
        lopAmount: 0,
        otherDeductions: 0,
        totalWorkingDays: 0,
        daysPresent: 0,
        paidLeaves: 0,
        paymentStatus: 'pending',
        paymentMode: 'bank-transfer',
        remarks: ''
      });
    }
    setOpenDialog(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const payload = {
        employeeId: formData.employeeId,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        earnings: {
          basicSalary: parseFloat(formData.basicSalary) || 0,
          hra: parseFloat(formData.hra) || 0,
          conveyanceAllowance: parseFloat(formData.conveyanceAllowance) || 0,
          medicalAllowance: parseFloat(formData.medicalAllowance) || 0,
          specialAllowance: parseFloat(formData.specialAllowance) || 0,
          performanceBonus: parseFloat(formData.performanceBonus) || 0,
          overtimePay: parseFloat(formData.overtimePay) || 0,
          otherAllowances: parseFloat(formData.otherAllowances) || 0
        },
        deductions: {
          providentFund: parseFloat(formData.providentFund) || 0,
          employeeStateInsurance: parseFloat(formData.esi) || 0,
          professionalTax: parseFloat(formData.professionalTax) || 0,
          incomeTax: parseFloat(formData.incomeTax) || 0,
          loanRepayment: parseFloat(formData.loanRepayment) || 0,
          advanceDeduction: parseFloat(formData.advanceDeduction) || 0,
          lopAmount: parseFloat(formData.lopAmount) || 0,
          otherDeductions: parseFloat(formData.otherDeductions) || 0
        },
        attendance: {
          totalWorkingDays: parseInt(formData.totalWorkingDays) || 0,
          daysPresent: parseInt(formData.daysPresent) || 0,
          paidLeaves: parseInt(formData.paidLeaves) || 0
        },
        paymentStatus: formData.paymentStatus,
        paymentMode: formData.paymentMode,
        remarks: formData.remarks
      };

      if (editingRecord) {
        await axios.put(`/salary-management/${editingRecord._id}`, payload);
        toast.success('Salary record updated successfully');
      } else {
        await axios.post('/salary-management', payload);
        toast.success('Salary record created successfully');
      }

      setOpenDialog(false);
      fetchSalaryRecords();
      fetchStats();
    } catch (error) {
      console.error('Error saving salary record:', error);
      toast.error(error.response?.data?.message || 'Failed to save salary record');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) {
      return;
    }

    try {
      await axios.delete(`/salary-management/${id}`);
      toast.success('Salary record deleted successfully');
      fetchSalaryRecords();
      fetchStats();
    } catch (error) {
      console.error('Error deleting salary record:', error);
      toast.error('Failed to delete salary record');
    }
  };

  // Handle CSV file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file');
      return;
    }

    setCsvFile(file);
    // Reset previous data
    setCsvHeaders([]);
    setCsvData([]);
    setUploadResults(null);
    
    // Parse the file
    parseCsvFile(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Parse CSV file using Papa Parse
  const parseCsvFile = (file) => {
    console.log('Starting to parse file:', file.name, 'Size:', file.size);
    
    // Read the file as text
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      console.log('File content (first 500 chars):', text.substring(0, 500));
      
      // Try to detect delimiter (tab or comma)
      const firstLine = text.split('\n')[0];
      const hasTab = firstLine.includes('\t');
      const delimiter = hasTab ? '\t' : ',';
      
      console.log('Detected delimiter:', delimiter === '\t' ? 'TAB (TSV)' : 'COMMA (CSV)');
      
      // Parse with PapaParse
      Papa.parse(text, {
        complete: (results) => {
          console.log('PapaParse results:', results);
          
          if (results.errors && results.errors.length > 0) {
            console.warn('PapaParse warnings:', results.errors);
          }
          
          if (!results.data || results.data.length === 0) {
            toast.error('No data found in CSV file. Please check the file format.');
            return;
          }
          
          // Remove completely empty rows
          let cleanData = results.data.filter(row => 
            Array.isArray(row) && row.length > 0 && row.some(cell => 
              cell !== null && cell !== undefined && cell.toString().trim() !== ''
            )
          );
          
          console.log('Clean data after filtering:', cleanData.length, 'rows');
          
          if (cleanData.length === 0) {
            toast.error('No valid data rows found in CSV file');
            return;
          }
          
          // Extract headers (first row)
          const rawHeaders = cleanData[0];
          const headers = rawHeaders.map((header, index) => {
            const cleanHeader = header ? header.toString().trim() : '';
            return cleanHeader || `Column ${index + 1}`;
          });
          
          console.log('Processed headers:', headers);
          console.log('Number of columns:', headers.length);
          
          // Extract data rows (skip first row which contains headers)
          const dataRows = cleanData.slice(1);
          console.log('Data rows count:', dataRows.length);
          
          // Log first data row for debugging
          if (dataRows.length > 0) {
            console.log('First data row sample:', dataRows[0]);
            console.log('First row column count:', dataRows[0].length);
          }
          
          // Validate that we have consistent column counts
          const headerCount = headers.length;
          const validDataRows = dataRows.filter((row, index) => {
            const isValid = Array.isArray(row) && row.length <= headerCount && 
                           row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
            return isValid;
          });
          
          console.log('Final valid data rows:', validDataRows.length);
          
          setCsvHeaders(headers);
          setCsvData(validDataRows);
          setImportDialogOpen(true);
          setOpenUploadDialog(false);
          
          toast.success(`Successfully parsed ${validDataRows.length} salary records with ${headers.length} fields`);
        },
        header: false,
        skipEmptyLines: true,
        delimiter: delimiter,
        quoteChar: '"',
        escapeChar: '"',
        dynamicTyping: false,
        encoding: 'UTF-8',
        worker: false,
        error: (error) => {
          console.error('PapaParse error:', error);
          toast.error(`Error parsing CSV: ${error.message}`);
        }
      });
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast.error('Error reading CSV file');
    };
    
    reader.readAsText(file);
  };

  // Handle CSV import after parsing
  const handleCSVImport = async () => {
    if (!csvData || csvData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setImporting(true);
    setUploadResults(null);

    try {
      // Debug: Log headers with indexes
      console.log('📋 CSV Headers:', csvHeaders);
      console.log('📋 Total columns:', csvHeaders.length);
      csvHeaders.forEach((header, index) => {
        console.log(`  Column ${index}: "${header}"`);
      });
      console.log('📊 Sample row:', csvData[0]);
      console.log('📊 Sample row length:', csvData[0]?.length);

      // Helper function to match column names flexibly (handles spaces, underscores, case)
      const normalizeColumnName = (name) => {
        return name.toLowerCase()
          .trim()
          .replace(/[_\s-]/g, '') // Remove underscores, spaces, hyphens
          .replace(/\(.*?\)/g, ''); // Remove anything in parentheses
      };

      // Helper function to get column value by various possible names
      // Priority: Exact match > Starts with > Contains
      const getColumnValue = (row, possibleNames, exactMatchOnly = false) => {
        const normalizedPossibleNames = possibleNames.map(n => normalizeColumnName(n));
        
        // First, try exact match
        let headerIndex = csvHeaders.findIndex(h => {
          const normalizedHeader = normalizeColumnName(h);
          return normalizedPossibleNames.some(name => normalizedHeader === name);
        });
        
        // If no exact match and not exactMatchOnly, try partial match
        if (headerIndex < 0 && !exactMatchOnly) {
          headerIndex = csvHeaders.findIndex(h => {
            const normalizedHeader = normalizeColumnName(h);
            return normalizedPossibleNames.some(name => normalizedHeader.includes(name) || name.includes(normalizedHeader));
          });
        }
        
        if (headerIndex >= 0) {
          const value = row[headerIndex];
          return value ? value.toString().trim() : '';
        }
        return '';
      };

      // Transform CSV data to salary records
      const salaryRecords = csvData.map((row, index) => {
        // Try many variations for employeeId (including "Employee Number")
        const employeeId = getColumnValue(row, [
          'employeeId', 'EmployeeID', 'employee_id', 'employeeid', 
          'emp_id', 'empid', 'id', 'employee', 'emp',
          'employee number', 'employeenumber', 'emp number', 'empnumber'
        ]);
        
        // Try to get month and year directly first
        let month = getColumnValue(row, [
          'month', 'Month', 'MONTH', 'mon', 'mnth'
        ]);
        
        let year = getColumnValue(row, [
          'year', 'Year', 'YEAR', 'yr'
        ]);

        // If month/year not found, try to extract from date columns
        // Priority: Revision Effective From > Last Updated On > Date of Joining
        if (!month || !year) {
          const dateValue = getColumnValue(row, [
            'revision effective from', 'revisioneffectivefrom',
            'last updated on', 'lastupdatedon',
            'date of joining', 'dateofjoining', 'doj', 'joining date',
            'effective date', 'effectivedate',
            'date', 'salary date', 'pay date'
          ]);

          if (dateValue) {
            // Try to parse date in various formats
            const dateFormats = [
              /(\d{2})-([A-Za-z]{3})-(\d{4})/,  // 01-Mar-2025
              /(\d{2})\/(\d{2})\/(\d{4})/,      // 01/03/2025
              /(\d{4})-(\d{2})-(\d{2})/         // 2025-03-01
            ];

            for (const format of dateFormats) {
              const match = dateValue.match(format);
              if (match) {
                if (format === dateFormats[0]) {
                  // DD-MMM-YYYY format
                  const monthNames = {
                    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
                    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
                  };
                  month = monthNames[match[2].toLowerCase()] || '';
                  year = match[3];
                } else if (format === dateFormats[1]) {
                  // DD/MM/YYYY format
                  month = parseInt(match[2]);
                  year = match[3];
                } else if (format === dateFormats[2]) {
                  // YYYY-MM-DD format
                  month = parseInt(match[2]);
                  year = match[1];
                }
                break;
              }
            }
          }
        }

        // Debug first 2 rows with ALL 28 CSV fields
        if (index < 2) {
          console.log(`\n🔍 ROW ${index + 1} - FULL PARSING DEBUG:`);
          console.log('Employee Info:');
          console.log('  Employee Number:', employeeId || 'MISSING');
          console.log('  Employee Name:', getColumnValue(row, ['employee name', 'employeename', 'name']));
          console.log('  Date of Joining:', getColumnValue(row, ['date of joining', 'dateofjoining', 'doj', 'joining date']));
          console.log('  Remuneration Type:', getColumnValue(row, ['remuneration type', 'remunerationtype', 'salary type']));
          console.log('  Employment Status:', getColumnValue(row, ['employment status', 'employmentstatus', 'emp status']));
          console.log('  Worker Type:', getColumnValue(row, ['worker type', 'workertype', 'employee type']));
          console.log('  Job Title:', getColumnValue(row, ['job title', 'jobtitle', 'designation', 'position']));
          console.log('  Department:', getColumnValue(row, ['department', 'dept']));
          console.log('  Sub Department:', getColumnValue(row, ['sub department', 'subdepartment', 'sub dept']));
          console.log('  Location:', getColumnValue(row, ['location', 'office location', 'city']));
          console.log('  Business Unit:', getColumnValue(row, ['business unit', 'businessunit', 'bu']));
          console.log('  Cost Center:', getColumnValue(row, ['cost center', 'costcenter', 'cc']));
          console.log('\nDates:');
          console.log('  Revision Effective From:', getColumnValue(row, ['revision effective from', 'revisioneffectivefrom', 'effective from']));
          console.log('  Last Updated On:', getColumnValue(row, ['last updated on', 'lastupdatedon', 'updated on']));
          console.log('\nSalary Components:');
          console.log('  Total CTC:', getColumnValue(row, ['total ctc', 'totalctc', 'ctc']));
          console.log('  Total Bonus Amount:', getColumnValue(row, ['total bonus amount', 'totalbonusamount', 'bonus amount']));
          console.log('  Total Perk Amount:', getColumnValue(row, ['total perk amount', 'totalperkamount', 'perk amount']));
          console.log('  PF - Other Charges:', getColumnValue(row, ['pf other charges', 'pfothercharges', 'pf - other charges']));
          console.log('  Regular Salary:', getColumnValue(row, ['regular salary', 'regularsalary']));
          console.log('  Basic:', getColumnValue(row, ['basic', 'basic salary', 'basic_salary', 'basicsalary']));
          console.log('  HRA:', getColumnValue(row, ['hra', 'house rent', 'houserent']));
          console.log('  Conveyance Allowance:', getColumnValue(row, ['conveyance', 'conveyance allowance', 'transport', 'travel']));
          console.log('  Special Allowance:', getColumnValue(row, ['special', 'special allowance', 'specialallowance']));
          console.log('  Gross(A):', getColumnValue(row, ['gross(a)', 'grossa', 'gross a']));
          console.log('  Total (EXACT MATCH):', getColumnValue(row, ['total'], true));
          console.log('  PF Employee:', getColumnValue(row, ['pf employee', 'pfemployee']));
          console.log('  PF - Employer:', getColumnValue(row, ['pf employer', 'pfemployer', 'pf - employer']));
          console.log('  Health Insurance:', getColumnValue(row, ['health insurance', 'healthinsurance', 'health ins']));
        }

        if (!employeeId || !month || !year) {
          console.warn(`Row ${index + 2}: Missing required fields (employeeId: "${employeeId}", month: "${month}", year: "${year}")`);
          return null;
        }

        // Helper to parse currency (remove commas)
        const parseCurrency = (value) => {
          if (!value) return 0;
          const cleaned = value.toString().replace(/,/g, '');
          const parsed = parseFloat(cleaned) || 0;
          if (index < 2) {
            console.log(`💰 Parse currency: "${value}" → "${cleaned}" → ${parsed}`);
          }
          return parsed;
        };

        // Helper to parse date
        const parseDate = (dateStr) => {
          if (!dateStr) return null;
          const match = dateStr.match(/(\d{2})-([A-Za-z]{3})-(\d{4})/);
          if (match) {
            const monthNames = {
              'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
              'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
            };
            const day = parseInt(match[1]);
            const monthIndex = monthNames[match[2].toLowerCase()];
            const year = parseInt(match[3]);
            return new Date(year, monthIndex, day).toISOString();
          }
          return null;
        };

        return {
          employeeId: employeeId.toString().trim(),
          month: parseInt(month),
          year: parseInt(year),
          
          // Employee Details from CSV
          employeeName: getColumnValue(row, ['employee name', 'employeename', 'name']),
          dateOfJoining: parseDate(getColumnValue(row, ['date of joining', 'dateofjoining', 'joining date', 'doj'])),
          remunerationType: getColumnValue(row, ['remuneration type', 'remunerationtype', 'salary type']),
          employmentStatus: getColumnValue(row, ['employment status', 'employmentstatus', 'emp status']),
          workerType: getColumnValue(row, ['worker type', 'workertype', 'employee type']),
          jobTitle: getColumnValue(row, ['job title', 'jobtitle', 'designation', 'position']),
          department: getColumnValue(row, ['department', 'dept']),
          subDepartment: getColumnValue(row, ['sub department', 'subdepartment', 'sub dept']),
          location: getColumnValue(row, ['location', 'office location', 'city']),
          businessUnit: getColumnValue(row, ['business unit', 'businessunit', 'bu']),
          costCenter: getColumnValue(row, ['cost center', 'costcenter', 'cc']),
          
          // Salary Components from CSV
          totalCTC: parseCurrency(getColumnValue(row, ['total ctc', 'totalctc', 'ctc'])),
          totalBonusAmount: parseCurrency(getColumnValue(row, ['total bonus amount', 'totalbonusamount', 'bonus amount'])),
          totalPerkAmount: parseCurrency(getColumnValue(row, ['total perk amount', 'totalperkamount', 'perk amount'])),
          regularSalary: parseCurrency(getColumnValue(row, ['regular salary', 'regularsalary'])),
          grossSalaryA: parseCurrency(getColumnValue(row, ['gross(a)', 'grossa', 'gross a'])),
          total: parseCurrency(getColumnValue(row, ['total'], true)), // Exact match only to avoid matching "Total CTC", "Total Bonus", etc.
          revisionEffectiveFrom: parseDate(getColumnValue(row, ['revision effective from', 'revisioneffectivefrom', 'effective from'])),
          lastUpdatedOn: parseDate(getColumnValue(row, ['last updated on', 'lastupdatedon', 'updated on'])),
          
          earnings: {
            basicSalary: parseCurrency(getColumnValue(row, ['basic', 'basic salary', 'basic_salary', 'basicsalary'])),
            hra: parseCurrency(getColumnValue(row, ['hra', 'house rent', 'houserent'])),
            conveyanceAllowance: parseCurrency(getColumnValue(row, ['conveyance allowance', 'conveyance', 'transport allowance', 'travel allowance'])),
            medicalAllowance: parseCurrency(getColumnValue(row, ['medical allowance', 'medical', 'health allowance'])),
            specialAllowance: parseCurrency(getColumnValue(row, ['special allowance', 'specialallowance', 'special'])),
            performanceBonus: parseCurrency(getColumnValue(row, ['performance bonus', 'performancebonus', 'incentive', 'bonus pay'], true)), // Exact match to avoid matching "Total Bonus Amount"
            overtimePay: parseCurrency(getColumnValue(row, ['overtime pay', 'overtimepay', 'overtime', 'ot pay', 'extra hours pay'], true)), // Exact match to avoid matching "Total"
            otherAllowances: parseCurrency(getColumnValue(row, ['other allowance', 'other allowances', 'others', 'misc allowance']))
          },
          deductions: {
            providentFund: parseCurrency(getColumnValue(row, ['pf employee', 'pfemployee', 'employee pf'])),
            employeeStateInsurance: parseCurrency(getColumnValue(row, ['esi', 'employee state insurance', 'esic'])),
            professionalTax: parseCurrency(getColumnValue(row, ['pt', 'professional tax', 'prof tax'])),
            incomeTax: parseCurrency(getColumnValue(row, ['tds', 'income tax', 'tax deducted'])),
            loanRepayment: parseCurrency(getColumnValue(row, ['loan repayment', 'loan deduction', 'loan'])),
            advanceDeduction: parseCurrency(getColumnValue(row, ['advance deduction', 'advance', 'advance recovery'])),
            lossOfPayDays: parseFloat(getColumnValue(row, ['lop days', 'loss of pay days', 'lop'], true) || 0), // Exact match to avoid generic matches
            lopAmount: parseCurrency(getColumnValue(row, ['lop amount', 'loss of pay amount'])),
            otherDeductions: parseCurrency(getColumnValue(row, ['other deductions', 'other ded', 'misc deductions'])),
            pfEmployer: parseCurrency(getColumnValue(row, ['pf employer', 'pfemployer', 'pf - employer', 'employer pf'])),
            pfOtherCharges: parseCurrency(getColumnValue(row, ['pf other charges', 'pfothercharges', 'pf - other charges', 'pf charges'])),
            healthInsurance: parseCurrency(getColumnValue(row, ['health insurance', 'healthinsurance', 'health ins', 'medical insurance']))
          },
          attendance: {
            totalWorkingDays: parseInt(getColumnValue(row, ['working days', 'work days', 'days worked', 'total working days'], true) || 0), // Exact match to avoid matching "Total"
            daysPresent: parseInt(getColumnValue(row, ['present', 'days present', 'attendance']) || 0),
            daysAbsent: parseInt(getColumnValue(row, ['absent', 'days absent']) || 0),
            paidLeaves: parseInt(getColumnValue(row, ['paid leave', 'pl', 'paid leaves']) || 0),
            unpaidLeaves: parseInt(getColumnValue(row, ['unpaid leave', 'lop leave', 'unpaid']) || 0)
          },
          // Only match specific payment status values, default to 'pending'
          paymentStatus: (() => {
            const statusValue = getColumnValue(row, ['payment status', 'pay status', 'salary status']);
            const validStatuses = ['pending', 'processing', 'paid', 'failed'];
            return validStatuses.includes(statusValue.toLowerCase()) ? statusValue.toLowerCase() : 'pending';
          })(),
          paymentDate: getColumnValue(row, ['payment date', 'pay date', 'salary date']),
          paymentMode: getColumnValue(row, ['payment mode', 'pay mode', 'salary mode']) || 'bank-transfer',
          paymentReference: getColumnValue(row, ['payment reference', 'pay reference', 'transaction id', 'ref no']),
          remarks: getColumnValue(row, ['remarks', 'notes', 'comments'])
        };
      }).filter(record => record !== null);

      console.log('Processed salary records for import:', salaryRecords.length);
      
      // Debug: Show first record details
      if (salaryRecords.length > 0) {
        console.log('📊 Sample record being sent:', JSON.stringify(salaryRecords[0], null, 2));
      }

      if (salaryRecords.length === 0) {
        toast.error('No valid records found to import. Please check the CSV format and required fields (employeeId, month, year)');
        setImporting(false);
        return;
      }

      // Send to backend for bulk creation
      console.log('Sending to backend:', { recordCount: salaryRecords.length });
      const response = await axios.post('/salary-management/import/processed', {
        records: salaryRecords
      });

      console.log('Backend response:', response.data);
      setUploadResults(response.data);
      toast.success(`Import completed! ${response.data.summary.successful} records processed successfully`);
      
      setImportDialogOpen(false);
      setCsvFile(null);
      setCsvHeaders([]);
      setCsvData([]);
      
      fetchSalaryRecords();
      fetchStats();
    } catch (error) {
      console.error('Error importing salary records:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to import salary records');
    } finally {
      setImporting(false);
    }
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const template = [
      {
        employeeId: 'CODR001',
        month: '1',
        year: '2025',
        basicSalary: '50000',
        hra: '10000',
        conveyanceAllowance: '2000',
        medicalAllowance: '1500',
        specialAllowance: '5000',
        performanceBonus: '0',
        overtimePay: '0',
        otherAllowances: '0',
        pf: '6000',
        esi: '0',
        professionalTax: '200',
        incomeTax: '5000',
        loanRepayment: '0',
        advanceDeduction: '0',
        lopAmount: '0',
        otherDeductions: '0',
        totalWorkingDays: '22',
        daysPresent: '22',
        paidLeaves: '0',
        paymentStatus: 'pending',
        paymentMode: 'bank-transfer',
        remarks: 'Sample record'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'salary_import_template.csv';
    link.click();
    toast.success('CSV template downloaded');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'paid': 'success',
      'pending': 'warning',
      'processing': 'info',
      'on-hold': 'default',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom sx={{ color: '#1976d2' }}>
          💰 Salary & Financial Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage employee salaries, allowances, deductions, and financial records
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ 
            border: '1px solid #e0e0e0', 
            borderLeft: '4px solid #1976d2',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#1976d2', opacity: 0.8 }} />
                <Typography variant="h4" fontWeight="700" sx={{ color: '#1976d2' }}>
                  {stats.totalRecords}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                TOTAL RECORDS
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ 
            border: '1px solid #e0e0e0', 
            borderLeft: '4px solid #f57c00',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(245, 124, 0, 0.3)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <PendingIcon sx={{ fontSize: 40, color: '#f57c00', opacity: 0.8 }} />
                <Typography variant="h4" fontWeight="700" sx={{ color: '#f57c00' }}>
                  {stats.pendingPayments}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                PENDING PAYMENTS
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ 
            border: '1px solid #e0e0e0', 
            borderLeft: '4px solid #388e3c',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(56, 142, 60, 0.3)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#388e3c', opacity: 0.8 }} />
                <Typography variant="h4" fontWeight="700" sx={{ color: '#388e3c' }}>
                  {stats.paidPayments}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                PAID PAYMENTS
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ 
            border: '1px solid #e0e0e0', 
            borderLeft: '4px solid #7b1fa2',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(123, 31, 162, 0.3)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <MoneyIcon sx={{ fontSize: 40, color: '#7b1fa2', opacity: 0.8 }} />
                <Typography variant="h4" fontWeight="700" sx={{ color: '#7b1fa2' }}>
                  {formatCurrency(stats.totalPayable).replace('₹', '')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                TOTAL PAYABLE
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Employee ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={filters.month}
                label="Month"
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                <MenuItem value="">All Months</MenuItem>
                {monthNames.map((month, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={filters.year}
                label="Year"
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="on-hold">On Hold</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleSearch}
              sx={{ height: '40px' }}
            >
              Filter
            </Button>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="text"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{ height: '40px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Add Salary Record
          </Button>

          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenUploadDialog(true)}
            sx={{ 
              bgcolor: '#388e3c',
              '&:hover': { bgcolor: '#2e7d32' }
            }}
          >
            Import from CSV
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadCSVTemplate}
          >
            Download CSV Template
          </Button>
        </Box>
      </Paper>

      {/* Salary Records Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '700' }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Employee Name</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Job Title</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Period</TableCell>
                <TableCell align="right" sx={{ fontWeight: '700' }}>Total CTC</TableCell>
                <TableCell align="right" sx={{ fontWeight: '700' }}>Gross Salary</TableCell>
                <TableCell align="center" sx={{ fontWeight: '700' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : salaryRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No salary records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                salaryRecords.map((record) => (
                  <TableRow 
                    key={record._id}
                    sx={{ 
                      '&:hover': { bgcolor: '#f5f5f5' },
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedRecord(record);
                      setOpenDetailsDialog(true);
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {record.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {record.employeeName || `${record.employee?.personalInfo?.firstName || ''} ${record.employee?.personalInfo?.lastName || ''}`.trim()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.jobTitle || record.employee?.employmentInfo?.designation || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {monthNames[record.month - 1]} {record.year}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {formatCurrency(record.totalCTC || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="600" color="success.dark">
                        {formatCurrency(record.grossSalaryA || record.grossSalary || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                            setOpenDetailsDialog(true);
                          }}
                          sx={{ color: '#1976d2' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(record);
                          }}
                          sx={{ color: '#1976d2' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record._id);
                          }}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: '700' }}>
          {editingRecord ? 'Edit Salary Record' : 'Add Salary Record'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#1976d2' }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employeeId || ''}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                disabled={editingRecord !== null}
                required
              />
            </Grid>

            <Grid item xs={6} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Month</InputLabel>
                <Select
                  value={formData.month || ''}
                  label="Month"
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                >
                  {monthNames.map((month, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Year"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </Grid>

            {/* Earnings */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#388e3c', mt: 2 }}>
                Earnings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Basic Salary"
                value={formData.basicSalary || 0}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="HRA"
                value={formData.hra || 0}
                onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Conveyance"
                value={formData.conveyanceAllowance || 0}
                onChange={(e) => setFormData({ ...formData, conveyanceAllowance: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Medical"
                value={formData.medicalAllowance || 0}
                onChange={(e) => setFormData({ ...formData, medicalAllowance: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Special Allowance"
                value={formData.specialAllowance || 0}
                onChange={(e) => setFormData({ ...formData, specialAllowance: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Performance Bonus"
                value={formData.performanceBonus || 0}
                onChange={(e) => setFormData({ ...formData, performanceBonus: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Overtime Pay"
                value={formData.overtimePay || 0}
                onChange={(e) => setFormData({ ...formData, overtimePay: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Other Allowances"
                value={formData.otherAllowances || 0}
                onChange={(e) => setFormData({ ...formData, otherAllowances: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            {/* Deductions */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#d32f2f', mt: 2 }}>
                Deductions
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Provident Fund (PF)"
                value={formData.providentFund || 0}
                onChange={(e) => setFormData({ ...formData, providentFund: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="ESI"
                value={formData.esi || 0}
                onChange={(e) => setFormData({ ...formData, esi: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Professional Tax"
                value={formData.professionalTax || 0}
                onChange={(e) => setFormData({ ...formData, professionalTax: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Income Tax (TDS)"
                value={formData.incomeTax || 0}
                onChange={(e) => setFormData({ ...formData, incomeTax: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Loan Repayment"
                value={formData.loanRepayment || 0}
                onChange={(e) => setFormData({ ...formData, loanRepayment: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Advance Deduction"
                value={formData.advanceDeduction || 0}
                onChange={(e) => setFormData({ ...formData, advanceDeduction: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="LOP Amount"
                value={formData.lopAmount || 0}
                onChange={(e) => setFormData({ ...formData, lopAmount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Other Deductions"
                value={formData.otherDeductions || 0}
                onChange={(e) => setFormData({ ...formData, otherDeductions: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Grid>

            {/* Attendance */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#7b1fa2', mt: 2 }}>
                Attendance Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Total Working Days"
                value={formData.totalWorkingDays || 0}
                onChange={(e) => setFormData({ ...formData, totalWorkingDays: e.target.value })}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Days Present"
                value={formData.daysPresent || 0}
                onChange={(e) => setFormData({ ...formData, daysPresent: e.target.value })}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                type="number"
                label="Paid Leaves"
                value={formData.paidLeaves || 0}
                onChange={(e) => setFormData({ ...formData, paidLeaves: e.target.value })}
              />
            </Grid>

            {/* Payment Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#00acc1', mt: 2 }}>
                Payment Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.paymentStatus || 'pending'}
                  label="Payment Status"
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  value={formData.paymentMode || 'bank-transfer'}
                  label="Payment Mode"
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                >
                  <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Remarks"
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#1976d2' }}
          >
            {editingRecord ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#388e3c', color: 'white', fontWeight: '700' }}>
          Import Salary Data from CSV
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <UploadIcon sx={{ fontSize: 64, color: '#388e3c', mb: 2 }} />
            
            <Typography variant="body1" gutterBottom>
              Upload a CSV file containing salary data for multiple employees
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Download the template to see the required format
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="csv-file-input"
            />
            
            <label htmlFor="csv-file-input">
              <Button
                component="span"
                variant="contained"
                fullWidth
                sx={{ mb: 2, bgcolor: '#388e3c' }}
              >
                Select CSV File
              </Button>
            </label>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              File will be parsed and you can review data before importing
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenUploadDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Import Preview Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#388e3c', color: 'white', fontWeight: '700' }}>
          Review & Import Salary Data
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              Parsed {csvData.length} records from CSV file
            </Typography>
            <Typography variant="body2">
              Review the data below and click "Import All Records" to proceed
            </Typography>
          </Alert>

          {csvHeaders.length > 0 && csvData.length > 0 && (
            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {csvHeaders.slice(0, 10).map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        {header}
                      </TableCell>
                    ))}
                    {csvHeaders.length > 10 && (
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        ... +{csvHeaders.length - 10} more
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvData.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex} hover>
                      {row.slice(0, 10).map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {cell || '-'}
                        </TableCell>
                      ))}
                      {row.length > 10 && (
                        <TableCell>...</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {csvData.length > 10 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
              Showing first 10 rows of {csvData.length} total records
            </Typography>
          )}

          {uploadResults && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                Import Summary:
              </Typography>
              <Typography variant="body2">
                • Total Records: {uploadResults.summary.total}
              </Typography>
              <Typography variant="body2" color="success.main">
                • Successful: {uploadResults.summary.successful}
              </Typography>
              <Typography variant="body2" color="error.main">
                • Failed: {uploadResults.summary.failed}
              </Typography>
              
              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="600" gutterBottom>
                    Errors:
                  </Typography>
                  {uploadResults.errors.slice(0, 5).map((error, index) => (
                    <Typography key={index} variant="caption" display="block" color="error.main">
                      Row {error.row}: {error.error}
                    </Typography>
                  ))}
                  {uploadResults.errors.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      ... and {uploadResults.errors.length - 5} more errors
                    </Typography>
                  )}
                </Box>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setImportDialogOpen(false)} disabled={importing}>
            Cancel
          </Button>
          {!uploadResults && (
            <Button
              variant="contained"
              onClick={handleCSVImport}
              disabled={importing}
              sx={{ bgcolor: '#388e3c' }}
              startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
            >
              {importing ? 'Importing...' : `Import All Records (${csvData.length})`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Details Dialog - Show ALL CSV Columns */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#1976d2', 
          color: 'white', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon />
            <span>Salary Details - {selectedRecord?.employeeId}</span>
          </Box>
          <IconButton
            onClick={() => setOpenDetailsDialog(false)}
            sx={{ color: 'white' }}
            size="small"
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedRecord && (
            <Grid container spacing={3}>
              {/* Employee Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="700" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon /> Employee Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Employee Number</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedRecord.employeeId}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Employee Name</Typography>
                  <Typography variant="body1" fontWeight="600">{selectedRecord.employeeName || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Date of Joining</Typography>
                  <Typography variant="body1">{selectedRecord.dateOfJoining ? moment(selectedRecord.dateOfJoining).format('DD-MMM-YYYY') : '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Remuneration Type</Typography>
                  <Typography variant="body1">{selectedRecord.remunerationType || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Employment Status</Typography>
                  <Typography variant="body1">{selectedRecord.employmentStatus || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Worker Type</Typography>
                  <Typography variant="body1">{selectedRecord.workerType || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Job Title</Typography>
                  <Typography variant="body1">{selectedRecord.jobTitle || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{selectedRecord.department || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Sub Department</Typography>
                  <Typography variant="body1">{selectedRecord.subDepartment || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{selectedRecord.location || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Business Unit</Typography>
                  <Typography variant="body1">{selectedRecord.businessUnit || '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Cost Center</Typography>
                  <Typography variant="body1">{selectedRecord.costCenter || '-'}</Typography>
                </Paper>
              </Grid>

              {/* Salary Period & Dates Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="700" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon /> Salary Period & Dates
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Salary Period</Typography>
                  <Typography variant="body1" fontWeight="600">{monthNames[selectedRecord.month - 1]} {selectedRecord.year}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Revision Effective From</Typography>
                  <Typography variant="body1">{selectedRecord.revisionEffectiveFrom ? moment(selectedRecord.revisionEffectiveFrom).format('DD-MMM-YYYY') : '-'}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Last Updated On</Typography>
                  <Typography variant="body1">{selectedRecord.lastUpdatedOn ? moment(selectedRecord.lastUpdatedOn).format('DD-MMM-YYYY') : '-'}</Typography>
                </Paper>
              </Grid>

              {/* Salary Components Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="700" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon /> Salary Components & Earnings
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '2px solid #4caf50' }}>
                  <Typography variant="caption" color="text.secondary">Total CTC</Typography>
                  <Typography variant="h6" fontWeight="700" color="success.main">₹{(selectedRecord.totalCTC || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total Bonus Amount</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.totalBonusAmount || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total Perk Amount</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.totalPerkAmount || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Regular Salary</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.regularSalary || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Basic Salary</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.earnings?.basicSalary || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">HRA (House Rent Allowance)</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.earnings?.hra || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Conveyance Allowance</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.earnings?.conveyanceAllowance || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Special Allowance</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.earnings?.specialAllowance || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #4caf50' }}>
                  <Typography variant="caption" color="text.secondary">Gross(A)</Typography>
                  <Typography variant="body1" fontWeight="700" color="success.dark">₹{(selectedRecord.grossSalaryA || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #4caf50' }}>
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                  <Typography variant="body1" fontWeight="700" color="success.dark">₹{(selectedRecord.total || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>

              {/* Deductions Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="700" color="error.main" gutterBottom>
                  Deductions
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">PF - Employee</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.deductions?.providentFund || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">PF - Employer</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.deductions?.pfEmployer || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">PF - Other Charges</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.deductions?.pfOtherCharges || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Health Insurance</Typography>
                  <Typography variant="body1" fontWeight="600">₹{(selectedRecord.deductions?.healthInsurance || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>

              {/* Summary Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
                  Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Gross Salary</Typography>
                  <Typography variant="h5" fontWeight="700" color="primary.main">₹{(selectedRecord.grossSalary || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total Deductions</Typography>
                  <Typography variant="h5" fontWeight="700" color="error.main">₹{(selectedRecord.totalDeductions || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Net Salary (Take Home)</Typography>
                  <Typography variant="h5" fontWeight="700" color="success.main">₹{(selectedRecord.netSalary || 0).toLocaleString()}</Typography>
                </Paper>
              </Grid>

              {/* Payment Status */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={selectedRecord.paymentStatus?.toUpperCase()}
                      color={getStatusColor(selectedRecord.paymentStatus)}
                      sx={{ fontWeight: '700', fontSize: '0.875rem' }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            variant="outlined"
            onClick={() => setOpenDetailsDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenDetailsDialog(false);
              handleOpenDialog(selectedRecord);
            }}
            startIcon={<EditIcon />}
            sx={{ borderRadius: 2 }}
          >
            Edit Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryManagement;

