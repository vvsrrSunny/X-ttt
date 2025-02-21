import React, {Component} from 'react'

export default class AvailablePlayersList extends Component {

  constructor (props) {
    super(props)

    this.state = {}
  }

//	------------------------	------------------------	------------------------

  render () {
    return (
      <div className="available-players">
      <h1>Available Players</h1>
      <ul>
        {this.props.available_players &&
          this.props.available_players.map((player) => (
            <li key={player.uid}>
              <p>{player.name}</p>
              <button onClick={this.sendGameRequest.bind(this ,player.uid)}>
                Challenge
                <i className="fa fa-trophy"></i>
              </button>
            </li>
          ))}
          {this.props.available_players.length === 0 && <p>No online players currently </p>}
      </ul>
    </div>
    )
  }

  sendGameRequest(playerId) {
    this.props.sendGameRequest(playerId);
  }
}
