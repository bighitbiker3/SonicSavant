var React = require('react');
var LinkItem = require('./linkItem');
var Firebase = require('firebase');
var rootUrl = 'https://tastemkr.firebaseio.com/';
var top10Array = [];

module.exports = React.createClass({
  getTop10: function(){
    top10Array = [];
    var ref = new Firebase(rootUrl);
    var query = ref.child('items').orderByChild('upVotes').limitToLast(10);
    query.on('value', function(snapshot){
      top10Array.push(snapshot.val())
    })
  },
  renderTop10: function(){
    this.getTop10();
    console.log(top10Array)
    var children = [];

    for(var key in top10Array[0]){
      var keyNum = key
      var item = top10Array[0][key];
      console.log('this is key for top 10', key)
      children.push(
        <LinkItem
          item = {item}
          songTitle = {top10Array[0][key].songTitle}
          artist = {top10Array[0][key].artist}
          trackId = {top10Array[0][key].trackId}
          upVotes = {top10Array[0][key].upVotes}
          postedBy = {top10Array[0][key].postedBy.username}
          userId = {top10Array[0][key].postedBy.userId}
          score = {top10Array[0][key].score}
          timestamp = {top10Array[0][key].timestamp}
          genre = {top10Array[0][key].genre}
          key = {key}
          keyNum = {keyNum}
          link = {top10Array[0][key].links}
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
      <h3 className="dateName col-md-4 col-sm-4 col-xs-4">Damn Daniel (Top10)</h3>
      <br></br>
      <br></br>
      <br></br>
      {this.renderTop10()}
    </div>
  }
})
