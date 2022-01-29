import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { loadGoogleScript } from './lib/GoogleLogin';
const googleClientId = "576773905852-tkb6qe5nev0b4t3dted10g3qo21fjq92.apps.googleusercontent.com";

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
  };
  
  const onFailure = () => {
    setIsLoggedIn(false);
  }
  
  const logOut = () => {
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
  
  
  return (



    <div className="App">
    <nav class="navbar navbar-expand-md bg-dark navbar-dark sticky-top">
      <a class="navbar-brand" href="#">IndiviDUALITY Chess</a>
      <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navb" aria-expanded="true">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navb" class="navbar-collapse collapse hide">
        <ul class="navbar-nav">
          <li class="nav-item active">
            <a class="nav-link" href="#">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Page 1</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Page 2</a>
          </li>
        </ul>

        <ul class="nav navbar-nav ml-auto">
          {!isLoggedIn &&
          <li class="nav-item"><a class="nav-link" href="#"><span class="fas fa-user"></span> Login </a></li>
          }
          {isLoggedIn &&
            <li class="nav-item" onClick={logOut}>
              <a class="nav-link" href="#">
                <span class="fas fa-sign-in-alt"></span> 
                  Logout 
              </a>
            </li>
          }
        </ul>
      </div>
    </nav>

      <header className="App-header">
        {!isLoggedIn &&
          <div id="google-signin"></div>
        }
        
        
          <div>
            <div>
              <img src={imageUrl} />
            </div>
            <div>{name}</div>
            <div>{email}</div>
          
          </div>
        
      </header>
    </div>
  );
}

export default App;