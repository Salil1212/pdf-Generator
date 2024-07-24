
import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { useDropzone } from "react-dropzone";
import "./App.css"; // Import custom CSS file

function App() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [rank, setRank] = useState("");
  const [error, setError] = useState("");

  // To keep track of the last ID number
  const [lastIdNumber, setLastIdNumber] = useState(1000);

  useEffect(() => {
    // Load the last ID number from local storage or initialize it
    const storedIdNumber = localStorage.getItem("lastIdNumber");
    if (storedIdNumber) {
      setLastIdNumber(parseInt(storedIdNumber, 10));
    }
  }, []);

  useEffect(() => {
    // Save the last ID number to local storage
    localStorage.setItem("lastIdNumber", lastIdNumber);
  }, [lastIdNumber]);

  const onDrop = (acceptedFiles) => {
    setPhoto(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const newIdNumber = `#${(lastIdNumber + 1).toString().padStart(6, "0")}`;
    setLastIdNumber(lastIdNumber + 1);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();

    page.drawText(`User Name: ${name}`, { x: 400, y: height - 100, size: 10 });
    page.drawText(`Congratulations!! You have secured: ${rank}`, {
      x: 20,
      y: height - 300,
      size: 20,
    });
    page.drawText(`ID Number: ${newIdNumber}`, {
      x: 500,
      y: height - 50,
      size: 10,
    });

    if (photo) {
      const imgData = new Uint8Array(await photo.arrayBuffer());
      const image = await pdfDoc.embedPng(imgData);
      page.drawImage(image, {
        x: 5,
        y: height - 200,
        width: 150,
        height: 150,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div className="app-container">
      <h1 className="title">Form Submission</h1>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="photo">Photo:</label>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>
              {photo
                ? photo.name
                : "Drag and drop an image here, or click to select one"}
            </p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rank">Rank:</label>
          <select
            id="rank"
            className="form-control"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            required
          >
            <option value="">Select Rank</option>
            <option value="First Rank">First Rank</option>
            <option value="Second Rank">Second Rank</option>
            <option value="Third Rank">Third Rank</option>
          </select>
        </div>

        <button type="submit" className="submit-button">
          Generate PDF
        </button>
      </form>
    </div>
  );
}

export default App;
