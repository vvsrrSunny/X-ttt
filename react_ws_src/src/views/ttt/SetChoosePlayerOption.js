import React, {Component} from 'react'

export default class SetChoosePlayerOption extends Component {

	constructor (props) {
		super(props)

		this.state = {}
	}

//	------------------------	------------------------	------------------------

	render () {
		return (
			<div id='SetChoosePlayerOption'>

				<h1>Choose the player</h1>

				<button type='submit' onClick={this.selTypeMyChoice.bind(this)} className='button long'><span>Choose a player <span className='fa fa-caret-right'></span></span></button>
				
				&nbsp;&nbsp;&nbsp;&nbsp;

				<button type='submit' onClick={this.selTypeRandom.bind(this)} className='button long'><span>Play with random player <span className='fa fa-caret-right'></span></span></button>

			</div>
		)
	}

//	------------------------	------------------------	------------------------

	selTypeRandom (e) {
		this.props.onSetType('random')
	}

//	------------------------	------------------------	------------------------

	selTypeMyChoice (e) {
		this.props.onSetType('my_choice')
	}

}
