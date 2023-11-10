const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var cors = require('cors')

const app = express();
app.use(cors());
const port = 3000 || process.env.port;

// Mock user data
const users = [];
const products = [];
const secretKey = 'your-secret-key';

app.use(bodyParser.json());

// User registration (signup)
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { username, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: 'User created successfully.' });
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  res.json({ message: 'Login successful.', token });
});

// Middleware to authenticate requests
function authenticate(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    req.user = user;
    next();
  });
}

// Add some mock products
for (let i = 1; i <= 50; i++) {
  products.push({ id: i, name: `Product ${i}` });
}

// Get paginated products
app.get('/products', authenticate, (req, res) => {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 10;

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;

  const paginatedProducts = products.slice(startIndex, endIndex);
  res.json({ products: paginatedProducts });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
