import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPriceSimple } from './formatters';

export const exportToPdf = (data, title, columns) => {
  const doc = new jsPDF();
  doc.text(`Lista de ${title}`, 14, 10);

  const tableRows = data.map(item => columns.map(col => item[col]));

  autoTable(doc, {
    head: [columns],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [240, 126, 229] }
  });

  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175); 
  doc.text(`Generado el ${fecha}`, 14, doc.internal.pageSize.height - 20);
  doc.text("Sistema de Reservas — 2025", 14, doc.internal.pageSize.height - 14);

  doc.save(`${title}.pdf`);
};

export const exportReservaToPdf = (reserva, usuario) => {
  const doc = new jsPDF();
  
  // Header con logo/título principal
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185); // Azul profesional
  doc.text('HOTEL MANAGEMENT', 105, 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 73, 94);
  doc.text('Comprobante de Reserva', 105, 30, { align: 'center' });
  
  // Línea decorativa
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Calcular datos
  const fechaInicio = new Date(reserva.fecha_inicio + 'T00:00:00').toLocaleDateString('es-AR');
  const fechaFin = new Date(reserva.fecha_fin + 'T00:00:00').toLocaleDateString('es-AR');
  const noches = Math.ceil((new Date(reserva.fecha_fin + 'T00:00:00') - new Date(reserva.fecha_inicio + 'T00:00:00')) / (1000 * 60 * 60 * 24));
  
  // Crear tabla con información principal usando autoTable
  const tableData = [
    ['Número de Reserva:', `#${reserva.id}`],
    ['Habitación:', `#${reserva.habitacion?.numero_habitacion} - ${reserva.habitacion?.tipo || 'N/A'}`],
    ['Estado:', reserva.estado === 'confirmada' ? 'CONFIRMADA' : 'CANCELADA'],
    ['', ''], // Separador
    ['Cliente:', usuario?.nombre || 'N/A'],
    ['Email:', usuario?.email || 'N/A'], 
    ['DNI:', usuario?.documento_identidad || 'No especificado'],
    ['Teléfono:', usuario?.telefono || 'No especificado'],
    ['', ''], // Separador
    ['Check-in:', fechaInicio],
    ['Check-out:', fechaFin],
    ['Duración:', `${noches} noche${noches > 1 ? 's' : ''}`],
    ['Precio por noche:', formatPriceSimple(reserva.habitacion?.precio_noche || 0)],
  ];

  autoTable(doc, {
    body: tableData,
    startY: 45,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: { top: 4, right: 8, bottom: 4, left: 8 },
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { 
        fontStyle: 'bold',
        textColor: [52, 73, 94],
        cellWidth: 50,
      },
      1: {
        textColor: [44, 62, 80],
        cellWidth: 120,
      }
    },
    didParseCell: function(data) {
      // Separadores vacíos
      if (data.cell.text[0] === '') {
        data.cell.styles.fillColor = [248, 249, 250];
        data.cell.styles.minCellHeight = 8;
      }
      // Resaltar estado
      if (data.cell.text[0] === 'CONFIRMADA') {
        data.cell.styles.textColor = [39, 174, 96];
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.cell.text[0] === 'CANCELADA') {
        data.cell.styles.textColor = [231, 76, 60];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // Total destacado en caja
  const finalY = doc.lastAutoTable.finalY + 20;
  
  // Fondo para el total
  doc.setFillColor(41, 128, 185);
  doc.rect(20, finalY - 5, 170, 20, 'F');
  
  // Texto del total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAGADO:', 25, finalY + 7);
  doc.text(formatPriceSimple(reserva.total), 185, finalY + 7, { align: 'right' });
  
  // Pie de página simple
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFontSize(10);
  doc.setTextColor(149, 165, 166);
  doc.text('Sistema de Gestión Hotelera', 105, pageHeight - 15, { align: 'center' });
  
  // Guardar con nombre descriptivo
  const fileName = `Comprobante-Reserva-${reserva.id}.pdf`;
  doc.save(fileName);
};
