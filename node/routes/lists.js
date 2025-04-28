const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get('/my-lists', authenticateToken, (req, res) => {
    const ownerId = req.user.id;
    
    db.query('SELECT * FROM watchlists WHERE owner_id = ?', [ownerId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
      res.status(200).json({ lists: results });
    });
  });
  

router.post('/create', authenticateToken, (req, res) => {
  const { name, is_shared } = req.body;
  const ownerId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'Le nom de la liste est requis.' });
  }

  db.query(
    'INSERT INTO watchlists (name, owner_id, is_shared) VALUES (?, ?, ?)',
    [name, ownerId, is_shared || 0],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
      res.status(201).json({ message: 'Liste créée avec succès.', listId: result.insertId });
    }
  );
});

router.post('/:listId/add', authenticateToken, (req, res) => {
  const { listId } = req.params;
  const { film_id, title, poster_path } = req.body;
  const ownerId = req.user.id;

  if (!film_id || !title || !poster_path) {
    return res.status(400).json({ message: 'Film incomplet.' });
  }

  db.query('SELECT * FROM watchlists WHERE id = ? AND owner_id = ?', [listId, ownerId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    if (result.length === 0) return res.status(403).json({ message: 'Accès interdit à cette liste.' });

    db.query(
      'INSERT INTO watchlist_items (watchlist_id, film_id, title, poster_path) VALUES (?, ?, ?, ?)',
      [listId, film_id, title, poster_path],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de l\'ajout du film.' });
        res.status(201).json({ message: 'Film ajouté avec succès.' });
      }
    );
  });
});


router.get('/:listId', authenticateToken, (req, res) => {
  const { listId } = req.params;
  const ownerId = req.user.id;

  db.query(
    'SELECT * FROM watchlists WHERE id = ? AND owner_id = ?',
    [listId, ownerId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur.' });
      if (result.length === 0) return res.status(403).json({ message: 'Accès interdit.' });

      db.query(
        'SELECT * FROM watchlist_items WHERE watchlist_id = ?',
        [listId],
        (err, films) => {
          if (err) return res.status(500).json({ message: 'Erreur serveur.' });
          res.status(200).json({ films });
        }
      );
    }
  );
});

router.delete('/:listId/remove/:itemId', authenticateToken, (req, res) => {
  const { listId, itemId } = req.params;
  const ownerId = req.user.id;

  db.query('SELECT * FROM watchlists WHERE id = ? AND owner_id = ?', [listId, ownerId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    if (result.length === 0) return res.status(403).json({ message: 'Accès interdit.' });

    db.query(
      'DELETE FROM watchlist_items WHERE id = ? AND watchlist_id = ?',
      [itemId, listId],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
        res.status(200).json({ message: 'Film supprimé avec succès.' });
      }
    );
  });
});

module.exports = router;
