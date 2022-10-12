const express = require('express');
const mongoose = require("mongoose");
const app = express();

const sauceRoutes = require('./routes/sauce');
const userRoutes = require("./routes/user");
const path = require("path");
app.use(express.json());


mongoose.connect('mongodb+srv://Bauwst:JB27UUKX@cluster0.7e3lnda.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion réussie !'))
  .catch(() => console.log('Connexion échouée !'));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});
app.use("/images", express.static(path.join(__dirname, "images")));
app.use('/api/sauces', sauceRoutes);
app.use("/api/auth", userRoutes);
//app.use(bodyParser.json());

module.exports = app;