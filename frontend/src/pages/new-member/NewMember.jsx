import {
  Grid2 as Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import useStore from '../../hooks/useStore.js'; // Custom hook for accessing global state
import useForm from '../../hooks/useForm.js';   // Custom hook for form state management
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // React Router utilities
import styles from './NewMember.module.css';   // Import CSS Module for scoped styling

const NewMember = () => {
  // Destructure necessary methods from the global store
  const { raiseAlert, memberSignup } = useStore((state) => state);

  // Initialize form state using useForm hook with default values
  const { formState, handleFormChange } = useForm({
    //Pre-filled fields for Demo
    email: 'hugo@hugo.at',       
    firstName: 'Hugo',         
    lastName: 'Tester',         
    birthDay: '21',             
    birthMonth: '1',            
    birthYear: '1966',        
    number: '1234567890',       
    age: 58,                    
    role: 'worker',             
  });

  const navigate = useNavigate();

  const handleSignup = async () => {
    // Create a FormData object to send form data to the server
    const submitForm = new FormData();
    Object.entries(formState).forEach(([key, value]) => submitForm.append(key, value));

    // Attempt to sign up the member and await the result
    const result = await memberSignup(submitForm); 

    if (result) {
      navigate('/shifts/all-shifts');
    } else {
      raiseAlert({
        severity: 'error',
        text: 'Es gab ein Problem bei der Registrierung. Bitte überprüfen Sie die Felder.',
      });
    }
  };

  return (
    // Outer container to center the form on the page
    <div className={styles.newmemberContainer}>
      {/* Form wrapper with styling */}
      <div className={styles.newmemberForm}>
        {/* Form header */}
        <Typography variant="h4" component="h1" className={styles.newmemberHeader}>
          Create New Member
        </Typography>

        {/* Grid layout for form fields */}
        <Grid container spacing={2}>
          {/* Email field */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Email-Adresse"
              variant="outlined"
              name="email"
              value={formState.email}
              onChange={handleFormChange}
              className={styles.textField}
            />
          </Grid>
          {/* First Name field */}
          <Grid size={6}>
            <TextField
              fullWidth
              label="Vorname"
              variant="outlined"
              name="firstName"
              value={formState.firstName}
              onChange={handleFormChange}
              className={styles.textField}
            />
          </Grid>
          {/* Last Name field */}
          <Grid size={6}>
            <TextField
              fullWidth
              label="Nachname"
              variant="outlined"
              name="lastName"
              value={formState.lastName}
              onChange={handleFormChange}
              className={styles.textField}
            />
          </Grid>
          {/* Birth Day field */}
          <Grid size={4}>
            <TextField
              fullWidth
              label="Tag"
              variant="outlined"
              name="birthDay"
              value={formState.birthDay}
              onChange={handleFormChange}
              className={styles.textField}
            />
          </Grid>
          {/* Birth Month field */}
          <Grid size={4}>
            <TextField
              fullWidth
              label="Monat"
              variant="outlined"
              name="birthMonth"
              value={formState.birthMonth}
              onChange={handleFormChange}
              className={styles.textField}
            />
          </Grid>
          {/* Birth Year field */}
          <Grid size={4}>
            <TextField
              fullWidth
              label="Jahr"
              variant="outlined"
              name="birthYear"
              value={formState.birthYear}
              onChange={handleFormChange}
              className={styles.textField}
            />
          </Grid>
          {/* Phone Number field */}
          <Grid size={6}>
            <TextField
              fullWidth
              label="Telefonnummer"
              variant="outlined"
              name="number"
              value={formState.number}
              onChange={handleFormChange}
              className={styles.textField}
            />
          </Grid>
          {/* Age field */}
          <Grid size={6}>
            <TextField
              fullWidth
              label="Alter"
              variant="outlined"
              name="age"
              value={formState.age}
              onChange={handleFormChange}
              type="number"
              className={styles.textField}
            />
          </Grid>
          {/* Role selection */}
          <Grid size={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Rolle</InputLabel>
              <Select
                label="Rolle"
                name="role"
                value={formState.role}
                onChange={handleFormChange}
                className={styles.textField}
              >
                <MenuItem value="super-admin">Super Admin</MenuItem>
                <MenuItem value="office-leader">Office Leader</MenuItem>
                <MenuItem value="team-leader">Team Leader</MenuItem>
                <MenuItem value="worker">Worker</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Submit button to confirm member creation */}
        <Button
          variant="contained"
          onClick={handleSignup}
          className={styles.newmemberButton}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default NewMember;