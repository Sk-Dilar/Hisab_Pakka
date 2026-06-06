import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, CircularProgress, Typography, Alert,
  InputAdornment
} from '@mui/material';
import { useUpdateDiscountMutation } from '../store/api/apiSlice';

const EditDiscountModal = ({ open, onClose, invoice }) => {
  const [discount, setDiscount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [updateDiscount, { isLoading: isUpdating }] = useUpdateDiscountMutation();

  useEffect(() => {
    if (invoice) {
      setDiscount(invoice.discount || 0);
    }
  }, [invoice]);

  const handleClose = () => {
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const discountValue = Number(discount);
    
    if (isNaN(discountValue) || discountValue < 0) {
      setErrorMsg('Discount must be a valid positive number');
      return;
    }

    if (discountValue > invoice.totalAmount) {
      setErrorMsg('Discount cannot exceed the total invoice amount');
      return;
    }

    try {
      setErrorMsg('');
      await updateDiscount({ id: invoice._id, discount: discountValue }).unwrap();
      handleClose();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to update discount.');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', padding: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#1a1f36' }}>Edit Discount</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
          Update the discount for Invoice #{invoice?.invoiceNumber}. 
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            fullWidth
            label="Discount Amount"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            disabled={isUpdating}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              sx: { borderRadius: '12px' }
            }}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isUpdating}
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
          disabled={isUpdating}
          sx={{ 
            bgcolor: '#1a1f36', 
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: '#242a45' } 
          }}
        >
          {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDiscountModal;
