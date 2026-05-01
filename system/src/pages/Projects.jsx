import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
  Pagination,
  Breadcrumbs
} from '@mui/material';
import { FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2, FiHome, FiBriefcase } from 'react-icons/fi';
import { useGetProjectsQuery } from '../store/api/apiSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import { useNavigate, Link } from 'react-router-dom';

const Projects = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useGetProjectsQuery({
    page,
    search: searchTerm,
    limit: 9
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing': return 'primary';
      case 'Finished': return 'success';
      case 'On Hold': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/app/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <FiHome style={{ marginRight: 8 }} /> Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <FiBriefcase style={{ marginRight: 8 }} /> Projects
        </Typography>
      </Breadcrumbs>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Projects</Typography>
        <Button 
          variant="contained" 
          startIcon={<FiPlus />} 
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
      </Box>

      <Box mb={4}>
        <TextField
          placeholder="Search projects..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch color="#9ca3af" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400, bgcolor: 'white' }}
        />
      </Box>

      <Grid container spacing={3}>
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : data?.projects?.length > 0 ? (
          data.projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Chip 
                      label={project.status} 
                      color={getStatusColor(project.status)} 
                      size="small" 
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="primary" gutterBottom fontWeight="medium">
                    {project.clientId?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description || 'No description provided.'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button 
                    size="small" 
                    startIcon={<FiEye />} 
                    onClick={() => navigate(`/app/projects/${project._id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={10} bgcolor="white" borderRadius={2} border="1px dashed" borderColor="divider">
              <Typography color="text.secondary">No projects found. Create your first project to get started!</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {data?.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={6}>
          <Pagination 
            count={data.totalPages} 
            page={page} 
            onChange={(e, v) => setPage(v)} 
            color="primary" 
          />
        </Box>
      )}

      <CreateProjectModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Box>
  );
};

export default Projects;
