import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Breadcrumbs,
  Skeleton,
  Tooltip
} from '@mui/material';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiTrash2, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle 
} from 'react-icons/fi';
import { 
  useGetProjectQuery, 
  useGetWorkItemsQuery, 
  useDeleteWorkItemMutation 
} from '../store/api/apiSlice';
import AddWorkItemModal from '../components/AddWorkItemModal';

const ProjectDetails = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useGetProjectQuery(id);
  const { data: workItemsData, isLoading: workItemsLoading } = useGetWorkItemsQuery({ projectId: id });
  const [deleteWorkItem] = useDeleteWorkItemMutation();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ongoing': return <FiClock />;
      case 'Finished': return <FiCheckCircle />;
      case 'On Hold': return <FiAlertCircle />;
      default: return null;
    }
  };

  const handleDeleteWorkItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this work item? This will also revert the client balance.')) {
      try {
        await deleteWorkItem(itemId).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete work item');
      }
    }
  };

  if (projectLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 4 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!project) return <Typography>Project not found</Typography>;

  const totalProjectValue = workItemsData?.workItems?.reduce((sum, item) => sum + item.totalAmount, 0) || 0;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/app/projects" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <FiArrowLeft style={{ marginRight: 4 }} /> Projects
        </Link>
        <Typography color="text.primary">Project Details</Typography>
      </Breadcrumbs>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">{project.title}</Typography>
                <Chip 
                  icon={getStatusIcon(project.status)}
                  label={project.status} 
                  color={project.status === 'Ongoing' ? 'primary' : project.status === 'Finished' ? 'success' : 'warning'} 
                  variant="outlined" 
                />
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                {project.description || 'No description provided.'}
              </Typography>
              <Box display="flex" gap={4} mt={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Client</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">{project.clientId?.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Created Date</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, bgcolor: 'primary.main', color: 'white', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Total Project Value</Typography>
              <Typography variant="h3" fontWeight="bold">${totalProjectValue.toLocaleString()}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>From {workItemsData?.workItems?.length || 0} items</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">Work Items</Typography>
        <Button 
          variant="outlined" 
          startIcon={<FiPlus />} 
          onClick={() => setIsModalOpen(true)}
        >
          Add Work Item
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell fontWeight="bold">Description</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workItemsLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton height={40} /></TableCell></TableRow>
              ))
            ) : workItemsData?.workItems?.length > 0 ? (
              workItemsData.workItems.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>{item.title}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">${item.rate.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>${item.totalAmount.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.billed ? 'Billed' : 'Unbilled'} 
                      color={item.billed ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {!item.billed && (
                      <Tooltip title="Delete Item">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteWorkItem(item._id)}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No work items logged yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddWorkItemModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectId={project._id}
        clientId={project.clientId?._id}
      />
    </Box>
  );
};

export default ProjectDetails;
