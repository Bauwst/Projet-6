require("dotenv").config();

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const secretKey = "RANDOM_SECRET_KEY";
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;
    req.auth = { userId }; 
    if (req.body.userId && req.body.userId !== userId) {
      throw "403: unauthorized request";
    } else {
    next();
    }
  } catch(e) {
    res.status(401).json({
      error: e.message,
    });
  }
};