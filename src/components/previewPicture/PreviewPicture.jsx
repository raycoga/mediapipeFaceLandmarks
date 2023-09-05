import React, { memo, useEffect, useState } from "react";

const PreviewPicture = memo(({ SmilePic, setSmilePic }) => {
  const [preview, setpreview] = useState();

  useEffect(() => {
    const image = SmilePic || sessionStorage.getItem("img-preview");
    setpreview(image);
  }, [SmilePic]);

  const repitPicture = () => {
    sessionStorage.clear();
    window.location.reload();
  };
  return (
    <div className="contenedor">
      <div id="image-preview-container">
        <img id="image" src={preview} alt="preview" />
      </div>
      <button onClick={repitPicture}> Repetir Foto </button>
      <button> Siguiente </button>
    </div>
  );
});

export default PreviewPicture;
