import React, {  useEffect, useState } from "react";
import "./App.css";
import TakePicture from "./components/takePicture/TakePicture";
import PreviewPicture from "./components/previewPicture/PreviewPicture";
function App() {
  const [SmilePic, setSmilePic] = useState(null);


  if (SmilePic === null) {
    return <TakePicture SmilePic={SmilePic} setSmilePic={setSmilePic}/>;
  } else {
    return <PreviewPicture SmilePic={SmilePic} setSmilePic={setSmilePic}/>;
  }
}

export default App;
