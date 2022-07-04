require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const fullRouter = require('./routes/index');
const cors = require('cors');
const {errors} = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');


const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://127.0.0.1/mydb');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(requestLogger);
app.use(cors());
app.use(fullRouter);


app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
