import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Tooltip, IconButton, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TextField, Button, InputAdornment
} from '@mui/material';
import { FiFileText, FiPlus, FiEye, FiEdit2, FiSearch, FiDownload } from 'react-icons/fi';
import { useGetInvoicesQuery } from '../store/api/apiSlice';
import GenerateInvoiceModal from '../components/GenerateInvoiceModal';
import EditDiscountModal from '../components/EditDiscountModal';
import { useDebounce } from '../hooks/useDebounce';
import { generateInvoicePdf } from '../utils/invoicePdf';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Invoices = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [discountModalInvoice, setDiscountModalInvoice] = useState(null);

  const { data, isLoading } = useGetInvoicesQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const getStatusChipColor = (paid, finalAmt) => {
    if (paid === 0) return 'error'; // Unpaid
    if (paid < finalAmt) return 'warning'; // Partial
    return 'success'; // Paid
  };

  const getStatusText = (paid, finalAmt) => {
    if (paid === 0) return 'Unpaid';
    if (paid < finalAmt) return 'Partial';
    return 'Paid';
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s', p: { xs: 2, md: 0 } }}>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <FiFileText size={14} /> / Invoices
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1f36' }}>
            Invoices
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<FiPlus />}
          onClick={() => setIsGenerateModalOpen(true)}
          sx={{ 
            bgcolor: '#1a1f36', 
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#242a45' } 
          }}
        >
          Generate Invoice
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by invoice number or client name..."
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
        size="small"
        sx={{
          mb: 3,
          width: '100%',
          maxWidth: 380,
          bgcolor: 'white',
          '& .MuiOutlinedInput-root': { borderRadius: '12px' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FiSearch size={16} color="#94a3b8" />
            </InputAdornment>
          ),
        }}
      />

      {/* Data Section */}
      <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.6)', overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem' }}>Invoice No</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5 }}>
                    <CircularProgress size={30} sx={{ color: '#1a1f36' }} />
                  </TableCell>
                </TableRow>
              ) : data?.invoices?.length > 0 ? (
                data.invoices.map((invoice) => (
                  <TableRow
                    key={invoice._id}
                    hover
                    onClick={() => navigate(`/app/invoices/${invoice._id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#1a1f36' }}>{invoice.invoiceNumber}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{invoice.clientId?.name || '—'}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: '#1a1f36' }}>
                      {fmt(invoice.finalAmount)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={getStatusText(invoice.paidAmount, invoice.finalAmount)} 
                        color={getStatusChipColor(invoice.paidAmount, invoice.finalAmount)}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="View Invoice">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/app/invoices/${invoice._id}`)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#2e4ed2', bgcolor: '#eff6ff' } }}
                          >
                            <FiEye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={() => generateInvoicePdf(invoice, user)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#1a1f36', bgcolor: '#f1f5f9' } }}
                          >
                            <FiDownload size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={invoice.paidAmount > 0 ? "Cannot edit discount for paid invoices" : "Edit Discount"}>
                          <span style={{ display: 'inline-block' }}>
                            <IconButton
                              size="small"
                              onClick={() => setDiscountModalInvoice(invoice)}
                              disabled={invoice.paidAmount > 0}
                              sx={{ color: '#94a3b8', '&:hover': { color: '#eab308', bgcolor: '#fefce8' } }}
                            >
                              <FiEdit2 size={16} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                    No invoices generated yet.
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

      {/* Modals */}
      <GenerateInvoiceModal 
        open={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
      />
      {discountModalInvoice && (
        <EditDiscountModal
          open={!!discountModalInvoice}
          onClose={() => setDiscountModalInvoice(null)}
          invoice={discountModalInvoice}
        />
      )}
    </Box>
  );
};

export default Invoices;
