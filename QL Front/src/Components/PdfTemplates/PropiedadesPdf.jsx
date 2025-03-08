/* eslint-disable react/prop-types */

import jsPDF from "jspdf";

const PropiedadesPDF = ({ property }) => {
  const generatePdf = async () => {
    const doc = new jsPDF();

    const logoUrl = '/assets/logoNegro.png'; // Asegúrate que la ruta sea correcta
    doc.addImage(logoUrl, 'PNG', 10, 10, 40, 20);

    doc.setFont("helvetica");
    doc.setFontSize(10);
    doc.text("Av. Cuba Nº 50", 90, 18);
    doc.setFontSize(9);
    doc.text("Tel:3835 5036166", 90, 22);

    const propertyType = property.type; // Asegúrate de que el campo tenga el nombre correcto
    if (property.type === "venta") {
      // Dibujar rectángulo rojo con texto blanco
      doc.setFillColor(255, 0, 0); // Rojo
      doc.rect(160, 15, 30, 10, "F"); // Rectángulo lleno en (x: 160, y: 18), ancho: 30, alto: 10
      doc.setTextColor(255, 255, 255); // Texto blanco
      doc.setFontSize(15);
      doc.text("VENTA", 167, 22); // Texto en el rectángulo
    } else if (propertyType === "alquiler") {
      // Dibujar rectángulo verde con texto blanco
      doc.setFillColor(0, 128, 0); // Verde
      doc.rect(160, 15, 30, 10, "F"); // Rectángulo lleno en (x: 160, y: 18), ancho: 30, alto: 10
      doc.setTextColor(255, 255, 255); // Texto blanco
      doc.setFontSize(9);
      doc.text("ALQUILER", 167, 22); // Texto en el rectángulo
    }
  
    doc.setTextColor(0, 0, 0);

    doc.line(10, 27, 200, 27);

    // Configuración inicial para imágenes
    let xPosition = 10; // Posición inicial en el eje X
    let yPosition = 30; // Posición inicial en el eje Y
    const imageWidth = 60; // Ancho de cada imagen
    const imageHeight = 40; // Alto de cada imagen
    const spaceBetweenImages = 5; // Espacio entre imágenes
    const pageWidth = 210; // Ancho de la página A4 en mm (en orientación vertical)
    let rowsOfImages = 1; // Número de filas de imágenes

    // Agregar imágenes desde las URLs
    if (property.images.length > 0) {
      for (let i = 0; i < property.images.length; i++) {
        const imageUrl = property.images[i];
        try {
          const img = await fetch(imageUrl)
            .then((res) => res.blob())
            .then((blob) => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
            });

          // Agregar imagen al PDF
          doc.addImage(img, "JPEG", xPosition, yPosition, imageWidth, imageHeight);

          // Incrementar posición X para la siguiente imagen
          xPosition += imageWidth + spaceBetweenImages;

          // Verificar si excede el ancho de la página y mover a la siguiente fila
          if (xPosition + imageWidth > pageWidth) {
            xPosition = 10; // Reiniciar posición X
            yPosition += imageHeight + spaceBetweenImages; // Mover a la siguiente fila
            rowsOfImages++; // Incrementar contador de filas
          }
        } catch (err) {
          console.error(`Error al cargar la imagen ${imageUrl}:`, err);
          doc.text(`Error al cargar la imagen: ${imageUrl}`, xPosition, yPosition);
          yPosition += 10;
        }
      }
    } else {
      doc.text("No hay imágenes disponibles", 10, 120);
    }

    // Calcular posición inicial del texto en función de las filas de imágenes
    const startYText = 10 + rowsOfImages * (imageHeight + spaceBetweenImages);

    // Agregar líneas de texto comenzando desde la posición calculada
    doc.text(`- Dirección: ${property.address}`, 10, startYText + 10);
    doc.text(`- Barrio: ${property.neighborhood}`, 10, startYText + 20);
    doc.text(`- Ciudad: ${property.city}`, 10, startYText + 30);
    doc.text(`- Precio: $${property.price}`, 10, startYText + 40);
    doc.text(`- Tipo: ${property.type}`, 10, startYText + 50);
    doc.text(`- Tipo de Propiedad: ${property.typeProperty}`, 10, startYText + 60);
    doc.text(`- Habitaciones: ${property.rooms || "N/A"}`, 10, startYText + 70);
    doc.text(`- Superficie Cubierta: ${property.superficieCubierta || "N/A"}`, 10, startYText + 80);
    doc.text(`- Superficie Total: ${property.SuperficieTotal || "N/A"}`, 10, startYText + 90);
    doc.text(`- Baños: ${property.bathrooms || "N/A"}`, 10, startYText + 100);
    doc.text(`- Descripción: ${property.description || "N/A"}`, 10, startYText + 110);

    // Descargar el PDF
    doc.save(`Propiedad-${property.propertyId}.pdf`);
  };

  return (
    <button onClick={generatePdf} className="bg-green-500 text-white px-3 py-1 rounded">
      Descargar PDF
    </button>
  );
};

export default PropiedadesPDF;

