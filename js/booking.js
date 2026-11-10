/* ==========================================================================
   TyreX – Booking System & LocalStorage Manager
   Handles booking submissions, persistence, and status
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'tyrex_appointments';

  // Seed default demonstration appointments if none exist
  function seedDefaultAppointments() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const defaultAppointments = [
        {
          id: 'TX-4921',
          name: 'Alexander Wright',
          email: 'alex.wright@example.com',
          phone: '+1 (555) 234-5678',
          vehicle: 'BMW M3 Competition (2023)',
          vehiclePlate: 'NYC-8921',
          service: '3D Laser Wheel Alignment',
          date: '2026-11-10',
          time: '10:00 AM',
          status: 'Confirmed',
          notes: 'Front right vibration at highway speeds.',
          price: '$89.00',
          created: '2026-11-05'
        },
        {
          id: 'TX-4922',
          name: 'Sarah Jenkins',
          email: 'sarah.j@example.com',
          phone: '+1 (555) 345-6789',
          vehicle: 'Porsche Macan GTS (2022)',
          vehiclePlate: 'CAL-4420',
          service: 'High-Speed Wheel Balancing',
          date: '2026-11-12',
          time: '02:30 PM',
          status: 'Pending',
          notes: 'Standard seasonal tyre swap and balance.',
          price: '$59.00',
          created: '2026-11-06'
        },
        {
          id: 'TX-4919',
          name: 'David Miller',
          email: 'd.miller@example.com',
          phone: '+1 (555) 456-7890',
          vehicle: 'Audi RS6 Avant (2024)',
          vehiclePlate: 'TEX-9011',
          service: 'Premium Tyre Replacement (4x)',
          date: '2026-11-02',
          time: '11:15 AM',
          status: 'Completed',
          notes: 'Fitted 4x Michelin Pilot Sport 4S tyres.',
          price: '$840.00',
          created: '2026-10-30'
        },
        {
          id: 'TX-4915',
          name: 'Elena Rostova',
          email: 'elena.r@example.com',
          phone: '+1 (555) 567-8901',
          vehicle: 'Mercedes-AMG C63 (2021)',
          vehiclePlate: 'FLA-7732',
          service: 'Nitrogen Purge & Alignment',
          date: '2026-10-28',
          time: '04:00 PM',
          status: 'Completed',
          notes: 'Complete nitrogen filling and track alignment.',
          price: '$120.00',
          created: '2026-10-25'
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAppointments));
    }
  }

  // Get all appointments
  function getAppointments() {
    seedDefaultAppointments();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  // Save appointments
  function saveAppointments(appointments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }

  // Add new appointment
  function addAppointment(appointmentData) {
    const list = getAppointments();
    const newId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
    const newAppointment = {
      id: newId,
      status: 'Pending',
      created: new Date().toISOString().split('T')[0],
      ...appointmentData
    };
    list.unshift(newAppointment);
    saveAppointments(list);
    return newAppointment;
  }

  // Update appointment status
  function updateAppointmentStatus(id, newStatus) {
    const list = getAppointments();
    const found = list.find(item => item.id === id);
    if (found) {
      found.status = newStatus;
      saveAppointments(list);
      return true;
    }
    return false;
  }

  // Delete appointment
  function deleteAppointment(id) {
    let list = getAppointments();
    list = list.filter(item => item.id !== id);
    saveAppointments(list);
    return true;
  }

  // Setup Booking Form Handler (Modal & Dedicated Forms)
  function initBookingForms() {
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(inp => {
      if (!inp.value) inp.value = today;
      inp.min = today;
    });

    const bookingForms = document.querySelectorAll('.appointment-booking-form, #bookingModalForm, #contactAppointmentForm');
    bookingForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('[name="name"]') || form.querySelector('#bookingName');
        const emailInput = form.querySelector('[name="email"]') || form.querySelector('#bookingEmail');
        const phoneInput = form.querySelector('[name="phone"]') || form.querySelector('#bookingPhone');
        const vehicleInput = form.querySelector('[name="vehicle"]') || form.querySelector('#bookingVehicle');
        const serviceInput = form.querySelector('[name="service"]') || form.querySelector('#bookingService');
        const dateInput = form.querySelector('[name="date"]') || form.querySelector('#bookingDate');
        const timeInput = form.querySelector('[name="time"]') || form.querySelector('#bookingTime');
        const notesInput = form.querySelector('[name="notes"]') || form.querySelector('#bookingNotes');

        if (!nameInput || !nameInput.value.trim()) {
          if (window.showToast) window.showToast('Please enter your full name', 'error');
          return;
        }
        if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes('@')) {
          if (window.showToast) window.showToast('Please provide a valid email address', 'error');
          return;
        }
        if (!phoneInput || !phoneInput.value.trim()) {
          if (window.showToast) window.showToast('Please provide your contact phone number', 'error');
          return;
        }

        const appointment = addAppointment({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          vehicle: vehicleInput ? vehicleInput.value.trim() : 'Standard Vehicle',
          vehiclePlate: 'AUTO-' + Math.floor(100 + Math.random() * 900),
          service: serviceInput ? serviceInput.value : 'Wheel Alignment & Checkup',
          date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
          time: timeInput ? timeInput.value : '10:00 AM',
          notes: notesInput ? notesInput.value.trim() : 'Booking created via website.',
          price: '$79.00'
        });

        // Close modal if inside one
        const modal = form.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }

        form.reset();

        if (window.showToast) {
          window.showToast(`Appointment Confirmed! Reference: #${appointment.id}`, 'success');
        }

        // Trigger dynamic updates if on dashboard or admin page
        if (window.refreshDashboardBookings) {
          window.refreshDashboardBookings();
        }
        if (window.refreshAdminAppointments) {
          window.refreshAdminAppointments();
        }
      });
    });
  }

  // Run on startup
  seedDefaultAppointments();

  document.addEventListener('DOMContentLoaded', initBookingForms);

  // Expose API
  window.TyreXBooking = {
    getAppointments,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment
  };
})();
