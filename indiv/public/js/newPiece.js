function init() {
	console.log("init")
	var playerPieces = localStorage.getItem('@IndiviDUALITY/piecesQntd');

	if (playerPieces != null) {
		console.log("dentro do if")
		disablePackageButtons()
	} else {
		document.getElementById("newPiece").innerHTML = playerPieces
	} 
}

function disablePackageButtons() {
	console.log("disablePackageButtons")
	document.getElementById("btnPeople").disabled = "true"
	document.getElementById("btnReligion").disabled = "true"
	document.getElementById("btnChivalry").disabled = "true"
	document.getElementById("btnCastle").disabled = "true"
}

function clickPeople() {
	var piecesQntd = [1,0,0,0,0,9]
    localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
	 disablePackageButtons()

	document.getElementById("newPiece").innerHTML = piecesQntd
}

function clickReligion() {
	var piecesQntd = [1,0,0,2,0,3]
    localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		disablePackageButtons()

	document.getElementById("newPiece").innerHTML = piecesQntd
}

function clickChivalry() {
	var piecesQntd = [1,0,0,0,2,3]
    localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
	disablePackageButtons()

	document.getElementById("newPiece").innerHTML = piecesQntd
}

function clickCastle() {
	var piecesQntd = [1,0,1,0,0,4]
    localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
	disablePackageButtons()

	document.getElementById("newPiece").innerHTML = piecesQntd
}

function clickRandom() {
	 

	 var playerPieces = localStorage.getItem('@IndiviDUALITY/piecesQntd');
	 var piecesAvailable = null
	 var piecesQntd = null
	 
	 var piece = null
	 var result = generateRandomIntegerInRange(1, 1000);

	 if (result <= 5) {
	 	piece = "Queen"
	
		if (playerPieces == null) {
			piecesQntd = [1,1,0,0,0,0]
    		localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		} else {
			piecesQntd = playerPieces.split(",").map(Number)
			piecesQntd[1]++
			localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		}
	 }
	 if (result > 5 & result <= 50) {
	 	piece = "Rook"
	 	if (playerPieces == null) {
			piecesQntd = [1,0,1,0,0,0]
    		localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		} else {
			piecesQntd = playerPieces.split(",").map(Number)
			piecesQntd[2]++
			localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		}
	 }
	 if (result > 50 & result <= 275) {
	 	piece = "Bishop"
	 	if (playerPieces == null) {
			piecesQntd = [1,0,0,1,0,0]
    		localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		} else {
			piecesQntd = playerPieces.split(",").map(Number)
			piecesQntd[3]++
			localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		}
	 }

	 if (result > 275 & result <= 500) {
	 	piece = "Knight"
	 	if (playerPieces == null) {
			piecesQntd = [1,0,0,0,1,0]
    		localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		} else {
			piecesQntd = playerPieces.split(",").map(Number)
			piecesQntd[4]++
			localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		}
	 }

	 if (result > 500) {
	 	piece = "Pawn"
	 	if (playerPieces == null) {
			piecesQntd = [1,0,0,0,0,1]
    		localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		} else {
			piecesQntd = playerPieces.split(",").map(Number)
			piecesQntd[5]++
			localStorage.setItem('@IndiviDUALITY/piecesQntd', piecesQntd);
		}
	 }
	 disablePackageButtons()
	 document.getElementById("newPiece").innerHTML = "You get a " + piece + " - " + piecesQntd
}

 function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }