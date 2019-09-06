import React from "react";
import Webcam from "react-webcam";

function MainScreen() {
  return (
    <div>
      <h1>Main Screen</h1>
      <Webcam
        audio={false}
        width={1500}
        height={620}
        screenshotFormat="image/jpeg" />
    </div>
  );
}

export default MainScreen;
