import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { loadGoogleScript } from './lib/GoogleLogin';
import imgProtected from './protected.gif'

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

  const showBoard = () => {

     myBoard.style.visibility = 'visible';
     packagePiece.style.visibility = 'hidden';
     window.initBoard();
  };

  const showPackage = () => {

     packagePiece.style.visibility = 'visible';
     myBoard.style.visibility = 'hidden';
     //window.initBoard();
     window.init();
  };
  
  
  return (
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
                <a class="dropdown-item" onClick={showBoard} href="#">My board</a>
                <a class="dropdown-item" onClick={showPackage} href="#">Create Package</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" onClick={logOut} href="#">Logout</a>
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

          <div className="myBoard" style={{visibility : 'hidden'}}>
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

          <div className="package" style={{visibility : 'hidden'}}>
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