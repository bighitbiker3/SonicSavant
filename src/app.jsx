var React = require('react');
var ReactDOM = require('react-dom');
var ReactFire = require('reactfire');
var Firebase = require('firebase');
var Submission = require('./submission');
var List = require('./list');
var Iframe = require('./iframe');
var Header = require('./header');
var Navbar = require('./navbar');
var rootUrl = 'https://tastemkr.firebaseio.com/';
var NotificationSystem = require('react-notification-system');
var Modal = require('./modal');
var Top10Feed = require('./top10feed');
var Savant = require('./savant');
var SavantApplication = require('./savantapplication');
var Welcome = require('./welcome');

var Hello = React.createClass({
  mixins: [ ReactFire ],
  getInitialState: function() {
    return {
      items: [],
      playingTrack: 0,
      playerHidden: false,
      duplicate: {
        artist: String,
        songTitle: String,
        postedBy: {
          username: String,
          userId: String,
        },
        score: Number,
        timestamp: Number,
        upVotes: Number,
        links: String,
        trackId: Number,
        postedOn: String,
        keyNum: String,
      },
      feedState: 'welcome',
    }
  },
  _notificationSystem: null,

  loginNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: 'Login Successful!',
      level: 'success'
    });
  },
  logoutNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: 'You are now logged out',
      level: 'success'
    });
  },
  loginFailNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: "We're sry (not that sry tho), we don't recognize that email/password",
      level: 'error'
    });
  },
  notLoggedInUpvoteFailNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: "Please login/register to upvote tunes :)",
      level: 'error'
    });
  },
  alreadyUpvotedFailNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: "You can only upvote once fam",
      level: 'error'
    });
  },
  usernameTakenNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: "That username has already been taken",
      level: 'error'
    });
  },
  registerFailNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: "That email appears to already be in use",
      level: 'error'
    });
  },
  submissionFailNotification: function() {
    event.preventDefault();
    this._notificationSystem.addNotification({
      message: "Please register/login to post. It'll take you 4 seconds.",
      level: 'error'
    });
  },
  tooManyFollowersNotification: function() {
    this._notificationSystem.addNotification({
      message: "Artists posted can only have a max of 12,000 followers. Be a leader.",
      level: 'error'
    });
  },
  postedNotification: function() {
    this._notificationSystem.addNotification({
      message: "Posted :)",
      level: 'success'
    });
  },
  hitLimitForDayNotification: function() {
    this._notificationSystem.addNotification({
      message: "We only allow 15 tracks posted per day. This resets at 12am PST. Try again tomorrow!",
      level: 'error'
    });
  },
  alreadyPostedNotification: function() {
    this._notificationSystem.addNotification({
      message: "This track has already been posted. Feel free to upvote it :)",
      level: 'error'
    });
  },
  savantAlreadyPostedNotification: function() {
    this._notificationSystem.addNotification({
      message: "This track has already been posted by the Savant :(",
      level: 'error'
    });
  },
  noMorePostsNotification: function() {
    this._notificationSystem.addNotification({
      message: "There aren't anymore posts to display :(",
      level: 'error'
    });
  },
  somethingWentWrongNotification: function() {
    this._notificationSystem.addNotification({
      message: ":( something went wrong. Please try again",
      level: 'error'
    });
  },
  emailRequiredNotification: function() {
    this._notificationSystem.addNotification({
      message: "Please input your email address",
      level: 'error'
    });
  },
  validSoundcloudLinkRequiredNotification: function() {
    this._notificationSystem.addNotification({
      message: "Please input a valid Soundcloud Profile Link",
      level: 'error'
    });
  },
  wrongEmailNotification: function() {
    this._notificationSystem.addNotification({
      message: "We can't find your email address. Are you sure you registered with this one?",
      level: 'error'
    });
  },
  enoughLikesNotification: function() {
    this._notificationSystem.addNotification({
      message: "Nice! First Step complete. Checking some more things real quick...",
      level: 'success'
    });
  },
  notEnoughLikesNotification: function() {
    this._notificationSystem.addNotification({
      message: "Unfortunately you haven't been liking enough tracks on Soundcloud to qualify",
      level: 'error'
    });
  },
  notQualifiedNotification: function() {
    this._notificationSystem.addNotification({
      message: "Unfortunately your track selections aren't what we're looking for. You can always apply again soon.",
      level: 'error'
    });
  },
  alreadyASavantNotification: function() {
    this._notificationSystem.addNotification({
      message: "Wait...you're already a Savant!",
      level: 'error'
    });
  },
  addingAsSavantNotification: function() {
    this._notificationSystem.addNotification({
      message: "Yeehaw! Adding you as a Savant now.",
      level: 'success'
    });
  },
  componentDidMount: function() {
    this._notificationSystem = this.refs.notificationSystem;
  },
  componentWillMount: function() {
    fbitems = new Firebase(rootUrl + 'items/');
    fbsavant = new Firebase(rootUrl + 'savantitems/')
    this.bindAsObject(fbitems, 'items');
    this.bindAsObject(fbsavant, 'savantitems');
  },
  handleListSubmitClick: function(data, dataObject) {
    var ref = new Firebase(rootUrl);
    var authData = ref.getAuth()
    ref.child('users').child(authData.uid).child('posts').push(dataObject);
    this.setState({data})
    console.log(this.state)
    this.postedNotification()
    this.orderPostsByDate()

  },
  orderPostsByDate: function(){
    var ref = new Firebase(rootUrl)
    var query = ref.child('items').orderByChild('postedOn');
    query.on('child_added', function(snapshot){
      return;
    })
  },
  handlePlayClick: function(item){
    var stateCopy = Object.assign({}, item);
    var trackId = stateCopy.trackId;
    this.setState({playingTrack: trackId})
    console.log('should be playing ' + this.state.playingTrack);
  },
  handlePlayClickModal: function(){
    this.setState({playingTrack: this.state.duplicate.trackId})
    console.log(this.state.duplicate.trackId)
    console.log('should be playing ' + this.state.playingTrack);
  },
  hidePlayer: function(){
    this.setState({playerHidden: !this.state.playerHidden})

  },
  showDuplicate: function(dataObj, key){
    this.setState({
      duplicate: {
        artist: dataObj.artist,
        songTitle: dataObj.songTitle,
        genre: dataObj.genre,
        postedBy: {
          username: dataObj.postedBy.username,
          userId: dataObj.postedBy.userId,
        },
        score: dataObj.score,
        timestamp: dataObj.timestamp,
        upVotes: dataObj.upVotes,
        links: dataObj.links,
        trackId: dataObj.trackId,
        postedOn: dataObj.postedOn,
        keyNum: key,
      }
    })
    $('.modal').modal();
    $('.entireList').addClass('blur');
    console.log('settingState for Duplicate on app done')
    $('.modal').on('hidden.bs.modal', function (e) {
      $('.entireList').removeClass('blur')
    })
  },
  updateDuplicateUpvote: function(upVoted){
    var stateCopy = Object.assign({}, this.state);
    console.log(stateCopy)
    console.log(stateCopy.upVotes)
    stateCopy.duplicate.upVotes = upVoted;
    console.log(stateCopy.upVotes)
    this.setState(stateCopy)
  },
  top10Feed: function(){
    return <Top10Feed
      handleUpVote = {this.handleUpVote}
      feedState = {this.state.feedState}
      handlePlayClick = {this.handlePlayClick}
      noMorePostsNotification = {this.noMorePostsNotification}
      notLoggedInUpvoteFailNotification = {this.notLoggedInUpvoteFailNotification}
      alreadyUpvotedFailNotification = {this.alreadyUpvotedFailNotification}
            savantAlreadyPostedNotification = {this.savantAlreadyPostedNotification}
      />
  },
  savantFeed: function(){
    return <Savant
      handleUpVote = {this.handleUpVote}
      feedState = {this.state.feedState}
      handlePlayClick = {this.handlePlayClick}
      noMorePostsNotification = {this.noMorePostsNotification}
      notLoggedInUpvoteFailNotification = {this.notLoggedInUpvoteFailNotification}
      alreadyUpvotedFailNotification = {this.alreadyUpvotedFailNotification}
      savantAlreadyPostedNotification = {this.savantAlreadyPostedNotification}
      />
  },
  listFeed: function(){
    return <List
      className = "trackList"
      items = {this.state.items}
      feedState = {this.state.feedState}
      handleUpVote = {this.handleUpVote}
      handlePlayClick = {this.handlePlayClick}
      noMorePostsNotification = {this.noMorePostsNotification}
      notLoggedInUpvoteFailNotification = {this.notLoggedInUpvoteFailNotification}
      alreadyUpvotedFailNotification = {this.alreadyUpvotedFailNotification}
      savantAlreadyPostedNotification = {this.savantAlreadyPostedNotification}
      />
  },
  savantApplication: function(){
    return <SavantApplication
      validSoundcloudLinkRequiredNotification = {this.validSoundcloudLinkRequiredNotification}
      wrongEmailNotification = {this.wrongEmailNotification}
      somethingWentWrongNotification = {this.somethingWentWrongNotification}
      enoughLikesNotification = {this.enoughLikesNotification}
      notEnoughLikesNotification = {this.notEnoughLikesNotification}
      notQualifiedNotification = {this.notQualifiedNotification}
      addingAsSavantNotification = {this.addingAsSavantNotification}
      alreadyASavantNotification = {this.alreadyASavantNotification}
      emailRequiredNotification = {this.emailRequiredNotification}
      />
  },
  welcomeScreen: function(){
    return <Welcome
      savantStateChange = {this.savantStateChange}
      />
  },
  top10StateChange: function(){
    this.setState({feedState: 'top10'})
  },
  savantStateChange: function(){
    this.setState({feedState: 'savant'})
  },
  userFeedStateChange: function(){
    this.setState({feedState: 'userFeed'})
  },
  savantApplicationStateChange: function() {
    this.setState({feedState: 'savantApplication'})
  },
  render: function() {
    if(this.state.playerHidden === true){
      $('.iFrameApp').hide();
      $('.hideShowPlayer').css('bottom', '0').html('show player');
      $('.loadMorePosts').css('bottom', '0')
    } else {
      $('.iFrameApp').show();
      $('.hideShowPlayer').css('bottom', '100').html('hide player')
      $('.loadMorePosts').css('bottom', '100')
    }
    var feed = null;
    if (this.state.feedState === 'top10'){
                 feed = this.top10Feed()
                }
                else if(this.state.feedState === 'welcome'){
                  feed = this.welcomeScreen()
                }
                else if(this.state.feedState === 'savant'){
                 feed = this.savantFeed()
                }
                else if(this.state.feedState === 'userFeed'){
                 feed = this.listFeed();
                }
                else if(this.state.feedState === 'savantApplication'){
                  feed = this.savantApplication()
                }

    return <div>

      <NotificationSystem ref="notificationSystem" />
      <Navbar
        savantApplicationStateChange = {this.savantApplicationStateChange}
        userFeedStateChange = {this.userFeedStateChange}
        savantStateChange = {this.savantStateChange}
        top10StateChange = {this.top10StateChange}
        feedState = {this.state.feedState}
        loginNotification = {this.loginNotification}
        logoutNotification = {this.logoutNotification}
        loginFailNotification = {this.loginFailNotification}
        usernameTakenNotification = {this.usernameTakenNotification}
        registerFailNotification = {this.registerFailNotification}
        dataStore = {this.firebaseRefs.items}
        handleListSubmitClick={this.handleListSubmitClick}
        submissionFailNotification = {this.submissionFailNotification}
        tooManyFollowersNotification = {this.tooManyFollowersNotification}
        hitLimitForDayNotification = {this.hitLimitForDayNotification}
        alreadyPostedNotification = {this.alreadyPostedNotification}
        savantAlreadyPostedNotification = {this.savantAlreadyPostedNotification}
        showDuplicate = {this.showDuplicate}
        />
      <div className="modal fade" id="duplicateModal" role="dialog">
          <div className="modal-dialog">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            </div>
            <div className = "modal-body">
                <Modal
                  item = {this.state.duplicate}
                  artist = {this.state.duplicate.artist}
                  songTitle = {this.state.duplicate.songTitle}
                  postedBy = {this.state.duplicate.postedBy.username}
                  upVotes = {this.state.duplicate.upVotes}
                  keyNum = {this.state.duplicate.keyNum}
                  trackId = {this.state.duplicate.trackId}
                  userId = {this.state.duplicate.postedBy.userId}
                  score = {this.state.duplicate.score}
                  timestamp = {this.state.duplicate.timestamp}
                  handleUpVote = {this.handleUpVote}
                  updateDuplicateUpvote = {this.updateDuplicateUpvote}
                  handlePlayClickModal = {this.handlePlayClickModal}
                  alreadyUpvotedFailNotification = {this.alreadyUpvotedFailNotification}
                  />
              </div>
          </div>
        </div>
        <div className = "row">
        {feed}
        </div>

      <div className="hidePlayerDiv">
        <p className="hideShowPlayer" onClick={this.hidePlayer}>hide player</p>
      </div>
        <div className="iFrameApp">
        <Iframe trackId = {this.state.playingTrack}/>
      </div>
    </div>

  }
});

var element = React.createElement(Hello, {});
ReactDOM.render(element, document.querySelector('.container'));
