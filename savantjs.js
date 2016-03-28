var rootUrl = 'https://tastemkr.firebaseio.com/';
var clientId = '033e31e2d036e02f39242e1aa1dd2fa9';
var Firebase = require('firebase');
var moment = require('moment-timezone');
var request = require('request');

module.exports = {
  getSavantsArray: function() {
    var savantsArray = [];
    var myThis = this;
    var ref = new Firebase(rootUrl + 'savantUsers/')
    ref.once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot){
        savantsArray.push(childSnapshot.val().savant)
      })
    }).then(function(){
      myThis.checkForValidPermalink(savantsArray)
    })
  },
  checkForValidPermalink: function(arr){
    var savantsArray = []
    var index = 0
    var myThis = this
    arr.forEach(function(user){
      request.get('https://api.soundcloud.com/users/' + user + '/favorites?client_id=' + clientId + '&limit=200', function(error, response, body){
        if(!error && response.statusCode == 200){
          savantsArray.push(user)
        }
      })
    })
    setTimeout(function(){
      myThis.getTracksFromSavants(savantsArray)
    }, 30000);
  },
  shuffleArray: function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
},
  getTracksFromSavants: function(arr){
    console.log('hi')
    var savantsArray = this.shuffleArray(arr);
    console.log(savantsArray)
    var savantTunes = [];
    var index = 0;
    var myThis = this;
    var emptyObj = {};
    var year = moment().tz("America/Los_Angeles").format('YYYY');
    var month = moment().tz("America/Los_Angeles").format('MM');
    var day = moment().tz("America/Los_Angeles").format('DD');
    var timestampDate = new Date(year, month, day).getTime();
    var datenow = Date.now()
    var timestamp = moment.tz(datenow, "America/Los_Angeles")._i
    var date = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');
    savantsArray.forEach(function(user){
      var postedByUsername = '';
      request.get('https://api.soundcloud.com/users/' + user + '?client_id=' + clientId, function(error, response, body){
        body = JSON.parse(body)
        postedByUsername = body.username;

      })
      request.get('https://api.soundcloud.com/users/' + user + '/favorites?client_id=' + clientId + '&limit=200', function(error, response, body){
        body = JSON.parse(body)
        for (var prop in body){
          if(body[prop] !== undefined){
            body[prop].artist = body[prop].user.username;
            body[prop].songTitle = body[prop].title
            body[prop].trackId = body[prop].id
            body[prop].link = body[prop].permalink_url
            body[prop].upVotedBy = {
              test: true,
            }
            body[prop].upVotes = 0
            body[prop].postedBy = {
              username: postedByUsername,
            }
            body[prop].postedOn = date,
            body[prop].timestampDate = timestampDate,
            body[prop].timestamp = timestamp
            savantTunes.push(body[prop])
          }
        }
      })
    })
    setTimeout(function(){
      myThis.getSmallArtistTracks(savantTunes)
    }, 60000)
  },
  getSmallArtistTracks: function(arr){
    console.log('in getSmallArtistTracks')
    var smallArtistArray = [];
    var index = 0;
    var myThis = this;
    arr.forEach(function(track){
      request.get('https://api.soundcloud.com/users/' + track.user.id + '?client_id=' + clientId + '&limit=200', function(error, response, body){
        if(body !== undefined){
          body = JSON.parse(body);
          index += 1
          if(body.followers_count < 12000){
            smallArtistArray.push(track)
          }
        }
      })
    })
    setTimeout(function(){
      myThis.checkForDuplicateInItems(smallArtistArray)
    }, 60000)
  },
  checkForDuplicateInItems: function(arr){
    var notADuplicate = []
    var ref = new Firebase(rootUrl);
    var index = 0
    var myThis = this
    arr.forEach(function(track){
      var result = true;
      ref.child('items').once('value', function snap(snapshot){
        snapshot.forEach(function childSnap(childSnapshot){
          if(childSnapshot.val().trackId === track.id){
            result = false;
          }
        })
      }).then(function(){
        index += 1
        console.log(index, arr.length)
        if(result == true){
          console.log('result is true')
          notADuplicate.push(track)
        } else {
          console.log('result is false')
        }
      })
    })
    setTimeout(function(){
      myThis.checkForDuplicateInSavantItems(notADuplicate)
    }, 30000)
  },
  checkForDuplicateInSavantItems: function(arr){
    var notADuplicate = []
    var ref = new Firebase(rootUrl);
    var index = 0
    var myThis = this
    arr.forEach(function(track){
      var result = true;
      ref.child('savantitems').once('value', function snap(snapshot){
        snapshot.forEach(function childSnap(childSnapshot){
          if(childSnapshot.val().trackId === track.id){
            result = false;
          }
        })
      }).then(function(){
        index += 1
              console.log(index, arr.length)
        if(result == true){
          console.log('result is true for savant')
          notADuplicate.push(track)
        } else {
          console.log('result is false for savant')
        }
      })
    })
    setTimeout(function(){
      myThis.checkLikeRatio(notADuplicate)
    }, 30000)
  },
  checkLikeRatio: function(arr){
    console.log('checking like ratio')
    var itsFire = [];
    var index = 0;
    var myThis = this;
    arr.forEach(function(track){
      index += 1;
      if(track.favoritings_count / track.playback_count > 0.039){
        if(track.playback_count < 10000){
          itsFire.push(track)
        }
        else if(track.playback_count > 10000 && track.comment_count > 9){
          itsFire.push(track)
        }
      }
    })
    setTimeout(function(){
      myThis.getFinalTracks(itsFire)
    }, 30000)
  },
  getFinalTracks: function(arr){
    console.log('getting final 15')
    finalTracks = [];
    values = [];
    var ref = new Firebase(rootUrl + 'savantitems');
    for(var i = 0; i < 15; i++){
      pushRandom();
      function pushRandom(){
        var random = Math.floor(Math.random() * arr.length -1)
        if (values.indexOf(random) == -1 && arr[random] !== undefined && arr[random].duration > 150000 && arr[random].duration < 600000){
          finalTracks.push(arr[random])
          values.push(random)
          console.log(finalTracks)
        } else {
          pushRandom();
        }
      }
    }
    setTimeout(function(){
      finalTracks.length = 15;
      console.log('getFinalTracks done');
      for(var i = 0; i < finalTracks.length; i++){
        console.log('setting')
        ref.push(finalTracks[i])
      }
    }, 30000)
  },

}
