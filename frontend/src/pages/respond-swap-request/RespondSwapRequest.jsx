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

const RespondSwapRequest = () => {
  const {
    loggedInMember,
    fetchMyPendingSwapRequests,
    myPendingSwapRequests,
    respondToSwapRequest,
    loading,
  } = useStore((state) => state);

  const [alert, setAlert] = useState({ type: null, message: null });

  useEffect(() => {
    if (loggedInMember?._id) {
      fetchMyPendingSwapRequests(loggedInMember._id);
    }
  }, [loggedInMember, fetchMyPendingSwapRequests]);

  const handleResponse = async (swapRequestId, accept) => {
    setAlert({ type: null, message: null });

    const result = await respondToSwapRequest(loggedInMember._id, swapRequestId, accept);

    setAlert({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    if (result.success) {
      // Refresh the list so the responded request disappears
      fetchMyPendingSwapRequests(loggedInMember._id);
    }
  };

  const formatShift = (event) => {
    if (!event?.startDate) return event;
    return `${new Date(event.startDate).toLocaleString()} - ${new Date(event.endDate).toLocaleString()} (${event.location})`;
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1000px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Incoming Swap Requests
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Someone has requested to swap shifts with you. Accept to forward the request to a leader for final approval, or decline to cancel it.
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

      {alert.type && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {!loading && myPendingSwapRequests.length === 0 && (
        <Typography color="text.secondary">No incoming swap requests.</Typography>
      )}

      {myPendingSwapRequests.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Requested By</TableCell>
                <TableCell>Their Shift (they give up)</TableCell>
                <TableCell>Your Shift (you give up)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myPendingSwapRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {request.requester?.firstName && request.requester?.lastName
                      ? `${request.requester.firstName} ${request.requester.lastName}`
                      : request.requester?._id || request.requester}
                  </TableCell>
                  <TableCell>{formatShift(request.fromEvent)}</TableCell>
                  <TableCell>{formatShift(request.toEvent)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleResponse(request._id, true)}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleResponse(request._id, false)}
                      disabled={loading}
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

export default RespondSwapRequest;
