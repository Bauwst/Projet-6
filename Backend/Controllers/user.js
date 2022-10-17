const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../models/User");
let emailRegExp =  new RegExp('^[a-zA-Z0-9.-_-]+@[a-zA-Z0-9.-_]+.[a-z]{2,}$');

require("dotenv").config();


exports.signup = async (req, res, next) => {
  try {
    console.log(req)
    let hash = await bcrypt.hash(req.body.password, 10);
    console.log(hash)
    const user = new User({
        email: req.body.email,
        password: hash,
        });
    if (emailRegExp.test(req.body.email)){
        user.save()         
        res.status(201).json({ message: "Utilisateur créé !" })
    }
  } catch(e) {
    console.log(e.message)
    res.status(500).json({
      error: e.message,
    });
  }
};


exports.login = async (req, res, next) => {
    try {
        console.log(req)
        const secretKey = "RANDOM_SECRET_KEY"; 
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(401).json({ error: "utilisateur inconnu" });
        }
        const valid = await bcrypt.compare(req.body.password, user.password)
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
    } catch(e) {
        console.log(e.message)
        res.status(500).json({
            error: e.message,
        });
    }
};