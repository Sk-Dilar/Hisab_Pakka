import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Grid,
  Breadcrumbs,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { FiUser, FiHome, FiSettings, FiSave } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileAsync, clearSuccessMessage, clearError } from '../store/slices/authSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading, error, successMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    return () => {
      dispatch(clearSuccessMessage());
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfileAsync({
      name: formData.name,
      phone: formData.phone
    }));
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link to="/app/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <FiHome style={{ marginRight: 8 }} /> Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <FiSettings style={{ marginRight: 8 }} /> Settings
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" mb={4}>Account Settings</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={4}>
                <Box 
                  p={2} 
                  bgcolor="primary.main" 
                  borderRadius="50%" 
                  color="white" 
                  display="flex" 
                  mr={3}
                >
                  <FiUser size={32} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Profile Information</Typography>
                  <Typography variant="body2" color="text.secondary">Update your account details and contact information.</Typography>
                </Box>
              </Box>

              {successMessage && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      name="name"
                      fullWidth
                      variant="outlined"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      name="email"
                      fullWidth
                      variant="outlined"
                      value={formData.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number (Optional)"
                      name="phone"
                      fullWidth
                      variant="outlined"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box mt={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FiSave />}
                        disabled={loading}
                        sx={{ px: 4, borderRadius: 2 }}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Account Plan</Typography>
              <Box p={3} bgcolor="primary.light" color="primary.contrastText" borderRadius={2} mb={3}>
                <Typography variant="h5" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                  {user?.plan} Plan
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Professional billing tools for your business.
                </Typography>
              </Box>
              <Button variant="outlined" fullWidth sx={{ borderRadius: 2 }}>
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
