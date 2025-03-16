import { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
} from '@mui/material';
import useStore from '../../hooks/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './editShifts.module.css';

const EditShift = () => {
  const { id: shiftId } = useParams();

  const { raiseAlert, fetchSingleEvent, updateShift, eventTypes, fetchEventTypes, members } = useStore((state) => state);
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    type: '',  
    people: [],      
    startDate: '',  
    endDate: '',    
    location: '',
  });

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  // Fetch shift details when shiftId changes and populate form state
  useEffect(() => {
    const fetchShift = async () => {
      const shift = await fetchSingleEvent(shiftId);
      if (shift) {
        setFormState({
          type: shift.type?._id || '',
          people: shift.people || [],
          startDate: dayjs(shift.startDate).format('YYYY-MM-DDTHH:mm'),
          endDate: dayjs(shift.endDate).format('YYYY-MM-DDTHH:mm'),
          location: shift.location || '',
        });
      }
    };
    fetchShift();
  }, [shiftId, fetchSingleEvent]);


  const handleUpdateShift = async () => {
    const submitForm = new FormData();
    Object.entries(formState).forEach(([key, value]) =>
      submitForm.append(key, Array.isArray(value) ? value.join(',') : value)
    ); // Convert arrays to comma-separated strings if needed (backend expects this)

    try {
      await updateShift(shiftId, submitForm);
      navigate('/shifts/all-shifts');
    } catch (error) {
      raiseAlert('Failed to update shift', 'error'); 
    }
  };

  // Handle changes to the multiple-select people field
  const handlePeopleChange = (event) => {
    const { value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      people: typeof value === 'string' ? value.split(',') : value, // Handle string or array input
    }));
  };

  return (
    <div className={styles.editShiftContainer}>
      {/* Container to center the edit form */}
      <div className={styles.editShiftForm}>
        <Typography variant="h4" component="h1" className={styles.editShiftHeader}>
          Schicht bearbeiten
        </Typography>

        {/* Grid layout for form fields */}
        <Grid container spacing={2} className={styles.formGrid}>
          {/* Event Type Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Schichttyp</InputLabel>
              <Select
                name="type"
                label="Schichttyp"
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                className={styles.selectField}
              >
                {eventTypes.map((eventType) => (
                  <MenuItem key={eventType._id} value={eventType._id}>
                    {eventType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Multiple Select for Assigning Members */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Assign Members</InputLabel>
              <Select
                multiple
                value={formState.people}
                onChange={handlePeopleChange}
                input={<OutlinedInput label="Assign Members" />}
                renderValue={(selected) => (
                  <div className={styles.chipContainer}>
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
                  </div>
                )}
                className={styles.selectField}
              >
                {members.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {`${member.firstName} ${member.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Start Date Input */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Startzeit"
              variant="outlined"
              name="startDate"
              value={formState.startDate}
              onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
              className={styles.textField}
            />
          </Grid>

          {/* End Date Input */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Endzeit"
              variant="outlined"
              name="endDate"
              value={formState.endDate}
              onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
              className={styles.textField}
            />
          </Grid>

          {/* Location Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Standort"
              variant="outlined"
              name="location"
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
              className={styles.textField}
            />
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleUpdateShift}
          className={styles.editShiftButton}
        >
          Schicht aktualisieren
        </Button>
      </div>
    </div>
  );
};

export default EditShift;