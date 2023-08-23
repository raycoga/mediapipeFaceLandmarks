import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import vision from "@mediapipe/tasks-vision";
import './App.css'
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const videoBlendShapes = document.getElementById("video-blend-shapes");
  const [faceLandmarker, setfaceLandmarker] = useState();

  const onResults = async (results) => {
    // const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    let startTimeMs = performance.now();
    const data = faceLandmarker.detectForVideo(
      webcamRef.current.video,
      startTimeMs
    );
    drawBlendShapes(videoBlendShapes, data.faceBlendshapes);
    /*  drawBlendShapes(videoBlendShapes, results.faceBlendshapes); */

    function drawBlendShapes(el, blendShapes) {
      if (!blendShapes.length) {
        return;
      }
      let htmlMaker = "";
      blendShapes[0].categories.map((shape) => {
        htmlMaker += `
            <li class="blend-shapes-item">
              <span class="blend-shapes-label">${
                shape.displayName || shape.categoryName
              }</span>
              <span class="blend-shapes-value" style="width: calc(${
                +shape.score * 100
              }% - 120px)">${(+shape.score).toFixed(4)}</span>
            </li>
          `;
      });

      el.innerHTML = htmlMaker;
    }
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
          color: "#FF3030",
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#30FF30",
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
          color: "#30FF30",
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
          color: "#E0E0E0",
        });
      }
    }
    canvasCtx.restore();
  };
  // }
  async function createFaceLandmarker() {
    let runningMode = "VIDEO";
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    const facelandmarker = await FaceLandmarker.createFromOptions(
      filesetResolver,
      {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1,
      }
    );
    setfaceLandmarker(facelandmarker);
  }
  // setInterval(())
  useEffect(() => {
    if (!faceLandmarker) {
      createFaceLandmarker();
    } else {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);

      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null
      ) {
        camera = new cam.Camera(webcamRef.current.video, {
          onFrame: async () => {
            await faceMesh.send({ image: webcamRef.current.video });
          },
          width: 640,
          height: 480,
        });
        camera.start();
      }
    }
  }, [faceLandmarker]);
  return (
    <center>
      <div className="App">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",

            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />{" "}
        <canvas
          ref={canvasRef}
          className="output_canvas"
          style={{
            position: "absolute",

            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        ></canvas>
      </div>



      <div className="blend-shapes">
        <ul className="blend-shapes-list" id="video-blend-shapes"></ul>
      </div>
    </center>
  );
}

export default App;
