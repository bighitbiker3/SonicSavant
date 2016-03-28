var React = require('react');
var Firebase = require('firebase');
var rootUrl = 'https://tastemkr.firebaseio.com/';
var counterFollowers = Number;
var dataObject = {};
var moment = require('moment-timezone');
module.exports = React.createClass({
  getInitialState: function() {
    return {
      text: '',
      artist: '',
      songTitle: '',
      followers: Number,
      searching: false,
    }
  },
  handleTextInput: function(event){
    this.setState({text: event.target.value})

  },
  counterFunction: function(dataObject){
    var myThis = this;
    $({Counter: 0}).animate({Counter: counterFollowers}, {
                 duration: 2300,
                 easing:'linear',
                 step: function() {
                  myThis.setState({followers: Math.floor(this.Counter)})
                 },
                 complete: function() {
                   myThis.setState({followers: counterFollowers})
                  if(counterFollowers < 12000) {
                      myThis.props.dataStore.push(dataObject);
                      myThis.handleSubmitClick();
                      myThis.props.userFeedStateChange();
                  } else {
                    myThis.props.tooManyFollowersNotification()
                    myThis.setState({searching: false})
                    setTimeout(function(){
                      $('.processingSong').fadeOut(2000);
                    }, 3000)
                    }
                 }
             });
  },
  checkForDuplicateAndLimit: function(trackId, dataObject, userId){
    var result = true;
    var array = [];
    var key = String;
    var objOfDup = Object;
    var ref = new Firebase(rootUrl);
    var date = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');
    ref.child('items').once('value', function snap(snapshot){
      snapshot.forEach(function childSnap(childSnapshot){
        if(childSnapshot.val().postedOn === date){
          array.push(childSnapshot.val().songTitle);
        }
        if(childSnapshot.val().trackId === trackId){
          key = childSnapshot.key();
          objOfDup = childSnapshot.val();
          this.props.showDuplicate(objOfDup, key);
          this.setState({searching: false})
          result = false;
        }
      }.bind(this))
    }.bind(this)).then(function(){
      ref.child('savantitems').once('value', function snap(snapshot){
        snapshot.forEach(function childSnap(childSnapshot){
          if(childSnapshot.val().trackId === trackId){
            key = childSnapshot.key();
            objOfDup = childSnapshot.val();
            this.props.showDuplicate(objOfDup, key);
            this.setState({searching: false})
            result = 'savant';
          }
        }.bind(this))
      }.bind(this))
    }.bind(this)).then(function(){
      if(result === false) {
        console.log(result)
        this.props.alreadyPostedNotification();
      }
      else if(result === 'savant'){
        console.log(result)
        this.props.savantAlreadyPostedNotification();
      }
      else if(result){
        if(array.length == 15){
          result = false;
          this.props.hitLimitForDayNotification()
          this.setState({searching: false})
        } else {
          this.checkSoundcloudTrackInfo(dataObject, userId)
        }
      }
    }.bind(this))
  },
  checkSoundcloudTrackInfo: function(dataObject, userId){

    var ref = new Firebase(rootUrl);
    var authData = ref.getAuth();
    var clientId = '033e31e2d036e02f39242e1aa1dd2fa9';
    ref.child('users').child(authData.uid).once('value', function(snapshot){
      user = snapshot.val().username;
      score = snapshot.val().scores.score;
      dataObject.postedBy.username = user;
      dataObject.postedBy.userId = authData.uid;
      dataObject.score = score;
    }.bind(this)).then(function(){
      var userUrl = 'https://api.soundcloud.com/users/' + userId + '?client_id=' + clientId
      $.get(userUrl, function(data) {
        counterFollowers = data.followers_count;
        $('.processingSong').fadeIn();
        this.counterFunction(dataObject);
      }.bind(this)).fail(function(){console.log('ajax error on user')});
    }.bind(this));
  },
  checkSoundcloudUser: function(link){
    this.setState({searching: true})
    var ref = new Firebase(rootUrl);
    var authData = ref.getAuth();
    var trackId = 0;
    var songTitle = '';
    var artist = '';
    var upVotes = 0;
    var user = '';
    var userId = 0;
    var score = 0;
    var genre = ''
    if(authData){
      console.log('ajax callin')
      var clientId = '033e31e2d036e02f39242e1aa1dd2fa9';
      var resolve = 'https://api.soundcloud.com/resolve?url=';
      $.get(resolve + this.state.text + '&client_id=' + clientId, function(data) {
        this.setState({artist: data.user.username});
        this.setState({songTitle: data.title});
        var year = moment().tz("America/Los_Angeles").format('YYYY');
        var month = moment().tz("America/Los_Angeles").format('MM');
        var day = moment().tz("America/Los_Angeles").format('DD');
        var timestampDate = new Date(year, month, day).getTime();
        var datenow = Date.now()
        var timestamp = moment.tz(datenow, "America/Los_Angeles")._i
        var date = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');
        dataObject = {
            links: this.state.text,
            trackId: data.id,
            songTitle: data.title,
            artist: data.user.username,
            genre: data.genre,
            upVotes: 0,
            upVotedBy: {},
            postedBy: {},
            scores: score,
            postedOn: date,
            timestampDate: timestampDate,
            timestamp: timestamp
        }
        trackId = data.id;
        console.log(dataObject)
        userId = data.user.id
      }.bind(this)).fail(function(){
        console.log('ajax error on resolve')
        this.setState({searching: false})
      }).success(function(){

        this.checkForDuplicateAndLimit(trackId, dataObject, userId);
      }.bind(this));
    } else {
      this.props.submissionFailNotification();
      this.setState({searching: false})
      console.log('please log in to post');
    }
  },
  handleSubmitClick: function() {
    this.setState({searching: false})
    console.log('handleSubmitClick going')
      setTimeout(function(){
        $('.processingSong').fadeOut('slow');
      }, 3000)
      var dataStore = this.props.dataStore;
      setTimeout(function(){
        this.setState({text: ''});
        this.setState({artist: ''});
        this.setState({songTitle: ''});
        this.setState({followers: Number});
      }.bind(this), 4000);
      this.props.handleListSubmitClick(dataStore, dataObject)

  },
  render: function() {
    return <div className="submission col-md-6">
        <div className="">
          <div className="input-group">
            <input
              onChange = {this.handleTextInput}
              type="text"
              className="form-control"
              placeholder="Put Soundcloud Link Here - Max 12K Followers"
              value={this.state.text} />
            <span className="input-group-btn">
              <button
                onClick={this.checkSoundcloudUser}
                className="btn "
                type="button">Submit!    <i id="submitSpinner" className={"fa fa-spinner fa-spin " + (this.state.searching ? '' : 'hide')}></i>
              </button>
            </span>
            <div>
              <p className="processingSong">Number of Followers for {this.state.artist}: {this.state.followers}</p>
            </div>
          </div>
        </div>
    </div>
  }


});
