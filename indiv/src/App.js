import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { loadGoogleScript } from './lib/GoogleLogin';
import { Chessboard } from './chessboard-1.0.0.js';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


const googleClientId = "576773905852-tkb6qe5nev0b4t3dted10g3qo21fjq92.apps.googleusercontent.com";
var amountOfPrices;

function App() {
  
  const [gapi, setGapi] = useState();
  const [googleAuth, setGoogleAuth] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState();
  
  const onSuccess = (googleUser) => {
    setIsLoggedIn(true);
    const profile = googleUser.getBasicProfile();
    setName(profile.getName());
    setEmail(profile.getEmail());
    setImageUrl(profile.getImageUrl());

    setRamdonPieces();
  };
  
  const onFailure = () => {
    setIsLoggedIn(false);
  }
  
  const logOut = () => {
    console.log(localStorage.getItem('@IndiviDUALITY/piecesQntd'));

    (async() => {
      await googleAuth.signOut();
      setIsLoggedIn(false);
      renderSigninButton(gapi);
    })();
  };
  
  const renderSigninButton = (_gapi) => {
    _gapi.signin2.render('google-signin', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      'onsuccess': onSuccess,
      'onfailure': onFailure 
    });
  }
  
  
  useEffect(() => {
    
    //window.gapi is available at this point
    window.onGoogleScriptLoad = () => {
     
      const _gapi = window.gapi;
      setGapi(_gapi);
      
      _gapi.load('auth2', () => {
        (async () => { 
          const _googleAuth = await _gapi.auth2.init({
           client_id: googleClientId
          });
          setGoogleAuth(_googleAuth);
          renderSigninButton(_gapi);
        })();
      });
    }
    
    //ensure everything is set before loading the script
    loadGoogleScript();
    
  }, []);
  
  function setRamdonPieces() {
    //var piecesQntd = [1, 0, 1, 3, 2, 4]
    amountOfPrices = generateRandomIntegerInRange(2, 15);

    var numPawn   = generatePrices(amountOfPrices);
    var numHorse  = generatePrices(numPawn[1]);  
    var numBishop = generatePrices(numHorse[1]);    
    var numTower  = generatePrices(numBishop[1]);
    var numQueen  = generatePrices(numTower[1]);

    var piecesQntd = [1,numQueen[0], numTower[0], numBishop[0], numHorse[0], numPawn[0]]

    localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);

  }

  function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  function generatePrices(amountOfPrices) {
    console.log("Init - amountOfPrices: " + amountOfPrices);
    var numPrices = generateRandomIntegerInRange(0, amountOfPrices);

    console.log("Price:" + numPrices);

     amountOfPrices = amountOfPrices - numPrices;
    console.log("Final - amountOfPrices: " + amountOfPrices);

    return [numPrices, amountOfPrices];
  } 

var board = null

//We use the matrix, just to check if the king is protected. Easier than using FEN
var boardMatrix = [[0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0]]

//Store variables for king
var king = false
var kingRank = -1
var kingFile = -1

//Initial amounts available for each piece. This will be replaced by the actual amount of pieces, the player has
var piecesQntd = [1, 0, 2, 3, 2, 4]
var piecesAvailable = [1, 0, 2, 3, 2, 4]

//This is the beginning of the Drag. We want to make sure player can drag the piece player is trying to
//Player cannot drag a piece not available nor more than 16 pieces
function onDragStart (source, piece, position, orientation) {
  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false

  var draggingPiece = piece.substring(1)
  var endBoard = board.fen()

  if (draggingPiece == "K") {
    king = true
  } else {
    king = false
  }

  //Let's take this piece out of the matrix if we are taking from the board
  if (source != "spare") {
    var rank = source.substring(1)
    var file = convertFileToInt(source.substring(0,1))

    boardMatrix[rank-1][file] = 0
  }

  //If piece is already on the board, player can drag it anytime
  if(source == 'spare') {

    //We cannot have more than 16 pieces
    var regexp = /[A-R]/gi;
    var matches_array = endBoard.match(regexp);

    if (matches_array == null)
      console.log("vazio")
    else {
      var total = matches_array.length
      if (total >= 16)
        return false
    }

   //we can only put 4 Pawns, 3 Bishops, 2 Knights, 1 Rookie and 1 King (for testig purposes)
    if (draggingPiece == "P" & piecesAvailable[5] <= 0) {
      return false
    }

    if (draggingPiece == "N" & piecesAvailable[4] <= 0) {
      return false
    }

    if (draggingPiece == "B" & piecesAvailable[3] <= 0) {
      return false
    }

    if (draggingPiece == "R" & piecesAvailable[2] <= 0) {
      return false
    }

    if (draggingPiece == "Q" & piecesAvailable[1] <= 0) {
      return false
    }

    if (draggingPiece == "K" & piecesAvailable[0] <= 0) {
        return false
    } 

  }
}

function countPieces(pos) {
  var endBoard = pos

  var piece = "K"
  var count = 0
  var re = new RegExp(piece,"g");
  count += (endBoard.match(re) || []).length;
  piecesAvailable[0] = piecesQntd[0] - count

  piece = "Q"
  var count = 0
  var re = new RegExp(piece,"g");
  count += (endBoard.match(re) || []).length;
  piecesAvailable[1] = piecesQntd[1] - count

  piece = "R"
  var count = 0
  var re = new RegExp(piece,"g");
  count += (endBoard.match(re) || []).length;
  piecesAvailable[2] = piecesQntd[2] - count

  piece = "B"
  var count = 0
  var re = new RegExp(piece,"g");
  count += (endBoard.match(re) || []).length;
  piecesAvailable[3] = piecesQntd[3] - count 

  piece = "N"
  var count = 0
  var re = new RegExp(piece,"g");
  count += (endBoard.match(re) || []).length;
  piecesAvailable[4] = piecesQntd[4] - count

  piece = "P"
  var count = 0
  var re = new RegExp(piece,"g");
  count += (endBoard.match(re) || []).length;
  piecesAvailable[5] = piecesQntd[5] - count

}

//Player has dragged and now is dropping the piece on board.
//Player can only drop on the bottom half, and the king only on the 2 first ranks
function onDrop (source, target, piece, newPos, oldPos) {
  // we should put pieces only in our half of the board
  console.log(target)
  if (target != "offboard") {
    var rank = target.substring(1)
    var file = convertFileToInt(target.substring(0,1))

    
    var droppedPiece = piece.substring(1)
    // King can only be placed up to the second rank, other pieces up to the fourth
    if (king) {
      king = false
      if (rank > 2) return 'snapback'
      else {
        kingFile = file
        kingRank = rank-1
      }   
    } else {
      if (rank > 4) return 'snapback'  
    }
    
    boardMatrix[rank-1][file] = droppedPiece

  }
  var newFen = Chessboard.objToFen(newPos)
  countPieces(newFen)
  board.piecesAmount(piecesAvailable)
}

//Auxiliary function to deal with the boardMatrix
function convertFileToInt(file) {
  if (file == "a")
    return 0
  if (file == "b")
    return 1
  if (file == "c")
    return 2
  if (file == "d")
    return 3
  if (file == "e")
    return 4
  if (file == "f")
    return 5
  if (file == "g")
    return 6
  if (file == "h")
    return 7
  
}
//To avoid a initial position in check, we want to make sure king is protected
function checkKingProtected() {
  console.log(kingFile + " - " + kingRank)
  console.log(boardMatrix)

  if (boardMatrix[kingRank+1][kingFile] == 0 & boardMatrix[kingRank+2][kingFile] == 0 & boardMatrix[kingRank+3][kingFile] == 0) {
    console.log("pra frente")
    return false
  }

  if (kingFile <= 3) {
    if (boardMatrix[kingRank+1][kingFile+1] == 0 & boardMatrix[kingRank+2][kingFile+2] == 0 & boardMatrix[kingRank+3][kingFile+3] == 0) {
      console.log("pra mais")
      return false    
    }
  }

  if (kingFile >= 4) {
    if (boardMatrix[kingRank+1][kingFile-1] == 0 & boardMatrix[kingRank+2][kingFile-2] == 0 & boardMatrix[kingRank+3][kingFile-3] == 0) {
      console.log("pra menos")
      return false
    }    
  }

  return true
}


var config = {
  draggable: true,
  sparePieces: 'white',
  dropOffBoard: 'trash',
  onDragStart: onDragStart,
  onDrop: onDrop
}
board = Chessboard('myBoard', config)

function clickSavePositionBtn () {
  //Before we save it, let's make sure we have a king on our board
  console.log('Current position as a FEN string:')
  var endBoard = generateFEN()
  var king = "K"

  //This needs to become a message on the page, not on the console
  if (endBoard.indexOf(king) !== -1) {
    //document.getElementById("errorMessage").innerHTML = "Saved Successfully";
    console.log(endBoard)
  }
  else {
    console.log('Missing King')
    document.getElementById("errorMessage").innerHTML = "Missing King";
    return
  }

  if (checkKingProtected()) {
    document.getElementById("errorMessage").innerHTML = "Saved Successfully. Your FEN is: " + endBoard;
    document. getElementById("protectedImage"). style. visibility = "hidden";
  } else {
    document.getElementById("errorMessage").innerHTML = "Your King is unprotected. A king is protected when a square in front of him and any of the squares on his diagonals are occupied by allied pieces. See examples below:";
    document. getElementById("protectedImage"). style. visibility = "visible";
    return
  }
}

function generateFEN() {
  console.log(board.fen())
  var endBoard = board.fen()
  endBoard += " w "

  //We can only Castle if King is in e1
  if (boardMatrix[0][4] == "K") {
    //If rookie is on File h, we can castle small
    if (boardMatrix[0][7] == "R") {
      endBoard += "K"  
    }
    //If rookie is on File a, we can castle big
    if (boardMatrix[0][0] == "R") {
      endBoard += "Q"
    }
  }
  return endBoard

}

$('#savePos').on('click', clickSavePositionBtn)

$('#clrBoard').on('click', function () {

  board.clear(false)

  var newFen = board.fen()
  countPieces(newFen)
  board.piecesAmount(piecesAvailable)
})  
  
  
  return (
    <Router>
      <div className="App">
      <nav class="navbar navbar-expand-md bg-dark navbar-dark sticky-top">
        <a class="navbar-brand" href="/">IndiviDUALITY Chess</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link" href="/play">Jogar <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Page 1</a>
            </li>
            
          </ul>

          <ul class="nav navbar-nav ml-auto">
          {isLoggedIn &&
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img src={imageUrl} class="w-25 rounded-circle" />
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                <a class="dropdown-item" href="/myBoard">My board</a>
                <a class="dropdown-item" href="#">Another action</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" onClick={logOut} href="#">Logout</a>
              </div>
            </li>
            }
          </ul>
        </div>
      </nav>

      <Switch>
          <Route exact path="/">
            {isLoggedIn &&
            <Home />
            }
          </Route>
          <Route path="/myBoard">
            {isLoggedIn &&
            <MyBoard />
            }
          </Route>
          <Route path="/play">
            {isLoggedIn &&
            <Dashboard />
            }
          </Route>
        </Switch>

        <header className="App-header">
          {!isLoggedIn &&
            <div id="google-signin"></div>
          }
        </header>
        
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function MyBoard() {
  return (
    <div id="myBoard" >

    <button id="savePos">Save Position</button>
    <button id="clrBoard">Clear Board</button>
    
    </div>
    



  );
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
    </div>
  );
}


export default App;