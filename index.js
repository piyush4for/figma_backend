const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var cors = require('cors')

const app = express();
app.use(express.static('public'))
app.use(express.json());

app.use(cors());
const port = 3000 || process.env.PORT;

// Mock user data
const users = [];
const products = [];
const secretKey = 'your-secret-key';

//one function just to view it on render
app.get("/", (req, res) => res.type('html').send(html));

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Piyush</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
    Welcome To piyush figma backend
    </section>
  </body>
</html>
`


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

  const token = jwt.sign({ username }, secretKey, { expiresIn: '7d' });
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
