import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";

const App = () => {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      width: 400,
      height: 500,
      backgroundColor: "#fff",
    });
    fabricCanvas.current = canvas;

    fabric.Image.fromURL("/tshirt_base.png", img => {
      img.selectable = false;
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });

    const saved = localStorage.getItem("draft");
    if (saved) {
      canvas.loadFromJSON(saved, () => canvas.renderAll());
    }

    canvas.on("object:added", updateLayers);
    canvas.on("object:removed", updateLayers);
    canvas.on("object:modified", updateLayers);

    return () => canvas.dispose();
  }, []);

  const updateLayers = () => {
    const objs = fabricCanvas.current.getObjects().map((obj, index) => ({
      id: index,
      type: obj.type,
    }));
    setLayers(objs);
  };

  const addText = () => {
    const text = new fabric.IText("文本", {
      left: 150,
      top: 200,
      fontSize: 20,
      fill: "#000",
    });
    restrict(text);
    fabricCanvas.current.add(text);
  };

  const uploadImage = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = f => {
      fabric.Image.fromURL(f.target.result, img => {
        img.set({ left: 150, top: 100, scaleX: 0.4, scaleY: 0.4 });
        restrict(img);
        fabricCanvas.current.add(img);
      });
    };
    reader.readAsDataURL(file);
  };

  const restrict = obj => {
    obj.on("moving", () => {
      if (obj.left < 50) obj.left = 50;
      if (obj.top < 100) obj.top = 100;
      if (obj.left + obj.width * obj.scaleX > 350) obj.left = 350 - obj.width * obj.scaleX;
      if (obj.top + obj.height * obj.scaleY > 300) obj.top = 300 - obj.height * obj.scaleY;
    });
  };

  const saveDraft = () => {
    const json = fabricCanvas.current.toJSON();
    localStorage.setItem("draft", JSON.stringify(json));
    alert("已保存草稿！");
  };

  const deleteActive = () => {
    const obj = fabricCanvas.current.getActiveObject();
    if (obj) {
      fabricCanvas.current.remove(obj);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "250px", padding: "10px", background: "#f3f3f3" }}>
        <h3>控制面板</h3>
        <button onClick={addText}>添加文字</button><br />
        <input type="file" onChange={uploadImage} /><br />
        <button onClick={saveDraft}>保存草稿</button><br />
        <button onClick={deleteActive}>删除当前图层</button><br />
        <h4>图层：</h4>
        <ul>{layers.map(l => <li key={l.id}>{l.type}</li>)}</ul>
      </div>
      <canvas id="canvas" ref={canvasRef} />
    </div>
  );
};

export default App;