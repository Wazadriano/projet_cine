const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get('/user', authenticateToken, (req, res) => {
  const listId = req.params.listId;

  const query = `
    SELECT * from watchlists
    WHERE owner_id = ?
  `;

  db.query(query, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    res.status(200).json(results);
  });
});

router.get('/:listId', authenticateToken, (req, res) => {
  const listId = req.params.listId;

  const query = `
    SELECT film_id AS id, title, poster_path
    FROM watchlist_items
    WHERE watchlist_id = ?
  `;

  db.query(query, [listId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    res.status(200).json(results);
  });
});


router.post("/add", authenticateToken, (req, res) => {
  const { listId, film_id, title, poster_path } = req.body;

  if (!listId || !film_id || !title || !poster_path) {
    return res.status(400).json({ message: "Données incomplètes." });
  }

  const query = `
    INSERT INTO watchlist_items (watchlist_id, film_id, title, poster_path)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [listId, film_id, title, poster_path], (err) => {
    if (err) {
      console.error("Erreur ajout film :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }

    res.status(201).json({ message: "Film ajouté à la liste." });
  });
});


router.post('/create', authenticateToken, (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'Le nom de la liste est requis.' });
  }

  const query = 'INSERT INTO watchlists (name, owner_id, is_shared) VALUES (?, ?, false)';
  db.query(query, [name, userId], (err, result) => {
    if (err) {
      console.error('Erreur création liste:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    const newList = {
      id: result.insertId,
      name,
      owner_id: userId,
      is_shared: false
    };

    res.status(201).json(newList);
  });
});


// Supprimer un film d'une watchlist
router.delete('/:listId/:filmId', authenticateToken, (req, res) => {
  const { listId, filmId } = req.params;

  db.query(
    'DELETE FROM watchlist_items WHERE watchlist_id = ? AND film_id = ?',
    [listId, filmId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
      res.status(200).json({ message: 'Film retiré de la liste.' });
    }
  );
});


module.exports = router;
