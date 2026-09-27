const cartLayout = document.getElementById('cartLayout');

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    cartLayout.innerHTML = `<p class="empty-cart">Your cart is empty. <a href="shop.html">Go shopping →</a></p>`;
    return;
  }

  const itemsHtml = cart.map(item => `
    <div class="cart-item" data-id="${item._id}">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="brand">${item.brand}</p>
        <h3>${item.name}</h3>
        <p class="cart-item-price">₸${item.price.toLocaleString()}</p>
        <div class="quantity-controls">
          <button class="decrease-btn">−</button>
          <span>${item.quantity}</span>
          <button class="increase-btn">+</button>
        </div>
      </div>
      <button class="remove-item">Remove</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartLayout.innerHTML = `
    <div class="cart-items">${itemsHtml}</div>
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Items (${totalItems})</span><span>₸${total.toLocaleString()}</span></div>
      <div class="summary-row"><span>Shipping</span><span>Free</span></div>
      <div class="summary-total"><span>Total</span><span>₸${total.toLocaleString()}</span></div>
      <button class="checkout-btn" id="checkoutBtn">Checkout</button>
    </div>
  `;

  attachCartEvents();
}

function attachCartEvents() {
  document.querySelectorAll('.cart-item').forEach(itemEl => {
    const id = itemEl.dataset.id;

    itemEl.querySelector('.increase-btn').addEventListener('click', () => changeQuantity(id, 1));
    itemEl.querySelector('.decrease-btn').addEventListener('click', () => changeQuantity(id, -1));
    itemEl.querySelector('.remove-item').addEventListener('click', () => removeItem(id));
  });

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
}

function changeQuantity(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i._id === id);

  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i._id !== id);
    }
  }

  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  let cart = getCart();
  cart = cart.filter(i => i._id !== id);
  saveCart(cart);
  renderCart();
}

function handleCheckout() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please log in to checkout');
    return;
  }

  window.location.href = 'checkout.html';
}

renderCart();

const accountProfileIcon = document.getElementById('openRegister');
if (accountProfileIcon) {
  accountProfileIcon.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    window.location.href = token ? 'profile.html' : 'index.html';
  });
}