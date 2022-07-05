const router = require('express').Router();
const { login, createUser } = require('../controllers/users');
const userRouter = require('./users');
const movieRouter = require('./movies');
const NotFoundError = require('../errors/not-found-error');
const auth = require('../middlewares/auth');
const { loginValidation, createUserValidation } = require('../middlewares/validation');

router.post('/signup', createUserValidation, createUser);
router.post('/signin', loginValidation, login);

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);
router.use('*', auth, (req, res, next) => next(new NotFoundError('Страница не найдена')));

module.exports = router;
