var React = require('react');
var LinkItem = require('./linkItem');
var moment = require('moment-timezone');
var showMorePostsArray = [];

module.exports = React.createClass({
  getInitialState: function(){
    return {
      showingMorePosts: false,
      sections: 2,
      propOfArray: 0,
    }
  },
  changeShowingMoreState: function(){
    var stateSections = this.state.sections + 1;
    var propOfArrayInc = this.state.propOfArray + 1
    console.log('this is state sections ' + stateSections)
    this.setState({sections: stateSections})
    this.setState({propOfArray: propOfArrayInc})
    this.setState({showingMorePosts: true});
  },
  loadMorePosts: function(prop){
    var year = moment().tz("America/Los_Angeles").format('YYYY');
    var month = moment().tz("America/Los_Angeles").format('MM');
    var day = moment().tz("America/Los_Angeles").format('DD');
    var dateStr = year + '-' + month + '-' + day
    dateStr.toString()
    var dayMS = 86400000;
    var date = moment.tz(dateStr, "America/Los_Angeles")
    var eod = date + dayMS;
    console.log(date - dayMS)
    var showMorePostsCode = <div><br></br><h3 className="dateName col-md-4">the day before that</h3><br></br><br></br><br></br>{this.renderList(date - (this.state.sections * dayMS), eod - (this.state.sections * dayMS))}</div>
    showMorePostsArray.push(showMorePostsCode)
    return showMorePostsArray;
  },
  render: function() {
    var year = moment().tz("America/Los_Angeles").format('YYYY');
    var month = moment().tz("America/Los_Angeles").format('MM');
    var day = moment().tz("America/Los_Angeles").format('DD');
    var dateStr = year + '-' + month + '-' + day;
    dateStr.toString();
    var dayMS = 86400000;
    var date = moment.tz(dateStr, "America/Los_Angeles")
    var eod = date + dayMS;
    var showMorePosts = this.state.showingMorePosts ? this.loadMorePosts() : null

    return <div className="entireList">
      <h3 className="dateName col-md-4 col-sm-4 col-xs-4">today</h3>
      <br></br>
      <br></br>
      <br></br>
      {this.renderList(date, eod)}
      <br></br>
      <h3 className="dateName col-md-4">yesterday</h3>
        <br></br>
        <br></br>
        <br></br>
      {this.renderList(date - dayMS, eod - dayMS)}
      <br></br>
      <h3 className="dateName col-md-4">the day before that</h3>
        <br></br>
        <br></br>
        <br></br>
      {this.renderList(date - (2 * dayMS), eod - (2 * dayMS))}
      {showMorePosts}
      <p className="loadMorePosts" onClick={this.changeShowingMoreState}>load more posts</p>
    </div>
  },
  renderList: function(date, eod) {
    console.log('rendering list fam')
    var children = [];
    for(var key in this.props.items){
      var item = this.props.items[key];
      item.key = key;
      var keyNum = key
      var userId = this.props.items[key].postedBy.userId;
      console.log('this is normal item', item.key)
      if(this.props.items[key].timestamp >= date && this.props.items[key].timestamp < eod){
          children.push(
            <LinkItem
              item = {item}
              songTitle = {this.props.items[key].songTitle}
              artist = {this.props.items[key].artist}
              genre = {this.props.items[key].genre}
              trackId = {this.props.items[key].trackId}
              upVotes = {this.props.items[key].upVotes}
              postedBy = {this.props.items[key].postedBy.username}
              userId = {this.props.items[key].postedBy.userId}
              score = {this.props.items[key].score}
              timestamp = {this.props.items[key].timestamp}
              key = {key}
              keyNum = {keyNum}
              link = {this.props.items[key].links}
              feedState = {this.props.feedState}
              handleUpVote = {this.props.handleUpVote}
              handlePlayClick = {this.props.handlePlayClick}
              notLoggedInUpvoteFailNotification = {this.props.notLoggedInUpvoteFailNotification}
              alreadyUpvotedFailNotification = {this.props.alreadyUpvotedFailNotification}
              savantAlreadyPostedNotification = {this.props.savantAlreadyPostedNotification}>
            </LinkItem>
          );
      }
      children.sort(function(a, b){
          var timestampA = a.props.timestamp;
          var timestampB = b.props.timestamp;
          var upVotesA = a.props.upVotes;
          var upVotesB = b.props.upVotes;

          if (upVotesB > upVotesA) return 1;
          if (upVotesB < upVotesA) return -1;
          if (timestampB < timestampA) return 1;
          if (timestampB > timestampA) return -1;
          return 0
      })
      }
    return children;
  }
});
