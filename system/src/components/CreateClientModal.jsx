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
  CircularProgress
} from '@mui/material';
import { FiX } from 'react-icons/fi';
import { useCreateClientMutation } from '../store/api/apiSlice';

const CreateClientModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [createClient, { isLoading }] = useCreateClientMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) return;
    if (name === 'phone' && value.length > 10) return;
    setFormData({ ...formData, [name]: value });
    setErrorMsg('');
  };

  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false;
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg('Name is required');
      return;
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number starting with 6-9');
      return;
    }

    try {
      await createClient(formData).unwrap();
      setSuccessMsg('Client created successfully!');
      setFormData({ name: '', email: '', phone: '', companyName: '' });
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to create client');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New Client</Typography>
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
          {successMsg && (
            <Box mb={2} p={1.5} bgcolor="success.light" borderRadius={1}>
              <Typography color="success.main" variant="body2">{successMsg}</Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Client Name"
                required
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email Address"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                size="small"
                type="email"
                error={Boolean(formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                helperText={formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Enter a valid email address" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={handleChange}
                size="small"
                error={Boolean(formData.phone && !/^[6-9]\d{9}$/.test(formData.phone))}
                helperText={formData.phone && !/^[6-9]\d{9}$/.test(formData.phone) ? "Enter a valid 10-digit Indian phone number" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="companyName"
                label="Company Name"
                fullWidth
                variant="outlined"
                value={formData.companyName}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !isFormValid()}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Create Client
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateClientModal;
