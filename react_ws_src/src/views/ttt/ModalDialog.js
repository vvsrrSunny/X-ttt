import React from 'react';

class ModalDialog extends React.Component {
  constructor(props) {
    super(props);
    // Binding methods
    this.handleYes = this.handleYes.bind(this);
    this.handleNo = this.handleNo.bind(this);
  }

  handleYes() {
    // Trigger the callback to emit the accept request
    this.props.onAccept();
  }

  handleNo() {
    this.props.onReject();
  }

  render() {
    const { isVisible, from_player_name } = this.props;
    return (
      <div>
        {isVisible && (
          <div className="popup">
            <div className="popup-content">
              <p>Player {from_player_name} wants to play. Do you accept?</p>
              <div className='popup-buttons'>
                <button className="btn yes" onClick={this.handleYes}>Yes</button>
                <button className="btn no" onClick={this.handleNo}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ModalDialog;
