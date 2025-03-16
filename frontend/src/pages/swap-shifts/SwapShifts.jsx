import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import useStore from '../../hooks/useStore.js';
import useForm from '../../hooks/useForm.js';
import styles from './SwapShifts.module.css'; 

const SwapShifts = () => {
  const { loggedInMember, fetchEvents, fetchSingleEvent, events, loading, requestEventSwap } = useStore((state) => state);

  const { formState, handleFormChange, updateFormField } = useForm({
    fromEventId: '', // Shift the user wants to swap out of
    toEventId: '',   // Shift the user wants to swap into
    toMemberId: '',  // Member to swap with
  });

  // State for members assigned to the selected "to" event
  const [toEventMembers, setToEventMembers] = useState([]);
  
  // State for displaying success/error alerts
  const [alert, setAlert] = useState({ type: null, message: null });

  // Fetch all events when the component mounts
  useEffect(() => {
    fetchEvents('/shifts/all-shifts');
  }, [fetchEvents]);

  // Filter shifts assigned to the logged-in member
  const myShifts = events.filter((event) =>
    event.people.some((memberId) => memberId === loggedInMember?._id)
  );

  // Filter available shifts to swap into (excluding the user's own shifts)
  const availableShifts = events.filter(
    (event) => !event.people.includes(loggedInMember?._id)
  );

  // Fetch details of the selected "to" event to populate member options
  useEffect(() => {
    const fetchToEventDetails = async () => {
      if (formState.toEventId) {
        const eventData = await fetchSingleEvent(formState.toEventId);
        if (eventData) {
          setToEventMembers(eventData.people || []);
        }
      } else {
        setToEventMembers([]);
      }
    };
    fetchToEventDetails();
  }, [formState.toEventId, fetchSingleEvent]);

  // Handle the swap request submission
  const handleSwapRequest = async () => {
    setAlert({ type: null, message: null }); 

    const { fromEventId, toEventId, toMemberId } = formState;

    // Validate all fields are selected
    if (!fromEventId || !toEventId || !toMemberId) {
      setAlert({ type: 'error', message: 'Bitte wählen Sie alle erforderlichen Felder aus.' });
      return;
    }

    // Submit swap request to the server
    const result = await requestEventSwap(loggedInMember._id, {
      fromEventId,
      toEventId,
      toMemberId,
    });

    // Display result alert and reset form on success
    setAlert({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      updateFormField('fromEventId', '');
      updateFormField('toEventId', '');
      updateFormField('toMemberId', '');
    }
  };

  return (
    <div className={styles.swapShiftsContainer}>
      {/* Container to center the swap form */}
      <div className={styles.swapShiftsForm}>
        <Typography variant="h4" component="h1" className={styles.swapShiftsHeader}>
          Request a Shift Swap
        </Typography>

        {/* Loading indicator */}
        {loading && <CircularProgress className={styles.loadingSpinner} />}

        {/* Form container */}
        <Box component="form" noValidate className={styles.formBox}>
          {/* From Event Selection */}
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Select Your Shift</InputLabel>
            <Select
              name="fromEventId"
              value={formState.fromEventId}
              onChange={handleFormChange}
              label="Select Your Shift"
              className={styles.selectField}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {myShifts.map((shift) => (
                <MenuItem key={shift._id} value={shift._id}>
                  {new Date(shift.startDate).toLocaleString()} -{' '}
                  {new Date(shift.endDate).toLocaleString()} ({shift.location})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* To Event Selection */}
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Select Shift to Swap Into</InputLabel>
            <Select
              name="toEventId"
              value={formState.toEventId}
              onChange={handleFormChange}
              label="Select Shift to Swap Into"
              className={styles.selectField}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableShifts.map((shift) => (
                <MenuItem key={shift._id} value={shift._id}>
                  {new Date(shift.startDate).toLocaleString()} -{' '}
                  {new Date(shift.endDate).toLocaleString()} ({shift.location})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* To Member Selection */}
          <FormControl fullWidth disabled={loading || !formState.toEventId}>
            <InputLabel>Select Member to Swap With</InputLabel>
            <Select
              name="toMemberId"
              value={formState.toMemberId}
              onChange={handleFormChange}
              label="Select Member to Swap With"
              className={styles.selectField}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {toEventMembers.map((memberId) => (
                <MenuItem key={memberId} value={memberId}>
                  {memberId} {/* TODO: Replace with member name if available */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            variant="contained"
            onClick={handleSwapRequest}
            disabled={loading}
            className={styles.swapShiftsButton}
          >
            Request Swap
          </Button>

          {/* Alert Messages */}
          {alert.type && (
            <Alert severity={alert.type} className={styles.alert}>
              {alert.message}
            </Alert>
          )}
        </Box>
      </div>
    </div>
  );
};

export default SwapShifts;