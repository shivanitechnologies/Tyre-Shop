(function () {
  'use strict';

  function readPriceMap(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (error) {
      console.error(`Could not load TORQ pricing from ${key}.`, error);
      return {};
    }
  }

  function formatPrice(value) {
    return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
  }

  function syncPublicPrices() {
    const serviceRates = readPriceMap('torq_admin_service_rates');
    const packagePrices = readPriceMap('torq_admin_package_prices');
    const serviceKeys = {
      '3d wheel alignment': 'alignment',
      'tyre fitting & replacement': 'fitting',
      'wheel balancing': 'balancing',
      'nitrogen inflation': 'nitrogen'
    };
    const packageKeys = {
      'essential care': 'basic',
      'performance plus': 'standard',
      'signature package': 'premium'
    };

    document.querySelectorAll('.service-card, .card-surface').forEach((card) => {
      const heading = card.querySelector('h3');
      if (!heading) return;
      const title = heading.textContent.trim().toLowerCase();
      const serviceKey = serviceKeys[title];
      const packageKey = packageKeys[title];

      if (serviceKey) {
        const priceElement = card.querySelector('strong');
        const value = Number(serviceRates[serviceKey]);
        if (priceElement && Number.isFinite(value) && value > 0) {
          priceElement.textContent = `From ${formatPrice(value)}${serviceKey === 'fitting' ? ' per tyre' : ''}`;
        }
      }

      if (packageKey) {
        const priceElement = heading.nextElementSibling;
        const value = Number(packagePrices[packageKey]);
        if (priceElement && Number.isFinite(value) && value > 0) {
          priceElement.textContent = formatPrice(value);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncPublicPrices);
  } else {
    syncPublicPrices();
  }
})();
