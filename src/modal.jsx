var React = require('react');
var Iframe = require('./iframe');
var Firebase = require('firebase');
var rootUrl = 'https://tastemkr.firebaseio.com/';

module.exports = React.createClass({
  getInitialState: function() {
    return {
      userUpvoted: false,
    }
  },

  render: function() {

      return <div className = "col-md-12">
        <div className = "trackGroup">
          <div className="artistName">
            <p>{this.props.artist}</p>
          </div>
          <div className="songTitle">
            <p>{this.props.songTitle}</p>
          </div>
          <div className="postedBy">
            <p>Posted By: {this.props.postedBy}</p>
          </div>
          <div className="upVotesModal">
            <span>{this.props.upVotes}</span>
          </div>
          <div className="upVoteButton">
            <img onClick={this.handleUpVoteCallback} className="upVote img-responsive" src="/images/fireemoji.png" />
          </div>
          <div className="playButton">
            <i onClick={this.handlePlayClickCallbackModal} className="fa-2x fa fa-play"></i>
          </div>
        </div>
      </div>
  },
  handleUpVoteCallback: function(){
    console.log("this is keynum" + this.props.keyNum)
    this.handleUpVote(this.props.item)
  },
  handlePlayClickCallbackModal: function(){

    this.props.handlePlayClickModal()
  },
  handleUpVote: function(item){
    console.log(item)
    var ref = new Firebase(rootUrl);
    var authData = ref.getAuth();
    if(authData){
      var userKey = authData.uid;
      console.log('this is userKey ' + userKey)
      var stateCopy = Object.assign({}, item);
      ref.child('items').child(this.props.keyNum).child('upVotedBy').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          console.log('this is snapshot.key ' + childSnapshot.val().upVotedBy);
          if(childSnapshot.key() === userKey){
            this.setState({userUpvoted: childSnapshot.key()})
            console.log('u already liked this')
            this.props.alreadyUpvotedFailNotification();
          }
        }.bind(this))
      }.bind(this)).then(function(){
        var ref = new Firebase(rootUrl + 'items/' + this.props.keyNum)
        if(this.state.userUpvoted === false){
          var userKey = authData.uid;
          console.log('okay u can like this')
          console.log(stateCopy)
          stateCopy.upVotes +=1;
          ref.update(stateCopy);
          var newObj = Object.assign({}, fb.upVotedBy);
          newObj[authData.uid] = true;
          console.log('This is new Obj' + newObj)
          ref.child('upVotedBy').update(newObj)
          console.log(stateCopy.upVotedBy)
          var upVoted = this.props.upVotes += 1;
          this.props.updateDuplicateUpvote(upVoted)
        }
      }.bind(this))

    } else {
      this.props.notLoggedInUpvoteFailNotification()
      console.log('must be logged in to upvote')
    }


  },

})
