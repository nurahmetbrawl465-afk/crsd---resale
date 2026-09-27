async function loadHomepageProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    renderArchive(products.slice(0, 3));
    renderUploadsSlider(products.slice(0, 4));
  } catch (err) {
    console.error('Ошибка загрузки товаров для главной:', err.message);
    document.getElementById('archiveCards').innerHTML = '<p class="loading-text">Failed to load</p>';
    document.getElementById('sliderTrack').innerHTML = '<p class="loading-text">Failed to load</p>';
  }
}

function renderArchive(products) {
  const container = document.getElementById('archiveCards');

  if (products.length === 0) {
    container.innerHTML = '<p class="loading-text">No items yet</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="card" onclick="window.location.href='product.html?id=${product._id}'">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="archiveminitext">${product.brand} · ₸${product.price.toLocaleString()}</p>
    </div>
  `).join('');
}

function renderUploadsSlider(products) {
  const track = document.getElementById('sliderTrack');

  if (products.length === 0) {
    track.innerHTML = '<p class="loading-text">No items yet</p>';
    return;
  }

  // Дублируем набор для бесшовной прокрутки, как и раньше
  const slidesHtml = products.map(product => `
    <div class="slide" onclick="window.location.href='product.html?id=${product._id}'">
      <img src="${product.image}" alt="${product.name}">
    </div>
  `).join('');

  track.innerHTML = slidesHtml + slidesHtml;
}

loadHomepageProducts();