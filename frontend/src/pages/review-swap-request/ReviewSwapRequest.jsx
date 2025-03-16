import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import useStore from '../../hooks/useStore.js';
import { fetchAPI } from '../../utils';

const ReviewSwapRequest = () => {
  const { loggedInMember, fetchPendingSwapRequests, swapRequests, loading, } = useStore((state) => state);
  const [alert, setAlert] = useState({ type: null, message: null });

  useEffect(() => {
    fetchPendingSwapRequests()
  }, [fetchPendingSwapRequests]);

  const handleSwapAction = async (swapRequestId, approve) => {
    setAlert({ type: null, message: null });

    try {
      const token = sessionStorage.getItem('lh_token');
      const response = await fetchAPI({
        method: 'POST',
        url: `/shifts/swap-shift/review/${loggedInMember._id}`,
        data: {
          swapRequestId,
          approve,
        },
        token,
      });
      
      setAlert({
        type: 'success',
        message: `Swap request ${approve ? 'approved' : 'declined'} successfully!`,
      });

    } catch (err) {
      console.error(`Error ${approve ? 'approving' : 'declining'} swap:`, err);
      setAlert({ type: 'error', message: 'Failed to process swap request.' });

    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1000px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Approve Swap Requests
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

      {alert.type && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {swapRequests.length === 0 && !loading && (
        <Typography>No pending swap requests found.</Typography>
      )}

      {swapRequests.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From Shift</TableCell>
                <TableCell>To Shift</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>To Member</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {swapRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {request.fromEvent?.startDate
                      ? `${new Date(request.fromEvent.startDate).toLocaleString()} - ${new Date(
                          request.fromEvent.endDate
                        ).toLocaleString()} (${request.fromEvent.location})`
                      : request.fromEvent}
                  </TableCell>
                  <TableCell>
                    {request.toEvent?.startDate
                      ? `${new Date(request.toEvent.startDate).toLocaleString()} - ${new Date(
                          request.toEvent.endDate
                        ).toLocaleString()} (${request.toEvent.location})`
                      : request.toEvent}
                  </TableCell>
                  <TableCell>{request.requester?._id || request.requester}</TableCell>
                  <TableCell>{request.toMember?._id || request.toMember}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleSwapAction(request._id, true)}
                      disabled={loading || request.status !== 'pending'}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleSwapAction(request._id, false)}
                      disabled={loading || request.status !== 'pending'}
                    >
                      Decline
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ReviewSwapRequest;