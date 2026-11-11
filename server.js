require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const jwt = require('jsonwebtoken');
const multer = require('multer')
const app = express();
const PORT = process.env.PORT || 3000;

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
}
    const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const storage = multer.diskStorage({destination(req, file, cb){cb(null, UPLOAD_DIR)},filename(req, file,cb){const name = (Date.now()+'-'+Math.round(Math.random()*1e9)+path.extname(file.originalname));cb(null, name)}})
    const upload = multer({
      storage : storage,
      limits : {fileSize: 5242880},
      fileFilter(req, file, cb){ 
        const file_types = ['image/jpeg','image/png','image/webp'];
        if (file_types.includes(file.mimetype)){
          cb(null, true);
        }
        else{
          cb(new Error('Only images allowed'));
        }
      }
    })

function removeUploadedFile(file) {
  if (file && file.path) {
    fs.unlink(file.path, () => {});
  }
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Подключено к MongoDB Atlas'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err.message));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Тестовый API-роут
app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ server: 'ok', database: states[dbState] });
});

// Регистрация
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Пароль должен быть от 8 символов' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      full_name: fullName,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'Регистрация прошла успешно' });
  } catch (err) {
    console.error('Ошибка регистрации:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Логин
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token: token,
      user: {
        fullName: user.full_name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Ошибка входа:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить список товаров (с опциональными фильтрами)
app.get('/api/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    let filter = { status: 'available' };

    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 }); // по умолчанию — новые сверху

    const products = await query;
    res.json(products);
  } catch (err) {
    console.error('Ошибка получения товаров:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


app.get('/api/products/my', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ seller_id: req.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Ошибка получения товаров юзера:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить один товар по id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller_id', 'full_name email');
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    res.json(product);
  } catch (err) {
    console.error('Ошибка получения товара:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать товар (выставить на продажу)
app.post('/api/products', authMiddleware,upload.single('image'), async (req, res) => {
  try {
    const { brand, name, description, category, size, price } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Загрузи фото'});
    }
    if (!brand || !name || !category || !price) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: 'Заполните обязательные поля' });
    }
    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: 'Некорректная цена' });
    }
    const newProduct = new Product({
      seller_id: req.userId,
      brand,
      name,
      description,
      category,
      size,
      price: Number(price),
      image :'uploads/' + req.file.filename
    });
    await newProduct.save();

    res.status(201).json({ message: 'Товар успешно выставлен', product: newProduct });
  } catch (err) {
    removeUploadedFile(req.file);
    console.error('Ошибка в создании товара:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать заказ (checkout)
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      user_id: req.userId,
      items,
      total,
      status: 'paid',
      shippingAddress
    });

    await newOrder.save();

    // Помечаем купленные товары как проданные
    const productIds = items.map(item => item.product_id);
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { status: 'sold' } }
    );

    res.status(201).json({ message: 'Заказ оформлен', order: newOrder });
  } catch (err) {
    console.error('Ошибка создания заказа:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить заказы текущего юзера
app.get('/api/orders/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Ошибка получения заказов:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Файл слишком большой (максимум 5 МБ)'
      : 'Ошибка загрузки файла';
    return res.status(400).json({ message });
  }
  if (err.message === 'Only images allowed') {
    return res.status(400).json({ message: 'Разрешены только JPG, PNG и WEBP' });
  }
  console.error('Необработанная ошибка:', err.message);
  res.status(500).json({ message: 'Ошибка сервера' });
});


app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});