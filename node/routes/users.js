const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { authenticateToken } = require("../middlewares/authMiddleware");
require("dotenv").config();

router.get("/test", (req, res) => {
  res.json({ message: "API Users OK ✅" });
});

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur." });
      if (result.length > 0)
        return res.status(400).json({ message: "Email déjà utilisé." });

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || "user";

      db.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, userRole],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Erreur serveur lors de l’inscription." });
          res.status(201).json({ message: "Utilisateur inscrit avec succès." });
        }
      );
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur." });
      if (result.length === 0)
        return res.status(401).json({ message: "Email invalide." });

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Mot de passe incorrect." });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(200).json({ message: "Connexion réussie", token });
    }
  );
});

router.post("/change-password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body

  db.query("SELECT * FROM users WHERE id = ?", [req.user.id], async (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur." })
    if (result.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé." })

    const user = result[0]

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect." })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour." })
      res.status(200).json({ ok: true, message: "Mot de passe mis à jour avec succès." })
    })
  })
})


module.exports = router;
