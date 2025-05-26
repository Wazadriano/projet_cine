// routes/ratings.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middlewares/authMiddleware');


router.post('/add', authenticateToken, (req, res) => {
  const { film_id, title, poster_path, rating } = req.body;

  if (!film_id || !title || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Données de notation invalides." });
  }

  const checkQuery = `SELECT * FROM ratings WHERE user_id = ? AND film_id = ?`;
  db.query(checkQuery, [req.user.id, film_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur SQL (vérification)." });

    if (results.length > 0) {

      const updateQuery = `
        UPDATE ratings SET rating = ? WHERE user_id = ? AND film_id = ?
      `;
      db.query(updateQuery, [rating, req.user.id, film_id], (err2) => {
        if (err2) return res.status(500).json({ message: "Erreur SQL (update)." });
        return res.status(200).json({ message: "Note mise à jour avec succès." });
      });
    } else {
      // Insertion
      const insertQuery = `
        INSERT INTO ratings (user_id, film_id, title, poster_path, rating)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(insertQuery, [req.user.id, film_id, title, poster_path, rating], (err2) => {
        if (err2) return res.status(500).json({ message: "Erreur SQL (insertion)." });
        return res.status(201).json({ message: "Note ajoutée avec succès." });
      });
    }
  });
});


router.get('/average/:film_id', (req, res) => {
  const filmId = req.params.film_id;

  const query = `SELECT AVG(rating) AS average FROM ratings WHERE film_id = ?`;
  db.query(query, [filmId], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur SQL (moyenne)." });
    const average = results[0].average ? parseFloat(results[0].average).toFixed(1) : null;
    res.status(200).json({ average });
  });
});


router.get('/user/:film_id', authenticateToken, (req, res) => {
  const filmId = req.params.film_id;

  const query = `SELECT rating FROM ratings WHERE film_id = ? AND user_id = ?`;
  db.query(query, [filmId, req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur SQL (user rating)." });

    if (results.length > 0) {
      res.status(200).json({ rating: results[0].rating });
    } else {
      res.status(200).json({ rating: null });
    }
  });
});

module.exports = router;
