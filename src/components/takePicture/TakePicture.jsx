import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import vision from "@mediapipe/tasks-vision";
import "./TakePicture.css";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
function TakePicture({ SmilePic, setSmilePic }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  const [smileMessage, setsmileMessage] = useState("");

  const videoBlendShapes = document.getElementById("video-blend-shapes");
  const [faceLandmarker, setfaceLandmarker] = useState();

  const onTakePhoto = React.useCallback(() => {
    const dataUri = webcamRef.current.getScreenshot();
    sessionStorage.setItem("img-preview", dataUri);
    setSmilePic(dataUri);
  }, []);

  const onResults = async (results, SmilePic) => {
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
      /*      
      parte1
       let htmlMaker = ""; 
       */
      let mouthSmileLeft, mouthSmileRight, mouthUpperUpLeft, mouthUpperUpRight;

      blendShapes[0].categories.map((shape) => {
        if (shape.categoryName === "mouthSmileLeft") {
          mouthSmileLeft = shape.score.toFixed(2);
        }
        if (shape.categoryName === "mouthSmileRight") {
          mouthSmileRight = shape.score.toFixed(2);
        }

        if (shape.categoryName === "mouthUpperUpLeft") {
          mouthUpperUpLeft = shape.score.toFixed(2);
        }
        if (shape.categoryName === "mouthUpperUpRight") {
          mouthUpperUpRight = shape.score.toFixed(2);
        }
        setsmileMessage("sonrie");

        /* 
este es el codigo q hacen q se pinte parte2
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
 */
      });
      /*     
      este es el codigo q hacen q se pinte parte3
      el.innerHTML = htmlMaker;
      */

      const uri = sessionStorage.getItem("img-preview");
      if (
        mouthSmileLeft > 0.6 &&
        mouthSmileRight > 0.6 &&
        mouthUpperUpLeft > 0.6 &&
        mouthUpperUpRight > 0.6
      ) {
        if (uri === null || uri === undefined || uri === "") {
          console.log("FOTO", uri);
          onTakePhoto();
        }
      }
    }
    /*  if (results.multiFaceLandmarks) {
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
    } */
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
    var camera = null;

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
      faceMesh.onResults((e) => onResults(e, SmilePic));

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
  /* ESPERANDO POR IMAGEN */

  return (
    <center>
      <div className="App">
        {smileMessage !== "" && <h1>{smileMessage}</h1>}
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
          mirrored
        />{" "}
        <canvas
          ref={canvasRef}
          className="output_canvas"
          style={{
            opacity: 0,
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

      {/* <div
        className="contenedor"
        style={{ display: "flex", paddingTop: "500px" }}
      >
        {SmilePic && (
          <div id="image-preview-container">
            <img id="image" src={SmilePic} alt="preview" />
          </div>
        )}
        <div className="blend-shapes">
          <ul className="blend-shapes-list" id="video-blend-shapes"></ul>
        </div>
      </div> */}
    </center>
  );
}

export default TakePicture;
