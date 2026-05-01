import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { FiX } from 'react-icons/fi';
import { useAddWorkItemMutation } from '../store/api/apiSlice';

const AddWorkItemModal = ({ open, onClose, projectId, clientId }) => {
  const [formData, setFormData] = useState({
    title: '',
    quantity: 1,
    rate: 0
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [addWorkItem, { isLoading }] = useAddWorkItemMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'title' ? value : parseFloat(value) || 0 
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.quantity <= 0 || formData.rate < 0) {
      setErrorMsg('Please fill all required fields correctly');
      return;
    }

    try {
      await addWorkItem({
        ...formData,
        projectId,
        clientId
      }).unwrap();
      setFormData({ title: '', quantity: 1, rate: 0 });
      onClose();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to add work item');
    }
  };

  const totalAmount = (formData.quantity * formData.rate).toFixed(2);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Log Work Item</Typography>
          <IconButton onClick={onClose} size="small">
            <FiX />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {errorMsg && (
            <Box mb={2} p={1.5} bgcolor="error.light" borderRadius={1}>
              <Typography color="error.main" variant="body2">{errorMsg}</Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Task Description *"
                fullWidth
                variant="outlined"
                value={formData.title}
                onChange={handleChange}
                size="small"
                autoFocus
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="quantity"
                label="Quantity *"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.quantity}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="rate"
                label="Rate *"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.rate}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center" border="1px solid" borderColor="divider">
                <Typography variant="caption" color="text.secondary">Estimated Total</Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  ${totalAmount}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Add Work Item
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddWorkItemModal;
