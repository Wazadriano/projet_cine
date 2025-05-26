const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post('/add', authenticateToken, (req, res) => {
  const { film_id, title, poster_path } = req.body;
  if (!film_id || !title) {
    return res.status(400).json({ message: "Données manquantes." });
  }

  const check = `SELECT * FROM favorites WHERE user_id = ? AND film_id = ?`;
  db.query(check, [req.user.id, film_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur SQL." });
    if (results.length > 0) {
      return res.status(400).json({ message: "Ce film est déjà dans vos favoris." });
    }

    const insert = `
      INSERT INTO favorites (user_id, film_id, title, poster_path)
      VALUES (?, ?, ?, ?)
    `;
    db.query(insert, [req.user.id, film_id, title, poster_path], (err2) => {
      if (err2) return res.status(500).json({ message: "Erreur ajout." });
      res.status(201).json({ message: "Film ajouté aux favoris." });
    });
  });
});

router.delete('/remove/:film_id', authenticateToken, (req, res) => {
  const filmId = req.params.film_id;
  db.query(
    `DELETE FROM favorites WHERE user_id = ? AND film_id = ?`,
    [req.user.id, filmId],
    (err) => {
      if (err) return res.status(500).json({ message: "Erreur suppression." });
      res.status(200).json({ message: "Favori supprimé." });
    }
  );
});

router.get('/user', authenticateToken, (req, res) => {
  db.query(
    `SELECT film_id AS id, title, poster_path FROM favorites WHERE user_id = ?`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur récupération." });
      res.status(200).json(results);
    }
  );
});

router.get('/check/:film_id', authenticateToken, (req, res) => {
  db.query(
    `SELECT * FROM favorites WHERE user_id = ? AND film_id = ?`,
    [req.user.id, req.params.film_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur." });
      res.status(200).json({ isFavorite: results.length > 0 });
    }
  );
});

module.exports = router;
