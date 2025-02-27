import React, { useState, useRef } from "react";
import Delaunator from "delaunator";

const RandomPolygonArtApp = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [outputSrc, setOutputSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const outputCanvasRef = useRef(null);

  // Handle image upload and store its data URL.
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOutputSrc(null);
      const reader = new FileReader();
      reader.onload = (event) => setImageSrc(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Generate a set of random points inside the image, including border points.
  const generatePoints = (width, height, count = 300) => {
    const points = [];
    // Add border points to ensure full coverage.
    points.push([0, 0]);
    points.push([width / 2, 0]);
    points.push([width - 1, 0]);
    points.push([0, height / 2]);
    points.push([width - 1, height / 2]);
    points.push([0, height - 1]);
    points.push([width / 2, height - 1]);
    points.push([width - 1, height - 1]);

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      points.push([x, y]);
    }
    return points;
  };

  // Triangulate the image using Delaunay triangulation on random points.
  const triangulateImage = () => {
    if (!imageSrc) return;
    setLoading(true);

    const image = new Image();
    image.onload = () => {
      // Set up canvases with the image dimensions.
      const inputCanvas = canvasRef.current;
      const outputCanvas = outputCanvasRef.current;
      inputCanvas.width = image.width;
      inputCanvas.height = image.height;
      outputCanvas.width = image.width;
      outputCanvas.height = image.height;
      const inCtx = inputCanvas.getContext("2d");
      const outCtx = outputCanvas.getContext("2d");

      // Draw the original image for color sampling.
      inCtx.drawImage(image, 0, 0);
      const imageData = inCtx.getImageData(0, 0, image.width, image.height);

      // Generate random points and compute Delaunay triangulation.
      const points = generatePoints(image.width, image.height, 500);
      const flattened = points.flat();
      const delaunay = Delaunator.from(points);

      // Clear the output canvas.
      outCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

      // Set a subtle blur filter for softer edges.
      outCtx.filter = "blur(1px)";

      // Loop through each triangle produced by Delaunay.
      for (let i = 0; i < delaunay.triangles.length; i += 3) {
        const p0 = points[delaunay.triangles[i]];
        const p1 = points[delaunay.triangles[i + 1]];
        const p2 = points[delaunay.triangles[i + 2]];

        // Calculate the center of the triangle.
        const centerX = Math.floor((p0[0] + p1[0] + p2[0]) / 3);
        const centerY = Math.floor((p0[1] + p1[1] + p2[1]) / 3);
        // Clamp center to image bounds.
        const boundedX = Math.min(Math.max(0, centerX), image.width - 1);
        const boundedY = Math.min(Math.max(0, centerY), image.height - 1);
        const index = (boundedY * image.width + boundedX) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];

        // Draw the triangle with the sampled color.
        outCtx.beginPath();
        outCtx.moveTo(p0[0], p0[1]);
        outCtx.lineTo(p1[0], p1[1]);
        outCtx.lineTo(p2[0], p2[1]);
        outCtx.closePath();
        outCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        outCtx.fill();
      }

      // Reset filter (optional).
      outCtx.filter = "none";

      // Export the generated image.
      setOutputSrc(outputCanvas.toDataURL("image/png"));
      setLoading(false);
    };
    image.src = imageSrc;
  };

  // Download the generated image.
  const downloadImage = () => {
    if (!outputSrc) return;
    const link = document.createElement("a");
    link.download = "random-polygon-art.png";
    link.href = outputSrc;
    link.click();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Random Polygon Art with Blurred Edges</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {imageSrc && (
        <div style={{ marginTop: "20px" }}>
          <h2>Original Image</h2>
          <img src={imageSrc} alt="Original" style={{ maxWidth: "300px" }} />
        </div>
      )}

      <button
        onClick={triangulateImage}
        disabled={!imageSrc || loading}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        {loading ? "Processing..." : "Generate Art"}
      </button>

      {outputSrc && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Art</h2>
          <img
            src={outputSrc}
            alt="Generated Art"
            style={{ maxWidth: "300px" }}
          />
          <br />
          <button
            onClick={downloadImage}
            style={{ marginTop: "10px", padding: "8px 16px" }}
          >
            Download Image
          </button>
        </div>
      )}

      {/* Hidden canvases for processing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <canvas ref={outputCanvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default RandomPolygonArtApp;
