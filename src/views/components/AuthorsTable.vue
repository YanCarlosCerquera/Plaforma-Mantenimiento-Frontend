<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Pagination from "./Pagination.vue";
import ArgonInput from "../../components/ArgonInput.vue";

export default {
  components:{
    ArgonInput,
    Pagination,
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    fields: {
      type: Object,
      required: true
    },
    headers: {
      type: Array,
      required: true
    },
    rows: {
      type: Array,
      required: true
    },
    icons: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Array,
      default: () => []
    },
    searchOption: {
      type: Boolean,
      default: true
    },
    exportOption: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      search: '',
      page: 1,
      itemsPerPage: 10,
      activeAccordion: null
    }
  },
  computed: {
    shouldShowSearch() {
    return this.searchOption;
  },
  shouldShowExport() {
    return this.exportOption;
  },
    tableHeaders()  {
      return this.headers.map((header, index) => ({
        title: header.text || header,
        key: Object.keys(this.fields)[index] || "actions",
        value: header.value || null,
        align: "start",
        sortable: false,
      }));
    },
    allHeaders() {
      const headers = [...this.tableHeaders];
      if (this.icons.length > 0) {
        headers.push({ title: "Acciones", key: "actions", sortable: false, align: "center" });
      }
      return headers;
    },
    filteredRows() {
      if (!this.search) return this.rows;
      
      return this.rows.filter(item => {
        return Object.keys(this.fields).some(field => {
          const value = this.getFieldValue(item, this.fields[field].value);
          if (value === null || value === undefined) return false;
          
          if (Array.isArray(value)) {
            return value.some(v => String(v).toLowerCase().includes(this.search.toLowerCase()));
          }
          
          return String(value).toLowerCase().includes(this.search.toLowerCase());
        });
      });
    },
    paginatedRows() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRows.slice(start, end);
    }
  },
  methods: {
    getFieldValue(item, path) {
      if (!path) return '';
      
      if (typeof path === 'function') {
        return path(item);
      }
      
      const keys = path.split('.');
      let value = item;
      
      for (const key of keys) {
        if (value === null || value === undefined) return '';
        value = value[key];
      }
      
      return value;
    },
    exportToPDF(rows) {
      const doc = new jsPDF();

      const tableColumn = this.allHeaders.map((header) => header.title);

      const tableRows = rows.map((row) =>
        Object.keys(this.fields).map((field) => {
          const fieldConfig = this.fields[field];
          if (fieldConfig.showAvatar) {
            return this.getFieldValue(row, fieldConfig.main);
          }
          if (fieldConfig.sub) {
            return this.getFieldValue(row, fieldConfig.sub);
          }
          return this.getFieldValue(row, fieldConfig.value);
        })
      );

      doc.text(this.title || "Exportación de Tabla", 14, 15);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`${this.title || "tabla"}.pdf`);
    },
    exportToExcel(rows) {
      const tableHeaders = this.allHeaders.map((header) => header.title);

      const tableRows = rows.map((row) =>
        Object.keys(this.fields).map((field) => {
          const fieldConfig = this.fields[field];
          if (fieldConfig.showAvatar) {
            return this.getFieldValue(row, fieldConfig.main);
          }
          if (fieldConfig.sub) {
            return this.getFieldValue(row, fieldConfig.sub);
          }
          return this.getFieldValue(row, fieldConfig.value);
        })
      );

      const worksheet = XLSX.utils.aoa_to_sheet([tableHeaders, ...tableRows]);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

      XLSX.writeFile(workbook, `${this.title || "tabla"}.xlsx`);
    },
    resetFilters() {
      this.filters.forEach(filter => {
        filter.selectedOption = '';
      });
    },
    customFilter(value, search, item) {
      if (!search) return true;
      const searchTerm = search.toLowerCase();
      const searchInObject = (obj) => {
        return Object.keys(obj).some(key => {
          const fieldValue = obj[key];
          if (typeof fieldValue === 'object' && fieldValue !== null) {
            return searchInObject(fieldValue); // Búsqueda recursiva
          }
          return String(fieldValue).toLowerCase().includes(searchTerm);
        });
      };

      return searchInObject(item);
    },
    toggleAccordion(index) {
      this.activeAccordion = this.activeAccordion === index ? null : index;
    },
    getMainField() {
      const mainField = Object.keys(this.fields).find(key => this.fields[key].main);
      return mainField || Object.keys(this.fields)[0];
    }
  }
}
</script>

<template>
  <div class="row justify-content-space-between py-2" style="border-radius: 8px; padding: 10px;">
    <div class="justify-content-space-between py-2">
      <h2 v-if="title" class="text-xl font-semibold" style="color: #fff;">{{ title }}</h2>
      <div class="py-2">
        <!-- Contenedor flex para alinear botones y filtros -->
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between w-100 gap-2">
          <!-- Botones y componente personalizado (lado izquierdo) -->
          <slot name="componentes-extra"></slot> 
          <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- Slot para el componente personalizado -->
            <slot name="add-button"></slot>

            <!-- Botones de PDF y Excel -->
            <button v-if="shouldShowExport" class="btn btn-sm btn-icon btn-bg-white btn-active-color-green btn-active-bg-warning mx-lg-2 my-2"
              style="width: auto; padding-right: 1rem; padding-left: 1rem; background-color: white; min-width: 60px;"
              @click="exportToPDF(rows)">
              <i class="fas fa-file-pdf" style="color: red; font-size: 1.5rem;"></i>
            </button>
            <button v-if="shouldShowExport" class="btn btn-sm btn-icon btn-bg-white btn-active-color-alert btn-active-bg-warning my-2"
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
    <div class="card bg-white rounded-lg shadow-sm">
      <div class="d-flex justify-end">
        <div v-if="shouldShowSearch" class="search-container">
          <ArgonInput v-model="search" placeholder="Buscar..." class="row input-search" IconDir="right" icon="fa-solid fa-magnifying-glass"/>
        </div>
      </div>
      <div class="card-body px-0 pt-0 pb-2">
        <!-- Vista de tabla para pantallas medianas y grandes -->
        <div class="table-responsive p-0 d-none d-md-block">
          <v-data-table v-model:items-per-page="itemsPerPage" v-model:page="page" :headers="allHeaders" :items="rows"
            :items-per-page-options="[5, 10, 25]" :search="search" :custom-filter="customFilter" class="elevation-1">
            <!-- Custom item slot -->
            <template v-slot:item="{ item }">
              <tr class="hover:bg-gray-50">
                <td v-for="(field, index) in Object.keys(fields)" :key="field">
                  <!-- Renderizamos el campo principal con avatar y demás -->
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

                  <!-- Renderizamos arreglos de manera especial -->
                  <div v-else-if="Array.isArray(getFieldValue(item, fields[field].value))" :class="fields[field].class || 'px-2 py-1'">
                    <div class="d-flex flex-wrap gap-1">
                      <div v-for="(value, idx) in getFieldValue(item, fields[field].value)" :key="idx"
                        class="badge text-dark rounded-pill p-2">
                        {{ value }}
                      </div>
                    </div>
                  </div>

                  <!-- Renderizamos campos normales aplicando el formatter si existe -->
                  <div v-else :class="fields[field].class || 'px-2 py-1'">
                    <span v-if="fields[field].formatter" 
                          :class="fields[field].textClass || 'text-xs font-weight-bold'" 
                          v-html="fields[field].formatter(getFieldValue(item, fields[field].value))">
                    </span>
                    <span v-else :class="fields[field].textClass || 'text-xs font-weight-bold'">
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

        <!-- Vista de acordeón para pantallas pequeñas -->
        <div class="accordion-container d-md-none">
          <div v-if="filteredRows.length === 0" class="text-center p-3">
            La tabla no tiene datos para mostrar
          </div>
          <div v-else>
            <div v-for="(item, itemIndex) in paginatedRows" :key="itemIndex" class="accordion-item mb-3">
              <div class="accordion-header" @click="toggleAccordion(itemIndex)">
                <div class="d-flex justify-content-between align-items-center p-3">
                  <div class="d-flex align-items-center">
                    <div v-if="fields[getMainField()].showAvatar">
                      <img :src="getFieldValue(item, fields[getMainField()].avatar) || '../../assets/img/team-2.jpg'"
                          class="avatar avatar-sm me-3 rounded-circle" alt="user" />
                    </div>
                    <div>
                      <h6 class="mb-0 text-sm">
                        {{ getFieldValue(item, fields[getMainField()].main || fields[getMainField()].value) }}
                      </h6>
                      <p class="text-xs text-secondary mb-0" v-if="fields[getMainField()].sub">
                        {{ getFieldValue(item, fields[getMainField()].sub) }}
                      </p>
                    </div>
                  </div>
                  <i :class="activeAccordion === itemIndex ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </div>
              </div>
              <div class="accordion-content" :class="{ 'active': activeAccordion === itemIndex }">
                <div class="p-3">
                  <div v-for="(field, fieldIndex) in Object.keys(fields)" :key="fieldIndex" class="mb-2">
                    <!-- Omitir el campo principal que ya se muestra en el encabezado -->
                    <template v-if="fieldIndex !== 0 || !fields[field].main">
                      <div class="d-flex flex-column">
                        <strong class="text-xs text-uppercase">{{ allHeaders.find(h => h.key === field)?.title || field }}</strong>
                        <!-- Renderizar arreglos -->
                        <div v-if="Array.isArray(getFieldValue(item, fields[field].value))" class="mt-1">
                          <div class="d-flex flex-wrap gap-1">
                            <div v-for="(value, idx) in getFieldValue(item, fields[field].value)" :key="idx"
                              class="badge text-dark rounded-pill p-2">
                              {{ value }}
                            </div>
                          </div>
                        </div>
                        <!-- Renderizar valores normales aplicando el formatter si existe -->
                        <div v-else class="mt-1">
                          <span v-if="fields[field].formatter" 
                                :class="fields[field].textClass || 'text-xs font-weight-bold'" 
                                v-html="fields[field].formatter(getFieldValue(item, fields[field].value))">
                          </span>
                          <span v-else :class="fields[field].textClass || 'text-xs font-weight-bold'">
                            {{ getFieldValue(item, fields[field].value) }}
                          </span>
                        </div>
                      </div>
                    </template>
                  </div>
                  
                  <!-- Botones de acción -->
                  <div v-if="icons.length > 0" class="d-flex flex-wrap gap-2 mt-3">
                    <button v-for="(icon, iconIndex) in icons" :key="iconIndex"
                      @click="icon.method(item)"
                      class="btn btn-sm btn-icon btn-active-color-green px-3 py-2 btn-table">
                      <i :class="icon.class"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Paginación para el acordeón -->
            <Pagination class="py-2" :totalPages="Math.ceil(filteredRows.length / itemsPerPage)" :currentPage="page"
              @page-change="page = $event" />
          </div>
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
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: none;
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
  font-size: 1.2rem;
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

/* Acordeón y responsive */
.accordion-container {
  padding: 0 1rem;
}

.accordion-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.accordion-header {
  cursor: pointer;
  background-color: #f9fafb;
  transition: background-color 0.3s ease;
}

.accordion-header:hover {
  background-color: #f3f4f6;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: white;
}

.accordion-content.active {
  max-height: 1000px;
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

@media (max-width: 576px) {
  .btn-sm {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
