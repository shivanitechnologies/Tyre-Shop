(function () {
  'use strict';

  const products = [
    {
      id: 1,
      name: 'Velocity Pro R-S',
      brand: 'Michelin',
      category: 'performance',
      price: 289,
      size: '225/40 R18',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      badge: 'Best seller',
      inStock: true,
      description: 'High-grip summer tyre engineered for responsive steering and confident braking on dry and wet roads.'
    },
    {
      id: 2,
      name: 'Apex All-Season X',
      brand: 'Bridgestone',
      category: 'all-season',
      price: 214,
      size: '205/55 R16',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      badge: 'New',
      inStock: true,
      description: 'Balanced comfort and efficiency for year-round driving with confident road manners in changing conditions.'
    },
    {
      id: 3,
      name: 'TrailEdge SUV Pro',
      brand: 'Continental',
      category: 'suv',
      price: 324,
      size: '245/60 R18',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80',
      badge: 'SUV',
      inStock: true,
      description: 'Strong sidewalls and quiet ride comfort for SUV owners who need both grip and long-distance reliability.'
    },
    {
      id: 4,
      name: 'PolarGrip Winter',
      brand: 'Pirelli',
      category: 'winter',
      price: 268,
      size: '225/45 R17',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
      badge: 'Cold weather',
      inStock: false,
      description: 'Winter-rated compound with reliable traction and safer stopping confidence in snow and wet surfaces.'
    },
    {
      id: 5,
      name: 'Torque Wheel Kit',
      brand: 'TORQ',
      category: 'accessories',
      price: 149,
      size: '18-inch set',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=900&q=80',
      badge: 'Accessory',
      inStock: true,
      description: 'A lightweight wheel upgrade for drivers seeking cleaner styling, lighter steering feel, and stronger finish quality.'
    },
    {
      id: 6,
      name: 'CityRun Touring',
      brand: 'Goodyear',
      category: 'all-season',
      price: 196,
      size: '215/55 R17',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
      badge: 'Daily drive',
      inStock: true,
      description: 'Comfort-first touring tyre tuned for smooth daily commutes, low noise, and better fuel efficiency.'
    }
  ];

  const state = {
    search: '',
    maxPrice: 600,
    categories: new Set(['performance', 'all-season', 'suv', 'winter', 'accessories']),
    sort: 'featured'
  };

  function getVisibleProducts() {
    let filtered = products.filter((product) => {
      const matchesSearch = !state.search || [product.name, product.brand, product.size, product.category].join(' ').toLowerCase().includes(state.search.toLowerCase());
      const matchesCategory = state.categories.has(product.category);
      const matchesPrice = product.price <= state.maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (state.sort === 'low') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (state.sort === 'high') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (state.sort === 'newest') {
      filtered = filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }

  function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const items = getVisibleProducts();
    const resultCount = document.getElementById('productResultCount');
    if (resultCount) {
      resultCount.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    }

    if (!items.length) {
      grid.innerHTML = `
        <div class="card-surface products-empty-state">
          <span class="eyebrow">No exact match</span>
          <h3>Try a different search or filter.</h3>
          <p>Adjust your selection to see more of the TORQ collection.</p>
          <button class="btn btn-outline" type="button" data-reset-filters>Reset filters</button>
        </div>
      `;
      grid.querySelector('[data-reset-filters]').addEventListener('click', resetFilters);
      return;
    }

    grid.innerHTML = items.map((product, index) => `
      <article class="product-card product-enter" style="--card-index: ${index};">
        <div class="product-image">
          <span class="product-badge">${product.badge}</span>
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-content">
          <div class="product-meta">
            <span class="product-brand">${product.brand}</span>
            <span class="product-rating">★ ${product.rating}</span>
          </div>
          <h3>${product.name}</h3>
          <div class="product-price-row">
            <div>
              <div class="product-price">$${product.price}</div>
              <div class="product-size">${product.size}</div>
            </div>
            <span class="badge-tag">${product.inStock ? 'In stock' : 'Back order'}</span>
          </div>
          <p style="color: var(--text-soft); margin-bottom: 1rem; min-height: 72px;">${product.description}</p>
          <div class="product-actions">
            <button class="btn btn-primary product-details-btn" data-product-id="${product.id}">View details</button>
            <button class="btn btn-outline" data-product-buy="${product.id}">Buy</button>
          </div>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('.product-details-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const product = products.find((item) => item.id === Number(button.dataset.productId));
        if (!product) return;
        const detailContent = document.getElementById('productDetailContent');
        if (!detailContent) return;

        detailContent.innerHTML = `
          <div style="display:grid; gap:1.2rem;">
            <img src="${product.image}" alt="${product.name}" style="border-radius: 18px; height: 260px; object-fit: cover;">
            <div>
              <div class="product-meta" style="margin-bottom:0.5rem;">
                <span class="product-brand">${product.brand}</span>
                <span class="product-rating">★ ${product.rating}</span>
              </div>
              <h3 style="margin-bottom: 0.5rem;">${product.name}</h3>
              <div class="product-price">$${product.price}</div>
              <div class="product-size" style="margin-bottom: 0.8rem;">${product.size}</div>
              <p style="color: var(--text-soft); margin-bottom: 1rem;">${product.description}</p>
              <ul style="list-style: none; padding: 0; margin: 0 0 1.2rem; display:grid; gap:0.55rem; color: var(--text-soft);">
                <li>• Premium compound with excellent wet grip</li>
                <li>• Balanced road noise and comfort characteristics</li>
                <li>• Available for fitting in-store or via booking</li>
              </ul>
              <div class="form-actions">
                <button class="btn btn-primary" onclick="window.closeModal('productModal')">Add to shortlist</button>
              </div>
            </div>
          </div>
        `;
        window.openModal('productModal');
      });
    });

    document.querySelectorAll('[data-product-buy]').forEach((button) => {
      button.addEventListener('click', () => {
        window.showToast('Added to shortlist', 'success');
      });
    });
  }

  function resetFilters() {
    state.search = '';
    state.maxPrice = 600;
    state.categories = new Set(['performance', 'all-season', 'suv', 'winter', 'accessories']);
    state.sort = 'featured';

    const searchInput = document.getElementById('productSearch');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const sortSelect = document.getElementById('productSort');

    if (searchInput) searchInput.value = '';
    if (priceRange) priceRange.value = '600';
    if (priceValue) priceValue.textContent = '$600';
    if (sortSelect) sortSelect.value = 'featured';
    document.querySelectorAll('.category-filter').forEach((checkbox) => {
      checkbox.checked = true;
    });

    renderProducts();
  }

  function bindControls() {
    const searchInput = document.getElementById('productSearch');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const sortSelect = document.getElementById('productSort');

    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        state.search = event.target.value.trim();
        renderProducts();
      });
    }

    if (priceRange) {
      priceRange.addEventListener('input', (event) => {
        state.maxPrice = Number(event.target.value);
        if (priceValue) priceValue.textContent = '$' + state.maxPrice;
        renderProducts();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (event) => {
        state.sort = event.target.value;
        renderProducts();
      });
    }

    document.querySelectorAll('.category-filter').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const selected = Array.from(document.querySelectorAll('.category-filter:checked')).map((input) => input.value);
        state.categories = new Set(selected);
        renderProducts();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindControls();
    renderProducts();
  });

  window.TyreXProducts = {
    getProducts: () => products,
    renderProducts
  };
})();
