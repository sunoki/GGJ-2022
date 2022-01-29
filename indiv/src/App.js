import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { loadGoogleScript } from './lib/GoogleLogin';

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
    <div>
      <h2>myBoard</h2>
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