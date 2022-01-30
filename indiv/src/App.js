import logo from './logo.svg';
import './App.css';
import { loadGoogleScript } from './lib/GoogleLogin';
import imgProtected from './protected.gif'
import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import Chess from "chess.js"
import $ from 'jquery'; 

const googleClientId = "576773905852-tkb6qe5nev0b4t3dted10g3qo21fjq92.apps.googleusercontent.com";
var amountOfPrices;

// varchessclient

const ENDPOINT = "http://localhost:8080";

var game = new Chess();
var socket = socketIOClient(ENDPOINT);

var color = "white";
var players;
var roomId;
var play = true;

// var room = document.getElementById("room")
// var roomNumber = document.getElementById("roomnumbers")
// var button = document.getElementById("buttonplay")
// var state = document.getElementById('stateroom')

var p1fen;
var p1castle;

var board;

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
    var user = {id: profile.getId(), name: profile.getName(), email: profile.getEmail() };
    localStorage.setItem('@IndiviDUALITY/user', user);
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
    //console.log("Init - amountOfPrices: " + amountOfPrices);
    var numPrices = generateRandomIntegerInRange(0, amountOfPrices);

    //console.log("Price:" + numPrices);

    amountOfPrices = amountOfPrices - numPrices;
    //console.log("Final - amountOfPrices: " + amountOfPrices);

    return [numPrices, amountOfPrices];
  }  

  var myBoard = document.getElementsByClassName('myBoard')[0]
  var packagePiece = document.getElementsByClassName('package')[0]
  var jogarContainer = document.getElementsByClassName('containerjogar')[0]

  const showBoard = () => {
     myBoard.style.display = 'block';
     packagePiece.style.display = 'none';
     jogarContainer.style.display = 'none';
     window.initBoard();
  };

  const showPackage = () => {
     packagePiece.style.display = 'block';
     myBoard.style.display = 'none';
     jogarContainer.style.display = 'none';
     //window.initBoard();
     window.init();
  };

  const showJogar = () => {
     packagePiece.style.display = 'none';
     myBoard.style.display = 'none';
     jogarContainer.style.display = 'block';
     //window.initBoard();
  //    // window.init();
  };
  
  // Online socketio
  // Useeffect é para os sockets

    useEffect(() => {
        socket.on('full', function (msg) {
            if(roomId == msg)
                window.location.assign(window.location.href+ 'full.html');
        });
    }, []);


    useEffect(() => {
        socket.on('play', function (msg) {
            if (msg == roomId) {
                play = false;
                document.getElementById('stateroom').innerHTML = "Game in progress"
            }
            // console.log(msg)
        });
    }, []);

    useEffect(() => {
        socket.on('move', function (msg) {
            if (msg.room == roomId) {
                game.move(msg.move);
                board.position(game.fen());
                console.log("moved")
            }
        });
    }, []);

    useEffect(() => {
        socket.on('firstMove', function (msg){
            // console.log(msg);
            // console.log(p1fen +' ! '+ p1castle +' ! '+ msg.fen +' ! '+ msg.castle +' ! '+ msg.color);
            if (msg.roomNum == roomId){
                var startFen = montaFen(p1fen, p1castle, msg.fen, msg.castle, msg.color);
                console.log(startFen);
                game.load(startFen);
                board.position(game.fen());
                console.log(roomId + '+++' + startFen);
                socket.emit('startFen', {  roomId , startFen })
            };
        });
    }, []);

    useEffect(() => {
        socket.on('startFen', function (msg){
            console.log('start = ' + msg.roomId);
            if (msg.roomId == roomId){
                var fen = msg.startFen;
                game.load(fen);
                board.position(game.fen());
            };
        });
    }, []);

    useEffect(() => {
        socket.on('player', (msg) => {
            var plno = document.getElementById('player')
            color = msg.color;

            plno.innerHTML = 'Player ' + msg.players + " : " + color;
            players = msg.players;

            var startFen;
            if(players == 2){
                var roomNum = msg.roomId;
                var fen = localStorage.getItem('@IndiviDUALITY/FEN');
                var castle = localStorage.getItem('@IndiviDUALITY/Castle');

                socket.emit('firstMove', { roomNum, fen , castle , color });
                document.getElementById('stateroom').innerHTML = "Game in Progress";
                play = false;
                socket.emit('play', msg.roomId);
            } else {
                document.getElementById('stateroom').innerHTML = "Waiting for Second player";
            }

            p1fen = localStorage.getItem('@IndiviDUALITY/FEN');
            p1castle = localStorage.getItem('@IndiviDUALITY/Castle');

            var cfg = {
                orientation: color,
                draggable: true,
                position: 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onMouseoutSquare: onMouseoutSquare,
                onMouseoverSquare: onMouseoverSquare,
                onSnapEnd: onSnapEnd
            };
            board = window.ChessBoard('boardJogo', cfg);
        });
    }, []);




    var removeGreySquares = function () {
        $('#board .square-55d63').css('background', '');
    };

    var greySquare = function (square) {
        var squareEl = $('#board .square-' + square);

        var background = '#a9a9a9';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = '#696969';
        }

        squareEl.css('background', background);
    };

    var onDragStart = function (source, piece) {
        // do not pick up pieces if the game is over
        // or if it's not that side's turn
        if (game.game_over() === true || play ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
            (game.turn() === 'w' && color === 'black') ||
            (game.turn() === 'b' && color === 'white') ) {
                return false;
        }
        // console.log({play, players});
    };

    var onDrop = function (source, target) {
        removeGreySquares();

        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });
        if (game.game_over()) {
            document.getElementById('stateroom').innerHTML = 'GAME OVER';
            socket.emit('gameOver', roomId)
        }

        // illegal move
        if (move === null) return 'snapback';
        else
            socket.emit('move', { move: move, board: game.fen(), room: roomId });

    };

    var onMouseoverSquare = function (square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square,
            verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };

    var onMouseoutSquare = function (square, piece) {
        removeGreySquares();
    };

    var onSnapEnd = function () {
        board.position(game.fen());
    };

    var montaFen = function (p1fen, p1castle, p2fen, p2castle, p2color){
        var gameFen;
        if (p2color == 'black'){
            // console.log('black-montagem');
            gameFen = inverteFen(p2fen) + recortaFen(p1fen) + finalizaFen(p1castle, p2castle);
            // console.log(gameFen);
        } else {
            gameFen = inverteFen(p1fen) + recortaFen(p2fen) + finalizaFen(p2castle, p1castle);
        }

        return gameFen;
    };

    var finalizaFen = function(wcastle, bcastle){
        // console.log('w-'+wcastle + '#b-'+ bcastle);
        var fen = ' w ';

        if (wcastle === ''){
            if (bcastle === ''){
                fen = fen + '-';
            };
        };

        if (wcastle != ''){
            fen = fen + wcastle;
        };

        if (bcastle != ''){
            fen = fen + bcastle.toLowerCase();
        };

        fen = fen + ' - 0 1';
        return fen;
    };

    var recortaFen = function (fen) {
        // console.log('rec_INI = '+ fen);
        var splited = String(fen).split('/');
        fen = splited[4]+'/'+splited[5]+'/'+splited[6]+'/'+splited[7];
        // console.log('rec_fim = '+ fen);
        return fen;
    };

    var inverteFen = function (fen) {
        // console.log('inv = '+ fen);
        var splited = String(fen).split('/');
        fen = splited[7]+'/'+splited[6]+'/'+splited[5]+'/'+splited[4]+'/';
        fen = fen.toLowerCase();
        // console.log('inv_fim = '+ fen);
        return fen;
    };
    
    const connect = () => {
        console.log("clicou no botao");
        roomId = document.getElementById("room").value;
        if (roomId !== "" && parseInt(roomId) <= 100) {
            document.getElementById("room").remove();
            document.getElementById("roomnumbers").innerHTML = "Room Number " + roomId;
            document.getElementById("buttonplay").remove();
            socket.emit('joined', roomId);
        }
    }

  return (
      <div className="App">
      <nav className="navbar navbar-expand-md bg-dark navbar-dark sticky-top">
        <a className="navbar-brand" href="/">IndiviDUALITY Chess</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <a className="nav-link" onClick={showJogar} href="#">Jogar <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Page 1</a>
            </li>
          </ul>

          <ul className="nav navbar-nav ml-auto">
          {isLoggedIn &&
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img src={imageUrl} className="w-25 rounded-circle" />
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" onClick={showBoard} href="#">My board</a>
                <a className="dropdown-item" onClick={showPackage} href="#">Create Package</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" onClick={logOut} href="#">Logout</a>
              </div>
            </li>
            }
          </ul>
        </div>
      </nav>



      <div className= "main" >
        <header className="App-header">
          {!isLoggedIn &&
            <div id="google-signin"></div>
          }
          {isLoggedIn &&
            <div className="containerjogar" style={{display : 'none'}}>
            <div id="boardJogo" style={{width: '500px', margin: 'auto'}}></div>
            <div style={{margin: 'auto'}}>
              <div id="player"></div>
              <div id="roomnumbers">Enter a room number between 0 and 99</div>
              <form>
                <div className="row">
                  <div className="col">
                    <input type="number" id="room" min="0" max="99" 
                  className="form-control form-control-md number"></input>
                  </div>
                  <div className="col">
                    <button id="buttonplay" className="btn btn-success" onClick={connect}>Connect</button>
                  </div>
                </div>
              </form>
              <div id="stateroom">Join Game</div>
            </div>
            </div>
          }
          <div className="myBoard" style={{display : 'none'}}>
            <div id="board" style={{width : '400px'}} ></div>  
            <div style={{width : '400px'}}>  
              <button id="savePos" onClick={window.clickSavePositionBtn} >Save Position</button>
              <button id="clrBoard" onClick={window.clickClearBoard} >Clear Board</button> 
            </div>
            <div style={{width : '400px'}}>
              <p id="errorMessage"></p>
              <img id="protectedImage" src={imgProtected}></img>
            </div>
          </div>

          <div className="package" style={{display : 'none'}}>
            <h2>Choose your initial army package</h2>
            <button id="btnPeople" onClick={window.clickPeople}>People</button>
            <button id="btnReligion" onClick={window.clickReligion}>Religion</button>
            <button id="btnChivalry" onClick={window.clickChivalry}>Chivalry</button>
            <button id="btnCastle"   onClick={window.clickCastle}>Castle</button>

            <p></p>

            <h3>Expand your army</h3>
            <button id="btnRandom" onClick={window.clickRandom}><img src="/img/random.png"></img></button>
            <p id="newPiece"></p>

            <p></p>

            <button id="btnInit" onClick={window.init}>Init</button>
          </div>
        </header>

        
      </div>        
      </div>
  );
}


export default App;