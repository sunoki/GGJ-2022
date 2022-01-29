const clientId = '576773905852-tkb6qe5nev0b4t3dted10g3qo21fjq92.apps.googleusercontent.com'

const responseGoogle = (response) => {
  console.log(response);
}

ReactDOM.render(
  <GoogleLogin
    clientId={clientId}
    buttonText="Login"
    onSuccess={responseGoogle}
    onFailure={responseGoogle}
    cookiePolicy={'single_host_origin'}
  />,
  document.getElementById('googleButton')
);