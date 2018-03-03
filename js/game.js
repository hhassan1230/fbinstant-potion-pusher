//
// Constants
//

const positions = [
[{x:34,y:271},{x:254,y:271},{x:474,y:271},],
[{x:34,y:491},{x:254,y:491},{x:474,y:491},],
[{x:34,y:711},{x:254,y:711},{x:474,y:711},]
];
const sprites = ['like', 'love'];
const version = '1.0.1';

//
// Globals
//

var game;
var gameData = {
  gameState : [
    [-1,-1,-1],
    [-1,-1,-1],
    [-1,-1,-1]
  ],
  players: [],
  playerTurn: -1,
};
var playerInfo = {
  name : null,
  photo:  null,
  locale: null,
  id: null,
  index: -1,
  winStreak: 0
}
var contextId = null;
var contextType = null;
var contextValid = false;
var forceRematch = false;
var isGameOver = false;
var lblGameText = null;


//
// Phaser functions
//

var bootState = {
  _lblDebugText: null,
  _btnChooseContext: null,
  _btnStartGame: null,

  preload: function() {
    var images = ['like', 'love', 'bg_blue', 'bg_grey', 'btn_context', 'btn_play', 'btn_rematch'];
    for (var i=0; i < images.length; i++) {
      var assetName = images[i];
      game.load.image(assetName, 'assets/'+assetName+'.png');
      game.events.onAssetLoaded(i, images.length);
    }
  },

  create: function() {
    var self = this;
    game.stage.backgroundColor = '#ffffff';
    self._lblDebugText = game.add.text(34, 34, '', { font: "16px Helvetica", fill: '#449BF3' });
    self._btnStartGame = game.add.button(10, 500, 'btn_play', function() {
      game.state.start('main');

    }, self);
    self._btnStartGame.visible = false;
    self._btnChooseContext = game.add.button(10, 500, 'btn_context', function() {
      game.events.onSelectContextButtonTapped();
    }, self);
    self._btnChooseContext.visible = false;
    game.events.onContextChange = (function(id, type, valid){

      self.updateGameInfo();
      if (id) {
        contextId = id;
        contextType = type;
        contextValid = valid;
        self._lblDebugText.text += 'Getting match data from backend... \n';
        self._btnChooseContext.visible = false;
        data.load(contextId)
        .then(function(response) {
          self._lblDebugText.text += '...done! \n';
          if (response.empty || forceRematch) {
            forceRematch = false;
            gameDataLoaded(null);
          } else {
            var serverData = JSON.parse(response.data);
            gameDataLoaded(serverData);
          }
          self.updateGameInfo();
        })
        .catch(function(err) {
          self._lblDebugText.text += 'error loading data from backend \n';
          self._lblDebugText.text += err;
        });
      }
    }).bind(self);
    game.events.onGameReady();
  },

  updateGameInfo: function() {
    var debugText = '';
    debugText += 'version = ' + version + '\n';
    debugText += 'playerID = ' + playerInfo.id + '\n';
    debugText += 'contextID = ' + contextId + '\n';
    debugText += 'context type = ' + contextType + '\n';
    if (!contextValid) {
      debugText += 'This game is made for 2 players only' + '\n';
    }
    var canPlayGame = (contextId != null && contextValid);
    this._lblDebugText.text = debugText;
    this._btnChooseContext.visible = !canPlayGame;
    this._btnStartGame.visible = canPlayGame;
  }
}

//
// Main State
//
var mainState = {
  preload: function() {
    setCanvasResponsive();
  },

  create: function() {
    createBackground();
    createGameText();
    placeTiles();
    createGameHud();
  },

  update: function() {
    game.scale.setShowAll();
    game.scale.refresh();
  },

  restartGame: function() {
    game.world.removeAll();
    this.create();
    isGameOver = false;
  },

  rematch: function() {
    forceRematch = false;
    gameData = {
      gameState : [
      [-1,-1,-1],
      [-1,-1,-1],
      [-1,-1,-1]
      ],
      players: [],
      playerTurn: -1,
    };
    gameDataLoaded(null);
    this.restartGame();
  }
}

//
// Rendering
//

function setCanvasResponsive() {
  game.scale.scaleMode = Phaser.ScaleManager.aspectRatio;
  game.scale.pageAlignVertically = true;
  game.scale.pageAlignHorizontally = true;
  game.scale.setShowAll();
  game.scale.refresh();
}

function createGameText() {
  lblGameText = game.add.text(34, 180, "", { font: "64px Helvetica", fill: '#449BF3' });
  lblGameText.text = playerInfo.name + "'s turn";
}

function createBackground() {
  game.stage.backgroundColor = '#ffffff';
  var currentBg = 0;
  var backgrounds = ['bg_blue', 'bg_grey'];
  for (var x=0; x < 3; x++) {
    for (var y=0; y < 3; y++) {
      var bgTile = game.add.image(positions[x][y].x, positions[x][y].y, backgrounds[currentBg]);
      bgTile.inputEnabled = true;
      bgTile.gridX = x;
      bgTile.gridY = y;
      bgTile.events.onInputDown.add(tappedBgTile, this);
      currentBg = toggle(currentBg);
    }
  }
}

function createGameHud() {
  if (playerInfo.photo) {
    var loader = new Phaser.Loader(game);
    loader.crossOrigin = true;
    loader.image('playerPhoto', playerInfo.photo);
    loader.onLoadComplete.add(function() {
      var profilePic = game.add.image(34, 24, 'playerPhoto');
      profilePic.width = 120;
      profilePic.height = 120;
    }, this);

    loader.start();
  }
  if (playerInfo.name) {
    game.add.text(160, 28, playerInfo.name + '(' + playerInfo.id + ')', { font: "28px Helvetica", fill: '#449BF3' });
  }
  if (contextId) {
    game.add.text(160, 90, 'Context: ' + contextId, { font: "16px Helvetica", fill: '#449BF3' });
  }
  if (playerInfo.locale) {
    game.add.text(160, 110, 'Locale: '+ playerInfo.locale, { font: "16px Helvetica", fill: '#449BF3' });
  }

  game.add.text(160, 70, 'Win Streak: '+ playerInfo.winStreak, { font: "16px Helvetica", fill: '#449BF3' });


  if (gameData.playerTurn != playerInfo.index) {
    isGameOver = true;
    lblGameText.text = 'Wait your turn';
  }

  if (checkGameWon()) {
    isGameOver = true;
    var winner = gameData.playerTurn;
    if (winner == playerInfo.index) {
      lblGameText.text = 'You win!';
    } else {
      lblGameText.text = 'You lose!';
    }
    game.add.button(275, 1000, 'btn_rematch', function() {
      mainState.rematch();
    }, self);
  }
  if (checkDraw()) {
    isGameOver = true;
    lblGameText.text = 'Draw!';
    game.add.button(275, 1000, 'btn_rematch', function() {
      mainState.rematch();
    }, self);
  }
}

function placeEmojiSprite(column, row, playerIndex) {
  var offsetX = 21;
  var offsetY = 21;
  var position = positions[column][row];
  game.add.image(position.x + offsetX, position.y + offsetY, sprites[playerIndex]);
}

function placeTiles() {
  for (var x=0; x < 3; x++) {
    for (var y=0; y < 3; y++) {
      if (gameData.gameState[x][y] > -1) {
        var playerIndex = gameData.gameState[x][y]
        placeEmojiSprite(x, y, playerIndex);
      }
    }
  }
}

//
// Input handling
//

function tappedBgTile(bgTile) {
  playInPosition(bgTile.gridX, bgTile.gridY, playerInfo.index);
}

//
// Game controls
//

function playInPosition(x, y, playerIndex) {
  if (isGameOver) {
    return;
  }
  if (gameData.gameState[x][y] != -1) {
    return;
  }

  placeEmojiSprite(x, y, playerInfo.index);
  setData(x, y, playerInfo.index);
  if (checkGameWon()) {
    lblGameText.text = playerInfo.name + ' won!';
    finishGame(true);
  } else if (checkDraw()) {
    lblGameText.text = 'Draw!';
    finishGame(false);
  } else {
    lblGameText.text = 'Sending your move';
    sendMove();
  }
}

function sendMove() {
  var self = this;
  isGameOver = true;
  gameData.playerTurn = toggle(gameData.playerTurn);
  saveGameData(function() {
    // Allow some time to render the last frame before screenshot
    game.time.events.add(100, function() {
      game.events.onSendMove();
    },
    self);
  });

}

function finishGame(playerWon) {
  var self = this;
  isGameOver = true;
  saveGameData(function() {
    // Allow some time to render the last frame before screenshot
    game.time.events.add(100, function() {
      game.events.onGameFinished(playerWon);
    },
    self);
  });
}

//
// Game State and Conditions
//
function gameDataLoaded(serverData) {
  if (!serverData || serverData.empty) {
    // This is a new game. Player is Player 1.
    gameData.players = [playerInfo.id];
    gameData.playerTurn = 0;
    saveGameData();
    game.events.onGamesStarted();
  } else {
    gameData = serverData;
    if (gameData.players.length == 1 && gameData.players[0] != playerInfo.id) {
      // Player is accepting a challenge as Player 2.
      gameData.players.push(playerInfo.id);
      gameData.playerTurn = 1
      saveGameData();
    }
  }
  playerInfo.index = gameData.players.indexOf(playerInfo.id);
}

function saveGameData(successCallback) {
  data.save(contextId, gameData)
  .then(function(){
    if (successCallback) {
      successCallback();
    }
  })
  .catch(function(err){
    console.log('Failed to save game data', err);
  });
}

function setData(column, row, playerIndex) {
  gameData.gameState[column][row] = playerIndex;
}

function checkMatchAll(cells) {
  return (cells[0] != -1) && (cells[0] == cells[1]) && (cells[1] == cells[2]);
}

function checkGameWon() {
  var gameState = gameData.gameState;
  var matchRow =
    checkMatchAll(gameState[0]) ||
    checkMatchAll(gameState[1]) ||
    checkMatchAll(gameState[2]);
  var matchColumn =
    checkMatchAll([gameState[0][0], gameState[1][0], gameState[2][0]]) ||
    checkMatchAll([gameState[0][1], gameState[1][1], gameState[2][1]]) ||
    checkMatchAll([gameState[0][2], gameState[1][2], gameState[2][2]]);
  var matchAcross =
    checkMatchAll([gameState[0][0], gameState[1][1], gameState[2][2]]) ||
    checkMatchAll([gameState[2][0], gameState[1][1], gameState[0][2]]);

  var won = matchRow || matchColumn || matchAcross;
  return won;
}

function checkDraw() {
  for (var x=0; x < 3; x++) {
    for (var y=0; y < 3; y++) {
      if (gameData.gameState[x][y] == -1) {
        return false;
      }
    }
  }
  return true;
}

//
// Helper functions
//

function toggle(value) {
  if (value) {
    return 0;
  } else {
    return 1;
  }
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function takeScreenshot() {
  return new Promise(function(resolve, reject){
    var img=new Image();
    img.onload= function() {
      var croppedURL=cropPlusExport(img,34,271,666,666);
      resolve(croppedURL);
    };
    img.src=game.canvas.toDataURL();

    function cropPlusExport(img,cropX,cropY,cropWidth,cropHeight){
      var canvas1=document.createElement('canvas');
      var ctx1=canvas1.getContext('2d');
      canvas1.width=cropWidth;
      canvas1.height=cropHeight;
      ctx1.drawImage(img,cropX,cropY,cropWidth,cropHeight,0,0,cropWidth,cropHeight);
      return(canvas1.toDataURL());
    }

  });

}
