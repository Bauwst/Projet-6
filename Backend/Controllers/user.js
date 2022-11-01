const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
let emailRegExp =  new RegExp('^[a-zA-Z0-9.-_-]+@[a-zA-Z0-9.-_]+.[a-z]{2,}$');
let mdpRegExp = new RegExp ('^[A-Za-zÀ-ÖØ-öø-ÿ0-9 -]{2,60}$');
require("dotenv").config();

exports.signup = async (req, res, next) => {
    try {
        let hash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hash,
        });
        if (emailRegExp.test(req.body.email) && mdpRegExp.test(req.body.password)){
            user.save()         
            res.status(201).json({ message: "Utilisateur créé !" })
        } else {
            res.status(401).json ({ message: "Email ou mot de passe invalide..." })
        }
    } catch(e) {
        res.status(500).json({
            error: e.message,
        });
    }
};


exports.login = async (req, res, next) => {
    try {
        const secretKey = "RANDOM_SECRET_KEY"; 
        if(!emailRegExp.test(req.body.email) || !mdpRegExp.test(req.body.password)){
            return res.status(401).json ({ message: "Email ou mot de passe invalide..." })
        }
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
            res.status(500).json({
                error: e.message,
            });
        }
    };