var React = require('react');
var LinkItem = require('./linkItem');
var Firebase = require('firebase');
var rootUrl = 'https://tastemkr.firebaseio.com/';
var savantArray = [];


module.exports = React.createClass({
  getSavantTracks: function(){
    var myThis = this
    savantArray = [];
    var ref = new Firebase(rootUrl);
    var query = ref.child('savantitems').limitToLast(15);
    query.on('value', function(snapshot){
      savantArray.push(snapshot.val())
      console.log(savantArray)
    })
  },
  renderSavants: function(){
    this.getSavantTracks()
    var children = [];

    for(var key in savantArray[0]){
      var keyNum = key
      var item = savantArray[0][key];
      console.log(item)
      console.log('this is key for savantArray', key)
      children.push(
        <LinkItem
          item = {item}
          songTitle = {savantArray[0][key].songTitle}
          artist = {savantArray[0][key].artist}
          trackId = {savantArray[0][key].trackId}
          upVotes = {savantArray[0][key].upVotes}
          postedBy = {savantArray[0][key].postedBy.username}
          userId = {savantArray[0][key].postedBy.userId}
          score = {savantArray[0][key].score}
          timestamp = {savantArray[0][key].timestamp}
          genre = {savantArray[0][key].genre}
          key = {key}
          keyNum = {keyNum}
          link = {savantArray[0][key].link}
          feedState = {this.props.feedState}
          handleUpVote = {this.props.handleUpVote}
          handlePlayClick = {this.props.handlePlayClick}
          notLoggedInUpvoteFailNotification = {this.props.notLoggedInUpvoteFailNotification}
          alreadyUpvotedFailNotification = {this.props.alreadyUpvotedFailNotification}
          savantAlreadyPostedNotification = {this.props.savantAlreadyPostedNotification}>
        </LinkItem>
      )
      children.sort(function(a, b){
        return b.props.upVotes - a.props.upVotes
      })
    }
    console.log(children)
    return children

  },
  render: function(){
    return <div className = "entireList">
      <h3 className="dateName col-md-4 col-sm-4 col-xs-4">Savant Shit</h3>
      <br></br>
      <br></br>
      <br></br>
      {this.renderSavants()}
    </div>
  }
})
