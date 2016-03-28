var React = require('react');

module.exports = React.createClass({

  render: function() {
    var frameSrc = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + this.props.trackId +  '&amp;auto_play=true&amp;hide_related=true&amp;show_comments=false&amp;show_user=true&amp;show_reposts=true&amp;visual=true"';
    return <div className="playerDiv">
      <div className="player">
      <iframe width="100%" height="150" scrolling="no" src={frameSrc}></iframe>
      </div>
    </div>
  }
})
