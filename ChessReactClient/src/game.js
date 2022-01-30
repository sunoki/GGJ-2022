game = new Chess();
var socket = io();

var color = "white";
var players;
var roomId;
var play = true;

var room = document.getElementById("room")
var roomNumber = document.getElementById("roomNumbers")
var button = document.getElementById("button")
var state = document.getElementById('state')
var setup = document.getElementById('setup')

var p1fen;
var p1castle;

var board;

var connect = function(){
    roomId = room.value;
    if (roomId !== "" && parseInt(roomId) <= 100) {
        room.remove();
        roomNumber.innerHTML = "Room Number " + roomId;
        button.remove();
        socket.emit('joined', roomId);
        setup.style.visibility = 'visible';
    }
}


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
        state.innerHTML = 'GAME OVER';
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


socket.on('full', function (msg) {
    if(roomId == msg)
        window.location.assign(window.location.href+ 'full.html');
});

socket.on('play', function (msg) {
    if (msg == roomId) {
        play = false;
        state.innerHTML = "Game in progress"
    }
    // console.log(msg)
});

socket.on('move', function (msg) {
    if (msg.room == roomId) {
        game.move(msg.move);
        board.position(game.fen());
        console.log("moved")
    }
});

socket.on('firstMove', function (msg){
    // console.log(msg);
    // console.log(p1fen +' ! '+ p1castle +' ! '+ msg.fen +' ! '+ msg.castle +' ! '+ msg.color);
    if (msg.roomNum == roomId){
        startFen = montaFen(p1fen, p1castle, msg.fen, msg.castle, msg.color);
        console.log(startFen);
        game.load(startFen);
        board.position(game.fen());
        console.log(roomId + '+++' + startFen);
        socket.emit('startFen', {  roomId , startFen })
    };
});

socket.on('startFen', function (msg){
    console.log('start = ' + msg.roomId);
    if (msg.roomId == roomId){
        var fen = msg.startFen;
        game.load(fen);
        board.position(game.fen());
    };
});

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
        state.innerHTML = "Game in Progress";
        play = false;
        socket.emit('play', msg.roomId);
    } else {
        state.innerHTML = "Waiting for Second player";
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
    board = ChessBoard('board', cfg);
});
// console.log(color)

