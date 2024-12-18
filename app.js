// підключаємо змінні оточення
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const logger = require('morgan');
const cors = require('cors');

//Swagger-doc - документація
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');

// створюємо сервер
const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

const { ORIGIN_URL, ORIGIN_URL_local } = process.env;


app.use(logger(formatsLogger));
app.use(cors({ origin: [ORIGIN_URL, ORIGIN_URL_local], credentials: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger-doc - документація

app.use('/auth', authRouter);               // корневий маршрут для регістрації, авторизації, розавторизації
app.use('/users', usersRouter);             // корневий маршрут для роботи з залогіненим юзером
app.use('/books', booksRouter);             // корневий маршрут для роботи з колекцією Books 

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
})

app.use((err, req, res, next) => {
  console.log("last block app.use err = ",err);
  const {status = 500, message = "Server error"} = err;
  res.status(status).json({ message, });
})

module.exports = app;
