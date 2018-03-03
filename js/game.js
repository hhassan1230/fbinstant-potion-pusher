//
// Constants
//

const positions = [
];
const sprites = ['like', 'love'];
const version = '0.0.1';

//
// Globals
//

var game;
var gameData = {
};
var playerInfo = {
}


//
// Phaser functions
//

var bootState = {

  preload: function() {
    var images = []; // this is where we'd load the assets
    for (var i=0; i < images.length; i++) {
      var assetName = images[i];
      game.load.image(assetName, 'assets/'+assetName+'.png');
      game.events.onAssetLoaded(i, images.length);
    }
  },

  create: function() {

  },

  updateGameInfo: function() {

  }
}

//
// Main State
//
var mainState = {
  preload: function() {
  },

  create: function() {

  },

  update: function() {

  },

  restartGame: function() {

  },

  rematch: function() {

  }
}

//
// Rendering
//

function setCanvasResponsive() {

}

function createGameText() {

}

function createBackground() {

}

function createGameHud() {

}

function placeEmojiSprite(column, row, playerIndex) {

}

function placeTiles() {

}

//
// Input handling
//

function tappedBgTile(bgTile) {
}

//
// Game controls
//

function playInPosition(x, y, playerIndex) {

}

function sendMove() {


}

function finishGame(playerWon) {


}

//
// Game State and Conditions
//
function gameDataLoaded(serverData) {

}

function saveGameData(successCallback) {

}

function setData(column, row, playerIndex) {
}

function checkMatchAll(cells) {
}

function checkGameWon() {
}

function checkDraw() {

}

//
// Helper functions
//

function toggle(value) {

}

function randomElement(arr) {
}

function takeScreenshot() { // This could be important!

}
