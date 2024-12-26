export interface InventoryItem {
    // Equipment Data
    nombre: string
    centroFormacion: string
    categoria: string
    ubicacion: string
    numeroSerie: string
    fechaAdquisicion: string
    estado: string
    marca: string
    codigoInventario: string
    modelo: string
    cuentadante: string
    imagen?: File
  
    // Manufacturer Data
    fabricanteNombre: string
    fabricanteDireccion: string
    fabricanteTelefono: string
  
    // Provider Data
    proveedorNombre: string
    proveedorDireccion: string
    proveedorTelefono: string
  }
  
  