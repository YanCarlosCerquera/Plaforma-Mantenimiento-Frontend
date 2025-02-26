<script setup>
import { defineProps, defineEmits, ref, computed, watch } from "vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import Pagination from "./Pagination.vue";
import Swal from 'sweetalert2';

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  fields: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  filters: {
    type: Boolean,
    required: false,
    default: false,
  },
  filterOptions: {
    type: Array,
    required: false,
    default: () => [],
  },
  icons: {
    type: Object,
    required: false,
    default: () => ({ firstIcon: "fas fa-check", secondIcon: "fas fa-trash" }),
  }
});

const emit = defineEmits(["edit", "delete", "view", "filter-change", "download"]);
const itemsPerPage = ref(10); // Cambia el valor inicial si es necesario
const page = ref(1);

// Calcular el número total de páginas
const totalPages = computed(() => {
  return Math.ceil(filteredRows.value.length / itemsPerPage.value);
});

// Manejar el cambio de página
const handlePageChange = (newPage) => {
  page.value = newPage;
};

const activeFilters = ref({});
const activeFilterField = ref(null);
const tableData = ref([]);
const isMobile = ref(window.innerWidth <= 768);



// Detectar cambios en el tamaño de la ventana
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768;
});

// Manejar expansión/contracción de acordeón
const toggleFilter = (field) => {
  if (activeFilterField.value === field) {
    activeFilterField.value = null;
  } else {
    activeFilterField.value = field;
  }
};

const isFilterActive = (field) => {
  return activeFilters.value[field]?.length > 0;
};

// Inicializar los filtros
props.filterOptions?.forEach(filter => {
  activeFilters.value[filter.field] = [];
});

// Vigilar cambios en rows y actualizar tableData
watch(() => props.rows, (newRows) => {
  if (Array.isArray(newRows)) {
    tableData.value = [...newRows];
    // Resetear a la primera página cuando cambian los datos
    page.value = 1;
  }
}, { immediate: true, deep: true });

// Reiniciar página cuando cambian los filtros
watch(activeFilters, () => {
  page.value = 1;
}, { deep: true });

const getFieldValue = (obj, path) => {
  if (!obj || !path) return "";
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

const tableHeaders = computed(() => {
  return props.headers.map((header, index) => ({
    title: header.text || header,
    key: Object.keys(props.fields)[index] || "actions",
    value: header.value || null,
    align: "start",
  }));
});

const allHeaders = computed(() => [
  ...tableHeaders.value,
  { title: "Acciones", key: "actions", sortable: false, align: "center" },
]);

// Filtrar las filas según los filtros activos
const filteredRows = computed(() => {
  let result = tableData.value;
  
  Object.entries(activeFilters.value).forEach(([field, selectedValues]) => {
    if (selectedValues && selectedValues.length > 0) {
      result = result.filter(row => {
        const value = getFieldValue(row, field);
        return selectedValues.includes(value);
      });
    }
  });
  
  return result;
});

// Obtener las filas de la página actual
const paginatedRows = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRows.value.slice(start, end);
});

const handleEdit = (row) => {
  emit("edit", row);
};

const handleDelete = (row) => {
  emit("delete", row.id || row._id);
};

const handleView = (row) => {
  emit("view", row);
};

const handleDownload = (row) => {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Añadir logo del SENA
    const imgData = 'https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png'; // Asegúrate de que la ruta sea correcta
    doc.addImage(imgData, 'JPEG', 14, 10, 30, 30);
    
    // Configurar el título principal
    doc.setFontSize(20);
    doc.setTextColor(57, 169, 0); // Verde SENA
    doc.text('SENA', 170, 20, { align: 'right' });
    doc.setFontSize(12);
    doc.setTextColor(128, 128, 128);
    doc.text('Centro de Formación', 170, 27, { align: 'right' });
    
    // Línea separadora
    doc.setDrawColor(57, 169, 0);
    doc.setLineWidth(0.5);
    doc.line(14, 45, 196, 45);
    
    // Título del reporte
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(props.title || 'Detalles', 14, 60);
    
    // Fecha y hora del reporte
    const now = new Date();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Fecha: ${now.toLocaleDateString('es-ES')}`, 196, 60, { align: 'right' });
    doc.text(`Hora: ${now.toLocaleTimeString('es-ES')}`, 196, 66, { align: 'right' });
    
    // Convertir los datos de la fila en un formato tabular
    const data = Object.entries(props.fields).map(([key, field]) => {
      let value = '';
      if (field.value) {
        value = field.value.split('.').reduce((obj, key) => obj?.[key], row) || '';
        // Formatear fechas si el valor parece una fecha
        if (value && !isNaN(Date.parse(value))) {
          value = new Date(value).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        }
      }
      const headerIndex = Object.keys(props.fields).indexOf(key);
      const header = props.headers[headerIndex];
      
      return [header, value];
    });

    // Generar la tabla con mejor formato
    doc.autoTable({
      startY: 75,
      head: [['Campo', 'Valor']],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [57, 169, 0],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 8
      },
      bodyStyles: {
        fontSize: 11,
        textColor: [60, 60, 60],
        cellPadding: 8
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 'auto' }
      },
      margin: { top: 80 },
      didDrawPage: function(data) {
        // Pie de página
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          'Documento generado automáticamente por el Sistema de Gestión de Mantenimiento',
          pageSize.width / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          `Página ${data.pageNumber}`,
          pageSize.width - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });

    // Descargar el PDF con un nombre más descriptivo
    const firstValue = Object.values(row)[0] || 'documento';
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`${props.title || 'detalle'}-${firstValue}-${timestamp}.pdf`);

  } catch (error) {
    console.error("Error al generar el PDF:", error);
    // Mostrar mensaje de error al usuario
    Swal.fire({
      title: "Error al generar el PDF",
      text: "No se pudo generar el documento PDF",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
  }
};

const resetFilters = () => {
  Object.keys(activeFilters.value).forEach(key => {
    activeFilters.value[key] = [];
  });
  emit('filter-change', activeFilters.value);
};

/* const toggleFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value;
};
 */
const exportToPDF = () => {
  const doc = new jsPDF();

  const tableColumn = props.headers.map((header) => header.text || header);

  const tableRows = filteredRows.value.map((row) =>
    Object.keys(props.fields).map((field) => {
      const fieldConfig = props.fields[field];
      if (fieldConfig.showAvatar) {
        return getFieldValue(row, fieldConfig.main);
      }
      if (fieldConfig.sub) {
        return getFieldValue(row, fieldConfig.sub);
      }
      return getFieldValue(row, fieldConfig.value);
    })
  );

  doc.text(props.title || "Exportación de Tabla", 14, 15);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(`${props.title || "tabla"}.pdf`);
};

const exportToExcel = () => {
  const tableHeaders = props.headers.map((header) => header.text || header);

  const tableRows = filteredRows.value.map((row) =>
    Object.keys(props.fields).map((field) => {
      const fieldConfig = props.fields[field];
      if (fieldConfig.showAvatar) {
        return getFieldValue(row, fieldConfig.main);
      }
      if (fieldConfig.sub) {
        return getFieldValue(row, fieldConfig.sub);
      }
      return getFieldValue(row, fieldConfig.value);
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([tableHeaders, ...tableRows]);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

  XLSX.writeFile(workbook, `${props.title || "tabla"}.xlsx`);
};


</script>

<template>
  <div class="card-custom">
    <div class="card-header-custom">
      <h3 class="card-title" v-if="props.title">{{ props.title }}</h3>
      <div class="card-toolbar">
        <!-- Botones de exportación -->
        <div class="export-buttons">
          <button 
            class="btn-custom btn-export"
            @click="exportToPDF"
            title="Exportar a PDF"
          >
            <i class="fas fa-file-pdf"></i>
            <span>PDF</span>
          </button>
          <button 
            class="btn-custom btn-export"
            @click="exportToExcel"
            title="Exportar a Excel"
          >
            <i class="fas fa-file-excel"></i>
            <span>Excel</span>
          </button>
        </div>

        <!-- Filtros -->
        <div v-if="props.filters && props.filterOptions?.length" class="horizontal-filters">
      <div class="filters-wrapper">
        <div v-for="filter in props.filterOptions" :key="filter.field" class="filter-item">
          <button 
            class="filter-button" 
            :class="{ 'active': activeFilterField === filter.field, 'has-value': isFilterActive(filter.field) }"
            @click="toggleFilter(filter.field)"
          >
            <i class="fas fa-filter"></i>
            <span>{{ filter.label }}</span>
            <i class="fas fa-chevron-down"></i>
            <span v-if="isFilterActive(filter.field)" class="filter-indicator"></span>
          </button>

          <!-- Dropdown Menu -->
          <div v-show="activeFilterField === filter.field" class="filter-dropdown">
            <div class="filter-options">
              <template v-if="filter.type === 'select'">
                <div v-for="option in filter.options" :key="option" class="filter-option">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      :checked="activeFilters[filter.field].includes(option)"
                      @change="
                        $event.target.checked
                          ? activeFilters[filter.field].push(option)
                          : activeFilters[filter.field] = activeFilters[filter.field].filter(v => v !== option)
                      "
                    >
                    {{ option }}
                  </label>
                </div>
              </template>
            </div>
          </div>
        </div>
        </div>
      </div>

        <button v-if="Object.values(activeFilters).some(f => f.length)" 
                @click="resetFilters" 
                class="reset-button">
          <i class="fas fa-sync-alt"></i>
          <span>Resetear filtros</span>
        </button>
      </div>
    </div>

    <!-- Vista móvil (acordeón) -->
    <div v-if="isMobile" class="accordion-container">
      <div v-for="(item, index) in paginatedRows" :key="index" class="accordion-item">
        <!-- Cabecera del acordeón -->
        <div class="accordion-header" @click="toggleItem(index)">
          <div class="accordion-title">
            <div v-if="props.fields[Object.keys(props.fields)[0]].showAvatar" class="avatar-container">
              <img
                :src="getFieldValue(item, props.fields[Object.keys(props.fields)[0]].avatar) || '../../assets/img/team-2.jpg'"
                class="avatar-img"
                alt="user"
              />
            </div>
            <span class="main-text">{{ getFieldValue(item, props.fields[Object.keys(props.fields)[0]].main) }}</span>
          </div>
          <i :class="isItemExpanded(index) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </div>
        
        <!-- Contenido del acordeón -->
        <div v-if="isItemExpanded(index)" class="accordion-content">
          <div v-for="(field, fieldKey) in props.fields" :key="fieldKey" class="accordion-row">
            <div class="accordion-label">{{ props.headers[Object.keys(props.fields).indexOf(fieldKey)].text }}</div>
            <div class="accordion-value">
              {{ getFieldValue(item, field.value || field.main) }}
            </div>
          </div>
          <!-- Botones de acción -->
          <div class="accordion-actions">
            <button @click="handleEdit(item)" class="btn-action edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="handleDelete(item)" class="btn-action delete">
              <i class="fas fa-trash"></i>
            </button>
            <button @click="handleView(item)" class="btn-action view">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="handleDownload(item)" class="btn-action download">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista desktop (tabla) -->
    <div v-else class="table-container">
      <table class="table align-items-center mb-0">
        <thead>
          <tr>
            <th
              v-for="header in allHeaders"
              :key="header.key"
              class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              :class="header.align === 'end' ? 'text-end' : ''"
              style="color: #000000 !important;"
            >
              {{ header.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedRows" :key="index" class="table-row">
            <td v-for="(field, fieldKey) in props.fields" :key="fieldKey">
              <!-- Celda con avatar y texto principal -->
              <div v-if="field.main" class="cell-with-avatar">
                <div v-if="field.showAvatar" class="avatar-container">
                  <img
                    :src="getFieldValue(item, field.avatar) || '../../assets/img/team-2.jpg'"
                    class="avatar-img"
                    alt="user"
                  />
                </div>
                <div class="cell-content">
                  <span class="main-text">{{ getFieldValue(item, field.main) }}</span>
                  <span v-if="field.sub" class="sub-text">
                    {{ getFieldValue(item, field.sub) }}
                  </span>
                </div>
              </div>
              <!-- Celda normal -->
              <div v-else class="cell-content">
                <span :class="field.textClass || 'regular-text'">
                  {{ getFieldValue(item, field.value) }}
                </span>
              </div>
            </td>
            <!-- Columna de acciones -->
            <td class="actions-cell">
              <div class="actions-container">
                <button @click="handleEdit(item)" class="btn-action edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="handleDelete(item)" class="btn-action delete">
                  <i class="fas fa-trash"></i>
                </button>
                <button @click="handleView(item)" class="btn-action view">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="handleDownload(item)" class="btn-action download">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="allHeaders.length" class="text-center py-4">
              No hay datos disponibles
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="card-footer d-flex justify-content-between align-items-center px-4 py-3">
      <div class="text-muted">
        Mostrando {{ filteredRows.length === 0 ? 0 : (page - 1) * itemsPerPage + 1 }} 
        a {{ Math.min(page * itemsPerPage, filteredRows.length) }} 
        de {{ filteredRows.length }} registros
      </div>
      <Pagination
        :totalPages="totalPages"
        :currentPage="page"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.horizontal-filters {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
}

.filters-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  position: relative;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-button:hover {
  background-color: #f9fafb;
}

.filter-button.active {
  border-color: #3b82f6;
  background-color: #eff6ff;
  color: #3b82f6;
}

.filter-button.has-value {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.filter-indicator {
  width: 6px;
  height: 6px;
  background-color: #3b82f6;
  border-radius: 50%;
  position: absolute;
  top: -2px;
  right: -2px;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
}

.filter-options {
  padding: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
}

.filter-option {
  padding: 0.375rem 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
}

.reset-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #fee2e2;
  border-radius: 0.375rem;
  background-color: #fff1f0;
  color: #ef4444;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background-color: #fee2e2;
}

.card-custom {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: visible !important;
}

.card-header-custom {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.card-title {
  font-size: 1.25rem;
  color: #000000;
  font-weight: 600;
  margin: 0;
}

.card-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-custom {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-export {
  background-color: #f8f9fa;
  color: #6c757d;
}

.btn-export:hover {
  background-color: #e9ecef;
  color: #495057;
}

.btn-filter {
  background-color: #eef3ff;
  color: #3b82f6;
}

.btn-filter:hover {
  background-color: #dbeafe;
}

.btn-reset {
  background-color: #fff1f0;
  color: #ef4444;
}

.btn-reset:hover {
  background-color: #fee2e2;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1rem;
  background: white;
  position: relative;
  z-index: 1;
}

.table {
  min-width: 750px; /* Ancho mínimo para asegurar legibilidad */
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.cell-with-avatar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
}

.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cell-content {
  display: flex;
  flex-direction: column;
}

.main-text {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.sub-text {
  color: #000000;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.regular-text {
  color: #000000;
  font-size: 0.875rem;
}

.actions-cell {
  padding: 0.75rem 1rem;
}

.actions-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-action.edit {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.btn-action.edit:hover {
  background-color: #3b82f6;
  color: white;
}

.btn-action.delete {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-action.delete:hover {
  background-color: #ef4444;
  color: white;
}

.btn-action.view {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.btn-action.view:hover {
  background-color: #10b981;
  color: white;
}

.btn-action.download {
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.btn-action.download:hover {
  background-color: #8b5cf6;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.pagination-wrapper {
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.custom-pagination {
  display: flex;
  gap: 0.25rem;
}

.filter-section {
  position: relative;
  display: inline-block;
}

.filter-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1050;
  min-width: 250px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin-top: 0.5rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #344767;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #344767;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Estilos para el botón de filtros */
.btn-filter {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  color: #344767;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-filter:hover {
  background-color: #f8f9fa;
}

.filter-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Asegurar que el menú de filtros esté siempre visible */
.card-custom {
  overflow: visible !important;
}

.table-container {
  overflow-x: auto;
  position: relative;
  z-index: 1;
}

.filter-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1050; /* Aumentar el z-index para asegurar que esté por encima de otros elementos */
}

/* Estilos responsivos para diferentes tamaños de pantalla */
@media (max-width: 768px) {
  .cell-with-avatar {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .avatar-container {
    width: 32px;
    height: 32px;
  }

  .main-text {
    font-size: 0.8rem;
  }

  .sub-text {
    font-size: 0.7rem;
  }

  .actions-container {
    gap: 0.25rem;
  }

  .btn-action {
    width: 28px;
    height: 28px;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 576px) {
  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
  }

  .pagination-wrapper {
    width: 100%;
    justify-content: center;
  }
}

/* Ajustes para mejorar la visualización en dispositivos móviles */
@media (hover: none) {
  .table-row:hover {
    background-color: inherit;
  }

  .btn-action {
    padding: 0.5rem;
  }
}

/* Mantener el scroll horizontal visible en iOS */
.table-container::-webkit-scrollbar {
  -webkit-appearance: none;
  height: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .3);
}

.table-container::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, .1);
}

/* Estilos para el acordeón móvil */
.accordion-container {
  padding: 0.5rem;
}

.accordion-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  background: white;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: #f9fafb;
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.accordion-content {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.accordion-row {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.accordion-label {
  font-weight: 600;
  color: #000000;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.accordion-value {
  color: #4b5563;
  font-size: 0.875rem;
}

.accordion-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Ocultar tabla en móvil y acordeón en desktop */
@media (max-width: 768px) {
  .table-container {
    display: none;
  }
}

@media (min-width: 769px) {
  .accordion-container {
    display: none;
  }
}
</style>
