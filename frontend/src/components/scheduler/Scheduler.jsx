import styles from './scheduler.module.css';
import useStore from '../../hooks/useStore.js';
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react';
import { createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createResizePlugin } from '@schedule-x/resize';
import '@schedule-x/theme-default/dist/calendar.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { LoadingSpinner } from '../loading-spinner/LoadingSpinner.jsx';
import { useNavigate } from 'react-router';
import { getPermissionsFromToken } from '../../utils/auth.js';

const Scheduler = ({ url }) => {
  const { events, fetchEvents, loading, fetchMembers, members, updateShift, deleteEvent } = useStore((state) => state);
  const hasFetched = useRef(false); //For debugging
  const schedulerRef = useRef(null); 
  const footerRef = useRef(null); 
  const modalRef = useRef(null);
  const [modal, setModal] = useState({ visible: false, event: null, x: 0, y: 0 }); 
  const [pendingChanges, setPendingChanges] = useState([]); 
  const navigate = useNavigate();
  const permissions = useMemo(() => getPermissionsFromToken(), []); // Get user permissions from token
  const canEdit = useMemo(() => permissions.includes('edit-shifts'), [permissions]);

  useEffect(() => {
    if (url && !hasFetched.current) {
      //Keep the function oreder to avoid Member name/Lastname display issues
      fetchMembers();
      fetchEvents(url);
      hasFetched.current = true;
      console.log("fetchEvents initialized successfully");
    }
  }, [url, fetchEvents]);

  // Save pending changes to the server and sync calendar
  const handleSaveChanges = async () => {
    if (pendingChanges.length > 0) {
      await Promise.all(
        pendingChanges.map((event) => {
          updateShift(event.id, {
            startDate: event.start,
            endDate: event.end,
          });
        })
      );
      pendingChanges.forEach((event) => calendarApp.events.update(event));
      setPendingChanges([]);
    }
  };

  const handleDiscardChanges = () => {
    setPendingChanges([]);
    fetchEvents(url);
  };

  // Format events for calendar display using memoization to reduce fetching
  const formattedEvents = useMemo(() => {
    console.log('Formatting events:', events);
    return events.map((event) => {
      const formattedStart = dayjs(event.startDate).format('YYYY-MM-DD HH:mm');
      const formattedEnd = dayjs(event.endDate).format('YYYY-MM-DD HH:mm');

      const peopleNames = event.people
        .map((userId) => {
          const member = members.find((m) => m._id === userId);
          return member ? `${member.firstName} ${member.lastName}` : userId;
        });

      return {
        id: event._id,
        title: event.type.name || 'Untitled',
        start: formattedStart,
        end: formattedEnd,
        location: event.location || '',
        people: peopleNames,
      };
    });
  }, [events, members]);

  // Configure calendar settings, views, and plugins based on edit permissions
  const calendarConfig = useMemo(() => ({
    views: [createViewWeek(), createViewMonthGrid()],
    events: formattedEvents,
    plugins: canEdit ? [
      createDragAndDropPlugin(),
      createResizePlugin(30),
    ] : [],
    callbacks: {
      onEventUpdate: (updatedEvent) => {
        if (!canEdit) return;
        console.log("updatedEvent Changed:", updatedEvent);
        setPendingChanges((prev) => {
          const updatedChanges = [...prev];
          const index = updatedChanges.findIndex((e) => e.id === updatedEvent.id);

          if (index !== -1) {
            updatedChanges[index] = updatedEvent; // Update existing event in pending changes
          } else {
            updatedChanges.push(updatedEvent); // Add new event to pending changes
          }

          return updatedChanges;
        });
      },
      onEventClick: (clickedEvent) => {
        if (modal.visible) {
          setModal({ ...modal, visible: false });
          return;
        }

        // Position modal near the clicked event
        const eventElement = schedulerRef.current.querySelector(`[data-event-id="${clickedEvent.id}"]`);
        let x = 0, y = 0;
        if (eventElement) {
          const rect = eventElement.getBoundingClientRect();
          x = rect.left;
          y = rect.top;
        }

        setModal({
          visible: true,
          event: clickedEvent,
          x,
          y,
        });
      },
    },
  }), [formattedEvents, canEdit, modal]);

  const calendarApp = useCalendarApp(calendarConfig);

  // Update calendar events when formattedEvents change
  useEffect(() => {
    if (calendarApp && events.length > 0) {
      console.log('Updating calendar events:', formattedEvents);
      calendarApp.events.set(formattedEvents);
    }
  }, [calendarApp, formattedEvents]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && modal.visible) {
        setModal({ ...modal, visible: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modal]);

  // Dynamically position footer based on scheduler dimensions
  useEffect(() => {
    const updateFooterPosition = () => {
      if (footerRef.current && schedulerRef.current) {
        const schedulerRect = schedulerRef.current.getBoundingClientRect();
        footerRef.current.style.width = `${schedulerRect.width}px`;
        footerRef.current.style.left = `${schedulerRect.left}px`;
      }
    };

    updateFooterPosition();
    window.addEventListener('resize', updateFooterPosition);
    return () => window.removeEventListener('resize', updateFooterPosition);
  }, [pendingChanges]);

  const handleDelete = async (eventId) => {
    if (!canEdit) return;
    const response = await deleteEvent(eventId);
  
    if (response.success) {
      calendarApp.events.set(formattedEvents.filter((e) => e.id !== eventId));
      setModal((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleEdit = (eventId) => {
    if (!canEdit) return;
    navigate(`/shifts/edit-shift/${eventId}`);
    setModal({ ...modal, visible: false });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!loading && events.length === 0) {
    return (
      <div className={styles.noShiftsMessage}>
        <p>Your shifts will be displayed here</p>
      </div>
    );
  }

  return (
    <div ref={schedulerRef} style={{ position: 'relative' }}>
      <ScheduleXCalendar calendarApp={calendarApp} />
      {modal.visible && (
        <div ref={modalRef} className={styles.modal} style={{ top: modal.y, left: modal.x }}>
          <h4>{modal.event.title}</h4>
          <p>Start: {dayjs(modal.event.start).format('DD.MM.YYYY HH:mm')}</p>
          <p>End: {dayjs(modal.event.end).format('DD.MM.YYYY HH:mm')}</p>
          <p>Location: {modal.event.location || 'N/A'}</p>
          <p>Assigned: {modal.event.people.join(', ') || 'None'}</p>
          <div className={styles.modalActions}>
            <button className={styles.deleteBtn} onClick={() => handleDelete(modal.event.id)}>
              Delete
            </button>
            <button className={styles.editBtn} onClick={() => handleEdit(modal.event.id)}>
              Edit
            </button>
          </div>
        </div>
      )}
      {pendingChanges.length > 0 && (
        <footer ref={footerRef} className={styles.stickyFooter}>
          <div className={styles.leftSection}>
            <p>Changes detected ({pendingChanges.length} events)</p>
          </div>
          <div className={styles.rightSection}>
            <button className={styles.saveBtn} onClick={handleSaveChanges}>
              Save
            </button>
            <button className={styles.discardBtn} onClick={handleDiscardChanges}>
              Discard
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Scheduler;