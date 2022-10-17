
const Sauce = require('../models/Sauce');

const fs = require("fs");

exports.createSauce = async (req, res, next) => {
  try {
    const sauceName = req.body.sauce;
    const userId = req.auth.userId;
    const sauce = new Sauce({
      userId: userId,
      name: sauceName,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, 
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
    } else res.status(404);
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
        delFile(req.params.id); 
      }
      const sauceObject = req.file 
      ? 
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    }
    : 
    { ...req.body };
    await Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      res.status(200).json({ message: "Objet modifié !" })
    }
  } catch {
    res.status(500).json({
      error: new Error("Erreur server"),
    });
  }
};


function delFile(sauceId) {
  try {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {});
      })
      .catch((error) => res.status(500).json({ error }));
  } catch {}
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
        delFile(req.params.id);
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({
              message: "Deleted!",
            });
          })
          .catch((error) => {
            res.status(400).json({
              error: error,
            });
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

exports.createLike = (req, res, next) => {
  try {
    const sauceId = req.params.id; 
    const likeValue = req.body.like; 
    const userId = req.body.userId; 

    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        let tabLikeIndex = sauce.usersLiked.indexOf(userId);
        let tabDisLikeIndex = sauce.usersDisliked.indexOf(userId);
        switch (likeValue) {
          case 1: 
            if (tabLikeIndex === -1) {
              sauce.usersLiked.push(userId);
              sauce.likes += 1;
            }
            break;
          case -1: 
            if (tabDisLikeIndex === -1) {
              sauce.usersDisliked.push(userId);
              sauce.dislikes += 1;
            }
            break;
          case 0: 
            if (tabLikeIndex !== -1) {
              sauce.usersLiked.splice(tabLikeIndex, 1);
              sauce.likes -= 1;
            }
            else if (tabDisLikeIndex !== -1) {

              sauce.usersDisliked.splice(tabDisLikeIndex, 1);

              sauce.dislikes -= 1;
            }
            break;
          default: 
        }
        Sauce.updateOne({ _id: sauceId }, sauce)
          .then(() => res.status(200).json({ message: "like pris en compte" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(400).json({ error }));
  } catch {
    res.status(500).json({
      error: new Error("Erreur server"),
    });
  }
};