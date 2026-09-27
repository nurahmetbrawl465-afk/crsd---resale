const productContainer = document.getElementById('productContainer');

// Достаём id товара из URL: product.html?id=ЗДЕСЬ
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

async function loadProduct() {
  if (!productId) {
    productContainer.innerHTML = '<p class="error-text">Product not found</p>';
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`);

    if (!res.ok) {
      productContainer.innerHTML = '<p class="error-text">Product not found</p>';
      return;
    }

    const product = await res.json();
    renderProduct(product);
  } catch (err) {
    console.error('Ошибка загрузки товара:', err.message);
    productContainer.innerHTML = '<p class="error-text">Failed to load product</p>';
  }
}

function renderProduct(product) {
  const isAvailable = product.status === 'available';

  productContainer.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-details">
      <a href="shop.html" class="back-link">← Back to shop</a>
      <p class="brand">${product.brand}</p>
      <h1>${product.name}</h1>
      <p class="price">₸${product.price.toLocaleString()}</p>

      <div class="product-meta">
        <div><span>Category</span>${product.category}</div>
        <div><span>Size</span>${product.size || 'One size'}</div>
        <div><span>Status</span>${product.status}</div>
      </div>

      <p class="seller-info">Sold by <strong>${product.seller_id?.full_name || 'Unknown'}</strong> · Listed on ${new Date(product.createdAt).toLocaleDateString()}</p>

      <p class="description">${product.description || 'No description provided.'}</p>

      ${isAvailable
        ? `<button class="add-to-cart-btn" id="addToCartBtn">Add to cart</button>`
        : `<button class="add-to-cart-btn" disabled style="opacity:0.5;cursor:not-allowed;">Sold out</button>`
      }
    </div>
  `;

  if (isAvailable) {
    document.getElementById('addToCartBtn').addEventListener('click', () => {
      addToCart(product);
    });
  }
}

function addToCart(product) {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please log in or sign up to add items to cart');
    window.location.href = 'index.html';
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingItem = cart.find(item => item._id === product._id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

updateCartCount(); // вызываем сразу при загрузке страницы

loadProduct();

const accountProfileIcon = document.getElementById('openRegister');
if (accountProfileIcon) {
  accountProfileIcon.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    window.location.href = token ? 'profile.html' : 'index.html';
  });
}