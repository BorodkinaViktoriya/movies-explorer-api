const Movie = require('../models/movie');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const { country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId  } = req.body;
  const owner = req.user._id;
  if (!name || !link) {
    throw new BadRequestError(' Переданы некорректные данные при создании карточки.');
  }
  return Movie.create({ country, director, duration, year, description, image, trailer, nameRU, nameEN, thumbnail, movieId, owner })
    .then((movie) => {
      res.status(201).send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(' Переданы некорректные данные при создании карточки.'));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Чужужю карточку нельзя удалять.');
      }
      return card.remove(() => res.status(200).send(card));
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new BadRequestError('Передано некорректное id карточки.'));
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
