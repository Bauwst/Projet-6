
const Sauce = require('../models/Sauce');

const fs = require("fs").promises;

exports.createSauce = async (req, res, next) => {

  try {
    const userId = req.auth.userId;
    const payLoad = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
      userId: userId,
      name: payLoad.name,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      manufacturer: payLoad.manufacturer,
      description: payLoad.description,
      mainPepper: payLoad.mainPepper,
      heat: payLoad.heat,
      likes: 0,
      dislikes: 0,
      usersLiked: [] ,
      usersDisliked: [] 
    });
    await sauce.save()
    res.status(201).json({ message: "Objet enregistré !" })
  } catch(e) {
    res.status(400).json({
      error: e.message,
    });
  }
};

exports.getOneSauce = async (req, res, next) => {
  try {
    const result = await Sauce.findOne({
      _id: req.params.id
    });
    if (result){
      res.status(201).json(result);
    } else {
      res.status(404).json({ message: "Impossible de trouver le produit recherché !"})
    } 
  } catch(e){
    res.status(500).json({
      error: e.message
    });
  }
};

exports.modifySauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id })
    if (!sauce) {
      res.status(404).json({
        error: new Error("sauce non trouvée"),
      });
    } else if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("403: unauthorized request"),
      });
    } else {
      if (req.file) {
        await delFile(req.params.id); 
      }
      const sauceObject = req.file 
      ? 
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
      : 
      { ...req.body };
      await Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id });
      res.status(200).json({ message: "Objet modifié !" })
    }
  } catch {
    res.status(500).json({
      error: new Error("Erreur server"),
    });
  }
};


async function delFile(sauceId) {
  try {
    const sauce = await Sauce.findOne({ _id: sauceId })
    const filename = sauce.imageUrl.split("/images/")[1];
    await fs.unlink(`./images/${filename}`);
  } catch(error) {
    console.error(`got an error trying to delete the file:${error.message}`);
  }
}


exports.deleteSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id })
    if (!sauce) {
      res.status(404).json({
        error: new Error("sauce non trouvée"),
      });
    } else if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("403: unauthorized request"),
      });
    } else {
      await delFile(req.params.id);
      await Sauce.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "Deleted!",
      });
    }
  } catch {
    res.status(500).json({
      error: new Error("Erreur server"),
    });
  }
};

exports.getAllSauce =  async (req, res, next) => {
  try {
    const sauces = await Sauce.find()
    if (sauces){
      res.status(200).json(sauces);
    } else res.status(404);
  } catch(e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

exports.createLike = async (req, res, next) => {
  try {
    const sauceId = req.params.id; 
    const likeValue = req.body.like;
    const userId = req.body.userId;
    const sauce = await Sauce.findOne({ _id: sauceId });
    let userLikedIndex = sauce.usersLiked.indexOf(userId);
    let userDisLikedIndex = sauce.usersDisliked.indexOf(userId);
    let flagUserExist = false;
    if(userLikedIndex >= 0 || userDisLikedIndex >= 0) { flagUserExist = true }
    switch (likeValue) {
      case 1: 
        if (userLikedIndex === -1) {
          sauce.usersLiked.push(userId);
          sauce.likes += 1;
          if(flagUserExist) { 
            sauce.usersDisliked.splice(userDisLikedIndex, 1); 
            sauce.dislikes -= 1; 
          }
        }
      break;
      case -1: 
        if (userDisLikedIndex === -1) {
          sauce.usersDisliked.push(userId);
          sauce.dislikes += 1;
          if(flagUserExist) { 
            sauce.usersLiked.splice(userLikedIndex, 1);
            sauce.likes -= 1; 
          }
        }
      break;
      case 0: 
        if(flagUserExist){
          if (userDisLikedIndex >= 0) {
            sauce.usersDisliked.splice(userDisLikedIndex, 1);
            sauce.dislikes -= 1;
          }
          else if (userLikedIndex >= 0) {
            sauce.usersLiked.splice(userLikedIndex, 1);
            sauce.likes -= 1;
          }
        }
      break;
      default: 
        return res.status(500).json({ error: "Valeur like non valide." });
    }
    await Sauce.updateOne({ _id: sauceId }, sauce);
    res.status(200).json(sauce);
  } catch(e) {
    res.status(500).json({
      error: e.message,
    });
  }
};