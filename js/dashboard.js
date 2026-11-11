/* ==========================================================================
   TyreX – Customer Dashboard Controller
   Tab navigation, Vehicle management, Bookings list, Profile updates
   ========================================================================== */

(function () {
  'use strict';

  const VEHICLES_KEY = 'tyrex_user_vehicles';

  const DEFAULT_VEHICLES = [
    { id: 'v1', make: 'BMW', model: 'M3 Competition', year: '2023', plate: 'NYC-8921', tyreSize: '275/35 R19' },
    { id: 'v2', make: 'Porsche', model: 'Macan GTS', year: '2022', plate: 'CAL-4420', tyreSize: '265/45 R20' }
  ];

  function getVehicles() {
    try {
      return JSON.parse(localStorage.getItem(VEHICLES_KEY)) || DEFAULT_VEHICLES;
    } catch (e) {
      return DEFAULT_VEHICLES;
    }
  }

  function saveVehicles(vehicles) {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Check if on dashboard page
    const dashboardMain = document.querySelector('.customer-dashboard-main');
    if (!dashboardMain) return;

    // Load active user
    const user = window.TyreXAuth ? window.TyreXAuth.getCurrentUser() : { name: 'Alexander Wright', email: 'alex.wright@example.com' };
    const welcomeNameEls = document.querySelectorAll('.dashboard-user-name');
    welcomeNameEls.forEach(el => el.textContent = user.name || 'Valued Driver');

    const avatarEls = document.querySelectorAll('.dashboard-user-avatar');
    avatarEls.forEach(el => el.textContent = user.avatarText || 'TX');

    // Sidebar Tab Navigation
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-view]');
    const views = document.querySelectorAll('.dashboard-view');
    const pageTitle = document.getElementById('dashboardPageTitle');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetViewId = item.getAttribute('data-view');

        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        views.forEach(v => {
          v.classList.remove('active');
          if (v.id === targetViewId) {
            v.classList.add('active');
          }
        });

        if (pageTitle) {
          const viewTitle = item.querySelector('span') ? item.querySelector('span').textContent : 'Dashboard';
          pageTitle.textContent = viewTitle;
        }

        // Close sidebar on mobile after clicking
        const sidebar = document.querySelector('.dashboard-sidebar');
        if (sidebar && window.innerWidth <= 992) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Mobile Sidebar Toggle
    const toggleSidebarBtn = document.querySelector('.dashboard-toggle-sidebar');
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (toggleSidebarBtn && sidebar) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Topbar Notification & Profile Dropdowns
    const notifBtn = document.getElementById('notifDropdownBtn');
    const notifMenu = document.getElementById('notifDropdownMenu');
    if (notifBtn && notifMenu) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifMenu.classList.toggle('show');
      });
    }

    const userProfileBtn = document.getElementById('userProfileDropdownBtn');
    const userProfileMenu = document.getElementById('userProfileDropdownMenu');
    if (userProfileBtn && userProfileMenu) {
      userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfileMenu.classList.toggle('show');
      });
    }

    document.addEventListener('click', () => {
      if (notifMenu) notifMenu.classList.remove('show');
      if (userProfileMenu) userProfileMenu.classList.remove('show');
    });

    // Render Data
    refreshDashboardBookings();
    renderVehicles();
    setupAddVehicle();
    setupProfileForm();
  });

  // Render Appointments & Summary Metrics
  window.refreshDashboardBookings = function () {
    const appointments = window.TyreXBooking ? window.TyreXBooking.getAppointments() : [];

    // Metrics
    const totalCount = appointments.length;
    const upcomingCount = appointments.filter(a => a.status === 'Confirmed').length;
    const pendingCount = appointments.filter(a => a.status === 'Pending').length;
    const completedCount = appointments.filter(a => a.status === 'Completed').length;

    const totalEl = document.getElementById('metricTotalBookings');
    const upcomingEl = document.getElementById('metricUpcomingBookings');
    const pendingEl = document.getElementById('metricPendingBookings');
    const completedEl = document.getElementById('metricCompletedBookings');

    if (totalEl) totalEl.textContent = totalCount;
    if (upcomingEl) upcomingEl.textContent = upcomingCount;
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (completedEl) completedEl.textContent = completedCount;

    // Render Recent Table on Overview & My Appointments view
    const recentTableBody = document.getElementById('recentBookingsTableBody');
    const allTableBody = document.getElementById('allBookingsTableBody');

    const renderRows = (list, isAll = false) => {
      if (!list || list.length === 0) {
        return `<tr><td colspan="${isAll ? 7 : 6}" style="text-align: center; padding: 2rem;">No appointments found.</td></tr>`;
      }
      return list.map(item => {
        let statusClass = 'status-pending';
        if (item.status === 'Confirmed') statusClass = 'status-confirmed';
        if (item.status === 'Completed') statusClass = 'status-completed';
        if (item.status === 'Cancelled') statusClass = 'status-cancelled';

        return `
          <tr>
            <td><strong>#${item.id}</strong></td>
            <td>
              <div>${item.service}</div>
              <small class="text-muted">${item.vehicle || 'Standard Vehicle'}</small>
            </td>
            <td>${item.date} <br><small class="text-muted">${item.time}</small></td>
            <td><strong>${item.price || '$79.00'}</strong></td>
            <td><span class="status-pill ${statusClass}">${item.status}</span></td>
            <td>
              <div class="table-actions">
                ${item.status !== 'Cancelled' && item.status !== 'Completed' ? `
                  <button class="action-btn-sm delete cancel-booking-btn" data-id="${item.id}" title="Cancel Appointment">
                    <i data-lucide="x-circle"></i>
                  </button>
                ` : '<span class="text-muted" style="font-size:0.8rem;">Archived</span>'}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    };

    if (recentTableBody) {
      recentTableBody.innerHTML = renderRows(appointments.slice(0, 4));
    }
    if (allTableBody) {
      allTableBody.innerHTML = renderRows(appointments, true);
    }

    // Bind Cancel Buttons
    document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to cancel appointment #${id}?`)) {
          window.TyreXBooking.updateAppointmentStatus(id, 'Cancelled');
          window.showToast(`Appointment #${id} has been cancelled`, 'info');
          refreshDashboardBookings();
        }
      });
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  // Render Vehicles
  function renderVehicles() {
    const containers = [
      document.getElementById('vehiclesGrid'),
      document.getElementById('vehiclesGridDedicated')
    ].filter(Boolean);

    if (containers.length === 0) return;

    const vehicles = getVehicles();
    const html = vehicles.length === 0
      ? `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No vehicles registered yet. Click "Add New Vehicle" to register your car.</div>`
      : vehicles.map(v => `
        <div class="vehicle-card" data-vehicle-id="${v.id}">
          <div class="vehicle-card-header">
            <div class="vehicle-card-icon">
              <i data-lucide="car"></i>
            </div>
            <span class="vehicle-plate">${v.plate}</span>
          </div>
          <h4 style="margin-bottom: 0.35rem;">${v.make} ${v.model}</h4>
          <p style="font-size: 0.88rem; margin-bottom: 0.75rem;">Year: ${v.year} • Spec</p>
          <div style="font-size: 0.85rem; background: var(--bg-body); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted">Tyre Fitment:</span>
            <strong>${v.tyreSize || 'Standard'}</strong>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 1.25rem;">
            <button class="btn btn-sm btn-outline quick-book-vehicle-btn" data-vehicle="${v.make} ${v.model}" style="flex: 1;">
              Book Service
            </button>
            <button class="action-btn-sm delete remove-vehicle-btn" data-id="${v.id}" title="Remove Vehicle">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `).join('');

    containers.forEach(container => {
      container.innerHTML = html;

      // Bind vehicle buttons
      container.querySelectorAll('.quick-book-vehicle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const vehName = btn.getAttribute('data-vehicle');
          if (window.openBookingModal) {
            window.openBookingModal(`Full Service for ${vehName}`);
          }
        });
      });

      container.querySelectorAll('.remove-vehicle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const vId = btn.getAttribute('data-id');
          let list = getVehicles();
          list = list.filter(v => v.id !== vId);
          saveVehicles(list);
          window.showToast('Vehicle removed from garage', 'info');
          renderVehicles();
        });
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Setup Add Vehicle Modal/Form
  function setupAddVehicle() {
    const form = document.getElementById('addVehicleForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const make = document.getElementById('vehMake').value.trim();
      const model = document.getElementById('vehModel').value.trim();
      const year = document.getElementById('vehYear').value.trim();
      const plate = document.getElementById('vehPlate').value.trim();
      const tyreSize = document.getElementById('vehTyreSize').value.trim();

      if (!make || !model || !plate) {
        window.showToast('Please fill in vehicle make, model and plate', 'error');
        return;
      }

      const list = getVehicles();
      list.push({
        id: 'v_' + Date.now(),
        make,
        model,
        year: year || '2024',
        plate,
        tyreSize: tyreSize || '225/45 R17'
      });
      saveVehicles(list);
      form.reset();

      const modal = form.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }

      window.showToast(`Vehicle ${make} ${model} registered!`, 'success');
      renderVehicles();
    });
  }

  // Setup Profile Form
  function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;

    const user = window.TyreXAuth.getCurrentUser();
    if (document.getElementById('profName')) document.getElementById('profName').value = user.name || '';
    if (document.getElementById('profEmail')) document.getElementById('profEmail').value = user.email || '';
    if (document.getElementById('profPhone')) document.getElementById('profPhone').value = user.phone || '+1 (555) 234-5678';

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedUser = {
        ...user,
        name: document.getElementById('profName').value.trim(),
        phone: document.getElementById('profPhone').value.trim()
      };
      localStorage.setItem('torq_user', JSON.stringify(updatedUser));
      window.showToast('Profile information updated successfully!', 'success');
      document.querySelectorAll('.dashboard-user-name').forEach(el => el.textContent = updatedUser.name);
    });
  }
})();
