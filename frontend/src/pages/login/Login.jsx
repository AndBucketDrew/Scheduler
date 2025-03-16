// etwaige Imports
import { useState } from 'react';
import styles from './login.module.css';
import animationStyles from '../../assets/styles/starsBackground.module.scss';
import logo from '../../assets/Scheduler.png';

import {
  Typography,
  Button,
  Box,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  Link,
  Card
} from '@mui/material';

import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import { useNavigate, Link as RouterLink } from 'react-router-dom';

import useStore from '../../hooks/useStore.js';
import useForm from '../../hooks/useForm.js';

// functional component
const Login = () => {
  // Javascript-Teil
  const { memberLogin, loggedInMember } = useStore((state) => state);

  const [showPassword, setShowPassword] = useState(false);

  const { formState, handleFormChange } = useForm({ email: '', password: '' });

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log(formState);
    const result = await memberLogin(formState);
    console.log('Response from memberLogin:', result);
    if (result.requiresPasswordSetup) {
      navigate('/members/new-password', { state: { memberId: result.memberId } });
    } else if (result) {
      navigate('/shifts/my-shifts');
    } else {
      setMessage('Login failed. Please check your credentials.');
    }
  };

  // JSX-Teil
  return (
    <div className={styles.loginContainer}>
      {/* Background Animation */}
      <div className={animationStyles.starsContainer}>
        <div className={animationStyles.stars}></div>
        <div className={animationStyles.stars2}></div>
        <div className={animationStyles.stars3}></div>
      </div>
      <Card className={styles.loginCard}>
        <div className={styles.loginLeft}>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
        <div className={styles.loginRight}>
          <div>
            <Typography variant="h4" component="h1" className={styles.loginTitle}>
              Anmelden
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Benutzername / Emailadresse"
                variant="outlined"
                name="email"
                value={formState.email}
                onChange={handleFormChange}
              />
              <TextField
                label="Passwort"
                variant="outlined"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formState.password}
                onChange={handleFormChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Passwort-Anzeige ein- oder ausschalten"
                        onClick={handleClickShowPassword}
                      >
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" onClick={handleLogin}>
                Absenden
              </Button>
            </Stack>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
