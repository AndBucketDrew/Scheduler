import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import useStore from '../../hooks/useStore.js';

const CustomAlert = () => {
  const { alert, destroyAlert } = useStore((state) => state);

  return (
    <Snackbar open={Boolean(alert)} autoHideDuration={alert?.duration} onClose={destroyAlert}>
      <Alert onClose={destroyAlert} severity={alert?.severity} variant={alert?.variant}>
        {alert?.title && <AlertTitle>{alert?.title}</AlertTitle>}
        {alert?.text}
      </Alert>
    </Snackbar>
  );
};

export default CustomAlert;
