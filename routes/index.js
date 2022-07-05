const router = require('express').Router();
const {celebrate, Joi} = require("celebrate");
const {login, createUser} = require("../controllers/users");
const userRouter = require("./users");
const movieRouter = require('./movies');
const NotFoundError = require("../errors/not-found-error");
const auth = require('../middlewares/auth');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
  }),
}), createUser);

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);
router.use('*', auth, (req, res, next) => next(new NotFoundError('Страница не найдена')));

module.exports = router;