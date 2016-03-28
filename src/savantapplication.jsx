var React = require('react');
var clientId = '033e31e2d036e02f39242e1aa1dd2fa9';
var Firebase = require('firebase');
var rootUrl = 'https://tastemkr.firebaseio.com/';

module.exports = React.createClass({
  getInitialState: function(){
    return {
      email: '',
      profileLink: '',
    }
  },
  handleListSubmitClick: function(){
    var user = this.state.profileLink.replace(/^.*\//, '')
    console.log(user)
    var myThis = this;
    var totalLikes = 0
    if(this.state.email.indexOf('@') == -1){
      myThis.props.emailRequiredNotification();
      return;
    }
    if(this.state.profileLink.indexOf('https://soundcloud.com/') == -1 && this.state.profileLink.indexOf('http://soundcloud.com/') == -1){
      myThis.props.validSoundcloudLinkRequiredNotification();
      return;
    }
    $.get('https://api.soundcloud.com/users/' + user + '?client_id=' + clientId +'&limit=200&linked_partitioning=1', function(data){
      data = data
      totalLikes = data.public_favorites_count
      console.log(data)
    }).done(function(){
      if(totalLikes > 300){
        console.log('moving to check likes')
        myThis.props.enoughLikesNotification()
        myThis.checkLikeRatio(user)
      } else {
        myThis.props.notEnoughLikesNotification()
      }
    }).fail(function(error){
      myThis.props.somethingWentWrongNotification()
    })
  },
  checkLikeRatio: function(user){
    console.log('checking like ratio')
    var array = [];
    ratio = 0;
    var myThis = this;
    $.get('https://api.soundcloud.com/users/' + user + '/favorites?client_id=' + clientId + '&limit=200', function(data){
      console.log(data)
      for (var prop in data){
        console.log(ratio)
        if(typeof data[prop].favoritings_count ==='number' && typeof data[prop].playback_count === 'number'){
          array.push(data[prop])
          ratio += (data[prop].favoritings_count / data[prop].playback_count)
        }
      }
    }).done(function(){
      console.log(ratio, array.length)
      if(ratio / array.length > 0.033){
        console.log(ratio / array.length)
        myThis.props.addingAsSavantNotification()
        console.log('moving on to addSavant')
        myThis.addSavant(user)
      } else {
        myThis.props.notQualifiedNotification()
        console.log(ratio / array.length)
        console.log('music selection too shitty sry')
      }
    }).fail(function(){
      myThis.props.somethingWentWrongNotification()
    })
  },
  addSavant: function(user){
    console.log('in addSavant')
    var ref = new Firebase(rootUrl)
    var result = false;
    var myThis = this;
    email = false;
    ref.child('users').once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot){
        if(childSnapshot.val().email === myThis.state.email){
          var key = childSnapshot.key()
          ref.child('users').child(key).update({savant: true})
          email = true
        }
      })
    }).then(function(){
      if(email === false){
        myThis.props.wrongEmailNotification();
      }
    }).then(function(){
      ref.child('savantUsers').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
          console.log(childSnapshot.val().savant)
          if(childSnapshot.val().savant === user){
            console.log('already there')
            myThis.props.alreadyASavantNotification();
            result = true
          }
        })
      }).then(function(){
        console.log(result)
        if(result === false){
          ref.child('savantUsers').push({savant: user})
        }
      })
    })
  },
  handleTextInputEmail: function(event){
    this.setState({email: event.target.value})
  },
  handleTextInputProfileLink: function(event){
    this.setState({profileLink: event.target.value})
  },
  render: function() {
    return <div className="savantApplication">
      <div className="row">
        <h3 className="dateName col-md-4 col-sm-4 col-xs-4">Savant Application</h3>
      </div>
      <br></br>

    <form className="form-horizontal" role="form">
     <div className="form-group">
       <label className="control-label col-sm-2" for="email"><p>Email:</p></label>
       <div className="col-sm-6">
         <input type="text" onChange={this.handleTextInputEmail} required="true" className="form-control" id="email" placeholder="Enter email"></input>
       </div>
     </div>
     <div className="form-group">
       <label className="control-label col-sm-2" for="pwd"><p>Your Soundcloud Profile Link:</p></label>
       <div className="col-sm-6">
         <input type="text" onChange={this.handleTextInputProfileLink} className="form-control" id="pwd" placeholder="https://soundcloud.com/69blondiebabe69"></input>
       </div>
     </div>
     <div className="form-group">
       <div className="col-sm-offset-2 col-sm-10">
         <button type="button" onClick={this.handleListSubmitClick} className="btn btn-default">Submit</button>
       </div>
     </div>
   </form>
   </div>

  }
})
