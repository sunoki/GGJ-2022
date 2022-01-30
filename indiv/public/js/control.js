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
var piecesAvailable = null

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
   console.log(piecesAvailable)
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

function countPieces(pos, piece) {
  var endBoard = pos

  console.log(endBoard)

  //if (piece == "K") {
  //  var count = 0
  //  var re = new RegExp(piece,"g");
  //  count = (endBoard.match(re) || []).length;
  //  piecesAvailable[0] = piecesQntd[0] - count
  //  console.log(count)
  //  console.log(piecesAvailable[0])
  //  console.log(piecesQntd[0])
  //}

  if (piece == "K") 
    piecesAvailable[0] += pos

if (piece == "Q") 
    piecesAvailable[1] += pos
if (piece == "R") 
    piecesAvailable[2] += pos
if (piece == "B") 
    piecesAvailable[3] += pos
if (piece == "N") 
    piecesAvailable[4] += pos
if (piece == "P") 
    piecesAvailable[5] += pos


}

//Player has dragged and now is dropping the piece on board.
//Player can only drop on the bottom half, and the king only on the 2 first ranks
function onDrop (source, target, piece, newPos, oldPos) {
  // we should put pieces only in our half of the board
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
    
    if (boardMatrix[rank-1][file] != 0) {
      countPieces(1, boardMatrix[rank-1][file])
    }
    boardMatrix[rank-1][file] = droppedPiece

  }

  if (source == "spare" & target != "offboard")
    countPieces(-1, piece.substring(1))

  if (source != "spare" & target == "offboard")
    countPieces(1, piece.substring(1))
  
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
    return false
  }

  if (kingFile <= 3) {
    if (boardMatrix[kingRank+1][kingFile+1] == 0 & boardMatrix[kingRank+2][kingFile+2] == 0 & boardMatrix[kingRank+3][kingFile+3] == 0) {
      return false    
    }
  }

  if (kingFile >= 4) {
    if (boardMatrix[kingRank+1][kingFile-1] == 0 & boardMatrix[kingRank+2][kingFile-2] == 0 & boardMatrix[kingRank+3][kingFile-3] == 0) {
      return false
    }    
  }

  return true
}



function clickSavePositionBtn () {
  //Before we save it, let's make sure we have a king on our board
  var endBoard = generateFEN()
  var king = "K"

  //This needs to become a message on the page, not on the console
  if (endBoard.indexOf(king) !== -1) {
    console.log(endBoard)
  }
  else {
    document.getElementById("errorMessage").innerHTML = "Missing King"
    return
  }

  if (checkKingProtected()) {
    document.getElementById("errorMessage").innerHTML = "Saved Successfully. Your FEN is: " + endBoard;
    
    console.log(localStorage.getItem('@IndiviDUALITY/FEN'))
    console.log(localStorage.getItem('@IndiviDUALITY/Castle'))
    
    document. getElementById("protectedImage"). style. visibility = "hidden"
  } else {
    document.getElementById("errorMessage").innerHTML = "Your King is unprotected. A king is protected when he cannot be checked on the initial oposition by enemies forces. See examples below:"
    document. getElementById("protectedImage"). style. visibility = "visible"
    return
  }
}

function generateFEN() {
  var endBoard = board.fen()
  localStorage.setItem('@IndiviDUALITY/FEN', endBoard)
  endBoard += " w "

  var castle = ""
  //We can only Castle if King is in e1
  if (boardMatrix[0][4] == "K") {
    //If rookie is on File h, we can castle small
    if (boardMatrix[0][7] == "R") {
      castle += "K"  
    }
    //If rookie is on File a, we can castle big
    if (boardMatrix[0][0] == "R") {
      castle += "Q"
    }
  }

  endBoard += castle

  localStorage.setItem('@IndiviDUALITY/Castle', castle)

  return endBoard

}

function initBoard () {
   var config = {
      draggable: true,
      sparePieces: 'white',
      dropOffBoard: 'trash',
      onDragStart: onDragStart,
      onDrop: onDrop
    }

    console.log("initBoard")
    var piecesQntdStr = localStorage.getItem('@IndiviDUALITY/piecesQntd');
    piecesAvailable= piecesQntdStr.split(",").map(Number)
    if( board == null) {
      board = Chessboard('board', config)      
    }

    boardMatrix = [[0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0]]

    document.getElementById("errorMessage").innerHTML = ""
    document. getElementById("protectedImage"). style. visibility = "hidden"
    board.piecesAmount(piecesAvailable)
}

function clickClearBoard () {
  board.clear(false)

  boardMatrix = [[0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0]]

  var piecesQntdStr = localStorage.getItem('@IndiviDUALITY/piecesQntd');
  piecesAvailable= piecesQntdStr.split(",").map(Number)
  board.piecesAmount(piecesAvailable)

  document.getElementById("errorMessage").innerHTML = ""
  document. getElementById("protectedImage"). style. visibility = "hidden"

}
 
