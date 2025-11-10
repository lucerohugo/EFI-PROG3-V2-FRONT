const onlyDigits = (s) => String(s || '').replace(/\D/g, '');

// DNI
const normalizeDNI = (s) => onlyDigits(s);
export const formatDNI = (s) => {
  const d = normalizeDNI(s);
  if (!d) return '';
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/(\d{1,3})(\d{1,3})/, '$1.$2');
  return d.replace(/(\d{1,3})(\d{3})(\d{3})$/, '$1.$2.$3');
};

// Celular AR
const normalizeCellAR = (s) => onlyDigits(s);
export const formatCellAR = (s) => {
  const digits = normalizeCellAR(s);
  if (!digits) return '';
  if (digits.startsWith('54')) {
    let rest = digits.slice(2);
    let pref = '+54 ';
    if (rest.startsWith('9')) { pref += '9 '; rest = rest.slice(1); }
    const area = rest.slice(0, 3);
    const num = rest.slice(3);
    if (num.length > 4) return `${pref}${area} ${num.slice(0, num.length - 4)}-${num.slice(-4)}`;
    return `${pref}${area} ${num}`;
  }
  if (digits.length >= 10) {
    const area = digits.slice(0, 3);
    const num = digits.slice(3);
    if (num.length > 4) return `${area} ${num.slice(0, num.length - 4)}-${num.slice(-4)}`;
    return `${area} ${num}`;
  }
  return digits;
};

// Formatear precios en pesos argentinos
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '$0';
  
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0';
  
  // Formatear con separador de miles y 2 decimales
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
  
  return formatted;
};

// Versión simple sin decimales para precios enteros
export const formatPriceSimple = (amount) => {
  if (!amount && amount !== 0) return '$0';
  
  const num = parseInt(amount);
  if (isNaN(num)) return '$0';
  
  // Separador de miles manual más simple
  return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
