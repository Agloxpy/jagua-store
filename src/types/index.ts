export interface Categoria {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  imagen_url?: string
  activo: boolean
  orden: number
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion?: string
  categoria_id?: string
  categoria?: Categoria
  precio_costo: number
  precio_venta: number
  imagenes: string[]
  tiene_variantes: boolean
  activo: boolean
  destacado: boolean
  variantes?: Variante[]
}

export interface Variante {
  id: string
  producto_id: string
  talle?: string
  color?: string
  color_hex?: string
  precio_costo?: number
  precio_venta?: number
  precio_oferta?: number
  oferta_activa?: boolean
  iva?: number
  stock: number
  activo: boolean
}

export interface Pedido {
  id: string
  numero_pedido: number
  cliente_nombre: string
  cliente_email?: string
  cliente_telefono?: string
  tipo_entrega: 'delivery' | 'retiro'
  direccion_entrega?: string
  ciudad_entrega?: string
  departamento_entrega?: string
  costo_envio: number
  metodo_pago: 'bancard' | 'transferencia' | 'efectivo'
  estado_pago: 'pendiente' | 'pagado' | 'rechazado'
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'
  subtotal: number
  total: number
  notas?: string
  es_venta_fisica: boolean
  created_at: string
  items?: PedidoItem[]
}

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id?: string
  variante_id?: string
  producto_nombre: string
  variante_talle?: string
  variante_color?: string
  precio_costo: number
  precio_venta: number
  cantidad: number
  subtotal: number
}

export interface PrecioEnvio {
  id: string
  departamento: string
  precio: number
  activo: boolean
}

export interface Banner {
  id: string
  titulo?: string
  subtitulo?: string
  imagen_url: string
  link?: string
  orden: number
  activo: boolean
}

export interface CartItem {
  producto: Producto
  variante?: Variante
  cantidad: number
}

export interface Oferta {
  id: string
  nombre: string
  slug: string
  imagenes: string[]
  precio_venta: number
  precio_oferta: number
  oferta_hasta?: string
  categoria?: Categoria
}

export interface PerfilCliente {
  id: string
  nombre?: string
  telefono?: string
  cedula?: string
  direccion?: string
  ciudad?: string
  departamento?: string
}
