const sellForm = document.getElementById('sellForm');
const sellErrorEl = document.getElementById('sellFormError');
const imageInput = document.getElementById('sellImage');
const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzoneText');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImageBtn');
const submitBtn = sellForm.querySelector('.submit-btn');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, как на сервере

let selectedFile = null;
let previewUrl = null;

function clearImage() {
  selectedFile = null;
  imageInput.value = '';
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
  imagePreview.removeAttribute('src');
  dropzone.classList.remove('has-image');
  dropzoneText.style.display = '';
  removeImageBtn.hidden = true;
}

function setImage(file) {
  sellErrorEl.textContent = '';

  if (!file) return;

  if (!ALLOWED_TYPES.includes(file.type)) {
    clearImage();
    sellErrorEl.textContent = 'Only JPG, PNG or WEBP images are allowed';
    return;
  }
  if (file.size > MAX_SIZE) {
    clearImage();
    sellErrorEl.textContent = 'Image is too large (max 5 MB)';
    return;
  }

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  selectedFile = file;
  previewUrl = URL.createObjectURL(file);
  imagePreview.src = previewUrl;
  dropzone.classList.add('has-image');
  dropzoneText.style.display = 'none';
  removeImageBtn.hidden = false;
}

imageInput.addEventListener('change', () => {
  setImage(imageInput.files[0]);
});

removeImageBtn.addEventListener('click', clearImage);

['dragenter', 'dragover'].forEach(evt => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach(evt => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
});
dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) setImage(file);
});

sellForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  sellErrorEl.textContent = '';

  const token = localStorage.getItem('token');

  if (!token) {
    sellErrorEl.textContent = 'You must be logged in to sell items';
    return;
  }
  if (!selectedFile) {
    sellErrorEl.textContent = 'Please add a photo of the item';
    return;
  }

  const formData = new FormData();
  formData.append('brand', document.getElementById('sellBrand').value.trim());
  formData.append('name', document.getElementById('sellName').value.trim());
  formData.append('description', document.getElementById('sellDescription').value.trim());
  formData.append('category', document.getElementById('sellCategory').value);
  formData.append('size', document.getElementById('sellSize').value.trim());
  formData.append('price', document.getElementById('sellPrice').value);
  // image — последним, чтобы multer получил текстовые поля до файла
  formData.append('image', selectedFile);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading...';

  try {
    // Content-Type НЕ ставим вручную: браузер сам добавит multipart boundary
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();

    if (res.status === 401) {
      sellErrorEl.textContent = 'Session expired, please log in again';
      return;
    }
    if (!res.ok) {
      sellErrorEl.textContent = data.message || 'Failed to list item';
      return;
    }

    alert('Item listed successfully!');
    window.location.href = 'shop.html';
  } catch (err) {
    sellErrorEl.textContent = 'Server error, try again later';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'List item';
  }
});

const accountProfileIcon = document.getElementById('openRegister');
if (accountProfileIcon) {
  accountProfileIcon.addEventListener('click', () => {
    const token = localStorage.getItem('token');
    window.location.href = token ? 'profile.html' : 'index.html';
  });
}
