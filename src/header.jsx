var React = require('react');
var ReactFire = require('reactfire');
var Firebase = require('firebase');
var rootUrl = 'https://tastemkr.firebaseio.com/';
var top10 = 'top10'


module.exports = React.createClass({
  getInitialState: function(){
    return {
      emailText: '',
      passwordText: '',
      usernameText: '',
      usernameTaken: false,
      userLoggedIn: false,
      username: '',
      score: 0,
    }
  },
  componentWillMount: function(){
    this.updateUserInfo();
  },
  componentDidMount: function(){
    $('.login').hide();
    $('.register').hide();
  },
  handleEmailInput: function(e){
    this.setState({emailText: e.target.value})
  },
  handleUsernameInput: function(e){
    this.setState({usernameText: e.target.value})
  },
  handlePasswordInput: function(e){
    this.setState({passwordText: e.target.value})
  },
  handleRegister: function() {
    var usernameText = this.state.usernameText;
    var emailText = this.state.emailText;
    var passwordText = this.state.passwordText
    var ref = new Firebase(rootUrl);
      console.log('creating user now')
      ref.createUser({
        email: emailText,
        password: passwordText
      }, function(error, userData) {
        if(error){
          this.props.registerFailNotification();
          console.log('error creating user: ' + error)
          $('#registerLoader').addClass('hide');
        } else {
          ref.child("users").child(userData.uid).set({
            username: usernameText,
            email: emailText,
            posts: {},
            scores: {
              score: 0
            }
          });
          console.log('successfully create user: ' + userData.uid);
          ref.authWithPassword({
            email: emailText,
            password: passwordText
          }, function(error, authData){
            if(error){
              console.log('error with login: ' + error);
            } else{
              $('#registerLoader').addClass('hide');
              console.log('user logged in and authed' + authData);
              this.setState({userLoggedIn: true})
              this.updateUserInfo()
              this.props.loginNotification();
            }
          }.bind(this))
        }
      }.bind(this))

  },
  checkForUsername: function() {
    if(this.state.emailText === '' && this.state.passwordText === ''){
      $('.showLogin').show();
      $('.register').hide('slow');
      $('.showRegister').show()
    } else {
        $('#registerLoader').removeClass('hide');
        var usernameText = this.state.usernameText;
        var emailText = this.state.emailText;
        var passwordText = this.state.passwordText;
        var ref = new Firebase(rootUrl);
        this.setState({usernameTaken: false});
          ref.child('users').once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
              if (usernameText == childSnapshot.val().username){
                console.log('username taken!');
                this.setState({usernameTaken: true});
                this.props.usernameTakenNotification()
                $('#registerLoader').addClass('hide');
              } else {
                console.log('username free! lets create that user');
              }
            }.bind(this));
          }.bind(this)).then(function(){
            if(this.state.usernameTaken === false){
              this.handleRegister();
            }
          }.bind(this));
      }
  },
  showRegister: function() {
    $('.register').show('slow');
    $('.showRegister').hide();
    $('.showLogin').hide()
  },
  showLogin: function() {
    $('.showLogin').hide();
    $('.login').show('slow');
    $('.showRegister').hide()
  },
  handleLogin: function() {
    var emailFound = false;
    if(this.state.emailText === ''){
      $('.showLogin').show();
      $('.login').hide('slow');
      $('.showRegister').show()
    }
    var ref = new Firebase(rootUrl);
    $('#loginLoader').removeClass('hide');
    var emailoruw = this.state.emailText
    if(emailoruw.indexOf('@') > -1){
      ref.authWithPassword({
        email: this.state.emailText,
        password: this.state.passwordText
      }, function(error, authData){
        if(error){
          $('#loginLoader').addClass('hide');
          this.props.loginFailNotification();
          console.log('error with login: ' + error);
        } else{
          $('#loginLoader').addClass('hide');
          this.props.loginNotification();
          $('#registerLoader').addClass('hide');
          console.log('user logged in and authed' + authData);
          this.updateUserInfo()
        }
      }.bind(this))
    } else {
      console.log('searching for email')
      ref.child('users').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){

          if (emailoruw === childSnapshot.val().username){
            emailFound = true;
            emailText = childSnapshot.val().email
            console.log(emailText)
            ref.authWithPassword({
              email: emailText,
              password: this.state.passwordText
            }, function(error, authData){
              if(error){
                $('#loginLoader').addClass('hide');
                this.props.loginFailNotification();
                console.log('error with login: ' + error);
              } else{
                $('#loginLoader').addClass('hide');
                this.props.loginNotification();
                $('#registerLoader').addClass('hide');
                console.log('user logged in and authed' + authData);
                this.updateUserInfo()
              }
            }.bind(this))
          }
        }.bind(this))
      }.bind(this)).then(function(){
        console.log('search done')
        console.log(emailFound)
        if(!emailFound){
          console.log('email search done')
          $('#loginLoader').addClass('hide');
          $('.showLogin').show();
          $('.showRegister').show();
          $('.login').hide();
          $('.register').hide();
          this.props.loginFailNotification();
        }
      }.bind(this))
    }
  },
  updateUserInfo: function(){
    var ref = new Firebase(rootUrl);
    var authData = ref.getAuth();
    console.log(authData)
    if(authData){
      var key = authData.uid;
      console.log(key)

      ref.child('users').child(key).once('value', function(snapshot){
        this.setState({username: snapshot.val().username})
        this.setState({userLoggedIn: true})

      }.bind(this)).then(function(){
        ref.child('users').child(key).child('scores').once('value', function(snapshot){
          this.setState({score: snapshot.val().score})
        }.bind(this))
      }.bind(this))
      console.log('user is logged in fam')
    }
  },
  logOut: function() {
    var ref = new Firebase(rootUrl);
    ref.unauth();
    this.setState({userLoggedIn: false});
    this.props.logoutNotification();
    this.setState({username: ''});
    $('.showLogin').show();
    $('.showRegister').show();
    $('.login').hide();
    $('.register').hide();
    console.log(this.state.userLoggedIn)
  },
  dropDownToggle: function(){
    $('.dropdown-toggle').dropdown()
  },
  render: function(){
    return <div className="row headerDiv col-md-3">
      {/*Register Stuff*/}
    <div className="registerAndLoginDiv">
      <div className="registerDiv">
        <button onClick={this.showRegister}
          className={"showRegister btn btn-default "  + (this.state.userLoggedIn ? 'hide' : '')}>
          Register
        </button>
        <div className={"row register " + (this.state.userLoggedIn ? 'hide' : '')}>
          <input onChange={this.handleEmailInput} type="email" id="inputEmail" className="form-control" placeholder="Email address" required autofocus />
          <input onChange={this.handleUsernameInput} id="inputUsername" className="form-control" placeholder="Username" required autofocus />
          <input onChange={this.handlePasswordInput} type="password" id="inputPassword" className="form-control" placeholder="Password" required autofocus />
          <button onClick={this.checkForUsername} className="btn ">Register    <i id="registerLoader" className="fa fa-spinner fa-spin hide"></i></button>
        </div>
      </div>
      {/*Login Stuff*/}
      <div className="loginDiv">
        <button id="showLoginButton"
          onClick={this.showLogin}
          className={"showLogin btn btn-default " + (this.state.userLoggedIn ? 'hide' : '')}>
          Login
        </button>
        <div className={"row login "  + (this.state.userLoggedIn ? 'hide' : '')}>
          <input onChange={this.handleEmailInput} type="email" id="loginEmail" className="form-control" placeholder="Email address or Username" required autofocus />
          <input onChange={this.handlePasswordInput} type="password" id="loginPassword" className="form-control" placeholder="Password" required autofocus />
          <button onClick={this.handleLogin}className="btn ">Login    <i id="loginLoader" className="fa fa-spinner fa-spin hide"></i></button>
        </div>
      </div>

    <div className="savantButton">
      <button onClick={this.props.userFeedStateChange} className="btn btn-default">User Feed</button>
    </div>
    </div>

    {/*Hi User :)*/}
    <div className= {"dropdown hiUserDiv " + (this.state.userLoggedIn ? '' : 'hide')}>
      <button onClick={this.dropDownToggle} className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        <p className="hiUser">hi {this.state.username}.  <img className="fireEmojiScore" src="/images/fireemoji.png" />  {this.state.score} </p>

      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
        <li><a><p className="dropdownButton" id="toggleFeedButton" onClick={this.props.top10StateChange}>Damn, Daniel!</p></a></li>
        <li><a><p className="dropdownButton" id="toggleFeedButton" onClick={this.props.savantApplicationStateChange}>Become A Savant</p></a></li>
        <li><a><p className="dropdownButton" onClick={this.logOut}>Logout</p></a></li>
      </ul>
    </div>

    {/*End Render Return*/}
  </div>
  }
})
