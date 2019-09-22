import React, { Component } from 'react';
import Webcam from "react-webcam";

let popupStyles = {
    width: '1500px',
    height: '700px',
    maxWidth: '100%',
    margin: '20px',
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '999',
    backgroundColor: 'whitesmoke',
    padding: '10px 20px 40px',
    borderRadius: '8px',
    flexDirection: 'column'
};

let popupButtonStyle = {
    marginBottom: '10px',
    marginLeft: '20px',
    padding: '3px 8px',
    cursor: 'pointer',
    borderRadius: '50%',
    border: 'none',
    width: '100px',
    height: '50px',
    fontWeight: 'bold',
    fontSize: '30px',
    alignSelf: 'flex-end',
    backgroundColor: 'darkgray'
};

let webcamStyle = {
    marginTop: '10px'
}

class Popup extends Component {
    render() {
        return (
            <div style={popupStyles}>
                <h1> Please rotate your face!</h1>
                <Webcam style={webcamStyle}
                    width={800}
                    height={600}
                />
                <button style={popupButtonStyle}>Done!</button>
            </div >
        )
    }
}

export default Popup;