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
  MenuItem
} from '@mui/material';
import { FiX } from 'react-icons/fi';
import { useCreateProjectMutation, useGetClientsQuery } from '../store/api/apiSlice';

const CreateProjectModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    status: 'Ongoing'
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: clientsData } = useGetClientsQuery({ limit: 100 });
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.title) {
      setErrorMsg('Client and Title are required');
      return;
    }

    try {
      await createProject(formData).unwrap();
      setFormData({ clientId: '', title: '', description: '', status: 'Ongoing' });
      onClose();
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to create project');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New Project</Typography>
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
                select
                name="clientId"
                label="Select Client *"
                fullWidth
                variant="outlined"
                value={formData.clientId}
                onChange={handleChange}
                size="small"
              >
                {clientsData?.clients?.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.name} {client.companyName ? `(${client.companyName})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Project Title *"
                fullWidth
                variant="outlined"
                value={formData.title}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="status"
                label="Status"
                fullWidth
                variant="outlined"
                value={formData.status}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="Ongoing">Ongoing</MenuItem>
                <MenuItem value="Finished">Finished</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </TextField>
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
            Create Project
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectModal;
