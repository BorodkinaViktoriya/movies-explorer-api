require('dotenv').config();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error');
const UnauthorizedError = require('../errors/unathorized-error');
const BadRequestError = require('../errors/bad-request-error');

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
      return res.send(user);
    })
    .catch((err) => next(err));
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findOne({ email })
    .then((baseUser) => {
      if (!baseUser) {
        return User.findByIdAndUpdate(
          req.user._id,
          { email, name },
          { new: true, runValidators: true },
        );
      } if (baseUser._id.equals(req.user._id)) {
        return User.findByIdAndUpdate(
          req.user._id,
          { name },
          { new: true, runValidators: true },
        );
      }
      return next(new ConflictError('Указанный email принадлежит другому пользователю.'));
    })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Такой email уже существующет в базе '));
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
        return next(new ConflictError('Такой email уже существующет в базе '));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'big-secret-key', { expiresIn: '7d' });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.message === 'not_found') {
        return next(new UnauthorizedError('Емейл или пароль неверный'));
      }
      return next(err);
    });
};

module.exports = {
  getUser,
  updateUser,
  createUser,
  login,
};
