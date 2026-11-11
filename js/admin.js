/* ==========================================================================
   TyreX – Admin Dashboard Controller
   Metrics, Product CRUD, Appointment Status Management, Customers & Messages
   ========================================================================== */

(function () {
  'use strict';

  // Seed default demonstration customers
  const CUSTOMERS_KEY = 'tyrex_admin_customers';
  const SERVICE_RATES_KEY = 'torq_admin_service_rates';
  const PACKAGE_PRICES_KEY = 'torq_admin_package_prices';
  const SETTINGS_KEY = 'torq_admin_settings';
  const DEFAULT_CUSTOMERS = [
    { id: 'CUST-301', name: 'Alexander Wright', email: 'alex.wright@example.com', phone: '+1 (555) 234-5678', vehicle: 'BMW M3 Competition', visits: 4, spent: '$1,240' },
    { id: 'CUST-302', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 (555) 345-6789', vehicle: 'Porsche Macan GTS', visits: 2, spent: '$680' },
    { id: 'CUST-303', name: 'David Miller', email: 'd.miller@example.com', phone: '+1 (555) 456-7890', vehicle: 'Audi RS6 Avant', visits: 6, spent: '$2,450' },
    { id: 'CUST-304', name: 'Elena Rostova', email: 'elena.r@example.com', phone: '+1 (555) 567-8901', vehicle: 'Mercedes-AMG C63', visits: 3, spent: '$890' },
    { id: 'CUST-305', name: 'Marcus Vance', email: 'm.vance@example.com', phone: '+1 (555) 678-9012', vehicle: 'Ford Mustang Mach 1', visits: 1, spent: '$320' }
  ];

  function getCustomers() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || DEFAULT_CUSTOMERS;
    } catch (e) {
      return DEFAULT_CUSTOMERS;
    }
  }

  // Seed contact messages
  const MESSAGES_KEY = 'tyrex_contact_messages';
  const ARCHIVED_MESSAGES_KEY = 'torq_archived_messages';
  const DEFAULT_MESSAGES = [
    { id: 'MSG-01', name: 'Robert Chen', email: 'robert.c@example.com', phone: '+1 555-881-2233', vehicle: 'Tesla Model S Plaid', service: 'Wheel Alignment', message: 'Experiencing slight steering pull to the right following pothole impact.', date: '2026-11-06' },
    { id: 'MSG-02', name: 'Jessica Taylor', email: 'jess.t@example.com', phone: '+1 555-442-9900', vehicle: 'Toyota Supra GR', service: 'Tyre Replacement', message: 'Do you have Michelin Pilot Sport 4S 275/35 R19 in stock for next Tuesday?', date: '2026-11-05' }
  ];

  function getMessages() {
    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      const messages = saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
      const archivedIds = JSON.parse(localStorage.getItem(ARCHIVED_MESSAGES_KEY) || '[]');
      if (!Array.isArray(messages) || !Array.isArray(archivedIds)) {
        throw new Error('Stored messages or archive list has an invalid format.');
      }
      return messages.filter((message) => !archivedIds.includes(message.id));
    } catch (error) {
      console.error('Could not load TORQ contact messages.', error);
      return [];
    }
  }

  function readStoredObject(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (error) {
      console.error(`Could not read TORQ admin data from ${key}.`, error);
      return {};
    }
  }

  function parsePrice(value) {
    const parsed = Number.parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 79;
  }

  function updateAdminCategoryCounts() {
    const products = window.TyreXProducts ? window.TyreXProducts.getProducts() : [];
    const counts = { car: 0, bike: 0, suv: 0, wheels: 0, accessories: 0 };
    products.forEach((product) => {
      const category = product.type || 'car';
      if (Object.prototype.hasOwnProperty.call(counts, category)) counts[category] += 1;
    });
    document.querySelectorAll('[data-admin-category-count]').forEach((badge) => {
      const count = counts[badge.dataset.adminCategoryCount] || 0;
      badge.textContent = `${count} ${count === 1 ? 'Product' : 'Products'}`;
    });
  }

  function setupAdminRatesAndSettings() {
    const serviceRates = readStoredObject(SERVICE_RATES_KEY);
    const packagePrices = readStoredObject(PACKAGE_PRICES_KEY);
    const settings = readStoredObject(SETTINGS_KEY);

    document.querySelectorAll('[data-service-rate-value]').forEach((element) => {
      const value = Number(serviceRates[element.dataset.serviceRateValue]);
      if (Number.isFinite(value) && value > 0) element.textContent = `$${value.toFixed(2)}`;
    });
    document.querySelectorAll('[data-package-price-value]').forEach((element) => {
      const value = Number(packagePrices[element.dataset.packagePriceValue]);
      if (Number.isFinite(value) && value > 0) element.textContent = `$${value}`;
    });
    document.querySelectorAll('[data-admin-setting]').forEach((input) => {
      const value = settings[input.dataset.adminSetting];
      if (value !== undefined) input.value = value;
    });

    document.querySelectorAll('[data-edit-service-rate]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.editServiceRate;
        const display = document.querySelector(`[data-service-rate-value="${key}"]`);
        const current = Number((display?.textContent || '').replace(/[^0-9.]/g, ''));
        const input = window.prompt('Enter the new service rate in dollars:', String(current));
        if (input === null) return;
        const value = Number(input);
        if (!Number.isFinite(value) || value <= 0) {
          window.showToast('Enter a valid rate greater than zero.', 'error');
          return;
        }
        serviceRates[key] = value;
        try {
          localStorage.setItem(SERVICE_RATES_KEY, JSON.stringify(serviceRates));
          if (display) display.textContent = `$${value.toFixed(2)}`;
          window.showToast('Service rate saved.', 'success');
        } catch (error) {
          window.showToast('Could not save the service rate.', 'error');
          console.error('Could not save TORQ service rates.', error);
        }
      });
    });

    document.querySelectorAll('[data-edit-package-price]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.editPackagePrice;
        const display = document.querySelector(`[data-package-price-value="${key}"]`);
        const current = Number((display?.textContent || '').replace(/[^0-9.]/g, ''));
        const input = window.prompt('Enter the new package price in dollars:', String(current));
        if (input === null) return;
        const value = Number(input);
        if (!Number.isFinite(value) || value <= 0) {
          window.showToast('Enter a valid price greater than zero.', 'error');
          return;
        }
        packagePrices[key] = value;
        try {
          localStorage.setItem(PACKAGE_PRICES_KEY, JSON.stringify(packagePrices));
          if (display) display.textContent = `$${value}`;
          window.showToast('Package price saved.', 'success');
        } catch (error) {
          window.showToast('Could not save the package price.', 'error');
          console.error('Could not save TORQ package prices.', error);
        }
      });
    });

    const saveSettingsButton = document.getElementById('adminSaveSettingsBtn');
    if (saveSettingsButton) {
      saveSettingsButton.addEventListener('click', () => {
        const nextSettings = {};
        document.querySelectorAll('[data-admin-setting]').forEach((input) => {
          nextSettings[input.dataset.adminSetting] = input.value.trim();
        });
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
          window.showToast('Workshop settings saved.', 'success');
        } catch (error) {
          window.showToast('Could not save workshop settings.', 'error');
          console.error('Could not save TORQ admin settings.', error);
        }
      });
    }
  }

  function exportAppointmentReport() {
    const appointments = window.TyreXBooking ? window.TyreXBooking.getAppointments() : [];
    const columns = ['id', 'name', 'email', 'phone', 'vehicle', 'service', 'date', 'time', 'status', 'price'];
    const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      columns.join(','),
      ...appointments.map((appointment) => columns.map((column) => csvValue(appointment[column])).join(','))
    ];
    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `torq-appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const adminMain = document.querySelector('.admin-dashboard-main');
    if (!adminMain) return;

    // View Navigation
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-view]');
    const views = document.querySelectorAll('.dashboard-view');
    const pageTitle = document.getElementById('adminPageTitle');

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
          const viewTitle = item.querySelector('span') ? item.querySelector('span').textContent : 'Admin Overview';
          pageTitle.textContent = viewTitle;
        }

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

    // Topbar Dropdowns
    const notifBtn = document.getElementById('adminNotifBtn');
    const notifMenu = document.getElementById('adminNotifMenu');
    if (notifBtn && notifMenu) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifMenu.classList.toggle('show');
      });
    }

    const adminProfileBtn = document.getElementById('adminProfileBtn');
    const adminProfileMenu = document.getElementById('adminProfileMenu');
    if (adminProfileBtn && adminProfileMenu) {
      adminProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adminProfileMenu.classList.toggle('show');
      });
    }

    document.addEventListener('click', () => {
      if (notifMenu) notifMenu.classList.remove('show');
      if (adminProfileMenu) adminProfileMenu.classList.remove('show');
    });

    // Render components
    refreshAdminAppointments();
    renderAdminProducts();
    renderAdminCustomers();
    renderAdminMessages();
    setupProductModalActions();
    setupAdminRatesAndSettings();
    const customerSearch = document.getElementById('adminCustomerSearch');
    if (customerSearch) customerSearch.addEventListener('input', renderAdminCustomers);
    const exportButton = document.getElementById('adminExportReportBtn');
    if (exportButton) exportButton.addEventListener('click', exportAppointmentReport);
  });

  // Calculate & Refresh Admin Metrics & Appointments
  window.refreshAdminAppointments = function () {
    const appointments = window.TyreXBooking ? window.TyreXBooking.getAppointments() : [];
    const products = window.TyreXProducts ? window.TyreXProducts.getProducts() : [];
    const customers = getCustomers();

    // Metrics
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
    const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
    const totalRevenueCalc = appointments.filter(item => item.status === 'Completed').reduce((sum, item) => {
      return sum + parsePrice(item.price);
    }, 0);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthAppointments = appointments.filter(item => String(item.date || '').startsWith(currentMonth));
    const monthRevenue = monthAppointments.filter(item => item.status === 'Completed').reduce((sum, item) => {
      return sum + parsePrice(item.price);
    }, 0);

    const mCustomers = document.getElementById('adminMetricCustomers');
    const mProducts = document.getElementById('adminMetricProducts');
    const mAppointments = document.getElementById('adminMetricAppointments');
    const mPending = document.getElementById('adminMetricPending');
    const mCompleted = document.getElementById('adminMetricCompleted');
    const mRevenue = document.getElementById('adminMetricRevenue');

    if (mCustomers) mCustomers.textContent = customers.length;
    if (mProducts) mProducts.textContent = products.length;
    if (mAppointments) mAppointments.textContent = totalAppointments;
    if (mPending) mPending.textContent = pendingAppointments;
    if (mCompleted) mCompleted.textContent = completedAppointments;
    if (mRevenue) mRevenue.textContent = `$${totalRevenueCalc.toLocaleString()}`;
    const reportRevenue = document.getElementById('adminReportRevenue');
    const reportAppointments = document.getElementById('adminReportAppointments');
    if (reportRevenue) reportRevenue.textContent = `$${monthRevenue.toLocaleString()}`;
    if (reportAppointments) reportAppointments.textContent = monthAppointments.length;

    // Tables
    const recentTable = document.getElementById('adminRecentAppointmentsTable');
    const allTable = document.getElementById('adminAllAppointmentsTable');

    const renderTableContent = (list) => {
      if (!list || list.length === 0) {
        return `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No appointment records found.</td></tr>`;
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
              <div><strong>${item.name}</strong></div>
              <small class="text-muted">${item.phone}</small>
            </td>
            <td>
              <div>${item.service}</div>
              <small class="text-muted">${item.vehicle || 'Standard Vehicle'}</small>
            </td>
            <td>${item.date} <br><small class="text-muted">${item.time}</small></td>
            <td><strong>${item.price || '$79.00'}</strong></td>
            <td><span class="status-pill ${statusClass}">${item.status}</span></td>
            <td>
              <div class="table-actions">
                ${item.status === 'Pending' ? `
                  <button class="action-btn-sm admin-status-btn" data-id="${item.id}" data-status="Confirmed" title="Confirm Booking" style="color: var(--info);">
                    <i data-lucide="check"></i>
                  </button>
                ` : ''}
                ${item.status === 'Confirmed' ? `
                  <button class="action-btn-sm admin-status-btn" data-id="${item.id}" data-status="Completed" title="Mark Completed" style="color: var(--success);">
                    <i data-lucide="check-check"></i>
                  </button>
                ` : ''}
                ${item.status !== 'Cancelled' ? `
                  <button class="action-btn-sm delete admin-status-btn" data-id="${item.id}" data-status="Cancelled" title="Cancel Booking">
                    <i data-lucide="x"></i>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    };

    if (recentTable) recentTable.innerHTML = renderTableContent(appointments.slice(0, 5));
    if (allTable) allTable.innerHTML = renderTableContent(appointments);

    // Bind status updater buttons
    document.querySelectorAll('.admin-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        window.TyreXBooking.updateAppointmentStatus(id, status);
        window.showToast(`Appointment #${id} updated to ${status}`, 'success');
        refreshAdminAppointments();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Render Products in Admin Table
  function renderAdminProducts() {
    const tableBodies = [
      document.getElementById('adminProductsTableBody'),
      document.getElementById('adminProductsTableBodyDedicated')
    ].filter(Boolean);

    if (tableBodies.length === 0) return;

    const products = window.TyreXProducts ? window.TyreXProducts.getProducts() : [];
    const html = products.map(p => `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: contain; background: var(--bg-subtle); border-radius: var(--radius-sm); padding: 2px;">
        </td>
        <td>
          <strong>${p.name}</strong>
          <div><small class="text-muted">${p.brand} • ${p.size}</small></div>
        </td>
        <td><span class="badge-tag" style="margin: 0; font-size: 0.72rem;">${p.category}</span></td>
        <td><strong>$${p.price}</strong></td>
        <td>
          <span class="status-pill ${p.inStock ? 'status-completed' : 'status-cancelled'}">
            ${p.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn-sm edit-admin-product-btn" data-id="${p.id}" title="Edit Product">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="action-btn-sm delete delete-admin-product-btn" data-id="${p.id}" title="Delete Product">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tableBodies.forEach(tb => {
      tb.innerHTML = html;

      // Bind Edit & Delete
      tb.querySelectorAll('.delete-admin-product-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = btn.getAttribute('data-id');
          if (confirm(`Are you sure you want to delete product ${pId}?`)) {
            let list = window.TyreXProducts.getProducts();
            list = list.filter(item => String(item.id) !== pId);
            window.TyreXProducts.saveProducts(list);
            window.showToast(`Product deleted successfully`, 'info');
            renderAdminProducts();
            refreshAdminAppointments();
          }
        });
      });

      tb.querySelectorAll('.edit-admin-product-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pId = btn.getAttribute('data-id');
          openEditProductModal(pId);
        });
      });
    });

    updateAdminCategoryCounts();
    if (window.lucide) window.lucide.createIcons();
  }

  // Setup Product CRUD Modals
  function setupProductModalActions() {
    const addProductForm = document.getElementById('adminAddProductForm');
    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newProdName').value.trim();
        const brand = document.getElementById('newProdBrand').value.trim();
        const category = document.getElementById('newProdCategory').value;
        const size = document.getElementById('newProdSize').value.trim();
        const price = parseFloat(document.getElementById('newProdPrice').value) || 120;
        const inStock = document.getElementById('newProdStock').checked;

        if (!name || !brand || !size) {
          window.showToast('Please fill out all required product fields', 'error');
          return;
        }

        const newProduct = {
          id: 'PROD-' + Math.floor(100 + Math.random() * 900),
          name,
          brand,
          category,
          type: category.toLowerCase().includes('bike') ? 'bike' :
            category.toLowerCase().includes('suv') ? 'suv' :
              category.toLowerCase().includes('alloy') ? 'wheels' :
                category.toLowerCase().includes('accessor') ? 'accessories' : 'car',
          size,
          price,
          rating: 4.8,
          inStock,
          image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
          description: 'High performance tire engineered for superior braking and durability.',
          specs: { speedRating: 'V (240 km/h)', loadIndex: '94', wetGrip: 'Class A', fuelEff: 'Class C', noise: '71 dB' }
        };

        const list = window.TyreXProducts.getProducts();
        list.unshift(newProduct);
        window.TyreXProducts.saveProducts(list);

        addProductForm.reset();
        const modal = addProductForm.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }

        window.showToast(`New product "${name}" added to catalog!`, 'success');
        renderAdminProducts();
        refreshAdminAppointments();
      });
    }
  }

  function openEditProductModal(productId) {
    const products = window.TyreXProducts.getProducts();
    const product = products.find(p => String(p.id) === productId);
    if (!product) return;

    let editModal = document.getElementById('adminEditProductModal');
    if (!editModal) {
      editModal = document.createElement('div');
      editModal.id = 'adminEditProductModal';
      editModal.className = 'modal-overlay';
      editModal.innerHTML = `
        <div class="modal-card">
          <button class="modal-close-btn" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <h3 style="margin-bottom: 1.5rem;">Edit Product: <span id="editProdTitle"></span></h3>
          <form id="editProductModalForm">
            <input type="hidden" id="editProdId">
            <div class="form-group">
              <label>Product Name</label>
              <input type="text" id="editProdName" class="form-control" required>
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label>Brand</label>
                <input type="text" id="editProdBrand" class="form-control" required>
              </div>
              <div class="form-group">
                <label>Price ($)</label>
                <input type="number" id="editProdPrice" class="form-control" required>
              </div>
            </div>
            <div class="form-group">
              <label>Tyre / Rim Size</label>
              <input type="text" id="editProdSize" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="custom-checkbox-label">
                <input type="checkbox" id="editProdStock"> In Stock Availability
              </label>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              Save Product Changes
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(editModal);

      editModal.addEventListener('click', (e) => {
        if (e.target === editModal || e.target.closest('.modal-close-btn')) {
          editModal.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }

    document.getElementById('editProdId').value = product.id;
    document.getElementById('editProdTitle').textContent = product.name;
    document.getElementById('editProdName').value = product.name;
    document.getElementById('editProdBrand').value = product.brand;
    document.getElementById('editProdPrice').value = product.price;
    document.getElementById('editProdSize').value = product.size;
    document.getElementById('editProdStock').checked = product.inStock;

    editModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();

    const form = document.getElementById('editProductModalForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      product.name = document.getElementById('editProdName').value.trim();
      product.brand = document.getElementById('editProdBrand').value.trim();
      product.price = parseFloat(document.getElementById('editProdPrice').value) || product.price;
      product.size = document.getElementById('editProdSize').value.trim();
      product.inStock = document.getElementById('editProdStock').checked;

      window.TyreXProducts.saveProducts(products);
      editModal.classList.remove('open');
      document.body.style.overflow = '';
      window.showToast(`Updated "${product.name}" successfully!`, 'success');
      renderAdminProducts();
    };
  }

  // Render Customers
  function renderAdminCustomers() {
    const container = document.getElementById('adminCustomersTableBody');
    if (!container) return;

    const search = (document.getElementById('adminCustomerSearch')?.value || '').trim().toLowerCase();
    const customers = getCustomers().filter((customer) =>
      [customer.name, customer.email, customer.phone, customer.vehicle].some((value) =>
        String(value || '').toLowerCase().includes(search)
      )
    );
    container.innerHTML = customers.map(c => `
      <tr>
        <td><strong>#${c.id}</strong></td>
        <td>
          <strong>${c.name}</strong>
          <div><small class="text-muted">${c.email}</small></div>
        </td>
        <td>${c.phone}</td>
        <td>${c.vehicle}</td>
        <td>${c.visits} services</td>
        <td><strong>${c.spent}</strong></td>
      </tr>
    `).join('');
  }

  // Render Messages
  function renderAdminMessages() {
    const container = document.getElementById('adminMessagesList');
    if (!container) return;

    const messages = getMessages();
    if (!messages.length) {
      container.innerHTML = '<p style="color:var(--text-muted);">No new contact messages.</p>';
      return;
    }
    container.innerHTML = messages.map(m => `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <h4 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${m.name}</h4>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${m.email} • ${m.phone} • Vehicle: ${m.vehicle}</div>
          </div>
          <span style="font-size: 0.78rem; background: var(--bg-subtle); padding: 0.25rem 0.6rem; border-radius: var(--radius-sm);">${m.date}</span>
        </div>
        <p style="font-size: 0.92rem; background: var(--bg-body); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
          "${m.message}"
        </p>
        <div style="display: flex; gap: 0.75rem;">
          <a href="mailto:${m.email}" class="btn btn-sm btn-primary">
            <i data-lucide="mail"></i> Reply by Email
          </a>
          <button class="btn btn-sm btn-outline archive-contact-message-btn" data-message-id="${m.id}">
            Archive
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.archive-contact-message-btn').forEach((button) => {
      button.addEventListener('click', () => {
        let archivedIds;
        try {
          archivedIds = JSON.parse(localStorage.getItem(ARCHIVED_MESSAGES_KEY) || '[]');
          if (!Array.isArray(archivedIds)) throw new Error('Stored archive list is not an array.');
          archivedIds.push(button.dataset.messageId);
          localStorage.setItem(ARCHIVED_MESSAGES_KEY, JSON.stringify(Array.from(new Set(archivedIds))));
          renderAdminMessages();
          window.showToast('Message archived.', 'info');
        } catch (error) {
          window.showToast('Could not archive this message.', 'error');
          console.error('Could not archive TORQ contact message.', error);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
})();
