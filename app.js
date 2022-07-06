require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/error-hendler');
const { limiter } = require('./middlewares/limiter');

const { PORT = 3000, NODE_ENV, DATABASE } = process.env;

mongoose.connect(NODE_ENV === 'production' ? DATABASE : 'mongodb://127.0.0.1/bitfilmsdb');

const app = express();
app.use(requestLogger);
app.use(limiter);
app.use(helmet());
app.use(express.json());

app.use(cors());
app.use(router);

app.use(errorLogger);
app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
