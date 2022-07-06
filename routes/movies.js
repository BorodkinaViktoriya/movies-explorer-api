const router = require('express').Router();
const { createMovieValidation, deleteMovieValidation } = require('../middlewares/validation');
const {
  getUserMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getUserMovies);
router.post('/', createMovieValidation, createMovie);
router.delete('/:movieId', deleteMovieValidation, deleteMovie);

module.exports = router;
