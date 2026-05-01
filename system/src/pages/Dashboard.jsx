import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Skeleton
} from '@mui/material';
import { 
  FiUsers, 
  FiBriefcase, 
  FiDollarSign, 
  FiActivity 
} from 'react-icons/fi';
import { useGetDashboardStatsQuery } from '../store/api/apiSlice';

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {loading ? <Skeleton width={80} /> : value}
          </Typography>
        </Box>
        <Box 
          sx={{ 
            backgroundColor: `${color}.light`, 
            color: `${color}.main`,
            p: 1.5,
            borderRadius: 2,
            display: 'flex'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" color="text.primary" mb={4}>
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Balance" 
            value={formatCurrency(data?.totalBalance)} 
            icon={<FiDollarSign size={24} />} 
            color="primary"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Clients" 
            value={data?.clientCount || 0} 
            icon={<FiUsers size={24} />} 
            color="success"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Projects" 
            value={data?.activeProjectsCount || 0} 
            icon={<FiBriefcase size={24} />} 
            color="warning"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Recent Activity" 
            value={data?.recentWorkItems?.length || 0} 
            icon={<FiActivity size={24} />} 
            color="info"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Projects */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box p={2} borderBottom="1px solid" borderColor="divider">
              <Typography variant="h6" fontWeight="bold">Pending Projects</Typography>
            </Box>
            <List>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <ListItem key={i} divider><ListItemText primary={<Skeleton />} secondary={<Skeleton width="40%" />} /></ListItem>
                ))
              ) : data?.pendingProjects?.length > 0 ? (
                data.pendingProjects.map((project, index) => (
                  <React.Fragment key={project._id}>
                    <ListItem>
                      <ListItemText 
                        primary={project.title} 
                        secondary={project.clientId?.name} 
                      />
                      <Chip label={project.status} size="small" color="warning" variant="outlined" />
                    </ListItem>
                    {index < data.pendingProjects.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Box p={3} textAlign="center">
                  <Typography color="text.secondary">No pending projects</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box p={2} borderBottom="1px solid" borderColor="divider">
              <Typography variant="h6" fontWeight="bold">Recent Activities</Typography>
            </Box>
            <List>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <ListItem key={i} divider><ListItemText primary={<Skeleton />} secondary={<Skeleton width="40%" />} /></ListItem>
                ))
              ) : data?.recentWorkItems?.length > 0 ? (
                data.recentWorkItems.map((item, index) => (
                  <React.Fragment key={item._id}>
                    <ListItem>
                      <ListItemText 
                        primary={item.title} 
                        secondary={`${item.clientId?.name} • ${formatCurrency(item.totalAmount)}`} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                    {index < data.recentWorkItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Box p={3} textAlign="center">
                  <Typography color="text.secondary">No recent activities</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
