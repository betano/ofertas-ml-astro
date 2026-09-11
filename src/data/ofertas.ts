export interface Oferta {
  id: string;
  titulo: string;
  categoria: 'tecnologia' | 'hogar' | 'moda';
  imagen: string;
  precioOriginal: number;
  precioOferta: number;
  descuento: number;
  rating: number;
  reviews: number;
  vendidos: number;
  envioGratis: boolean;
  cuotas: string;
  etiqueta?: 'OFERTA RELAMPAGO' | 'MAS VENDIDO' | 'NUEVO';
  linkAfiliado: string;
}

export const categorias = [
  { id: 'todas', nombre: 'Todas las ofertas', icono: 'Grid3X3' },
  { id: 'tecnologia', nombre: 'Tecnologia', icono: 'Smartphone' },
  { id: 'hogar', nombre: 'Hogar', icono: 'Home' },
  { id: 'moda', nombre: 'Moda', icono: 'Shirt' },
];

export const ofertas: Oferta[] = [
  {
    id: 'smart-tv-55-4k',
    titulo: 'Smart TV 55 pulgadas 4K UHD con HDR',
    categoria: 'tecnologia',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_2X_630987-MLA79862518456_102024-F.webp',
    precioOriginal: 899999,
    precioOferta: 629999,
    descuento: 30,
    rating: 4.8,
    reviews: 1240,
    vendidos: 5000,
    envioGratis: true,
    cuotas: '12 cuotas sin interes',
    etiqueta: 'OFERTA RELAMPAGO',
    linkAfiliado: 'https://listado.mercadolibre.com.ar/smart-tv-55-4k',
  },
  {
    id: 'auriculares-bluetooth',
    titulo: 'Auriculares Bluetooth con cancelacion de ruido',
    categoria: 'tecnologia',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_2X_822788-MLA79787933663_102024-F.webp',
    precioOriginal: 129999,
    precioOferta: 89999,
    descuento: 31,
    rating: 4.7,
    reviews: 892,
    vendidos: 3000,
    envioGratis: true,
    cuotas: '6 cuotas sin interes',
    etiqueta: 'MAS VENDIDO',
    linkAfiliado: 'https://listado.mercadolibre.com.ar/auriculares-bluetooth',
  },
  {
    id: 'cafetera-espresso',
    titulo: 'Cafetera espresso automatica con espumador',
    categoria: 'hogar',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_2X_965370-MLA79856353676_102024-F.webp',
    precioOriginal: 249999,
    precioOferta: 174999,
    descuento: 30,
    rating: 4.6,
    reviews: 436,
    vendidos: 1200,
    envioGratis: true,
    cuotas: '9 cuotas sin interes',
    linkAfiliado: 'https://listado.mercadolibre.com.ar/cafetera-espresso',
  },
  {
    id: 'zapatillas-running',
    titulo: 'Zapatillas running livianas para entrenamiento',
    categoria: 'moda',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_2X_874425-MLA79837985303_102024-F.webp',
    precioOriginal: 119999,
    precioOferta: 77999,
    descuento: 35,
    rating: 4.9,
    reviews: 2100,
    vendidos: 8000,
    envioGratis: true,
    cuotas: '6 cuotas sin interes',
    etiqueta: 'MAS VENDIDO',
    linkAfiliado: 'https://listado.mercadolibre.com.ar/zapatillas-running',
  },
];

export function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio);
}
