import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination
} from '@mui/material';
import { FiDollarSign, FiPlus } from 'react-icons/fi';
import { useGetPaymentsQuery } from '../store/api/apiSlice';
import RecordPaymentModal from '../components/RecordPaymentModal';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Payments = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const { data, isLoading } = useGetPaymentsQuery({
    page: page + 1,
    limit: rowsPerPage,
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s', p: { xs: 2, md: 0 } }}>
      {/* Header section */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <FiDollarSign size={14} /> / Payments
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1f36' }}>
            Payments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FiPlus />}
          onClick={() => setIsRecordModalOpen(true)}
          sx={{
            bgcolor: '#1a1f36',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { bgcolor: '#242a45' }
          }}
        >
          Record Payment
        </Button>
      </Box>

      {/* Data Section */}
      <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.6)', overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem' }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
                    <CircularProgress size={30} sx={{ color: '#1a1f36' }} />
                  </TableCell>
                </TableRow>
              ) : data?.payments?.length > 0 ? (
                data.payments.map((payment) => (
                  <TableRow
                    key={payment._id}
                    hover
                    onClick={() => navigate(`/app/payments/${payment._id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ color: '#64748b' }}>
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1a1f36' }}>
                      {payment.clientId?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.method} 
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      +{fmt(payment.amount)}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      {payment.note || '—'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                    No payments recorded yet.
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
          sx={{ borderTop: '1px solid rgba(226, 232, 240, 0.6)', bgcolor: '#f8fafc' }}
        />
      </Paper>

      {/* Record Payment Modal */}
      <RecordPaymentModal 
        open={isRecordModalOpen} 
        onClose={() => setIsRecordModalOpen(false)} 
      />
    </Box>
  );
};

export default Payments;
