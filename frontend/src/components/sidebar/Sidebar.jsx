import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/navLinks.jsx';
import styles from './sidebar.module.css';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useStore from '../../hooks/useStore.js';
import { fetchAPI } from '../../utils/index.js';

const Sidebar = () => {
  const { memberLogout, loggedInMember, token } = useStore((state) => state);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setOpenSubMenu(null); // Close all submenus when toggling sidebar
  };

  const toggleSubMenu = (menu) => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    memberLogout();
  };

  const handleRunWeeklyJob = async () => {
    try {
      await fetchAPI({ method: 'post', url: '/shifts/trigger-weekly-job', token });
      alert('Weekly job ran successfully!');
    } catch (err) {
      alert('Weekly job failed. Check the console.');
      console.error(err);
    }
  };

  return (
    <nav className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.close}`}>
      <ul>
        <li>
          <span className={styles.logo}>Scheduler</span>
          <button onClick={toggleSidebar} className={`${styles.togglebtn} ${!isSidebarOpen ? styles.rotate : ''}`}>
            {/* Found The SVG Arrow Online replace if needed */}
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="m313-480 155 156q11 11 11.5 27.5T468-268q-11 11-28 11t-28-11L228-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 27.5-11.5T468-692q11 11 11 28t-11 28L313-480Zm264 0 155 156q11 11 11.5 27.5T732-268q-11 11-28 11t-28-11L492-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 27.5-11.5T732-692q11 11 11 28t-11 28L577-480Z" />
            </svg>
          </button>
        </li>

        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            {/* Handle Submenu (if present) */}
            {link.subLinks ? (
              <>
                <button
                  onClick={() => toggleSubMenu(link.label)}
                  className={`${styles.dropdownbtn} ${openSubMenu === link.label ? styles.rotate : ''}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-361q-8 0-15-2.5t-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5Z" /></svg>
                </button>
                <ul className={`${styles.submenu} ${openSubMenu === link.label ? styles.show : ''}`}>
                  <div>
                  {link.subLinks.map((subLink) => (
                    <li key={subLink.to}>
                        <NavLink
                          to={subLink.to}
                          className={({ isActive }) =>
                            isActive ? `${styles.active} ${styles.navLink}` : styles.navLink
                          }
                        >
                          <span>{subLink.label}</span>
                        </NavLink>
                    </li>
                  ))}
                  </div>
                </ul>
              </>
            ) : (
              // Normal link (no submenu)
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive ? `${styles.active} ${styles.navLink}` : styles.navLink
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            )}
          </li>
        ))}
        <br />
        {loggedInMember?.role === 'super-admin' && (
          <li>
            <button onClick={handleRunWeeklyJob} className={styles.dropdownbtn}>
              <PlayArrowIcon />
              <span>Run Weekly Job</span>
            </button>
          </li>
        )}
        <li>
          <button onClick={handleLogout} className={styles.dropdownbtn}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </li>

      </ul>
    </nav>
  );
};

export default Sidebar;
