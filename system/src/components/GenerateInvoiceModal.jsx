import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, MenuItem, Select, InputLabel, FormControl, 
  CircularProgress, Typography, Alert 
} from '@mui/material';
import { useGetClientsQuery, useGenerateInvoiceMutation } from '../store/api/apiSlice';

const GenerateInvoiceModal = ({ open, onClose }) => {
  const [clientId, setClientId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { data: clientsData, isLoading: isClientsLoading } = useGetClientsQuery({ limit: 1000 }); // fetch many to populate dropdown
  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();

  const handleClose = () => {
    setClientId('');
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMsg('Please select a client');
      return;
    }

    try {
      setErrorMsg('');
      await generateInvoice({ clientId }).unwrap();
      handleClose();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to generate invoice. Please ensure there are unbilled work items.');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', padding: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#1a1f36' }}>Generate Invoice</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
          Select a client to group all their unbilled work items into a new or existing unpaid invoice.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {errorMsg}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="client-select-label">Select Client</InputLabel>
          <Select
            labelId="client-select-label"
            value={clientId}
            label="Select Client"
            onChange={(e) => setClientId(e.target.value)}
            disabled={isClientsLoading || isGenerating}
            sx={{ borderRadius: '12px' }}
          >
            {isClientsLoading ? (
              <MenuItem disabled value="">
                <CircularProgress size={20} sx={{ mr: 2 }} /> Loading clients...
              </MenuItem>
            ) : clientsData?.clients?.length > 0 ? (
              clientsData.clients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {client.name} {client.companyName ? `(${client.companyName})` : ''}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No clients found
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isGenerating}
          sx={{ 
            color: '#64748b', 
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isGenerating || !clientId}
          sx={{ 
            bgcolor: '#1a1f36', 
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: '#242a45' } 
          }}
        >
          {isGenerating ? <CircularProgress size={24} color="inherit" /> : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateInvoiceModal;
