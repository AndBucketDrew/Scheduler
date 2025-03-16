import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

export const NAV_LINKS = Object.freeze([
  {
    label: 'Shifts',
    to: '/shifts',
    icon: <CalendarMonthIcon className="navIcon"/>,
    subLinks: [
      { label: 'My Shifts', to: '/shifts/my-shifts' },
      { label: 'All Shifts', to: '/shifts/all-shifts' },
    ],
  },
  {
    label: 'Create Shifts',
    to: '/shifts/new-shift',
    icon: <EditCalendarIcon className="navIcon"/>, 
  },
  {
    label: 'Swap Shifts',
    to: '/shifts/swap-shift',
    icon: <EventRepeatIcon className="navIcon"/>, 
  },
  {
    label: 'Review Swap Request',
    to: '/shifts/review-swap-request',
    icon: <EventRepeatIcon className="navIcon"/>, 
  },
  {
    label: 'Manage Event Types',
    to: '/events/manage-events-types',
    icon: <ManageAccountsIcon className="navIcon"/>, 
  },
  {
    label: 'New Member',
    to: '/members/new-member',
    icon: <PersonAddIcon className="navIcon"/>
  },
  {
    label: 'Manage Users',
    to: '/members/manage-members',
    icon: <ManageAccountsIcon className="navIcon"/>, 
  },
]);