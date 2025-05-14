// controllers/hallsMoviesController.js
const pool = require('../config/db');

module.exports = {
  // 🔹 Отримати всі зв’язки
  getAll: async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM halls_movies`);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // 🔹 Отримати всі зали для конкретного фільму
  getHallsByMovie: async (req, res) => {
    const { movieId } = req.params;
    try {
      const [rows] = await pool.query(
        `SELECT hall_id FROM halls_movies WHERE movie_id = ?`,
        [movieId]
      );
      res.json(rows.map((r) => r.hall_id));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // 🔹 Отримати всі фільми в конкретному залі
  getMoviesByHall: async (req, res) => {
    const { hallId } = req.params;
    try {
      const [rows] = await pool.query(
        `SELECT movie_id FROM halls_movies WHERE hall_id = ?`,
        [hallId]
      );
      res.json(rows.map((r) => r.movie_id));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // 🔸 Додати зв’язок фільм-зал
  addRelation: async (req, res) => {
    const { movie_id, hall_id } = req.body;
    try {
      await pool.query(
        `INSERT INTO halls_movies (movie_id, hall_id) VALUES (?, ?)`,
        [movie_id, hall_id]
      );
      res.json({ message: 'Relation added' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error or duplicate relation' });
    }
  },

  // 🔸 Видалити зв’язок
  deleteRelation: async (req, res) => {
    const { movie_id, hall_id } = req.body;
    try {
      await pool.query(
        `DELETE FROM halls_movies WHERE movie_id = ? AND hall_id = ?`,
        [movie_id, hall_id]
      );
      res.json({ message: 'Relation deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },
};
