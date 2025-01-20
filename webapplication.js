const express = require("express");
const webapplication = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");


 
//Connecting to the mongodb database(we use mlab)
mongoose.connect("mongodb+srv://dung:dung2005@powergame.ztv0o.mongodb.net/Nodejs?retryWrites=true&w=majority&appName=powergame",{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {console.log('Connected to the database');
}).catch(() =>{
  console.log("Connected database failed");
});

// Struct of mongodb
const gameSchema = new mongoose.Schema({
  title : String,
  author :String,
  width: Number,
  height: Number,
  fileName: String,
  thumbnailFile: String
});

var Game = mongoose.model("Game", gameSchema);



//set the public folder as the external file folder
webapplication.use(express.static("public"));

webapplication.use(bodyParser.urlencoded({extended:true}));

webapplication.use(fileUpload());

//set view engine as ejs.
webapplication.set("view engine", "ejs");

// Home page
webapplication.get("/", function (req, res) {
  res.render("homepage");
});

// a game
webapplication.get("/game/:id", function (req, res) {
var id = req.params.id;

Game.findById(id).then(foundGame =>{
  res.render("game",{
    title: foundGame.title,
    author: foundGame.author,
    width: foundGame.width,
    height: foundGame.height,
    fileName: foundGame.fileName
  });
}).catch(error => {
    console.log(error);
  });

 
});

// Edit game
webapplication.get("/game/edit/:id", function(req, res){
  var id = req.params.id;

  Game.findById(id).then(foundGame =>{
    res.render("edit",{
      title: foundGame.title,
      author: foundGame.author,
      width: foundGame.width,
      height: foundGame.height,
      id: foundGame.id
    });
  }).catch(error => {
      console.log(error);
    });
  

});

webapplication.post("/update/:id", function(req,res){
var id =  req.params.id;

  Game.findByIdAndUpdate(id, {
    title: req.body.title,
    author: req.body.author,
    width: req.body.width,
    height: req.body.height
  },{new: true,runValidators: true}).then(updateGame => {
    res.redirect("/list");
    console.log("Updated Game: "+ updateGame);
  }).catch(error => {
    console.log("Couldn't update game",error);
  });
   

});


// go to all game
webapplication.get("/list", function (req, res) {

  Game.find({} ).then( games => {
    res.render("list", {
      gameList: games,
    });
  })
  .catch(error => {
    console.error('There was a problem retrieving all the of games from the database', error);
  });

});

// go to add game
webapplication.get("/addgame", function(req, res){
  res.render("addgame");
});

webapplication.post("/addgame", function(req,res){

  try {
    var data = req.body;
    var gameFile = req.files.gameFile;
    var imageFile = req.files.imageFile;

    if (!data || !gameFile || !imageFile) {
      return res.redirect("/list");
    }

    gameFile.mv("public/games/" + gameFile.name).then(() =>{
      console.log("Game file successfully uploaded");
    }).catch(error =>{
      console.log("Couldn't upload the game file",error);
    });

    imageFile.mv("publicgame/games/thumbnails/"+ imageFile.name).then(() =>{
      console.log("Image file successfully uploaded");
    }).catch(error =>{
      console.log("Couldn't upload the image file",error)
    });

    Game.create({
      title : data.title,
      author : data.author,
      width: data.width,
      height: data.height,
      fileName: gameFile.name,
      thumbnailFile: imageFile.name
    }).then(data => {
      console.log('Game added to database',data);
    }).catch(error =>{
      console.log("There was a problem  adding this game to the database",error);
    });

    res.redirect("/list");
  }
  catch (error) {
    console.error("Error:", error);
    res.redirect("/addgame");   // back to add game when error
  }

});


// PORT 6969
webapplication.listen("6969", function () {
  console.log("Gamepro Production Website ON <3");
});
