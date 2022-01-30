import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import Chess from "chess.js"
import $ from 'jquery'; 

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
                var fen = msg.fen;
                var castle = msg.castle;

                socket.emit('firstMove', { roomNum, fen , castle , color });
                document.getElementById('stateroom').innerHTML = "Game in Progress";
                play = false;
                socket.emit('play', msg.roomId);
            } else {
                document.getElementById('stateroom').innerHTML = "Waiting for Second player";
            }

            p1fen = msg.fen;
            p1castle = msg.castle;

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
            board = window.ChessBoard('board', cfg);
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
      <div className="containerjogar">
        <div id="board" style={{width: '500px', margin: 'auto'}}></div>
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
         );
};

// console.log(color)

export default App;