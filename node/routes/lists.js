const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get('/user', authenticateToken, (req, res) => {

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

  const checkQuery = `
    SELECT * FROM watchlist_items WHERE watchlist_id = ? AND film_id = ?
  `;

  db.query(checkQuery, [listId, film_id], (err, results) => {
    if (err) {
      console.error("❌ Erreur SQL (checkQuery):", err);
      return res.status(500).json({ message: "Erreur serveur (vérification)." });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Ce film est déjà dans la liste." });
    }

    const insertQuery = `
      INSERT INTO watchlist_items (watchlist_id, film_id, title, poster_path)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [listId, film_id, title, poster_path], (err2) => {
      if (err2) {
        console.error("❌ Erreur SQL (insertQuery):", err2);
        return res.status(500).json({ message: "Erreur serveur (insertion)." });
      }

      res.status(201).json({ message: "Film ajouté à la liste." });
    });
  });
});


// Supprimer un film d'une watchlist
router.delete('/:listId', authenticateToken, (req, res) => {
  const listId = req.params.listId;

  // Supprimer d'abord les films associés
  db.query('DELETE FROM watchlist_items WHERE watchlist_id = ?', [listId], (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la suppression des films." });

    // Puis supprimer la liste elle-même
    db.query('DELETE FROM watchlists WHERE id = ? AND owner_id = ?', [listId, req.user.id], (err2) => {
      if (err2) return res.status(500).json({ message: "Erreur lors de la suppression de la liste." });
      res.status(200).json({ message: "Liste supprimée avec succès." });
    });
  });
});

// Créer une nouvelle watchlist
router.post('/create', authenticateToken, (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Nom de liste requis.' });
  }

  const query = `
    INSERT INTO watchlists (name, owner_id)
    VALUES (?, ?)
  `;

  db.query(query, [name.trim(), req.user.id], (err, result) => {
    if (err) {
      console.error('Erreur SQL (create list) :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    res.status(201).json({
      id: result.insertId,
      name: name.trim()
    });
  });
});

// Mettre à jour le nom d'une watchlist
router.put('/update/:listId', authenticateToken, (req, res) => {
  const listId = req.params.listId;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Nom de liste requis.' });
  }

  const query = `
    UPDATE watchlists
    SET name = ?
    WHERE id = ? AND owner_id = ?
  `;

  db.query(query, [name.trim(), listId, req.user.id], (err) => {
    if (err) {
      console.error('Erreur SQL (update list) :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    res.status(200).json({ message: 'Liste mise à jour avec succès.' });
  });
});

// Partie shared lists
router.post('/share', authenticateToken, (req, res) => {
  const { listId, userEmail } = req.body;

  if (!listId || !userEmail) {
    return res.status(400).json({ message: "Données incomplètes." });
  }

  // 1. Vérifier que la liste appartient bien à l'utilisateur
  db.query(
    'SELECT * FROM watchlists WHERE id = ? AND owner_id = ?',
    [listId, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur." });
      if (results.length === 0) return res.status(403).json({ message: "Liste inaccessible." });

      // 2. Récupérer l'ID du destinataire
      db.query('SELECT id FROM users WHERE email = ?', [userEmail], (err2, users) => {
        if (err2) return res.status(500).json({ message: "Erreur recherche utilisateur." });
        if (users.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé." });

        const targetUserId = users[0].id;

        // 3. Insérer dans shared_lists
        db.query(
          'INSERT IGNORE INTO shared_lists (watchlist_id, user_id) VALUES (?, ?)',
          [listId, targetUserId],
          (err3) => {
            if (err3) return res.status(500).json({ message: "Erreur partage." });
            res.status(200).json({ message: "Liste partagée avec succès." });
          }
        );
      });
    }
  );
});

router.get('/shared', authenticateToken, (req, res) => {
  const query = `
    SELECT w.id, w.name, u.email AS owner_email
    FROM shared_lists s
    JOIN watchlists w ON s.watchlist_id = w.id
    JOIN users u ON w.owner_id = u.id
    WHERE s.user_id = ?
  `;

  db.query(query, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur." });
    res.status(200).json(results);
  });
});

router.get('/shared/:listId/items', authenticateToken, (req, res) => {
  const listId = req.params.listId;

  const checkAccess = `
    SELECT * FROM shared_lists WHERE watchlist_id = ? AND user_id = ?
  `;

  db.query(checkAccess, [listId, req.user.id], (err, access) => {
    if (err) return res.status(500).json({ message: "Erreur d’accès." });
    if (access.length === 0) return res.status(403).json({ message: "Accès refusé." });

    const query = `
      SELECT film_id AS id, title, poster_path
      FROM watchlist_items
      WHERE watchlist_id = ?
    `;

    db.query(query, [listId], (err2, items) => {
      if (err2) return res.status(500).json({ message: "Erreur chargement liste." });
      res.status(200).json(items);
    });
  });
});





module.exports = router;
