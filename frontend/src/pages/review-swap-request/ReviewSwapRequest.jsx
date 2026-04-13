import React, { useState, useEffect } from 'react';
import {
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
import styles from './reviewSwapRequest.module.css';

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
    <div className={styles.container}>
      <Typography className={styles.title}>Approve Swap Requests</Typography>

      {loading && <CircularProgress className={styles.loader} />}

      {alert.type && (
        <Alert severity={alert.type} className={styles.alert}>
          {alert.message}
        </Alert>
      )}

      {swapRequests.length === 0 && !loading && (
        <Typography className={styles.emptyState}>No pending swap requests found.</Typography>
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
                      className={styles.approveBtn}
                      onClick={() => handleSwapAction(request._id, true)}
                      disabled={loading || request.status !== 'pending'}
                    >
                      Approve
                    </Button>
                    <Button
                      className={styles.declineBtn}
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
    </div>
  );
};

export default ReviewSwapRequest;