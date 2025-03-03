<script setup>
import { defineProps, ref, computed, watch } from "vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import Pagination from "./Pagination.vue";
import ArgonInput from "../../components/ArgonInput.vue";
// import ArgonSelect from "@/components/ArgonSelect.vue";

const { headers, rows, title, icons, fields, filters } = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  fields: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  icons: {
    type: Array,
    required: false,
    default: () => [],
  },
  filters: {
    type: Array,
    required: false,
    default: () => [],
  },
});

const emit = defineEmits(['filter-change']);
const search = ref('');
const itemsPerPage = ref(10);
const page = ref(1);

const getFieldValue = (obj, path) => {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

const tableHeaders = computed(() => {
  return headers.map((header, index) => ({
    title: header.text || header,
    key: Object.keys(fields)[index] || "actions",
    value: header.value || null,
    align: "start",
    sortable: false,
  }));
});

const allHeaders = computed(() => {
  const headers = [...tableHeaders.value];
  if (icons.length > 0) {
    headers.push({ title: "Acciones", key: "actions", sortable: false, align: "center" });
  }
  return headers;
});


const exportToPDF = (rows) => {
  const doc = new jsPDF();

  const tableColumn = headers.map((header) => header.text || header);

  const tableRows = rows.map((row) =>
    Object.keys(fields).map((field) => {
      const fieldConfig = fields[field];
      if (fieldConfig.showAvatar) {
        return getFieldValue(row, fieldConfig.main);
      }
      if (fieldConfig.sub) {
        return getFieldValue(row, fieldConfig.sub);
      }
      return getFieldValue(row, fieldConfig.value);
    })
  );

  doc.text(title || "Exportación de Tabla", 14, 15);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(`${title || "tabla"}.pdf`);
};

const exportToExcel = (rows) => {
  const tableHeaders = headers.map((header) => header.text || header);

  const tableRows = rows.map((row) =>
    Object.keys(fields).map((field) => {
      const fieldConfig = fields[field];
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

  XLSX.writeFile(workbook, `${title || "tabla"}.xlsx`);
};

const resetFilters = () => {
  console.log(filters);
  
  filters.forEach(filter => {
    filter.selectedOption = "";
    filter.value = "";
  });
  emit('filter-change', filters.value);
};

const customFilter = (value, search, item) => {
  if (!search) return true;

  const rawItem = item.raw;
  const searchTerm = search.toLowerCase();

  // Función recursiva para buscar en campos anidados
  const searchInObject = (obj, term) => {
    return Object.keys(obj).some(key => {
      const fieldValue = obj[key];
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        return searchInObject(fieldValue, term); // Búsqueda recursiva
      }
      return String(fieldValue).toLowerCase().includes(term);
    });
  };

  return searchInObject(rawItem, searchTerm);
};

watch(() => filters.value, (newFilters) => {
  emit('filter-change', newFilters);
}, { deep: true });

</script>

<template>
  <div class="row justify-content-space-between py-2" style="background: linear-gradient(to bottom right, rgb(255 255 255), rgb(213 213 213)); border-radius: 8px; padding: 10px;">
    <div class="justify-content-space-between py-2">
      <h2 v-if="title" class="text-xl font-semibold" style="color: #28a745;">{{ title }}</h2>
      <div class="py-2">
        <!-- Contenedor flex para alinear botones y filtros -->
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between w-100 gap-2">
          <!-- Botones y componente personalizado (lado izquierdo) -->
          <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- Slot para el componente personalizado -->
            <slot name="add-button"></slot>

            <!-- Botones de PDF y Excel -->
            <button class="btn btn-sm btn-icon btn-bg-white btn-active-color-green btn-active-bg-warning mx-lg-2 my-2"
              style="width: auto; padding-right: 1rem; padding-left: 1rem; background-color: white; min-width: 60px;"
              @click="exportToPDF(rows)">
              <i class="fas fa-file-pdf" style="color: red; font-size: 1.5rem;"></i>
            </button>
            <button class="btn btn-sm btn-icon btn-bg-white btn-active-color-alert btn-active-bg-warning my-2"
              style="width: auto; padding-right: 1rem; padding-left: 1rem; background-color: white; min-width: 60px;"
              @click="exportToExcel(rows)">
              <i class="fas fa-file-excel" style="color: green; font-size: 1.5rem;"></i>
            </button>
          </div>

          <!-- Filtros (lado derecho) -->
          <div v-if="filters.length > 0" class="col-12 col-md-7 card bg-white rounded-lg shadow-sm d-flex justify-content-center p-1">
            <div class="col-12 d-flex flex-wrap align-items-center gap-2">
              <span class="btn-reset" @click="resetFilters()">
                <i class="fas fa-rotate-left"></i>
              </span>
              <div v-for="(filter, index) in filters" :key="index" class="d-flex align-items-center">
                <div v-if="filter.type === 'date'" class="d-flex flex-nowrap align-items-center input-group-text filter-select-wrapper">
                  <input v-model="filter.selectedOption" type="date" class="form-control form-control-sm filter-select" />
                </div>
                <div v-else class="d-flex flex-nowrap align-items-center input-group-text filter-select-wrapper">
                  <select v-model="filter.selectedOption" class="form-select filter-select">
                    <option v-for="option in filter.options" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card bg-white rounded-lg shadow-sm ">
      <div class="d-flex justify-end">
        <div class="search-container">
          <ArgonInput v-model="search" placeholder="Buscar..." class="row input-search" IconDir="right" icon="fa-solid fa-magnifying-glass"/>
        </div>
      </div>
      <div class="card-body px-0 pt-0 pb-2">
        <div class="table-responsive p-0">
          <v-data-table v-model:items-per-page="itemsPerPage" v-model:page="page" :headers="allHeaders" :items="rows"
            :items-per-page-options="[5, 10, 25]" :search="search" :custom-filter="customFilter" class="elevation-1">
            <!-- Custom item slot -->
            <template v-slot:item="{ item }">
              <tr class="hover:bg-gray-50">
                <td v-for="(field, index) in Object.keys(fields)" :key="field">
                  <!-- Renderizar campos normales -->
                  <div v-if="index === 0 && fields[field].main" class="d-flex px-2 py-1">
                    <div v-if="fields[field].showAvatar">
                      <img :src="getFieldValue(item, fields[field].avatar) || '../../assets/img/team-2.jpg'"
                        class="avatar avatar-sm me-3 rounded-circle" alt="user" />
                    </div>
                    <div v-if="fields[field].main" class="d-flex flex-column justify-content-center">
                      <h6 class="mb-0 text-sm">
                        {{ getFieldValue(item, fields[field].main) }}
                      </h6>
                      <p v-if="fields[field].sub" class="text-xs text-secondary mb-0">
                        {{ getFieldValue(item, fields[field].sub) }}
                      </p>
                    </div>
                  </div>

                  <!-- Renderizar arreglos de manera especial -->
                  <div v-else-if="Array.isArray(getFieldValue(item, fields[field].value))" :class="fields[field].class || 'px-2 py-1'">
                    <div class="d-flex flex-wrap gap-1">
                      <div v-for="(value, idx) in getFieldValue(item, fields[field].value)" :key="idx"
                        class="badge text-dark rounded-pill p-2">
                        {{ value }}
                      </div>
                    </div>
                  </div>

                  <!-- Renderizar campos normales -->
                  <div v-else :class="fields[field].class || 'px-2 py-1'">
                    <span :class="fields[field].textClass || 'text-xs font-weight-bold'">
                      {{ getFieldValue(item, fields[field].value) }}
                    </span>
                  </div>
                </td>
                <td v-if="icons.length > 0" class="align-middle text-center text-sm">
                  <button v-for="(icon, index) in icons" :key="index"
                    @click="icon.method(item)"
                    class="btn btn-sm btn-icon btn-active-color-green mx-lg-2 my-2 px-3 py-2 btn-table">
                    <i :class="icon.class"></i>
                  </button>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template v-slot:no-data>
              <p class="text-center p-3">La tabla no tiene datos para mostrar</p>
            </template>

            <template v-slot:bottom="bottomProps">
              <Pagination class="py-2" :totalPages="bottomProps.pageCount" :currentPage="bottomProps.page"
                @page-change="page = $event" />
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #cbf1cd !important;
  color: #2b313b !important;
}

.badge:hover {
  background-color: #e5e7eb;
  cursor: default;
}

:deep(.v-data-table) {
  background: transparent !important;
  border-radius: 8px;
}

:deep(.v-data-table-footer) {
  background: transparent !important;
}

:deep(.v-data-table__wrapper) {
  background: transparent !important;
}

:deep(.v-data-table > .v-data-table__wrapper > table) {
  background: transparent !important;
  border-spacing: 0;
}

:deep(.v-data-table > .v-data-table__wrapper > table > tbody > tr > td) {
  border-bottom: none;
  padding: 12px 8px;
}

:deep(.v-data-table > .v-data-table__wrapper > table > thead > tr > th) {
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
  padding: 12px 8px;
  font-weight: 600;
}

:deep(.items-per-page-select) {
  width: 80px !important;
  margin-left: 8px;
}

:deep(.v-select__selection) {
  color: #6b7280;
}

:deep(.v-pagination__item) {
  background: transparent !important;
  color: #6b7280 !important;
}

:deep(.v-pagination__item--active) {
  background: #000 !important;
  color: #fff !important;
}

.avatar {
  width: 36px;
  height: 36px;
  object-fit: cover;
}

/* Hover effect for table rows */
:deep(tbody tr:hover) {
  background-color: #f9fafb;
}

.input-group-text {
  border: none;
  border-radius: 0%;
  border-left: #000 1px solid;
  padding: 0.25rem 0rem !important;
}

.form-select {
  border: none;
}

.input-group-sm .form-select, .input-group-sm .input-group-text {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-reset {
  cursor: pointer;
  padding: 0.5rem 1rem;
  margin: 0 1rem;
  border-radius: 8px;
  background-color: #28a745;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-reset:hover {
  background-color: #5ba86d;
  box-shadow: 0 4px 6px rgba(116, 192, 252, 0.2);
}

.btn-reset i {
  font-size: 1rem;
}

.filter-select {
  border-radius: 8px;
  padding: 0.5rem 1.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: #ffffff;
  color: #495057;
  cursor: pointer;
  appearance: none; /* Elimina el estilo por defecto del select */
  -webkit-appearance: none; /* Para navegadores basados en WebKit */
  -moz-appearance: none; /* Para Firefox */
  border: none; /* Añade un borde para que coincida con el select */
}

.filter-select:hover {
  border-color: #5ba86d;
  box-shadow: 0 0 0 2px rgba(116, 192, 252, 0.2);
}

.filter-select:focus {
  outline: none;
  border-color: #5ba86d;
  box-shadow: 0 0 0 3px rgba(116, 192, 252, 0.3);
}

/* Estilo para el ícono del select (opcional) */
.filter-select-wrapper {
  position: relative;
  display: inline-block;
}

.filter-select-wrapper::after {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  pointer-events: none;
  color: #5ba86d;
  font-size: 0.75rem;
}

.btn-table {
  cursor: pointer;
  border-radius: 8px;
  background-color: #28a745;
  color: white;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-table:hover {
  background-color: #5ba86d;
  box-shadow: 0 4px 6px rgba(116, 192, 252, 0.2);
}

.btn-table i {
  font-size: 3rem;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px; 
  border: none;
  padding: 0 !important;
  margin: 0.8rem;
  width: 100%;
  max-width: 50%;
  min-width: 300px;
}

.input-search {
  width: 100% !important;
  height: auto !important;
  margin: 0 !important;
}

@media (max-width: 768px) {
  .filter-select-wrapper {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .filter-select {
    width: 100%;
  }

  .btn-reset {
    width: 100%;
    display: flex;
    justify-content: center;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .search-container {
    max-width: 100%;
    min-width: auto;
  }
}

/* Estilos para los botones en pantallas pequeñas */
@media (max-width: 576px) {
  .btn-sm {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

</style>