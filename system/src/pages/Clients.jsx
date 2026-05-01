import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Chip,
  Skeleton
} from '@mui/material';
import { FiSearch, FiPlus, FiMoreVertical, FiEye } from 'react-icons/fi';
import { useGetClientsQuery } from '../store/api/apiSlice';
import CreateClientModal from '../components/CreateClientModal';

const Clients = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetClientsQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: searchTerm
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'error'; // Client owes us
    if (balance < 0) return 'success'; // We owe client (advance)
    return 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Clients
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<FiPlus />} 
          onClick={() => setIsModalOpen(true)}
          sx={{ px: 3, py: 1 }}
        >
          Create Client
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box mb={3}>
          <TextField
            placeholder="Search by name..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'gray.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Client Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Current Balance</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(6)].map((_, i) => (
                      <TableCell key={i}><Skeleton variant="text" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.clients?.length > 0 ? (
                data.clients.map((client) => (
                  <TableRow key={client._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{client.name}</Typography>
                    </TableCell>
                    <TableCell>{client.companyName || '-'}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={formatCurrency(client.currentBalance)} 
                        color={getBalanceColor(client.currentBalance)}
                        size="small"
                        variant={client.currentBalance !== 0 ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <FiEye />
                      </IconButton>
                      <IconButton size="small">
                        <FiMoreVertical />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No clients found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <CreateClientModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Box>
  );
};

export default Clients;
