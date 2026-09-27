let products = []; // теперь это будет заполняться с сервера, а не захардкожено

const productGrid = document.getElementById('productGrid');
const resultsCount = document.getElementById('resultsCount');
const categoryCheckboxes = document.querySelectorAll('.filter-category');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const sortSelect = document.getElementById('sortSelect');
const clearFiltersBtn = document.getElementById('clearFilters');

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    products = data;
    renderProducts(products);
  } catch (err) {
    console.error('Ошибка загрузки товаров:', err.message);
    productGrid.innerHTML = '<p class="no-results">Failed to load products</p>';
  }
}

function renderProducts(list) {
  productGrid.innerHTML = '';

  if (list.length === 0) {
    productGrid.innerHTML = '<p class="no-results">No items match your filters</p>';
    resultsCount.textContent = '0 items';
    return;
  }

  resultsCount.textContent = `${list.length} item${list.length > 1 ? 's' : ''}`;

  list.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <p class="product-brand">${product.brand}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₸${product.price.toLocaleString()}</p>
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `product.html?id=${product._id}`;
    });
    productGrid.appendChild(card);
  });
}

function applyFilters() {
  let filtered = [...products];

  const selectedCategories = Array.from(categoryCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selectedCategories.length > 0) {
    filtered = filtered.filter(p => selectedCategories.includes(p.category));
  }

  const minPrice = parseFloat(minPriceInput.value);
  const maxPrice = parseFloat(maxPriceInput.value);

  if (!isNaN(minPrice)) {
    filtered = filtered.filter(p => p.price >= minPrice);
  }
  if (!isNaN(maxPrice)) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }

  const sortValue = sortSelect.value;
  if (sortValue === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  renderProducts(filtered);
}

categoryCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));
minPriceInput.addEventListener('input', applyFilters);
maxPriceInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

clearFiltersBtn.addEventListener('click', () => {
  categoryCheckboxes.forEach(cb => cb.checked = false);
  minPriceInput.value = '';
  maxPriceInput.value = '';
  sortSelect.value = 'default';
  renderProducts(products);
});

// Загружаем товары с сервера при открытии страницы
loadProducts();


const accountProfileIcon = document.getElementById('openRegister');
if (accountProfileIcon) {
  accountProfileIcon.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    window.location.href = token ? 'profile.html' : 'index.html';
  });
}