// src/geometryUtils.js

// Calcula el área de un polígono usando la fórmula de Shoelace (Gauss)
const calculatePolygonArea = (vertices) => {
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area / 2);
};

// Calcula el perímetro de un polígono sumando la distancia entre sus vértices
const calculatePolygonPerimeter = (vertices) => {
  let perimeter = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = vertices[i].x - vertices[j].x;
    const dy = vertices[i].y - vertices[j].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
};

/* export const analyzeDXFGeometry = (parsedDxf) => {
  let totalArea = 0;
  let totalPerimeter = 0;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let minY = Infinity;

  const entities = parsedDxf.entities || [];

  entities.forEach((entity) => {
    // Calcular Max/Min X y Y para todas las entidades
    if (entity.vertices) {
      entity.vertices.forEach((v) => {
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
      });
    }

    // Análisis de figuras cerradas para Área y Perímetro
    if ((entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') && entity.shape) {
      // entity.shape === true indica que la polilínea está cerrada
      totalArea += calculatePolygonArea(entity.vertices);
      totalPerimeter += calculatePolygonPerimeter(entity.vertices);
    } else if (entity.type === 'CIRCLE') {
      // Círculos son figuras cerradas por naturaleza
      const radius = entity.radius;
      totalArea += Math.PI * radius * radius;
      totalPerimeter += 2 * Math.PI * radius;

      // Actualizar límites con el círculo
      if (entity.center.x + radius > maxX) maxX = entity.center.x + radius;
      if (entity.center.y + radius > maxY) maxY = entity.center.y + radius;
      if (entity.center.x - radius < minX) minX = entity.center.x - radius;
      if (entity.center.y - radius < minY) minY = entity.center.y - radius;
    }
  });

  return {
    totalArea: totalArea > 0 ? totalArea : 0,
    totalPerimeter: totalPerimeter > 0 ? totalPerimeter : 0,
    maxX: maxX !== -Infinity ? maxX : 0,
    maxY: maxY !== -Infinity ? maxY : 0,
    minX: minX !== Infinity ? minX : 0,
    minY: minY !== Infinity ? minY : 0,
    entities
  };
}; */

export const analyzeDXFGeometry = (parsedDxf) => {
  let totalArea = 0;
  let totalPerimeter = 0;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let minY = Infinity;

  const entities = parsedDxf.entities || [];

  entities.forEach((entity) => {
    // 1. Calcular Max/Min X y Y para vértices estándar
    if (entity.vertices) {
      entity.vertices.forEach((v) => {
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
      });
    }

    // 2. Análisis de figuras cerradas y cálculo de límites para curvas
    if ((entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') && entity.shape) {
      totalArea += calculatePolygonArea(entity.vertices);
      totalPerimeter += calculatePolygonPerimeter(entity.vertices);

    } else if (entity.type === 'CIRCLE') {
      const radius = entity.radius;
      totalArea += Math.PI * radius * radius;
      totalPerimeter += 2 * Math.PI * radius;

      if (entity.center.x + radius > maxX) maxX = entity.center.x + radius;
      if (entity.center.y + radius > maxY) maxY = entity.center.y + radius;
      if (entity.center.x - radius < minX) minX = entity.center.x - radius;
      if (entity.center.y - radius < minY) minY = entity.center.y - radius;

    } else if (entity.type === 'ARC') {
      // Los arcos son abiertos, no suman área ni perímetro cerrado.
      // Calculamos los límites basados en su radio máximo para asegurar que quepan en el canvas.
      const radius = entity.radius;
      if (entity.center.x + radius > maxX) maxX = entity.center.x + radius;
      if (entity.center.y + radius > maxY) maxY = entity.center.y + radius;
      if (entity.center.x - radius < minX) minX = entity.center.x - radius;
      if (entity.center.y - radius < minY) minY = entity.center.y - radius;
    }
  });

  return {
    totalArea: totalArea > 0 ? totalArea : 0,
    totalPerimeter: totalPerimeter > 0 ? totalPerimeter : 0,
    maxX: maxX !== -Infinity ? maxX : 0,
    maxY: maxY !== -Infinity ? maxY : 0,
    minX: minX !== Infinity ? minX : 0,
    minY: minY !== Infinity ? minY : 0,
    entities
  };
};