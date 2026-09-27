const sellForm = document.getElementById('sellForm');
const sellErrorEl = document.getElementById('sellFormError');

sellForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  sellErrorEl.textContent = '';

  const token = localStorage.getItem('token');

  if (!token) {
    sellErrorEl.textContent = 'You must be logged in to sell items';
    return;
  }

  const brand = document.getElementById('sellBrand').value.trim();
  const name = document.getElementById('sellName').value.trim();
  const description = document.getElementById('sellDescription').value.trim();
  const category = document.getElementById('sellCategory').value;
  const size = document.getElementById('sellSize').value.trim();
  const price = document.getElementById('sellPrice').value;
  const image = document.getElementById('sellImage').value.trim();

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // токен передаётся в заголовке
      },
      body: JSON.stringify({ brand, name, description, category, size, price, image })
    });

    const data = await res.json();

    if (!res.ok) {
      sellErrorEl.textContent = data.message || 'Failed to list item';
      return;
    }

    alert('Item listed successfully!');
    window.location.href = 'shop.html';
  } catch (err) {
    sellErrorEl.textContent = 'Server error, try again later';
  }
});
const accountProfileIcon = document.getElementById('openRegister');
if (accountProfileIcon) {
  accountProfileIcon.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    window.location.href = token ? 'profile.html' : 'index.html';
  });
}