const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error');
const UnauthorizedError = require('../errors/unathorized-error');
const BadRequestError = require('../errors/bad-request-error');

const getMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
      return res.send({
        email: user.email,
        name: user.name,
      });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new BadRequestError('Передан некорректный _id.'));
      }
      return next(err);
    });
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  return User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Такой emal уже существующет в базе '));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  if (!password || !email) {
    throw new BadRequestError(' Переданы некорректные данные при создании пользователя. ');
  }
  return bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      res.send({
        email: user.email,
        name: user.name,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(' Переданы некорректные данные при создании пользователя. '));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Такой emal уже существующет в базе '));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'big-secret-key', { expiresIn: '7d' });
      return res.status(200).send({ token });
    })
    .catch((err) => {
      if (err.message === 'not_found') {
        return next(new UnauthorizedError('Емейл или пароль неверный'));
      }
      return next(err);
    });
};

module.exports = {
  getMe,
  updateUser,
  createUser,
  login,
};
