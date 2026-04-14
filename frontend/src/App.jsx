import { Routes, Route, useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Login from './pages/login/Login.jsx';
import AllShifts from './pages/all-shifts/AllShifts.jsx';
import MyShifts from './pages/my-shifts/MyShifts.jsx';
import SwapShifts from './pages/swap-shifts/SwapShifts.jsx';
import Sidebar from './components/sidebar/Sidebar.jsx';
import NewMember from './pages/new-member/NewMember.jsx';
import ProtectedRoute from './utils/protectedRoute.jsx';
import useStore from './hooks/useStore.js';
import CustomAlert from './components/snackbar-popup/CustomAlert.jsx';
import NewPassword from './pages/new-password/NewPassword.jsx';
import NewShift from './pages/new-shift/NewShift.jsx';
import EditShift from './pages/edit-shifts/EditShifts.jsx';
import ReviewSwapRequest from './pages/review-swap-request/ReviewSwapRequest.jsx';
import RespondSwapRequest from './pages/respond-swap-request/RespondSwapRequest.jsx';
import ManageUsers from './pages/manage-users/ManageUsers.jsx';
import ManageEvents from './pages/manage-events/ManageEvents.jsx';

function App() {
  // Access global state for authentication and member verification
  const { memberCheck } = useStore((state) => state);
  const navigate = useNavigate();
  const location = useLocation();

  // Define paths exempt from sidebar rendering
  const exemptions = !["/login", "/new-password"].includes(location.pathname);

  // Check member authentication status on mount or when memberCheck changes
  useEffect(() => {
    memberCheck();
  }, [memberCheck]);
  
  return (
    // Provide date handling with Day.js adapter
    <LocalizationProvider dateAdapter={AdapterDayjs}>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', minHeight: '100vh', width: '100vw' }}>
        {/* Render Sidebar only for non-exempt routes */}
        {exemptions &&
          <Box>
            <Sidebar />
          </Box>
        }


        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowY: 'auto' }}>
          <CustomAlert />

          

          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/members/new-password" element={<NewPassword />} />

            {/* Protected routes requiring authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" /> {/* Default route */}
              <Route path="/shifts/my-shifts" element={<MyShifts />} />
              <Route path="/shifts/all-shifts" element={<AllShifts />} />
              <Route path="/shifts/swap-shift" element={<SwapShifts />} />
              <Route path="/shifts/respond-swap-request" element={<RespondSwapRequest />} />
              <Route path="/shifts/edit-shift/:id" element={<EditShift />} />
            </Route>

            {/* Routes requiring specific permissions for user/event management */}
            <Route element={<ProtectedRoute requiredPerm={["manage-users", "manage-all-users"]} />}>
              <Route path="/members/new-member" element={<NewMember />} />
              <Route path="/shifts/review-swap-request" element={<ReviewSwapRequest />} />
              <Route path="/members/manage-members" element={<ManageUsers />} />
              <Route path="/events/manage-events-types" element={<ManageEvents />} />
            </Route>

            {/* Routes requiring shift assignment permissions */}
            <Route element={<ProtectedRoute requiredPerm={["assign-shifts-to-team-leader", "assign-shifts-to-worker", "assign-all-shifts"]} />}>
              <Route path="/shifts/new-shift" element={<NewShift />} />
            </Route>
          </Routes>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default App;