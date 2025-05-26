const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion DB
const db = require("./config/db");

// Routes
const usersRoutes = require("./routes/users");
const listsRoutes = require("./routes/lists");
const ratingsRoutes = require("./routes/ratings");
const favoritesRoutes = require("./routes/favoris");
app.use("api/favoris", favoritesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/lists", listsRoutes);
app.use("/api/ratings", ratingsRoutes);


// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Node opérationnel sur le port ${PORT}`);
});
