import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import IsolatedAddressForm from '../../components/IsolatedAddressForm';
import IsolatedTextField from '../../components/IsolatedTextField';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Person as PersonIcon,
  School as EducationIcon,
  Work as WorkIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';

// Create a dedicated axios instance for candidate portal
const candidateApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

const CandidatePortal = () => {
  console.log('🚀 CandidatePortal component is rendering!');
  
  // Add debugging to find what's causing re-renders
  const prevProps = useRef();
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if hooks are causing re-renders
  const prevHooks = useRef({});
  const currentHooks = {
    candidateId,
    navigate: navigate.toString(),
  };
  
  if (prevHooks.current.candidateId !== undefined) {
    console.log('🔍 candidateId changed?', prevHooks.current.candidateId !== candidateId);
    console.log('🔍 navigate changed?', prevHooks.current.navigate !== navigate.toString());
  }
  prevHooks.current = currentHooks;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => {
    // Check if user was previously authenticated
    const savedAuth = localStorage.getItem(`candidate_auth_${candidateId}`);
    return savedAuth ? JSON.parse(savedAuth).authenticated : false;
  });
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Define steps array
  const steps = [
    { label: 'Personal & Employment Details', icon: <PersonIcon /> },
    { label: 'Address & Emergency Contacts', icon: <PersonIcon /> },
    { label: 'Bank & Government Details', icon: <PersonIcon /> },
    { label: 'Education & Experience', icon: <EducationIcon /> },
    { label: 'Review & Submit', icon: <CheckIcon /> }
  ];

  // Handle URL step parameter
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 0 && stepNumber < steps.length) {
        setActiveStep(stepNumber);
      }
    }
  }, [searchParams, steps.length]);

  // Load saved data on component mount if already authenticated
  useEffect(() => {
    const loadSavedData = async () => {
      if (authenticated && candidateId) {
        try {
          console.log('🔄 Loading saved data for authenticated user:', candidateId);
          setLoading(true);
          
          // Always load from server first to get the latest data (including permanent image URLs)
          console.log('📊 Loading latest data from server...');
            const response = await candidateApi.get(`candidate-portal/${candidateId}/status`);
            if (response.data.success && response.data.candidatePortal) {
              const serverData = response.data.candidatePortal;
              console.log('📊 Server data received:', serverData);
              
              // Process server data and load it
              const processedServerData = {
                personalInfo: {
                  // Map from server data structure to client expected structure
                  fullName: serverData.personalInfo?.firstName && serverData.personalInfo?.lastName 
                    ? `${serverData.personalInfo.firstName} ${serverData.personalInfo.lastName}`.trim()
                    : (serverData.personalInfo?.fullName || ''),
                  email: serverData.personalInfo?.email || '',
                  mobileNumber: serverData.personalInfo?.phone || serverData.personalInfo?.mobileNumber || '',
                  alternatePhone: serverData.personalInfo?.alternatePhone || '',
                  employeeDOB: serverData.personalInfo?.dateOfBirth ? moment(serverData.personalInfo.dateOfBirth) : 
                    (serverData.personalInfo?.employeeDOB ? moment(serverData.personalInfo.employeeDOB) : null),
                  dateOfJoining: serverData.personalInfo?.dateOfJoining ? moment(serverData.personalInfo.dateOfJoining) : null,
                  gender: serverData.personalInfo?.gender || '',
                  maritalStatus: serverData.personalInfo?.maritalStatus || '',
                  nationality: serverData.personalInfo?.nationality || '',
                  aadhaarNumber: serverData.personalInfo?.aadharNumber || serverData.personalInfo?.aadhaarNumber || '',
                  panNumber: serverData.personalInfo?.panNumber || '',
                  designation: serverData.additionalInfo?.designation || serverData.personalInfo?.designation || '',
                  department: serverData.additionalInfo?.department || serverData.personalInfo?.department || '',
                  dobAsPerAadhaar: serverData.personalInfo?.dobAsPerAadhaar ? moment(serverData.personalInfo.dobAsPerAadhaar) : null,
                  fatherName: serverData.personalInfo?.fatherName || '',
                  personalEmailId: serverData.personalInfo?.personalEmailId || '',
                  officialEmailId: serverData.personalInfo?.officialEmailId || '',
                  bloodGroup: serverData.personalInfo?.bloodGroup || '',
                  employeeCode: serverData.personalInfo?.employeeCode || candidateId,
                  employmentStatus: serverData.personalInfo?.employmentStatus || 'permanent',
                  profilePhoto: serverData.personalInfo?.profilePhoto ? {
                    ...serverData.personalInfo.profilePhoto,
                    url: serverData.personalInfo.profilePhoto.url?.startsWith('/uploads') 
                      ? `http://localhost:5001${serverData.personalInfo.profilePhoto.url}`
                      : serverData.personalInfo.profilePhoto.url
                  } : null
                },
                addressInfo: {
                  currentAddress: serverData.addressInfo?.currentAddress || {},
                  permanentAddress: serverData.addressInfo?.permanentAddress || {}
                },
                emergencyContacts: serverData.emergencyContacts || [],
                bankDetails: serverData.bankDetails || [],
                educationQualifications: serverData.educationQualifications || [],
                workExperience: {
                  totalExperience: serverData.workExperience?.totalExperience || '',
                  experienceDetails: serverData.workExperience?.experienceDetails?.map(exp => ({
                    ...exp,
                    startDate: exp.startDate ? moment(exp.startDate) : null,
                    endDate: exp.endDate ? moment(exp.endDate) : null
                  })) || []
                },
                governmentDocuments: serverData.governmentDocuments ? {
                  aadhaarImage: serverData.governmentDocuments.aadhaarImage ? {
                    ...serverData.governmentDocuments.aadhaarImage,
                    url: serverData.governmentDocuments.aadhaarImage.url?.startsWith('/uploads') 
                      ? `http://localhost:5001${serverData.governmentDocuments.aadhaarImage.url}`
                      : serverData.governmentDocuments.aadhaarImage.url
                  } : null,
                  panImage: serverData.governmentDocuments.panImage ? {
                    ...serverData.governmentDocuments.panImage,
                    url: serverData.governmentDocuments.panImage.url?.startsWith('/uploads') 
                      ? `http://localhost:5001${serverData.governmentDocuments.panImage.url}`
                      : serverData.governmentDocuments.panImage.url
                  } : null
                } : {},
                bankDocuments: serverData.bankDocuments ? {
                  cancelledCheque: serverData.bankDocuments.cancelledCheque ? {
                    ...serverData.bankDocuments.cancelledCheque,
                    url: serverData.bankDocuments.cancelledCheque.url?.startsWith('/uploads') 
                      ? `http://localhost:5001${serverData.bankDocuments.cancelledCheque.url}`
                      : serverData.bankDocuments.cancelledCheque.url
                  } : null,
                  passbook: serverData.bankDocuments.passbook ? {
                    ...serverData.bankDocuments.passbook,
                    url: serverData.bankDocuments.passbook.url?.startsWith('/uploads') 
                      ? `http://localhost:5001${serverData.bankDocuments.passbook.url}`
                      : serverData.bankDocuments.passbook.url
                  } : null,
                  bankStatement: serverData.bankDocuments.bankStatement ? {
                    ...serverData.bankDocuments.bankStatement,
                    url: serverData.bankDocuments.bankStatement.url?.startsWith('/uploads') 
                      ? `http://localhost:5001${serverData.bankDocuments.bankStatement.url}`
                      : serverData.bankDocuments.bankStatement.url
                  } : null
                } : {},
                additionalInfo: serverData.additionalInfo || {},
                uploadedDocuments: serverData.uploadedDocuments || []
              };
              
              setCandidateData(processedServerData);
              console.log('✅ Data loaded from server with permanent URLs');
              toast.info('Latest data loaded from server');
              
              // Update localStorage with the latest server data
              localStorage.setItem(`candidate_data_${candidateId}`, JSON.stringify(processedServerData));
              
            } else {
              // If server doesn't have data, try localStorage as fallback
              console.log('📊 Server has no data, trying localStorage as fallback...');
          const savedData = localStorage.getItem(`candidate_data_${candidateId}`);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
                console.log('📊 Loading fallback data from localStorage:', parsedData);
            
                // Convert localStorage data to the format expected by the form
            const processedData = {
              ...parsedData,
              personalInfo: {
                ...parsedData.personalInfo,
                employeeDOB: parsedData.personalInfo?.employeeDOB ? moment(parsedData.personalInfo.employeeDOB) : null,
                dateOfJoining: parsedData.personalInfo?.dateOfJoining ? moment(parsedData.personalInfo.dateOfJoining) : null,
                dobAsPerAadhaar: parsedData.personalInfo?.dobAsPerAadhaar ? moment(parsedData.personalInfo.dobAsPerAadhaar) : null
              },
              workExperience: {
                ...parsedData.workExperience,
                experienceDetails: parsedData.workExperience?.experienceDetails?.map(exp => ({
                  ...exp,
                  startDate: exp.startDate ? moment(exp.startDate) : null,
                  endDate: exp.endDate ? moment(exp.endDate) : null
                })) || []
              }
            };
            
            setCandidateData(processedData);
                console.log('✅ Fallback data loaded from localStorage');
                toast.info('Data loaded from local storage');
              } else {
                console.log('❌ No data available anywhere');
                toast.info('No saved data found');
              }
          }
          
        } catch (error) {
          console.error('❌ Error loading saved data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSavedData();
  }, [authenticated, candidateId]);
  
  // Authentication state - initialize once with candidateId
  const [credentials, setCredentials] = useState(() => ({
    candidateId: candidateId || '',
    password: ''
  }));

  // Candidate data state
  const [candidateData, setCandidateData] = useState({
    personalInfo: {
      email: '',
      employeeCode: '',
      fullName: '',
      fatherName: '',
      designation: '',
      department: '',
      gender: '',
      maritalStatus: '',
      mobileNumber: '',
      personalEmailId: '',
      officialEmailId: '',
      bloodGroup: '',
      employeeDOB: null,
      dateOfJoining: null,
      dobAsPerAadhaar: null,
      employmentStatus: '',
      panNumber: '',
      aadhaarNumber: '',
      nationality: 'Indian',
      profilePhoto: null
    },
    addressInfo: {
      currentAddress: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      permanentAddress: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        sameAsPresent: false
      }
    },
    emergencyContacts: [{
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: ''
    }],
    bankDetails: [{
      ifscCode: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      branch: '',
      pfEligible: '',
      uanNumber: '',
      isPrimary: true
    }],
    educationQualifications: [],
    workExperience: {
      totalExperience: '',
      experienceDetails: []
    },
    additionalInfo: {
      skills: '',
      languages: '',
      references: ''
    },
    governmentDocuments: {
      aadhaarImage: null,
      panImage: null
    },
    bankDocuments: {
      cancelledCheque: null,
      passbook: null,
      bankStatement: null
    },
    uploadedDocuments: []
  });

  console.log('📊 candidateData.addressInfo:', candidateData.addressInfo);
  console.log('📊 currentAddress:', candidateData.addressInfo?.currentAddress);
  console.log('📊 permanentAddress:', candidateData.addressInfo?.permanentAddress);

  // Dialog states
  const [educationDialog, setEducationDialog] = useState({ open: false, data: null, index: -1 });
  const [workDialog, setWorkDialog] = useState({ open: false, data: null, index: -1 });
  const [emergencyDialog, setEmergencyDialog] = useState({ open: false, data: null, index: -1 });
  const [bankDialog, setBankDialog] = useState({ open: false, data: null, index: -1 });

  // Dialog form states
  const [educationForm, setEducationForm] = useState({
    educationLevel: '',
    degree: '',
    institution: '',
    yearOfPassing: '',
    percentage: '',
    specialization: '',
    documents: []
  });

  const [workForm, setWorkForm] = useState({
    company: '',
    position: '',
    startDate: null,
    endDate: null,
    salary: '',
    reasonForLeaving: '',
    documents: {
      experienceLetters: [],
      relievingCertificate: [],
      salarySlips: []
    }
  });

  // Remove all complex memoized components - they were causing re-renders

  // Simple handlers without complex logic
  const handlePersonalInfoChange = (field) => (e) => {
    const value = e.target.value;
    setCandidateData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handlePersonalInfoDateChange = (field) => (date) => {
    setCandidateData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: date }
    }));
  };

  const handleAddressChange = (addressType, field) => (e) => {
    const value = e.target.value;
    setCandidateData(prev => ({
      ...prev,
      addressInfo: {
        ...prev.addressInfo,
        [addressType]: { ...prev.addressInfo[addressType], [field]: value }
      }
    }));
  };

  const handlePresentAddressChange = (field) => (e) => {
    const value = e.target.value;
    setCandidateData(prev => ({
      ...prev,
      addressInfo: {
        ...prev.addressInfo,
        currentAddress: { ...prev.addressInfo.currentAddress, [field]: value }
      }
    }));
  };

  const handlePermanentAddressChange = (field) => (e) => {
    const value = e.target.value;
    setCandidateData(prev => ({
      ...prev,
      addressInfo: {
        ...prev.addressInfo,
        permanentAddress: { ...prev.addressInfo.permanentAddress, [field]: value }
      }
    }));
  };

  const handleEmergencyContactChange = (field) => (e) => {
    const value = e.target.value;
    setCandidateData(prev => ({
      ...prev,
      emergencyContacts: [{
        ...prev.emergencyContacts[0],
        [field]: value
      }]
    }));
  };

  const handleBankDetailsChange = (index, field) => (e) => {
    const value = e.target.value;
    setCandidateData(prev => ({
      ...prev,
      bankDetails: (Array.isArray(prev.bankDetails) ? prev.bankDetails : []).map((bank, i) => 
        i === index ? { ...bank, [field]: value } : bank
      )
    }));
  };

  const addBankDetail = () => {
    setCandidateData(prev => ({
      ...prev,
      bankDetails: [...(Array.isArray(prev.bankDetails) ? prev.bankDetails : []), {
        ifscCode: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        branch: '',
        pfEligible: '',
        uanNumber: '',
        isPrimary: false
      }]
    }));
  };

  const removeBankDetail = (index) => {
    setCandidateData(prev => ({
      ...prev,
      bankDetails: (Array.isArray(prev.bankDetails) ? prev.bankDetails : []).filter((_, i) => i !== index)
    }));
  };

  const setPrimaryBank = (index) => {
    setCandidateData(prev => ({
      ...prev,
      bankDetails: (Array.isArray(prev.bankDetails) ? prev.bankDetails : []).map((bank, i) => ({
        ...bank,
        isPrimary: i === index
      }))
    }));
  };

  // Education dialog handlers
  const handleEducationFormChange = (field) => (e) => {
    const value = e.target.value;
    setEducationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEducationFormDateChange = (field) => (date) => {
    setEducationForm(prev => ({ ...prev, [field]: date }));
  };

  const saveEducation = async () => {
    let updatedData;
    if (educationDialog.index === -1) {
      // Add new education
      updatedData = {
        ...candidateData,
        educationQualifications: [...(candidateData.educationQualifications || []), { ...educationForm }]
      };
      setCandidateData(updatedData);
    } else {
      // Edit existing education
      updatedData = {
        ...candidateData,
        educationQualifications: candidateData.educationQualifications.map((edu, index) => 
          index === educationDialog.index ? { ...educationForm } : edu
        )
      };
      setCandidateData(updatedData);
    }
    
    setEducationDialog({ open: false, data: null, index: -1 });
    setEducationForm({
      educationLevel: '',
      degree: '',
      institution: '',
      yearOfPassing: '',
      percentage: '',
      specialization: '',
      documents: []
    });

        // Auto-save to backend
        try {
          console.log('💾 Saving education data:', updatedData);
          
          // Ensure profilePhoto is preserved in personalInfo before saving
          const dataToSave = {
            ...updatedData,
            personalInfo: {
              ...updatedData.personalInfo,
              // Preserve profilePhoto if it exists
              ...(updatedData.personalInfo?.profilePhoto && { profilePhoto: updatedData.personalInfo.profilePhoto })
            }
          };
          
          const response = await candidateApi.put(`candidate-portal/${candidateId}/save`, dataToSave);
          console.log('✅ Education save response:', response.data);
          toast.success('Education details saved successfully');
        } catch (error) {
          console.error('❌ Failed to save education:', error);
          console.error('❌ Error response:', error.response?.data);
          toast.error('Failed to save education details');
        }
  };

  const openEducationDialog = (data = null, index = -1) => {
    if (data) {
      setEducationForm({
        ...data,
        documents: data.documents || []
      });
    } else {
      setEducationForm({
        educationLevel: '',
        degree: '',
        institution: '',
        yearOfPassing: '',
        percentage: '',
        specialization: '',
        documents: []
      });
    }
    setEducationDialog({ open: true, data, index });
  };

  // Work experience dialog handlers
  const handleWorkFormChange = (field) => (e) => {
    const value = e.target.value;
    setWorkForm(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkFormDateChange = (field) => (date) => {
    setWorkForm(prev => ({ ...prev, [field]: date }));
  };

  const saveWorkExperience = async () => {
    let updatedData;
    if (workDialog.index === -1) {
      // Add new work experience
      updatedData = {
        ...candidateData,
        workExperience: {
          ...candidateData.workExperience,
          experienceDetails: [...(candidateData.workExperience?.experienceDetails || []), { ...workForm }]
        }
      };
      setCandidateData(updatedData);
    } else {
      // Edit existing work experience
      updatedData = {
        ...candidateData,
        workExperience: {
          ...candidateData.workExperience,
          experienceDetails: candidateData.workExperience.experienceDetails.map((work, index) => 
            index === workDialog.index ? { ...workForm } : work
          )
        }
      };
      setCandidateData(updatedData);
    }
    
    setWorkDialog({ open: false, data: null, index: -1 });
    setWorkForm({
      company: '',
      position: '',
      startDate: null,
      endDate: null,
      salary: '',
      reasonForLeaving: '',
      documents: {
        experienceLetters: [],
        relievingCertificate: [],
        salarySlips: []
      }
    });

        // Auto-save to backend
        try {
          console.log('💾 Saving work experience data:', updatedData);
          
          // Ensure profilePhoto is preserved in personalInfo before saving
          const dataToSave = {
            ...updatedData,
            personalInfo: {
              ...updatedData.personalInfo,
              // Preserve profilePhoto if it exists
              ...(updatedData.personalInfo?.profilePhoto && { profilePhoto: updatedData.personalInfo.profilePhoto })
            }
          };
          
          const response = await candidateApi.put(`candidate-portal/${candidateId}/save`, dataToSave);
          console.log('✅ Work experience save response:', response.data);
          toast.success('Work experience saved successfully');
        } catch (error) {
          console.error('❌ Failed to save work experience:', error);
          console.error('❌ Error response:', error.response?.data);
          toast.error('Failed to save work experience');
        }
  };

  const openWorkDialog = (data = null, index = -1) => {
    if (data) {
      setWorkForm({
        ...data,
        documents: data.documents || {
          experienceLetters: [],
          relievingCertificate: [],
          salarySlips: []
        }
      });
    } else {
      setWorkForm({
        company: '',
        position: '',
        startDate: null,
        endDate: null,
        salary: '',
        reasonForLeaving: '',
        documents: {
          experienceLetters: [],
          relievingCertificate: [],
          salarySlips: []
        }
      });
    }
    setWorkDialog({ open: true, data, index });
  };

  const handleWorkExperienceChange = (field) => (e) => {
    const value = e.target.value;
    setCandidateData(prev => ({
      ...prev,
      workExperience: { ...prev.workExperience, [field]: value }
    }));
  };

  // Document upload handlers
  const handleEducationDocumentUpload = (file) => {
    const newDocument = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploaded'
    };
    setEducationForm(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDocument]
    }));
    toast.success(`${file.name} uploaded successfully!`);
  };

  const handleWorkDocumentUpload = (file, documentType) => {
    const newDocument = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploaded',
      type: documentType
    };
    setWorkForm(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: [...(prev.documents?.[documentType] || []), newDocument]
      }
    }));
    toast.success(`${file.name} uploaded successfully!`);
  };

  const removeEducationDocument = (docId) => {
    setEducationForm(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(doc => doc.id !== docId)
    }));
  };

  const removeWorkDocument = (docId, documentType) => {
    setWorkForm(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: (prev.documents?.[documentType] || []).filter(doc => doc.id !== docId)
      }
    }));
  };

  // Image upload handlers
  const handleImageUpload = async (file, imageType, section) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', imageType);
      formData.append('section', section);

      // Show loading toast
      const loadingToastId = toast.loading(`Uploading ${file.name}...`);

      // Upload to server
      const response = await candidateApi.post(`candidate-portal/${candidateId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const imageData = {
          ...response.data.imageData,
          // Convert relative URL to absolute URL for immediate display
          url: response.data.imageData.url.startsWith('/uploads') 
            ? `http://localhost:5001${response.data.imageData.url}`
            : response.data.imageData.url
        };
        
        // Update the appropriate section in state
        if (section === 'personal' && imageType === 'profilePhoto') {
          setCandidateData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, profilePhoto: imageData }
          }));
        } else if (section === 'government') {
          setCandidateData(prev => ({
            ...prev,
            governmentDocuments: { ...prev.governmentDocuments, [imageType]: imageData }
          }));
        } else if (section === 'bank') {
          setCandidateData(prev => ({
            ...prev,
            bankDocuments: { ...prev.bankDocuments, [imageType]: imageData }
          }));
        }

        // Dismiss loading toast and show success
        toast.dismiss(loadingToastId);
        toast.success(`${file.name} uploaded successfully!`);
        
        // Update localStorage
        const updatedData = { ...candidateData };
        if (section === 'personal') {
          if (!updatedData.personalInfo) updatedData.personalInfo = {};
          updatedData.personalInfo.profilePhoto = imageData;
        } else if (section === 'government') {
          if (!updatedData.governmentDocuments) updatedData.governmentDocuments = {};
          updatedData.governmentDocuments[imageType] = imageData;
        } else if (section === 'bank') {
          if (!updatedData.bankDocuments) updatedData.bankDocuments = {};
          updatedData.bankDocuments[imageType] = imageData;
        }
        localStorage.setItem('candidateData', JSON.stringify(updatedData));
        
      } else {
        toast.dismiss(loadingToastId);
        toast.error(response.data.message || 'Failed to upload image');
      }
      
    } catch (error) {
      console.error('❌ Image upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleImageFileChange = (imageType, section) => (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - allow PDF for bank statements
      const allowedTypes = imageType === 'bankStatement' 
        ? ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
        : ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        const fileTypeMessage = imageType === 'bankStatement' 
          ? 'Please upload only JPG, PNG, or PDF files'
          : 'Please upload only JPG or PNG images';
        toast.error(fileTypeMessage);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const sizeMessage = imageType === 'bankStatement' 
          ? 'File size should be less than 5MB'
          : 'Image size should be less than 5MB';
        toast.error(sizeMessage);
        return;
      }
      
      handleImageUpload(file, imageType, section);
    }
  };

  // Memoized textarea that won't re-render when parent re-renders
  const MemoizedTextArea = React.memo(({ label, value, onChange, required, rows = 3 }) => {
    console.log('🎨 MemoizedTextArea render for:', label, 'with value:', value?.substring(0, 10) + '...');
    
    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px',
          color: '#1976d2',
          fontWeight: 500
        }}>
          {label}
        </label>
        <textarea
          value={value || ''}
          onChange={onChange}
          required={required}
          rows={rows}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            console.log('🎯 FOCUS gained on:', label);
            e.target.style.borderColor = '#1976d2';
            e.target.style.boxShadow = '0 0 0 2px rgba(25, 118, 210, 0.2)';
          }}
          onBlur={(e) => {
            console.log('🎯 FOCUS lost on:', label);
            e.target.style.borderColor = '#ccc';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    );
  });

  // Remove the useEffect that was causing re-renders
  // candidateId is now initialized once in useState

  // Authentication
  const handleLogin = async (e) => {
    console.log('🔐 Form submitted!', e);
    e.preventDefault();
    setLoading(true);
    console.log('🔑 Attempting authentication with:', credentials);
    try {
      const response = await candidateApi.post('candidate-portal/authenticate', credentials);
      console.log('Authentication response:', response.data);
      if (response.data.success) {
        setAuthenticated(true);
        
        // Save authentication state to localStorage
        localStorage.setItem(`candidate_auth_${candidateId}`, JSON.stringify({
          authenticated: true,
          authenticatedAt: new Date().toISOString()
        }));
        
        // Merge the auto-filled data with existing state
        const autoFilledData = response.data.candidateData || {};
        
        // Convert date strings to Moment objects for DatePicker compatibility
        const processedAutoFilledData = {
          ...autoFilledData,
          personalInfo: {
            ...autoFilledData.personalInfo,
            // Convert date strings to Moment objects
            employeeDOB: autoFilledData.personalInfo?.employeeDOB ? moment(autoFilledData.personalInfo.employeeDOB) : null,
            dateOfJoining: autoFilledData.personalInfo?.dateOfJoining ? moment(autoFilledData.personalInfo.dateOfJoining) : null,
            dobAsPerAadhaar: autoFilledData.personalInfo?.dobAsPerAadhaar ? moment(autoFilledData.personalInfo.dobAsPerAadhaar) : null
          },
          workExperience: {
            ...autoFilledData.workExperience,
            experienceDetails: autoFilledData.workExperience?.experienceDetails?.map(exp => ({
              ...exp,
              startDate: exp.startDate ? moment(exp.startDate) : null,
              endDate: exp.endDate ? moment(exp.endDate) : null
            })) || []
          }
        };
        
        console.log('🔍 Loading candidate data from backend:', processedAutoFilledData);
        
        const updatedCandidateData = {
          ...candidateData,
          ...processedAutoFilledData,
          // Ensure nested objects are properly merged
          personalInfo: {
            ...candidateData.personalInfo,
            ...processedAutoFilledData.personalInfo
          },
          addressInfo: {
            ...candidateData.addressInfo,
            ...processedAutoFilledData.addressInfo,
            currentAddress: {
              ...candidateData.addressInfo.currentAddress,
              ...processedAutoFilledData.addressInfo?.currentAddress
            },
            permanentAddress: {
              ...candidateData.addressInfo.permanentAddress,
              ...processedAutoFilledData.addressInfo?.permanentAddress
            }
          },
          bankDetails: Array.isArray(processedAutoFilledData.bankDetails) 
            ? processedAutoFilledData.bankDetails 
            : (Array.isArray(candidateData.bankDetails) ? candidateData.bankDetails : []),
          additionalInfo: {
            ...candidateData.additionalInfo,
            ...processedAutoFilledData.additionalInfo
          },
          uploadedDocuments: Array.isArray(processedAutoFilledData.uploadedDocuments) 
            ? processedAutoFilledData.uploadedDocuments 
            : (Array.isArray(candidateData.uploadedDocuments) ? candidateData.uploadedDocuments : [])
        };
        
        setCandidateData(updatedCandidateData);
        
        // Save data to localStorage for persistence
        localStorage.setItem(`candidate_data_${candidateId}`, JSON.stringify(autoFilledData));
        
        toast.success('Welcome to your onboarding portal! Your information has been pre-filled.');
      } else {
        toast.error(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save progress
  const saveProgress = async () => {
    setSaving(true);
    try {
      // Ensure profilePhoto is preserved in personalInfo before saving
      const dataToSave = {
        ...candidateData,
        personalInfo: {
          ...candidateData.personalInfo,
          // Preserve profilePhoto if it exists
          ...(candidateData.personalInfo?.profilePhoto && { profilePhoto: candidateData.personalInfo.profilePhoto })
        }
      };
      
      await candidateApi.put(`candidate-portal/${candidateId}/save`, dataToSave);
      
      // Also save to localStorage for immediate persistence
      localStorage.setItem(`candidate_data_${candidateId}`, JSON.stringify(candidateData));
      
      toast.success('Progress saved successfully');
    } catch (error) {
      console.error('Save progress error:', error);
      toast.error('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  // Submit final data
  const submitData = async () => {
    setSaving(true);
    try {
      const response = await candidateApi.post(`candidate-portal/${candidateId}/submit`, candidateData);
      const isResubmission = response.data.isResubmission;
      
      toast.success(
        isResubmission 
          ? 'Information updated successfully! HR will review your updated details.'
          : 'Information submitted successfully! HR will review your details.'
      );
      
      // Don't clear localStorage immediately - let user see their data
      // localStorage.removeItem(`candidate_auth_${candidateId}`);
      // localStorage.removeItem(`candidate_data_${candidateId}`);
      
      setTimeout(() => {
        navigate('/submission-success');
      }, 2000);
    } catch (error) {
      console.error('❌ Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit information');
    } finally {
      setSaving(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem(`candidate_auth_${candidateId}`);
    localStorage.removeItem(`candidate_data_${candidateId}`);
    setCandidateData({
      personalInfo: {
        email: '',
        employeeCode: '',
        fullName: '',
        fatherName: '',
        designation: '',
        department: '',
        gender: '',
        maritalStatus: '',
        mobileNumber: '',
        personalEmailId: '',
        officialEmailId: '',
        bloodGroup: '',
        employeeDOB: null,
        dateOfJoining: null,
        dobAsPerAadhaar: null,
        employmentStatus: '',
        panNumber: '',
        aadhaarNumber: '',
        nationality: 'Indian'
      },
      addressInfo: {
        currentAddress: {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        permanentAddress: {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          sameAsPresent: false
        }
      },
      emergencyContacts: [{
        name: '',
        relationship: '',
        phone: '',
        email: '',
        address: ''
      }],
      bankDetails: [{
        ifscCode: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        branch: '',
        pfEligible: '',
        uanNumber: '',
        isPrimary: true
      }],
      educationQualifications: [],
      workExperience: {
        totalExperience: '',
        experienceDetails: []
      },
      additionalInfo: {
        skills: '',
        languages: '',
        references: ''
      },
      uploadedDocuments: []
    });
    toast.success('Logged out successfully');
  };

  // Helper function to check if a field is auto-filled
  const isAutoFilled = (fieldPath) => {
    const value = fieldPath.split('.').reduce((obj, key) => obj?.[key], candidateData);
    return value && value !== '' && value !== null;
  };

  // Helper component for auto-filled field indicator
  const AutoFillIndicator = ({ isFilled, children }) => (
    <Box sx={{ position: 'relative' }}>
      {children}
      {isFilled && (
        <Chip
          label="Pre-filled"
          size="small"
          color="success"
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            fontSize: '0.7rem',
            height: 20
          }}
        />
      )}
    </Box>
  );

  // Step 1: Personal & Employment Details Form
  const PersonalEmploymentForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Personal Information
          <Chip 
            label="Auto-filled from your profile" 
            color="info" 
            size="small" 
            sx={{ ml: 2, fontSize: '0.7rem' }}
          />
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.email')}>
          <IsolatedTextField
            label="Email *"
            type="email"
            initialValue={candidateData.personalInfo.email}
            onSave={(value) => setCandidateData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, email: value }
            }))}
            required
          />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.employeeCode')}>
          <IsolatedTextField
            label="Employee Code"
            initialValue={candidateData.personalInfo.employeeCode}
            onSave={(value) => setCandidateData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, employeeCode: value }
            }))}
          />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.fullName')}>
          <IsolatedTextField
            label="Full Name *"
            initialValue={candidateData.personalInfo.fullName}
            onSave={(value) => setCandidateData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, fullName: value }
            }))}
            required
          />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Father's Name *"
          initialValue={candidateData.personalInfo.fatherName}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, fatherName: value }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.mobileNumber')}>
          <IsolatedTextField
            label="Mobile Number *"
            initialValue={candidateData.personalInfo.mobileNumber}
            onSave={(value) => setCandidateData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, mobileNumber: value }
            }))}
            required
          />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Personal Email ID"
          type="email"
          initialValue={candidateData.personalInfo.personalEmailId}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, personalEmailId: value }
          }))}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Official Email ID"
          type="email"
          initialValue={candidateData.personalInfo.officialEmailId}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, officialEmailId: value }
          }))}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.gender')}>
          <FormControl fullWidth required>
            <InputLabel>Gender *</InputLabel>
            <Select
              value={candidateData.personalInfo.gender || ''}
              onChange={handlePersonalInfoChange('gender')}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.maritalStatus')}>
          <FormControl fullWidth>
            <InputLabel>Marital Status</InputLabel>
            <Select
              value={candidateData.personalInfo.maritalStatus || ''}
              onChange={handlePersonalInfoChange('maritalStatus')}
            >
              <MenuItem value="single">Single</MenuItem>
              <MenuItem value="married">Married</MenuItem>
              <MenuItem value="divorced">Divorced</MenuItem>
              <MenuItem value="widowed">Widowed</MenuItem>
            </Select>
          </FormControl>
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Blood Group</InputLabel>
          <Select
            value={candidateData.personalInfo.bloodGroup || ''}
            onChange={handlePersonalInfoChange('bloodGroup')}
          >
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Employment Details */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Employment Details</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.designation')}>
          <IsolatedTextField
            label="Designation *"
            initialValue={candidateData.personalInfo.designation}
            onSave={(value) => setCandidateData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, designation: value }
            }))}
            required
          />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.department')}>
          <IsolatedTextField
            label="Department *"
            initialValue={candidateData.personalInfo.department}
            onSave={(value) => setCandidateData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, department: value }
            }))}
            required
          />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.employeeDOB')}>
        <DatePicker
          label="Employee Date of Birth *"
          value={candidateData.personalInfo.employeeDOB}
          onChange={handlePersonalInfoDateChange('employeeDOB')}
          slots={{ textField: TextField }}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <AutoFillIndicator isFilled={isAutoFilled('personalInfo.dateOfJoining')}>
        <DatePicker
          label="Date of Joining *"
          value={candidateData.personalInfo.dateOfJoining}
          onChange={handlePersonalInfoDateChange('dateOfJoining')}
          slots={{ textField: TextField }}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
        </AutoFillIndicator>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Employment Status *</InputLabel>
          <Select
            value={candidateData.personalInfo.employmentStatus || ''}
            onChange={handlePersonalInfoChange('employmentStatus')}
          >
            <MenuItem value="permanent">Permanent</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
            <MenuItem value="intern">Intern</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Passport Photo Upload Section */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          Passport Size Photo
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Profile Photo *
          </Typography>
          
          {candidateData.personalInfo?.profilePhoto ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <img 
                src={candidateData.personalInfo.profilePhoto.url} 
                alt="Profile Photo"
                style={{ 
                  width: 80, 
                  height: 100, 
                  objectFit: 'cover', 
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.profilePhoto.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(candidateData.personalInfo.profilePhoto.size / 1024).toFixed(1)} KB
                </Typography>
                <br />
                <Chip 
                  label="UPLOADED" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please upload your passport size photo
            </Alert>
          )}

          <input
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            id="profile-photo-upload"
            type="file"
            onChange={handleImageFileChange('profilePhoto', 'personal')}
          />
          <label htmlFor="profile-photo-upload">
            <Button
              variant={candidateData.personalInfo?.profilePhoto ? 'outlined' : 'contained'}
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              color={candidateData.personalInfo?.profilePhoto ? 'success' : 'primary'}
            >
              {candidateData.personalInfo?.profilePhoto ? 'Replace Photo' : 'Upload Photo'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, PNG (Max size: 5MB)
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  // Step 2: Address & Emergency Contacts Form
  const AddressEmergencyForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Present Address</Typography>
      </Grid>
      
      <Grid item xs={12}>
        <IsolatedAddressForm 
          initialValue={candidateData.addressInfo?.currentAddress?.street || ''}
          onSave={(value) => {
            console.log('💾 Saving present address:', value);
            setCandidateData(prev => ({
              ...prev,
              addressInfo: {
                ...prev.addressInfo,
                currentAddress: { ...prev.addressInfo.currentAddress, street: value }
              }
            }));
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="City *"
          initialValue={candidateData.addressInfo?.currentAddress?.city || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              currentAddress: { ...prev.addressInfo.currentAddress, city: value }
            }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="State *"
          initialValue={candidateData.addressInfo?.currentAddress?.state || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              currentAddress: { ...prev.addressInfo.currentAddress, state: value }
            }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Pincode *"
          initialValue={candidateData.addressInfo?.currentAddress?.pincode || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              currentAddress: { ...prev.addressInfo.currentAddress, pincode: value }
            }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Country"
          initialValue={candidateData.addressInfo?.currentAddress?.country || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              currentAddress: { ...prev.addressInfo.currentAddress, country: value }
            }
          }))}
        />
      </Grid>

      {/* Permanent Address */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Permanent Address</Typography>
      </Grid>

      <Grid item xs={12}>
        <div>
          <label>Permanent Address *</label><br/>
          <textarea 
            rows={3} 
            style={{width: '100%', padding: '8px'}}
            defaultValue={candidateData.addressInfo?.permanentAddress?.street || ''}
            onBlur={(e) => {
              setCandidateData(prev => ({
                ...prev,
                addressInfo: {
                  ...prev.addressInfo,
                  permanentAddress: { ...prev.addressInfo.permanentAddress, street: e.target.value }
                }
              }));
            }}
          />
        </div>
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="City *"
          initialValue={candidateData.addressInfo?.permanentAddress?.city || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              permanentAddress: { ...prev.addressInfo.permanentAddress, city: value }
            }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="State *"
          initialValue={candidateData.addressInfo?.permanentAddress?.state || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              permanentAddress: { ...prev.addressInfo.permanentAddress, state: value }
            }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Pincode *"
          initialValue={candidateData.addressInfo?.permanentAddress?.pincode || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              permanentAddress: { ...prev.addressInfo.permanentAddress, pincode: value }
            }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Country"
          initialValue={candidateData.addressInfo?.permanentAddress?.country || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            addressInfo: {
              ...prev.addressInfo,
              permanentAddress: { ...prev.addressInfo.permanentAddress, country: value }
            }
          }))}
        />
      </Grid>

      {/* Emergency Contact Details */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Emergency Contact Details</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Emergency Contact Name *"
          initialValue={candidateData.emergencyContacts[0]?.name || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            emergencyContacts: [{
              ...prev.emergencyContacts[0],
              name: value
            }]
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Relationship *"
          initialValue={candidateData.emergencyContacts[0]?.relationship || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            emergencyContacts: [{
              ...prev.emergencyContacts[0],
              relationship: value
            }]
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Emergency Contact Phone *"
          initialValue={candidateData.emergencyContacts[0]?.phone || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            emergencyContacts: [{
              ...prev.emergencyContacts[0],
              phone: value
            }]
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Emergency Contact Email"
          type="email"
          initialValue={candidateData.emergencyContacts[0]?.email || ''}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            emergencyContacts: [{
              ...prev.emergencyContacts[0],
              email: value
            }]
          }))}
        />
      </Grid>

      <Grid item xs={12}>
        <div>
          <label>Emergency Contact Address</label><br/>
          <textarea 
            rows={2} 
            style={{width: '100%', padding: '8px'}}
            defaultValue={candidateData.emergencyContacts[0]?.address || ''}
            onBlur={(e) => {
              setCandidateData(prev => ({
                ...prev,
                emergencyContacts: [{
                  ...prev.emergencyContacts[0],
                  address: e.target.value
                }]
              }));
            }}
          />
        </div>
      </Grid>
    </Grid>
  );

  // Step 3: Bank & Government Details Form
  const BankGovernmentForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>Bank Details</Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addBankDetail}
            size="small"
          >
            Add Bank Account
          </Button>
        </Box>
      </Grid>

      {(Array.isArray(candidateData.bankDetails) ? candidateData.bankDetails : []).map((bank, index) => (
        <Grid item xs={12} key={index}>
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Bank Account {index + 1}
                {bank.isPrimary && (
                  <Chip label="Primary" color="primary" size="small" />
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!bank.isPrimary && (
                  <Button
                    size="small"
                    onClick={() => setPrimaryBank(index)}
                    variant="outlined"
                  >
                    Set Primary
                  </Button>
                )}
                {(Array.isArray(candidateData.bankDetails) ? candidateData.bankDetails.length : 0) > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => removeBankDetail(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <IsolatedTextField
                  label="IFSC Code *"
                  initialValue={bank.ifscCode}
                  onSave={(value) => handleBankDetailsChange(index, 'ifscCode')({ target: { value } })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <IsolatedTextField
                  label="Bank Name *"
                  initialValue={bank.bankName}
                  onSave={(value) => handleBankDetailsChange(index, 'bankName')({ target: { value } })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <IsolatedTextField
                  label="Account Number *"
                  initialValue={bank.accountNumber}
                  onSave={(value) => handleBankDetailsChange(index, 'accountNumber')({ target: { value } })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <IsolatedTextField
                  label="Account Holder Name *"
                  initialValue={bank.accountHolderName}
                  onSave={(value) => handleBankDetailsChange(index, 'accountHolderName')({ target: { value } })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <IsolatedTextField
                  label="Branch"
                  initialValue={bank.branch}
                  onSave={(value) => handleBankDetailsChange(index, 'branch')({ target: { value } })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>PF Eligible *</InputLabel>
                  <Select
                    value={bank.pfEligible || ''}
                    onChange={handleBankDetailsChange(index, 'pfEligible')}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {bank.pfEligible === 'yes' && (
                <Grid item xs={12} sm={6}>
                  <IsolatedTextField
                    label="UAN Number"
                    initialValue={bank.uanNumber}
                    onSave={(value) => handleBankDetailsChange(index, 'uanNumber')({ target: { value } })}
                  />
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>
      ))}

      {/* Government Details */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Government Details</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="PAN Number *"
          initialValue={candidateData.personalInfo.panNumber}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, panNumber: value }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Aadhaar Number *"
          initialValue={candidateData.personalInfo.aadhaarNumber}
          onSave={(value) => setCandidateData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, aadhaarNumber: value }
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <DatePicker
          label="DOB as per Aadhaar *"
          value={candidateData.personalInfo.dobAsPerAadhaar}
          onChange={handlePersonalInfoDateChange('dobAsPerAadhaar')}
          slots={{ textField: TextField }}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>

      {/* Government Document Images */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DocumentIcon />
          Government Document Images
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Aadhaar Card Image *
          </Typography>
          
          {candidateData.governmentDocuments?.aadhaarImage ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <img 
                src={candidateData.governmentDocuments.aadhaarImage.url} 
                alt="Aadhaar Card"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  maxHeight: 200,
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {candidateData.governmentDocuments.aadhaarImage.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(candidateData.governmentDocuments.aadhaarImage.size / 1024).toFixed(1)} KB
                </Typography>
                <br />
                <Chip 
                  label="UPLOADED" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please upload your Aadhaar card image
            </Alert>
          )}

          <input
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            id="aadhaar-image-upload"
            type="file"
            onChange={handleImageFileChange('aadhaarImage', 'government')}
          />
          <label htmlFor="aadhaar-image-upload">
            <Button
              variant={candidateData.governmentDocuments?.aadhaarImage ? 'outlined' : 'contained'}
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              color={candidateData.governmentDocuments?.aadhaarImage ? 'success' : 'primary'}
            >
              {candidateData.governmentDocuments?.aadhaarImage ? 'Replace Image' : 'Upload Aadhaar'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, PNG (Max size: 5MB)
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            PAN Card Image *
          </Typography>
          
          {candidateData.governmentDocuments?.panImage ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <img 
                src={candidateData.governmentDocuments.panImage.url} 
                alt="PAN Card"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  maxHeight: 200,
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {candidateData.governmentDocuments.panImage.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(candidateData.governmentDocuments.panImage.size / 1024).toFixed(1)} KB
                </Typography>
                <br />
                <Chip 
                  label="UPLOADED" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please upload your PAN card image
            </Alert>
          )}

          <input
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            id="pan-image-upload"
            type="file"
            onChange={handleImageFileChange('panImage', 'government')}
          />
          <label htmlFor="pan-image-upload">
            <Button
              variant={candidateData.governmentDocuments?.panImage ? 'outlined' : 'contained'}
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              color={candidateData.governmentDocuments?.panImage ? 'success' : 'primary'}
            >
              {candidateData.governmentDocuments?.panImage ? 'Replace Image' : 'Upload PAN'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, PNG (Max size: 5MB)
          </Typography>
        </Card>
      </Grid>

      {/* Bank Document Images */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BankIcon />
          Bank Document Images
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Cancelled Cheque *
          </Typography>
          
          {candidateData.bankDocuments?.cancelledCheque ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <img 
                src={candidateData.bankDocuments.cancelledCheque.url} 
                alt="Cancelled Cheque"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  maxHeight: 200,
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {candidateData.bankDocuments.cancelledCheque.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(candidateData.bankDocuments.cancelledCheque.size / 1024).toFixed(1)} KB
                </Typography>
                <br />
                <Chip 
                  label="UPLOADED" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please upload your cancelled cheque
            </Alert>
          )}

          <input
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            id="cancelled-cheque-upload"
            type="file"
            onChange={handleImageFileChange('cancelledCheque', 'bank')}
          />
          <label htmlFor="cancelled-cheque-upload">
            <Button
              variant={candidateData.bankDocuments?.cancelledCheque ? 'outlined' : 'contained'}
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              color={candidateData.bankDocuments?.cancelledCheque ? 'success' : 'primary'}
            >
              {candidateData.bankDocuments?.cancelledCheque ? 'Replace Image' : 'Upload Cheque'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, PNG (Max size: 5MB)
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Bank Passbook (First Page)
          </Typography>
          
          {candidateData.bankDocuments?.passbook ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <img 
                src={candidateData.bankDocuments.passbook.url} 
                alt="Bank Passbook"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  maxHeight: 200,
                  border: '1px solid #ddd',
                  borderRadius: 4
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {candidateData.bankDocuments.passbook.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(candidateData.bankDocuments.passbook.size / 1024).toFixed(1)} KB
                </Typography>
                <br />
                <Chip 
                  label="UPLOADED" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please upload your bank passbook first page
            </Alert>
          )}

          <input
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            id="passbook-upload"
            type="file"
            onChange={handleImageFileChange('passbook', 'bank')}
          />
          <label htmlFor="passbook-upload">
            <Button
              variant={candidateData.bankDocuments?.passbook ? 'outlined' : 'contained'}
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              color={candidateData.bankDocuments?.passbook ? 'success' : 'primary'}
            >
              {candidateData.bankDocuments?.passbook ? 'Replace Image' : 'Upload Passbook'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, PNG (Max size: 5MB)
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Bank Statement (Last 3 Months)
          </Typography>
          
          {candidateData.bankDocuments?.bankStatement ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {candidateData.bankDocuments.bankStatement.name?.toLowerCase().endsWith('.pdf') ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: 200,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  bgcolor: 'grey.50'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      PDF Document
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <img 
                  src={candidateData.bankDocuments.bankStatement.url} 
                  alt="Bank Statement"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto', 
                    maxHeight: 200,
                    border: '1px solid #ddd',
                    borderRadius: 4
                  }}
                />
              )}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {candidateData.bankDocuments.bankStatement.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(candidateData.bankDocuments.bankStatement.size / 1024).toFixed(1)} KB
                </Typography>
                <br />
                <Chip 
                  label="UPLOADED" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please upload your bank statement (last 3 months)
            </Alert>
          )}

          <input
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            style={{ display: 'none' }}
            id="bank-statement-upload"
            type="file"
            onChange={handleImageFileChange('bankStatement', 'bank')}
          />
          <label htmlFor="bank-statement-upload">
            <Button
              variant={candidateData.bankDocuments?.bankStatement ? 'outlined' : 'contained'}
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              color={candidateData.bankDocuments?.bankStatement ? 'success' : 'primary'}
            >
              {candidateData.bankDocuments?.bankStatement ? 'Replace Statement' : 'Upload Statement'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, PNG, PDF (Max size: 5MB)
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  // Step 4: Education & Experience Form
  const EducationExperienceForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Educational Qualifications</Typography>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">Add your educational qualifications</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openEducationDialog()}
          >
            Add Qualification
          </Button>
        </Box>

        {(candidateData.educationQualifications?.length || 0) === 0 ? (
          <Alert severity="info">No educational qualifications added yet. Click "Add Qualification" to start.</Alert>
        ) : (
          <Box>
            {(() => {
              // Group education by level
              const groupedEducation = (candidateData.educationQualifications || []).reduce((groups, edu, index) => {
                const level = edu.educationLevel || 'other';
                if (!groups[level]) {
                  groups[level] = [];
                }
                groups[level].push({ ...edu, originalIndex: index });
                return groups;
              }, {});

              // Define education level order and labels
              const levelOrder = ['10th', '12th', 'diploma', 'graduation', 'btech', 'bca', 'bcom', 'bba', 'bsc', 'ba', 'masters', 'mtech', 'mca', 'mcom', 'mba', 'msc', 'ma', 'phd', 'other'];
              const levelLabels = {
                '10th': '10th Standard',
                '12th': '12th Standard',
                'diploma': 'Diploma',
                'graduation': 'Graduation',
                'btech': 'B.Tech',
                'bca': 'BCA',
                'bcom': 'B.Com',
                'bba': 'BBA',
                'bsc': 'B.Sc',
                'ba': 'B.A',
                'masters': 'Masters',
                'mtech': 'M.Tech',
                'mca': 'MCA',
                'mcom': 'M.Com',
                'mba': 'MBA',
                'msc': 'M.Sc',
                'ma': 'M.A',
                'phd': 'Ph.D',
                'other': 'Other'
              };

              return levelOrder.map(level => {
                if (!groupedEducation[level] || groupedEducation[level].length === 0) return null;
                
                return (
                  <Box key={level} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                      {levelLabels[level]}
                    </Typography>
                    {groupedEducation[level].map((edu, groupIndex) => (
                      <Card key={groupIndex} sx={{ mb: 2, ml: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box>
                              <Typography variant="h6">{edu.degree}</Typography>
                              <Typography color="text.secondary">{edu.institution}</Typography>
                              <Typography variant="body2">
                                {edu.yearOfPassing} {edu.specialization && `• ${edu.specialization}`}
                              </Typography>
                              {edu.percentage && (
                                <Chip label={`${edu.percentage}%`} size="small" color="primary" sx={{ mt: 1 }} />
                              )}
                              
                              {/* Display attached documents */}
                              {edu.documents && edu.documents.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Attached Documents:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {edu.documents.map((doc) => (
                                      <Chip
                                        key={doc.id}
                                        icon={<DocumentIcon />}
                                        label={doc.name}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                            <Box>
                              <IconButton onClick={() => openEducationDialog(edu, edu.originalIndex)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton                               onClick={async () => {
                                const newEducation = [...candidateData.educationQualifications];
                                newEducation.splice(edu.originalIndex, 1);
                                const updatedData = { ...candidateData, educationQualifications: newEducation };
                                setCandidateData(updatedData);
                                
                                // Auto-save to backend
                                try {
                                  await candidateApi.put(`candidate-portal/${candidateId}/save`, updatedData);
                                  toast.success('Education entry deleted successfully');
                                } catch (error) {
                                  console.error('Failed to delete education:', error);
                                  toast.error('Failed to delete education entry');
                                }
                              }}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                );
              }).filter(Boolean);
            })()}
          </Box>
        )}
      </Grid>

      {/* Work Experience Section */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Work Experience</Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <IsolatedTextField
          label="Total Experience *"
          placeholder="e.g., 5 years 3 months"
          initialValue={candidateData.workExperience.totalExperience}
          onSave={async (value) => {
            const updatedData = {
              ...candidateData,
              workExperience: { ...candidateData.workExperience, totalExperience: value }
            };
            setCandidateData(updatedData);
            
            // Auto-save to backend
            try {
              await candidateApi.put(`candidate-portal/${candidateId}/save`, updatedData);
              toast.success('Total experience updated successfully');
            } catch (error) {
              console.error('Failed to save total experience:', error);
              toast.error('Failed to save total experience');
            }
          }}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">Experience Details</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openWorkDialog()}
          >
            Add Experience
          </Button>
        </Box>

        {(candidateData.workExperience?.experienceDetails?.length || 0) === 0 ? (
          <Alert severity="info">No work experience added yet. Click "Add Experience" to start.</Alert>
        ) : (
          <List>
            {(candidateData.workExperience?.experienceDetails || []).map((work, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h6">{work.position}</Typography>
                      <Typography color="text.secondary">{work.company}</Typography>
                      <Typography variant="body2">
                        {work.startDate ? (typeof work.startDate === 'string' ? work.startDate : work.startDate.format('MMM YYYY')) : ''} - {work.endDate ? (typeof work.endDate === 'string' ? work.endDate : work.endDate.format('MMM YYYY')) : 'Present'}
                      </Typography>
                      {work.salary && (
                        <Typography variant="body2" color="text.secondary">
                          Salary: {work.salary}
                        </Typography>
                      )}
                      {work.reasonForLeaving && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Reason for leaving: {work.reasonForLeaving}
                        </Typography>
                      )}
                      
                      {/* Display attached documents */}
                      {work.documents && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Attached Documents:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {/* Experience Letters */}
                            {work.documents.experienceLetters && work.documents.experienceLetters.length > 0 && (
                              <Chip
                                icon={<WorkIcon />}
                                label={`${work.documents.experienceLetters.length} Experience Letter(s)`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            
                            {/* Relieving Certificate */}
                            {work.documents.relievingCertificate && work.documents.relievingCertificate.length > 0 && (
                              <Chip
                                icon={<WorkIcon />}
                                label="Relieving Certificate"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                            
                            {/* Salary Slips */}
                            {work.documents.salarySlips && work.documents.salarySlips.length > 0 && (
                              <Chip
                                icon={<BankIcon />}
                                label={`${work.documents.salarySlips.length} Salary Slip(s)`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <IconButton onClick={() => openWorkDialog(work, index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={async () => {
                        const newExperience = [...candidateData.workExperience.experienceDetails];
                        newExperience.splice(index, 1);
                        const updatedData = {
                          ...candidateData,
                          workExperience: { 
                            ...candidateData.workExperience, 
                            experienceDetails: newExperience 
                          } 
                        };
                        setCandidateData(updatedData);
                        
                        // Auto-save to backend
                        try {
                          await candidateApi.put(`candidate-portal/${candidateId}/save`, updatedData);
                          toast.success('Work experience deleted successfully');
                        } catch (error) {
                          console.error('Failed to delete work experience:', error);
                          toast.error('Failed to delete work experience');
                        }
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Grid>
    </Grid>
  );

  // Work Experience Form
  const WorkExperienceForm = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Work Experience</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setWorkDialog({ open: true, data: null, index: -1 })}
        >
          Add Experience
        </Button>
      </Box>

      {(candidateData.workExperience?.experienceDetails?.length || 0) === 0 ? (
        <Alert severity="info">No work experience added yet. Click "Add Experience" to start.</Alert>
      ) : (
        <List>
          {candidateData.workExperience.map((work, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h6">{work.jobTitle}</Typography>
                    <Typography color="text.secondary">{work.company}</Typography>
                    <Typography variant="body2">
                      {work.startDate} - {work.endDate || 'Present'}
                    </Typography>
                    {work.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {work.description}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <IconButton onClick={() => setWorkDialog({ open: true, data: work, index })}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      const newExperience = [...candidateData.workExperience];
                      newExperience.splice(index, 1);
                      setCandidateData(prev => ({ ...prev, workExperience: newExperience }));
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );

  // Document Upload Form - REMOVED (integrated into other steps)
  // All document uploads are now handled in their respective sections:
  // - Passport photo: Personal & Employment Details
  // - Aadhaar & PAN images: Bank & Government Details 
  // - Bank documents: Bank & Government Details
  // - Education documents: Education & Experience
  // - Work documents: Education & Experience

  // Review Form
  const ReviewForm = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckIcon />
        Review Your Information
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Please review all the information below carefully before submitting. You won't be able to edit after submission.
      </Typography>

      {/* Personal Information */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Personal Information" 
          avatar={<PersonIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Full Name</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.fullName || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.email || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Employee Code</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.employeeCode || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.mobileNumber || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Father's Name</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.fatherName || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Gender</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.gender || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Marital Status</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.maritalStatus || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Blood Group</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.bloodGroup || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
              <Typography variant="body1" fontWeight="medium">
                {candidateData.personalInfo.employeeDOB ? 
                  (typeof candidateData.personalInfo.employeeDOB === 'string' ? 
                    candidateData.personalInfo.employeeDOB : 
                    candidateData.personalInfo.employeeDOB.format('DD/MM/YYYY')) : 
                  'Not provided'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Date of Joining</Typography>
              <Typography variant="body1" fontWeight="medium">
                {candidateData.personalInfo.dateOfJoining ? 
                  (typeof candidateData.personalInfo.dateOfJoining === 'string' ? 
                    candidateData.personalInfo.dateOfJoining : 
                    candidateData.personalInfo.dateOfJoining.format('DD/MM/YYYY')) : 
                  'Not provided'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Designation</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.designation || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Department</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.department || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Employment Status</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.employmentStatus || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">PAN Number</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.panNumber || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Aadhaar Number</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.aadhaarNumber || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Nationality</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.personalInfo.nationality || 'Not provided'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Address Information" 
          avatar={<PersonIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Current Address</Typography>
              <Typography variant="body1" fontWeight="medium">
                {candidateData.addressInfo?.currentAddress?.street || 'Not provided'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {candidateData.addressInfo?.currentAddress?.city || ''} {candidateData.addressInfo?.currentAddress?.state || ''} {candidateData.addressInfo?.currentAddress?.pincode || ''} {candidateData.addressInfo?.currentAddress?.country || ''}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Permanent Address</Typography>
              <Typography variant="body1" fontWeight="medium">
                {candidateData.addressInfo?.permanentAddress?.street || 'Not provided'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {candidateData.addressInfo?.permanentAddress?.city || ''} {candidateData.addressInfo?.permanentAddress?.state || ''} {candidateData.addressInfo?.permanentAddress?.pincode || ''} {candidateData.addressInfo?.permanentAddress?.country || ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Emergency Contacts" 
          avatar={<PersonIcon color="primary" />}
        />
        <CardContent>
          {(Array.isArray(candidateData.emergencyContacts) ? candidateData.emergencyContacts : []).map((contact, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{contact.name || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Relationship</Typography>
                  <Typography variant="body1" fontWeight="medium">{contact.relationship || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" fontWeight="medium">{contact.phone || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight="medium">{contact.email || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" fontWeight="medium">{contact.address || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Bank Details" 
          avatar={<BankIcon color="primary" />}
        />
        <CardContent>
          {(Array.isArray(candidateData.bankDetails) ? candidateData.bankDetails : []).map((bank, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">Bank Account {index + 1}</Typography>
                {bank.isPrimary && <Chip label="Primary" color="primary" size="small" />}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{bank.bankName || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1" fontWeight="medium">{bank.accountNumber || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{bank.accountHolderName || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body1" fontWeight="medium">{bank.ifscCode || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Branch</Typography>
                  <Typography variant="body1" fontWeight="medium">{bank.branch || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">PF Eligible</Typography>
                  <Typography variant="body1" fontWeight="medium">{bank.pfEligible || 'Not provided'}</Typography>
                </Grid>
                {bank.pfEligible === 'yes' && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">UAN Number</Typography>
                    <Typography variant="body1" fontWeight="medium">{bank.uanNumber || 'Not provided'}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Education Qualifications */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Education Qualifications" 
          avatar={<EducationIcon color="primary" />}
        />
        <CardContent>
          {candidateData.educationQualifications?.length > 0 ? (
            (Array.isArray(candidateData.educationQualifications) ? candidateData.educationQualifications : []).map((edu, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>{edu.degree || 'Not provided'}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Institution</Typography>
                    <Typography variant="body1" fontWeight="medium">{edu.institution || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Year of Passing</Typography>
                    <Typography variant="body1" fontWeight="medium">{edu.yearOfPassing || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Percentage/CGPA</Typography>
                    <Typography variant="body1" fontWeight="medium">{edu.percentage || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Specialization</Typography>
                    <Typography variant="body1" fontWeight="medium">{edu.specialization || 'Not provided'}</Typography>
                  </Grid>
                </Grid>
                {edu.documents && edu.documents.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Attached Documents:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {(Array.isArray(edu.documents) ? edu.documents : []).map((doc, docIndex) => (
                        <Chip key={docIndex} label={doc.name} size="small" color="success" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No education qualifications added</Typography>
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Work Experience" 
          avatar={<WorkIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Total Experience</Typography>
              <Typography variant="body1" fontWeight="medium">{candidateData.workExperience?.totalExperience || 'Not provided'}</Typography>
            </Grid>
          </Grid>
          
          {candidateData.workExperience?.experienceDetails?.length > 0 ? (
            (Array.isArray(candidateData.workExperience?.experienceDetails) ? candidateData.workExperience.experienceDetails : []).map((work, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>{work.position || 'Not provided'}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Company</Typography>
                    <Typography variant="body1" fontWeight="medium">{work.company || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {work.startDate ? (typeof work.startDate === 'string' ? work.startDate : work.startDate.format('MMM YYYY')) : ''} - {work.endDate ? (typeof work.endDate === 'string' ? work.endDate : work.endDate.format('MMM YYYY')) : 'Present'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Salary</Typography>
                    <Typography variant="body1" fontWeight="medium">{work.salary || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Reason for Leaving</Typography>
                    <Typography variant="body1" fontWeight="medium">{work.reasonForLeaving || 'Not provided'}</Typography>
                  </Grid>
                </Grid>
                {work.documents && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Attached Documents:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {work.documents.experienceLetters && work.documents.experienceLetters.length > 0 && (
                        <Chip label={`${work.documents.experienceLetters.length} Experience Letter(s)`} size="small" color="primary" variant="outlined" />
                      )}
                      {work.documents.relievingCertificate && work.documents.relievingCertificate.length > 0 && (
                        <Chip label="Relieving Certificate" size="small" color="success" variant="outlined" />
                      )}
                      {work.documents.salarySlips && work.documents.salarySlips.length > 0 && (
                        <Chip label={`${work.documents.salarySlips.length} Salary Slip(s)`} size="small" color="info" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No work experience added</Typography>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Uploaded Documents" 
          avatar={<UploadIcon color="primary" />}
        />
        <CardContent>
          {candidateData.uploadedDocuments?.length > 0 ? (
            <Grid container spacing={2}>
              {(Array.isArray(candidateData.uploadedDocuments) ? candidateData.uploadedDocuments : []).map((doc, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DocumentIcon color="primary" />
                      <Typography variant="body2" fontWeight="medium">{doc.name}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <Chip label="Uploaded" size="small" color="success" sx={{ ml: 1 }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">No documents uploaded</Typography>
          )}
        </CardContent>
      </Card>

      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Please review all information carefully before submitting. 
          Once submitted, you won't be able to edit this information. 
          If you need to make changes, please contact HR before submitting.
        </Typography>
      </Alert>
    </Box>
  );

  // Authentication Screen
  if (!authenticated) {
    return (
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Box sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Container maxWidth="sm">
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              
              <Typography variant="h4" gutterBottom>
                Candidate Portal
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Welcome! Please enter your credentials to access your onboarding portal.
              </Typography>

              <form onSubmit={handleLogin}>
                <IsolatedTextField
                  label="Candidate ID"
                  initialValue={credentials.candidateId}
                  onSave={(value) => setCredentials(prev => ({ ...prev, candidateId: value }))}
                  required
                  sx={{ mb: 2 }}
                />
                
                <IsolatedTextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  initialValue={credentials.password}
                  onSave={(value) => setCredentials(prev => ({ ...prev, password: value }))}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <ViewIcon />}
                      </IconButton>
                    )
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Authenticating...' : 'Access Portal'}
                </Button>
              </form>

              <Typography variant="caption" color="text.secondary">
                Having trouble? Contact HR for assistance.
              </Typography>
            </Paper>
          </Container>
        </Box>
      </LocalizationProvider>
    );
  }

  // Main Portal Interface
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" gutterBottom>
                Complete Your Profile
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleLogout}
                sx={{ minWidth: 100 }}
              >
                Logout
              </Button>
            </Box>
            
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
              Please fill in all the required information to complete your onboarding process.
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel icon={step.icon}>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {(saving || loading) && <LinearProgress sx={{ mb: 2 }} />}

            <Box sx={{ minHeight: 400 }}>
              {activeStep === 0 && <PersonalEmploymentForm />}
              {activeStep === 1 && <AddressEmergencyForm />}
              {activeStep === 2 && <BankGovernmentForm />}
              {activeStep === 3 && <EducationExperienceForm />}
              {activeStep === 4 && <ReviewForm />}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={saveProgress}
                  disabled={saving}
                >
                  Save Progress
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={submitData}
                    disabled={saving}
                  >
                    Submit Information
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(prev => prev + 1)}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Education Dialog */}
      <Dialog open={educationDialog.open} onClose={() => setEducationDialog({ open: false, data: null, index: -1 })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {educationDialog.index === -1 ? 'Add Education' : 'Edit Education'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Education Level *</InputLabel>
                <Select
                  value={educationForm.educationLevel}
                  onChange={handleEducationFormChange('educationLevel')}
                  label="Education Level *"
                >
                  <MenuItem value="10th">10th Standard</MenuItem>
                  <MenuItem value="12th">12th Standard</MenuItem>
                  <MenuItem value="diploma">Diploma</MenuItem>
                  <MenuItem value="graduation">Graduation</MenuItem>
                  <MenuItem value="btech">B.Tech</MenuItem>
                  <MenuItem value="bca">BCA</MenuItem>
                  <MenuItem value="bcom">B.Com</MenuItem>
                  <MenuItem value="bba">BBA</MenuItem>
                  <MenuItem value="bsc">B.Sc</MenuItem>
                  <MenuItem value="ba">B.A</MenuItem>
                  <MenuItem value="masters">Masters</MenuItem>
                  <MenuItem value="mtech">M.Tech</MenuItem>
                  <MenuItem value="mca">MCA</MenuItem>
                  <MenuItem value="mcom">M.Com</MenuItem>
                  <MenuItem value="mba">MBA</MenuItem>
                  <MenuItem value="msc">M.Sc</MenuItem>
                  <MenuItem value="ma">M.A</MenuItem>
                  <MenuItem value="phd">Ph.D</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <IsolatedTextField
                label="Degree/Qualification *"
                initialValue={educationForm.degree}
                onSave={(value) => setEducationForm(prev => ({ ...prev, degree: value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <IsolatedTextField
                label="Institution/University *"
                initialValue={educationForm.institution}
                onSave={(value) => setEducationForm(prev => ({ ...prev, institution: value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <IsolatedTextField
                label="Year of Passing *"
                initialValue={educationForm.yearOfPassing}
                onSave={(value) => setEducationForm(prev => ({ ...prev, yearOfPassing: value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <IsolatedTextField
                label="Percentage/CGPA"
                initialValue={educationForm.percentage}
                onSave={(value) => setEducationForm(prev => ({ ...prev, percentage: value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <IsolatedTextField
                label="Specialization/Stream"
                initialValue={educationForm.specialization}
                onSave={(value) => setEducationForm(prev => ({ ...prev, specialization: value }))}
              />
            </Grid>
            
            {/* Document Upload Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UploadIcon />
                Attach Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload certificates, mark sheets, or transcripts for this qualification
              </Typography>
              
              {/* File Upload */}
              <Box sx={{ mb: 2 }}>
                <input
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: 'none' }}
                  id="education-document-upload"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleEducationDocumentUpload(file);
                    }
                  }}
                />
                <label htmlFor="education-document-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Upload Document
                  </Button>
                </label>
              </Box>
              
              {/* Uploaded Documents List */}
              {educationForm.documents && educationForm.documents.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Uploaded Documents:
                  </Typography>
                  {educationForm.documents.map((doc) => (
                    <Card key={doc.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DocumentIcon color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {doc.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeEducationDocument(doc.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEducationDialog({ open: false, data: null, index: -1 })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveEducation}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Work Experience Dialog */}
      <Dialog open={workDialog.open} onClose={() => setWorkDialog({ open: false, data: null, index: -1 })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {workDialog.index === -1 ? 'Add Work Experience' : 'Edit Work Experience'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <IsolatedTextField
                label="Company Name *"
                initialValue={workForm.company}
                onSave={(value) => setWorkForm(prev => ({ ...prev, company: value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <IsolatedTextField
                label="Position/Job Title *"
                initialValue={workForm.position}
                onSave={(value) => setWorkForm(prev => ({ ...prev, position: value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date *"
                value={workForm.startDate}
                onChange={handleWorkFormDateChange('startDate')}
                slots={{ textField: TextField }}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={workForm.endDate}
                onChange={handleWorkFormDateChange('endDate')}
                slots={{ textField: TextField }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <IsolatedTextField
                label="Salary (Optional)"
                initialValue={workForm.salary}
                onSave={(value) => setWorkForm(prev => ({ ...prev, salary: value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <IsolatedTextField
                label="Reason for Leaving"
                initialValue={workForm.reasonForLeaving}
                onSave={(value) => setWorkForm(prev => ({ ...prev, reasonForLeaving: value }))}
                multiline
                rows={3}
              />
            </Grid>
            
            {/* Document Upload Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UploadIcon />
                Attach Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload relevant documents for this work experience
              </Typography>
              
              {/* Experience Letters */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" />
                  Experience Letters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload experience letters or certificates from this organization
                </Typography>
                
                <input
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: 'none' }}
                  id="experience-letters-upload"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleWorkDocumentUpload(file, 'experienceLetters');
                    }
                  }}
                />
                <label htmlFor="experience-letters-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Experience Letter
                  </Button>
                </label>
                
                {workForm.documents?.experienceLetters && workForm.documents.experienceLetters.length > 0 && (
                  <Box>
                    {workForm.documents.experienceLetters.map((doc) => (
                      <Card key={doc.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DocumentIcon color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {doc.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeWorkDocument(doc.id, 'experienceLetters')}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
              
              {/* Relieving Certificate */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" />
                  Relieving Certificate
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload relieving certificate from this organization
                </Typography>
                
                <input
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: 'none' }}
                  id="relieving-certificate-upload"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleWorkDocumentUpload(file, 'relievingCertificate');
                    }
                  }}
                />
                <label htmlFor="relieving-certificate-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Relieving Certificate
                  </Button>
                </label>
                
                {workForm.documents?.relievingCertificate && workForm.documents.relievingCertificate.length > 0 && (
                  <Box>
                    {workForm.documents.relievingCertificate.map((doc) => (
                      <Card key={doc.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DocumentIcon color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {doc.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeWorkDocument(doc.id, 'relievingCertificate')}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
              
              {/* Salary Slips */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BankIcon color="primary" />
                  Salary Slips
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload salary slips from this organization (you can upload multiple slips)
                </Typography>
                
                <input
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: 'none' }}
                  id="salary-slips-upload"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    files.forEach(file => {
                      handleWorkDocumentUpload(file, 'salarySlips');
                    });
                  }}
                />
                <label htmlFor="salary-slips-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Salary Slips (Multiple)
                  </Button>
                </label>
                
                {workForm.documents?.salarySlips && workForm.documents.salarySlips.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {workForm.documents.salarySlips.length} salary slip(s) uploaded
                    </Typography>
                    {workForm.documents.salarySlips.map((doc) => (
                      <Card key={doc.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DocumentIcon color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {doc.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeWorkDocument(doc.id, 'salarySlips')}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkDialog({ open: false, data: null, index: -1 })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveWorkExperience}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </LocalizationProvider>
  );
};

export default CandidatePortal;
