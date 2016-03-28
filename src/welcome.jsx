React = require('react');

module.exports = React.createClass({
  render: function(){
    return <div className="welcomeScreen">
      <br></br>
      <br></br>
      <br></br>
      <h1>Welcome To The SonicSavant</h1>
      <button onClick={this.props.savantStateChange} className="btn btn-default enterButton">Enter</button>
        <br></br>
        <br></br>
      <p className = "welcomeP">We help you find music from small, unknown artists.</p>
        <br></br>
      <p className = "welcomeP">The Savant will automatically update the tracks every night at 12am PST.</p>
        <br></br>
      <p className = "welcomeP">If you're interested in becoming a Savant, please login and apply by clicking on your username.</p>

    </div>
  }
})
