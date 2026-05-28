// src/FileUploader.jsx
import { useState } from 'react';

const FileUploader = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={`dropzone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept=".dxf"
        onChange={handleFileInput}
        id="file-input"
        className="file-input"
      />
      <label htmlFor="file-input" className="file-label">
        <span className="icon">📂</span>
        <h3>Arrastra tus archivos DXF aquí</h3>
        <p>o haz clic para seleccionar desde tu computadora</p>
      </label>
    </div>
  );
};

export default FileUploader;