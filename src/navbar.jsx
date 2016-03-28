var React = require('react');
var Firebase = require('firebase');
var Submission = require('./submission');
var Header = require('./header');
var ReactFire = require('reactfire');
var rootUrl = 'https://tastemkr.firebaseio.com/';

module.exports = React.createClass({
  mixins: [ ReactFire ],
  getInitialState: function() {
    return {
      items: [],
      playingTrack: 0,
    }
  },
  componentWillMount: function() {
    fb = new Firebase(rootUrl + 'items/');
    this.bindAsObject(fb, 'items');
  },
  render: function(){
    return <nav className="navbar navbar-default navbar-fixed-top">
  <div className="container-fluid">
    <div className="navbar-header">
      <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
        <span className="sr-only">Toggle navigation</span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
      </button>
      <a className="navbar-brand" href="#"><h1 onClick={this.props.savantStateChange}>SONICSAVANT</h1></a>
    </div>
    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <Header
        userFeedStateChange = {this.props.userFeedStateChange}
        savantApplicationStateChange = {this.props.savantApplicationStateChange}
        savantStateChange = {this.props.savantStateChange}
        top10StateChange = {this.props.top10StateChange}
        feedState = {this.props.feedState}
        loginNotification = {this.props.loginNotification}
        logoutNotification = {this.props.logoutNotification}
        loginFailNotification = {this.props.loginFailNotification}
        usernameTakenNotification = {this.props.usernameTakenNotification}
        registerFailNotification = {this.props.registerFailNotification}

        />
        <Submission
          className="row"
          dataStore = {this.firebaseRefs.items}
          handleListSubmitClick={this.props.handleListSubmitClick}
          submissionFailNotification = {this.props.submissionFailNotification}
          tooManyFollowersNotification = {this.props.tooManyFollowersNotification}
          hitLimitForDayNotification = {this.props.hitLimitForDayNotification}
          alreadyPostedNotification = {this.props.alreadyPostedNotification}
          savantAlreadyPostedNotification = {this.props.savantAlreadyPostedNotification}
          showDuplicate = {this.props.showDuplicate}
          userFeedStateChange = {this.props.userFeedStateChange}
          />

    </div>
  </div>
</nav>
  }
})
