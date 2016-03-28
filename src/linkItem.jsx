var React = require('react');
var Iframe = require('./iframe');
var Firebase = require('firebase');
var rootUrl = 'https://tastemkr.firebaseio.com/';

module.exports = React.createClass({
  getInitialState: function() {
    return {
      userUpvoted: false,
      userScore: Number,
      feedState: this.props.feedState,
    }
  },
  componentWillMount: function() {
    if(this.state.feedState === 'savant'){
      this.fb = new Firebase(rootUrl + 'savantitems/' + this.props.keyNum)
    } else{
    this.fb = new Firebase(rootUrl + 'items/' + this.props.keyNum)
    }
  },
  componentDidMount: function() {
    var ref = new Firebase(rootUrl);
    if(this.props.userId !== undefined){
      ref.child('users').child(this.props.userId).child('scores').child('score').once('value', function(snapshot){
        this.setState({userScore: snapshot.val()})
      }.bind(this))
    }
  },
  handleUpVoteCallback: function(){
    console.log("this is keynum" + this.props.keyNum)
    if(this.state.feedState === 'savant'){
      console.log('savant upvote')
      this.handleUpVote(this.props.item, 'savantitems')
    } else {
      this.handleUpVote(this.props.item, 'items')
    }

  },
  handlePlayClickCallback: function(){

    this.props.handlePlayClick(this.props.item)
  },
  handleUpVote: function(item, dir){
    var ref = new Firebase(rootUrl);
    var authData = ref.getAuth();
    console.log('this is item', item)
    if(authData){
      var userKey = authData.uid;
      console.log('this is userKey ' + userKey)
      console.log(this.props.keyNum)
      var stateCopy = Object.assign({}, item);
      ref.child(dir).child(this.props.keyNum).child('upVotedBy').once('value', function(snapshot){
        console.log('this is snapshot', snapshot.val())
        snapshot.forEach(function(childSnapshot){
          console.log('this is snapshot.key ' + childSnapshot.val().upVotedBy);
          if(childSnapshot.key() === userKey){
            this.setState({userUpvoted: childSnapshot.key()})
            console.log('u already liked this')
            this.props.alreadyUpvotedFailNotification();
          }
        }.bind(this))
      }.bind(this)).then(function(){
        if(this.state.userUpvoted === false){
          var userKey = authData.uid;
          console.log('okay u can like this')
          console.log(stateCopy)
          stateCopy.upVotes +=1;
          this.fb.update(stateCopy);
          var newObj = Object.assign({}, this.fb.upVotedBy);
          newObj[authData.uid] = true;
          console.log(newObj)
          this.fb.child('upVotedBy').update(newObj)
          console.log(stateCopy.upVotedBy)
          this.setState({userUpvoted: true})
          if(this.state.feedState !== 'savant'){
            console.log('okay going to update user posted', stateCopy.postedBy.userId, stateCopy.trackId)
            this.updateUserPostedUpvoted(stateCopy.postedBy.userId, stateCopy.trackId)
          }
        }
      }.bind(this))
    } else {
      this.props.notLoggedInUpvoteFailNotification()
      console.log('must be logged in to upvote')
    }
  },
  updateUserPostedUpvoted: function(userId, trackId){
    var trackKey = String;
    var score = 0;
    var ref = new Firebase(rootUrl);
    ref.child('users').child(userId).child('posts').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          if(childSnapshot.val().trackId === trackId){
            trackKey = childSnapshot.key()
                console.log(trackKey + ' ' + userId)
          }
          score += childSnapshot.val().upVotes
        })
        score + 1;
      }.bind(this)).then(function(){
        ref.child('users').child(userId).child('posts').child(trackKey).child('upVotes').transaction(function(currentUpVotes){
          console.log('this is upvotes in transation' + currentUpVotes)
          return currentUpVotes+1
        }).then(function(){
          ref.child('users').child(userId).child('scores').child('score').transaction(function(currentScore){
            return currentScore +1
          })
        })
    }.bind(this))
    this.componentDidMount()
  },
  render: function() {
    if(this.props.feedState == 'savant'){
      var savantOrNot = <p>Savant: {this.props.postedBy}</p>
    }
    else if(this.props.feedState == 'userFeed' || this.props.feedState == 'top10'){
      var savantOrNot = <p>{this.props.postedBy}: {this.state.userScore} <img className="fireEmojiScore" src="/images/fireemoji.png" /></p>
    }
      return <div className ="col-md-10 col-md-offset-1">
        <div className = "trackGroup">
          <div className="artistName">
            <p>{this.props.artist}</p>
          </div>
          <div className="songTitleDiv">
            <div className="songTitle">
              <p onClick={this.handlePlayClickCallback}>{this.props.songTitle}</p>
            </div>
          </div>

          <div className="postedBy">
            {savantOrNot}
          </div>
          <div className="upVotes">
            <span>{this.props.upVotes}</span>
          </div>
          <div className="upVoteButton">
            <img onClick={this.handleUpVoteCallback} className="upVote img-responsive" src="/images/fireemoji.png" />
          </div>
          <div className="genre">
            <p>genre: {this.props.genre}</p>
          </div>
        </div>
      </div>
  },
})
