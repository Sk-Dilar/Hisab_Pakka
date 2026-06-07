import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, MenuItem, Select, InputLabel, FormControl, 
  CircularProgress, Typography, Alert, TextField, InputAdornment
} from '@mui/material';
import { useGetClientsQuery, useAddPaymentMutation } from '../store/api/apiSlice';

const PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Other'];

const RecordPaymentModal = ({ open, onClose }) => {
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { data: clientsData, isLoading: isClientsLoading } = useGetClientsQuery({ limit: 1000 });
  const [addPayment, { isLoading: isRecording }] = useAddPaymentMutation();

  const handleClose = () => {
    setClientId('');
    setAmount('');
    setMethod('');
    setNote('');
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId || !amount || !method) {
      setErrorMsg('Client, amount, and method are required.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Amount must be greater than 0.');
      return;
    }

    try {
      setErrorMsg('');
      await addPayment({ clientId, amount: numAmount, method, note }).unwrap();
      handleClose();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to record payment.');
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
      <DialogTitle sx={{ fontWeight: 800, color: '#1a1f36' }}>Record Payment</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
          Record a payment received from a client. The system will automatically allocate this payment to the oldest unpaid invoices using the FIFO method.
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="client-select-label">Select Client *</InputLabel>
            <Select
              labelId="client-select-label"
              value={clientId}
              label="Select Client *"
              onChange={(e) => setClientId(e.target.value)}
              disabled={isClientsLoading || isRecording}
              sx={{ borderRadius: '12px' }}
            >
              {isClientsLoading ? (
                <MenuItem disabled value="">
                  <CircularProgress size={20} sx={{ mr: 2 }} /> Loading clients...
                </MenuItem>
              ) : clientsData?.clients?.length > 0 ? (
                clientsData.clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.name} {client.companyName ? `(${client.companyName})` : ''} - Balance: ₹{client.currentBalance}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No clients found
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Payment Amount *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isRecording}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              sx: { borderRadius: '12px' }
            }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="method-select-label">Payment Method *</InputLabel>
            <Select
              labelId="method-select-label"
              value={method}
              label="Payment Method *"
              onChange={(e) => setMethod(e.target.value)}
              disabled={isRecording}
              sx={{ borderRadius: '12px' }}
            >
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isRecording}
            InputProps={{
              sx: { borderRadius: '12px' }
            }}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isRecording}
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
          disabled={isRecording || !clientId || !amount || !method}
          sx={{ 
            bgcolor: '#1a1f36', 
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: '#242a45' } 
          }}
        >
          {isRecording ? <CircularProgress size={24} color="inherit" /> : 'Record Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordPaymentModal;
