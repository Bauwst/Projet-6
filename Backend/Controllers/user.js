const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../models/User");


require("dotenv").config();


exports.signup = (req, res, next) => {
  try {
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch((error) => res.status(401).json({ error }));
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  } catch {
    res.status(500).json({
      error: new Error("Erreur server"),
    });
  }
};


exports.login = (req, res, next) => {
  try {
    const secretKey = "RANDOM_SECRET_KEY";
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "utilisateur inconnu" });
        }
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              return res.status(401).json({ error: "Mot de passe incorrect" });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                {
                  userId: user._id,
                },
                secretKey,
                { expiresIn: "24h" }
              ),
            });
          })
        .catch((error) => res.status(501).json({ "error": process.env }));
      })
      .catch((error) => res.status(500).json({ error }));
  } catch {
    res.status(500).json({
      error: new Error("Erreur server"),
    });
  }
};