            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Bank & Government Details" 
                avatar={<AccountBalanceIcon color="primary" />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Government Details */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      Government Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          PAN Number
                        </Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {candidateData.personalInfo?.panNumber || 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Aadhaar Number
                        </Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {candidateData.personalInfo?.aadharNumber || 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Nationality
                        </Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {candidateData.personalInfo?.nationality || 'Not provided'}
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Bank Details */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                      <AccountBalanceIcon sx={{ mr: 1 }} />
                      Banking Information
                    </Typography>
                    {candidateData.bankDetails ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Bank Name</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.bankName || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Account Number</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.accountNumber || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>IFSC Code</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.ifscCode || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Account Holder Name</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.accountHolderName || 'Not provided'}
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        No banking information provided yet.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab Panel 2: Documents */}
          <TabPanel value={tabValue} index={2}>
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title={`Documents (${getAllDocuments(candidateData, offerLetter).length})`}
                avatar={<DescriptionIcon color="primary" />}
                action={
                  <Button 
                    onClick={refreshCandidateData} 
                    disabled={refreshing}
                    startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                    size="small"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                }
              />
              <CardContent>
                {(() => {
                  const allDocs = getAllDocuments(candidateData, offerLetter);
                  if (allDocs.length === 0) {
                    return (
                      <Alert severity="info" sx={{ textAlign: 'center' }}>
                        No documents uploaded yet.
                      </Alert>
                    );
                  }

                  return (
                    <List sx={{ width: '100%', p: 0 }}>
                      {allDocs.map((doc, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor: '#fafafa',
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <ListItemIcon>
                            <DescriptionIcon sx={{ color: '#666' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {doc.name || `Document ${index + 1}`}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  size="small"
                                  label={
                                    documentStatuses[doc.id]?.status?.toUpperCase() || 
                                    doc.status?.toUpperCase() || 
                                    'PENDING'
                                  }
                                  color={
                                    (documentStatuses[doc.id]?.status || doc.status) === 'verified' ? 'success' :
                                    (documentStatuses[doc.id]?.status || doc.status) === 'rejected' ? 'error' :
                                    'default'
                                  }
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {doc.type?.replace('_', ' ') || doc.source} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown Date'}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewDocument(doc)}
                                sx={{ minWidth: 'auto', px: 2 }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadDocument(doc)}
                                sx={{ minWidth: 'auto', px: 2 }}
                              >
                                Download
                              </Button>
                              {!doc.isOfferLetter && !doc.isMetadataOnly && (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleApproveDocument(doc)}
                                    disabled={documentStatuses[doc.id]?.status === 'verified'}
                                    sx={{ 
                                      color: documentStatuses[doc.id]?.status === 'verified' ? '#4caf50' : '#666'
                                    }}
                                  >
                                    {documentStatuses[doc.id]?.status === 'verified' ? <VerifiedIcon /> : <ApproveIcon />}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRejectDocument(doc)}
                                    disabled={documentStatuses[doc.id]?.status === 'rejected'}
                                    sx={{ 
                                      color: documentStatuses[doc.id]?.status === 'rejected' ? '#f44336' : '#666'
                                    }}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  );
                })()}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab Panel 3: IT Setup */}
          <TabPanel value={tabValue} index={3}>
            {candidateData?.itSetup && (
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="IT Setup Information" 
                  avatar={<Box component="span" sx={{ fontSize: '1.5rem' }}>💻</Box>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Hardware Equipment */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            💻 Hardware Equipment
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.itSetup.hardware && Object.entries(candidateData.itSetup.hardware).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.assigned ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.model && ` (${item.model})`}
                                  {item.assignedDate && ` - ${item.assignedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Software & Accounts */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            💾 Software & Accounts
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.itSetup.software && Object.entries(candidateData.itSetup.software).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.setup ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.account && ` (${item.account})`}
                                  {item.setupDate && ` - ${item.setupDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Access & Security */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            🔐 Access & Security
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.itSetup.access && Object.entries(candidateData.itSetup.access).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.granted ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                  {(item.cardNumber || item.spotNumber || item.credentials) && 
                                    ` (${item.cardNumber || item.spotNumber || item.credentials})`}
                                  {item.grantedDate && ` - ${item.grantedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Progress Summary */}
                  <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      {(() => {
                        const hardwareItems = candidateData.itSetup.hardware ? Object.values(candidateData.itSetup.hardware) : [];
                        const softwareItems = candidateData.itSetup.software ? Object.values(candidateData.itSetup.software) : [];
                        const accessItems = candidateData.itSetup.access ? Object.values(candidateData.itSetup.access) : [];
                        
                        const hardwareCompleted = hardwareItems.filter(item => item.assigned).length;
                        const softwareCompleted = softwareItems.filter(item => item.setup).length;
                        const accessCompleted = accessItems.filter(item => item.granted).length;
                        
                        const totalItems = hardwareItems.length + softwareItems.length + accessItems.length;
                        const completedItems = hardwareCompleted + softwareCompleted + accessCompleted;
                        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                        
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: '#333' }}>
                              IT Setup Progress:
                            </Typography>
                            <Chip 
                              label={`${progress}% Complete (${completedItems}/${totalItems})`}
                              color={progress === 100 ? "success" : progress > 50 ? "warning" : "default"}
                              sx={{ fontWeight: 600, fontSize: '1rem' }}
                            />
                            {candidateData.itSetup.completedDate && (
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Completed: {candidateData.itSetup.completedDate}
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
            {!candidateData?.itSetup && (
              <Alert severity="info">
                No IT setup information available yet.
              </Alert>
            )}
          </TabPanel>

          {/* Tab Panel 4: HR Setup */}
          <TabPanel value={tabValue} index={4}>
            {candidateData?.hrSetup && (
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="HR Setup Information" 
                  avatar={<Box component="span" sx={{ fontSize: '1.5rem' }}>👥</Box>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    {/* HR Processes */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            👥 HR Processes
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.hrSetup.processes && Object.entries(candidateData.hrSetup.processes).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.completed ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key === 'employeeId' ? 'Employee ID Assignment' :
                                    key === 'policies' ? 'Company Policies' :
                                    key === 'handbook' ? 'Employee Handbook' :
                                    key === 'benefits' ? 'Benefits Explanation' :
                                    key === 'payroll' ? 'Payroll Setup' :
                                    key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.completedDate && ` - ${item.completedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* HR Documents */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            📋 HR Documentation
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.hrSetup.documents && Object.entries(candidateData.hrSetup.documents).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.provided ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key === 'contract' ? 'Employment Contract' :
                                    key === 'nda' ? 'NDA Agreement' :
                                    key === 'handbook' ? 'Employee Handbook' :
                                    key === 'policies' ? 'Policy Documents' :
                                    key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.providedDate && ` - ${item.providedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* HR Progress Summary */}
                  <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      {(() => {
                        const processItems = candidateData.hrSetup.processes ? Object.values(candidateData.hrSetup.processes) : [];
                        const documentItems = candidateData.hrSetup.documents ? Object.values(candidateData.hrSetup.documents) : [];
                        
                        const processCompleted = processItems.filter(item => item.completed).length;
                        const documentsProvided = documentItems.filter(item => item.provided).length;
                        
                        const totalItems = processItems.length + documentItems.length;
                        const completedItems = processCompleted + documentsProvided;
                        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                        
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: '#333' }}>
                              HR Setup Progress:
                            </Typography>
                            <Chip 
                              label={`${progress}% Complete (${completedItems}/${totalItems})`}
                              color={progress === 100 ? "success" : progress > 50 ? "warning" : "default"}
                              sx={{ fontWeight: 600, fontSize: '1rem' }}
                            />
                            {candidateData.hrSetup.completedDate && (
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Completed: {candidateData.hrSetup.completedDate}
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
            {!candidateData?.hrSetup && (
              <Alert severity="info">
                No HR setup information available yet.
              </Alert>
            )}
          </TabPanel>
        </Paper>

    </Container>

      {/* Document Review Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Document Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Review document: {selectedDocument?.name}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={documentStatus}
              label="Action"
              onChange={(e) => setDocumentStatus(e.target.value)}
            >
              <MenuItem value="rejected">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon color="error" />
                  Reject Document
                </Box>
              </MenuItem>
              <MenuItem value="pending">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="warning" />
                  Mark as Pending
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments / Reason"
            placeholder="Please provide details..."
            value={rejectionComments}
            onChange={(e) => setRejectionComments(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmReject}
            color="primary"
            variant="contained"
            disabled={updatingDocument || !rejectionComments.trim()}
          >
            {updatingDocument 
              ? 'Updating...' 
              : (documentStatus === 'rejected' ? 'Reject Document' : 'Mark as Pending')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </GradientBackground>
  );
};

export default CandidateReview;
