import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import useStore from '../../hooks/useStore.js';
import useForm from '../../hooks/useForm.js';
import { useNavigate } from 'react-router-dom';
import styles from './newShift.module.css';
import sharedStyles from '../../assets/styles/shared.module.css';

const NewShift = () => {
  // Destructure necessary methods and state from the global store
  const { raiseAlert, createEvent, fetchEventTypes, eventTypes, fetchMembers, members } = useStore((state) => state);

  // Initialize form state with useForm hook
  const { formState, handleFormChange } = useForm({
    type: '',
    people: [],
    startDate: '',
    endDate: '',
    location: '',
  });

  const navigate = useNavigate();

  // Fetch event types and members when the component mounts
  useEffect(() => {
    fetchEventTypes();
    fetchMembers();
    console.log("Fetched Members:", members); // Debug log for members
  }, [fetchEventTypes, fetchMembers]);

  // Handle form submission to create a new shift
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare event data for submission
    const eventData = {
      type: formState.type,
      people: formState.people.join(', '), // Convert array to comma-separated string
      startDate: formState.startDate,
      endDate: formState.endDate,
      location: formState.location,
    };

    const success = await createEvent(eventData);
    console.log("Event creation response:", success);

    // Navigate to all shifts on success, or show error alert
    if (success) {
      navigate('/shifts/all-shifts');
    } else {
      raiseAlert({
        severity: 'error',
        text: 'Es gab ein Problem beim Erstellen der Schicht. Bitte überprüfen Sie die Felder.',
      });
    }
  };

  // Handle changes to the multiple-select people field
  const handlePeopleChange = (event) => {
    const { value } = event.target;
    handleFormChange({
      target: {
        name: 'people',
        value: typeof value === 'string' ? value.split(',') : value, // Handle string or array input
      },
    });
  };

  return (
    <div className={sharedStyles.pageContainer}>
      <div className={sharedStyles.card}>
        <Typography variant="h4" component="h1" className={sharedStyles.cardTitle}>
          Create New Shift
        </Typography>

        {/* Form with flex column layout */}
        <Box component="form" onSubmit={handleSubmit} className={styles.formBox}>
          {/* Event Type Selection */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Event Type</InputLabel>
            <Select
              name="type"
              value={formState.type}
              onChange={handleFormChange}
              label="Event Type"
              className={sharedStyles.field}
            >
              <MenuItem value="">
                <em>Select an event type</em>
              </MenuItem>
              {eventTypes.map((eventType) => (
                <MenuItem key={eventType._id} value={eventType._id}>
                  {eventType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Multiple Select for Assigning Members */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Assign Members</InputLabel>
            <Select
              multiple
              value={formState.people}
              onChange={handlePeopleChange}
              input={<OutlinedInput label="Assign Members" />}
              renderValue={(selected) => (
                <Box className={sharedStyles.chipRow}>
                  {selected.map((id) => {
                    const member = members.find((m) => m._id === id);
                    return member ? (
                      <Chip
                        key={id}
                        label={`${member.firstName} ${member.lastName}`}
                        className={styles.chip}
                      />
                    ) : null;
                  })}
                </Box>
              )}
              className={sharedStyles.field}
            >
              {members.map((member) => (
                <MenuItem key={member._id} value={member._id} className={styles.menuItem}>
                  <Avatar className={styles.avatar}>
                    {member?.firstName?.charAt(0).toUpperCase()}
                    {member?.lastName?.charAt(0).toUpperCase()}
                  </Avatar>
                  {`${member.firstName} ${member.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Start Date Input */}
          <TextField
            fullWidth
            label="Start Date"
            type="datetime-local"
            name="startDate"
            value={formState.startDate}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
            required
            variant="outlined"
            className={sharedStyles.field}
          />

          {/* End Date Input */}
          <TextField
            fullWidth
            label="End Date"
            type="datetime-local"
            name="endDate"
            value={formState.endDate}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
            required
            variant="outlined"
            className={sharedStyles.field}
          />

          {/* Location Input */}
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formState.location}
            onChange={handleFormChange}
            required
            variant="outlined"
            className={sharedStyles.field}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            className={sharedStyles.btnPrimary}
          >
            Create Shift
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default NewShift;