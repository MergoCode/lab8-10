// routes/hallsMoviesRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/hallsMoviesController');

router.get('/', controller.getAll);
router.get('/movie/:movieId', controller.getHallsByMovie);
router.get('/hall/:hallId', controller.getMoviesByHall);
router.post('/', controller.addRelation);
router.delete('/', controller.deleteRelation);

module.exports = router;
