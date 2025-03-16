import { useState } from 'react';
import styles from './newPassword.module.css';
import logo from '../../assets/Scheduler.png';

import {
  Typography,
  Button,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  Card
} from '@mui/material';

import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import useStore from '../../hooks/useStore.js';
import useForm from '../../hooks/useForm.js';

const NewPassword = () => {
  const { memberResetPassword, decodedToken } = useStore((state) => state);

  const [showPassword, setShowPassword] = useState(false);

  const { formState, handleFormChange } = useForm({ password: '', repeatPassword: '' });

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    console.log(formState);

    if (formState.password !== formState.repeatPassword) {
      console.error('Passwords must match');
      return;
    }

    const memberId = decodedToken;
    const payload = {
      id: memberId,
      password: formState.password
    };

    try {
      const result = await memberResetPassword(payload);
      console.log('Password reset successfully', result);
      navigate('/login');
    } catch (err) {
      console.error('Error at handleChangePassword', err);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <div>
          <Typography variant="h4" component="h1" className={styles.loginTitle}>
            Set a Password
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="New Password"
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
            <TextField
              label="Repeat Password"
              variant="outlined"
              name="repeatPassword"
              type={showPassword ? 'text' : 'password'}
              value={formState.repeatPassword}
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
            <Button variant="contained" onClick={handleChangePassword}>
              Set New Password
            </Button>
          </Stack>
        </div>
      </Card>
    </div>
  );
};

export default NewPassword;