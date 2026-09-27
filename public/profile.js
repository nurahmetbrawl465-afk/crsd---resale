const profileHeader = document.getElementById('profileHeader');
const ordersTab = document.getElementById('ordersTab');
const listingsTab = document.getElementById('listingsTab');
const tabButtons = document.querySelectorAll('.tab-btn');

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
  window.location.href = 'index.html';
}

function renderHeader() {
  profileHeader.innerHTML = `
    <h1>${user.fullName}</h1>
    <p>${user.email}</p>
    <button class="logout-btn" id="logoutBtn">Log out</button>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
}

async function loadOrders() {
  try {
    const res = await fetch('/api/orders/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      ordersTab.innerHTML = '<p class="empty-state">Failed to load orders</p>';
      return;
    }

    const orders = await res.json();

    if (orders.length === 0) {
      ordersTab.innerHTML = '<p class="empty-state">No orders yet</p>';
      return;
    }

    ordersTab.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-card-header">
          <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
          <span class="order-status">${order.status}</span>
        </div>
        ${order.items.map(item => `
          <div class="order-item-row">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
              <p class="item-brand">${item.brand}</p>
              <p>${item.name} × ${item.quantity}</p>
            </div>
          </div>
        `).join('')}
        <div class="order-total-row">
          <span>Total</span>
          <span>₸${order.total.toLocaleString()}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Ошибка загрузки заказов:', err.message);
    ordersTab.innerHTML = '<p class="empty-state">Failed to load orders</p>';
  }
}

async function loadListings() {
  try {
    const res = await fetch('/api/products/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      listingsTab.innerHTML = '<p class="empty-state">Failed to load listings</p>';
      return;
    }

    const products = await res.json();

    if (products.length === 0) {
      listingsTab.innerHTML = '<p class="empty-state">You haven\'t listed any items yet</p>';
      return;
    }

    listingsTab.innerHTML = products.map(product => `
      <div class="listing-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="listing-card-info">
          <p class="item-brand">${product.brand}</p>
          <h3>${product.name}</h3>
          <p>₸${product.price.toLocaleString()}</p>
          <p class="listing-date">Listed on ${new Date(product.createdAt).toLocaleDateString()}</p>
          <span class="order-status">${product.status}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Ошибка загрузки листингов:', err.message);
    listingsTab.innerHTML = '<p class="empty-state">Failed to load listings</p>';
  }
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;
    ordersTab.style.display = tab === 'orders' ? 'block' : 'none';
    listingsTab.style.display = tab === 'listings' ? 'block' : 'none';

    if (tab === 'listings') {
      loadListings();
    }
  });
});

renderHeader();
loadOrders();