// src/App.jsx
import { useState, useRef, useEffect } from 'react';
import DxfParser from 'dxf-parser';
import FileUploader from './FileUploader';
import { analyzeDXFGeometry } from './geometryUtils';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const canvasRefs = useRef({});

  const processFiles = async (files) => {
    setErrors([]);
    const parser = new DxfParser();
    const newResults = [];

    for (const file of files) {
      try {
        const fileContent = await file.text();
        const parsedData = parser.parseSync(fileContent);
        
        if (!parsedData || !parsedData.entities || parsedData.entities.length === 0) {
          throw new Error("El archivo no contiene geometría 2D válida o está vacío.");
        }

        const metrics = analyzeDXFGeometry(parsedData);
        newResults.push({
          filename: file.name,
          ...metrics
        });
      } catch (err) {
        setErrors((prev) => [...prev, `Error en ${file.name}: ${err.message}`]);
      }
    }
    setResults(newResults);
  };

  // Efecto para dibujar en los canvas cada vez que cambian los resultados
  useEffect(() => {
    results.forEach((res) => {
      const canvas = canvasRefs.current[res.filename];
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Limpiar canvas
      ctx.clearRect(0, 0, width, height);

      // Calcular escala y traslación para centrar el dibujo
      const dx = res.maxX - res.minX;
      const dy = res.maxY - res.minY;
      // Añadimos un pequeño margen (10%)
      const scale = Math.min(width / (dx || 1), height / (dy || 1)) * 0.9; 
      
      const offsetX = (width - dx * scale) / 2 - res.minX * scale;
      // Invertimos el eje Y porque en CAD el Y positivo es hacia arriba, en Canvas es hacia abajo
      const offsetY = height - (height - dy * scale) / 2 + res.minY * scale;

      ctx.save();
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 1.5;

/*       res.entities.forEach(entity => {
        if ((entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE' || entity.type === 'LINE') && entity.vertices) {
          ctx.beginPath();
          entity.vertices.forEach((v, i) => {
            const x = v.x * scale + offsetX;
            const y = offsetY - (v.y * scale);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          if (entity.shape) ctx.closePath();
          ctx.stroke();
        } else if (entity.type === 'CIRCLE') {
          ctx.beginPath();
          const x = entity.center.x * scale + offsetX;
          const y = offsetY - (entity.center.y * scale);
          const r = entity.radius * scale;
          ctx.arc(x, y, r, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }); */

      res.entities.forEach(entity => {
        if ((entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE' || entity.type === 'LINE') && entity.vertices) {
          ctx.beginPath();
          entity.vertices.forEach((v, i) => {
            const x = v.x * scale + offsetX;
            const y = offsetY - (v.y * scale);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          if (entity.shape) ctx.closePath();
          ctx.stroke();
          
        } else if (entity.type === 'CIRCLE') {
          ctx.beginPath();
          const x = entity.center.x * scale + offsetX;
          const y = offsetY - (entity.center.y * scale);
          const r = entity.radius * scale;
          ctx.arc(x, y, r, 0, 2 * Math.PI);
          ctx.stroke();
          
        } else if (entity.type === 'ARC') {
          // --- NUEVO BLOQUE PARA ARCOS ---
          ctx.beginPath();
          const x = entity.center.x * scale + offsetX;
          const y = offsetY - (entity.center.y * scale);
          const r = entity.radius * scale;
          
          // dxf-parser entrega los ángulos en radianes.
          // Al invertir el eje Y, debemos dibujar los ángulos en sentido antihorario (true) e invertidos con un negativo
          ctx.arc(x, y, r, -entity.startAngle, -entity.endAngle, true);
          ctx.stroke();
        }
      });
      ctx.restore();
    });
  }, [results]);

  return (
    <div className="app-container">
      <header>
        <h1>Visor y Analizador DXF</h1>
        <p>Calcula áreas, perímetros y visualiza la geometría 2D</p>
      </header>

      <main>
        <FileUploader onFilesSelected={processFiles} />

        {errors.length > 0 && (
          <div className="error-container">
            {errors.map((err, idx) => (
              <p key={idx} className="error-text">⚠️ {err}</p>
            ))}
          </div>
        )}

        <div className="results-grid">
          {results.map((res, index) => (
            <div key={index} className="result-card">
              <h3>{res.filename}</h3>
              <div className="canvas-container">
                <canvas 
                  ref={(el) => (canvasRefs.current[res.filename] = el)}
                  width={400} 
                  height={300}
                />
              </div>
              <div className="metrics">
                <p><strong>Área total (figuras cerradas):</strong> {res.totalArea.toFixed(2)} u²</p>
                <p><strong>Perímetro total (figuras cerradas):</strong> {res.totalPerimeter.toFixed(2)} u</p>
                <p><strong>Máximo en X:</strong> {res.maxX.toFixed(2)}</p>
                <p><strong>Máximo en Y:</strong> {res.maxY.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;