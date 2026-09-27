const checkoutForm = document.getElementById('checkoutForm');
const orderTotalEl = document.getElementById('orderTotal');
const checkoutError = document.getElementById('checkoutError');

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function showOrderTotal() {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html'; // нечего оформлять, если корзина пуста
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  orderTotalEl.textContent = `Total: ₸${total.toLocaleString()}`;
}

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  checkoutError.textContent = '';

  const token = localStorage.getItem('token');
  if (!token) {
    checkoutError.textContent = 'Please log in first';
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    checkoutError.textContent = 'Your cart is empty';
    return;
  }

  const shippingAddress = {
    fullName: document.getElementById('fullName').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };

  // Данные карты нигде реально не проверяются и не отправляются — это симуляция
  const items = cart.map(item => ({
    product_id: item._id,
    name: item.name,
    brand: item.brand,
    price: item.price,
    quantity: item.quantity,
    image: item.image
  }));

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items, shippingAddress })
    });

    const data = await res.json();

    if (!res.ok) {
      checkoutError.textContent = data.message || 'Failed to place order';
      return;
    }

    localStorage.removeItem('cart'); // очищаем корзину после успешного заказа
    updateCartCount();

    alert('Order placed successfully! Thank you for your purchase.');
    window.location.href = 'profile.html'; // сделаем эту страницу следующим шагом
  } catch (err) {
    checkoutError.textContent = 'Server error, try again later';
  }
});

showOrderTotal();