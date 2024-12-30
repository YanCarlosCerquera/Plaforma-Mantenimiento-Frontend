<script setup>
import { defineProps, defineEmits, ref, computed } from "vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import Pagination from "./Pagination.vue";

const { headers, rows, title, icons, fields } = defineProps({
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
    type: { firstIcon: "", secondIcon: "" },
    required: false,
  },
});

const emit = defineEmits(["edit", "delete"]);
const itemsPerPage = ref(10);
const page = ref(1);

const handleEdit = (row) => {
  emit("edit", row);
};

const handleDelete = (row) => {
  emit("delete", row.id || row._id);
};

const getFieldValue = (obj, path) => {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

const tableHeaders = computed(() => {
  console.log("header", headers)
  console.log("rows", rows)
  console.log("fields", fields)
  console.log("icons", icons)
  return headers.map((header, index) => ({
    title: header.text || header,
    key: Object.keys(fields)[index] || "actions",
    value: header.value || null,
    align: "start",
  }));
});

const allHeaders = computed(() => [
  ...tableHeaders.value,
  { title: "Acciones", key: "actions", sortable: false, align: "center" },
]);

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

</script>

<template>
  <h2 v-if="title" class="text-xl font-semibold" style="color: white;">{{ title }}</h2>
  <div class="row align-middle text-sm">
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
  <div class="card bg-white rounded-lg shadow-sm">
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <v-data-table v-model:items-per-page="itemsPerPage" v-model:page="page" :headers="allHeaders" :items="rows"
          :items-per-page-options="[5, 10, 25]" class="elevation-1">
          <!-- Custom item slot -->
          <template v-slot:item="{ item }">
            <tr class="hover:bg-gray-50">
              <td v-for="(field, index) in Object.keys(fields)" :key="field">
                <div v-if="index === 0" class="d-flex px-2 py-1">
                  <div v-if="fields[field].showAvatar">
                    <img :src="getFieldValue(item, fields[field].avatar) ||
                      '../../assets/img/team-2.jpg'
                      " class="avatar avatar-sm me-3 rounded-circle" alt="user" />
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-sm">
                      {{ getFieldValue(item, fields[field].main) }}
                    </h6>
                    <p v-if="fields[field].sub" class="text-xs text-secondary mb-0">
                      {{ getFieldValue(item, fields[field].sub) }}
                    </p>
                  </div>
                </div>
                <div v-else :class="fields[field].class || 'px-2 py-1'">
                  <span :class="fields[field].textClass || 'text-xs font-weight-bold'
                    ">
                    {{ getFieldValue(item, fields[field].value) }}
                  </span>
                </div>
              </td>
              <td class="align-middle text-center text-sm">
                <button @click="handleEdit(item)"
                  class="btn btn-sm btn-icon btn-bg-light btn-active-color-green btn-active-bg-warning mx-lg-2 my-2">
                  <i :class="icons.firstIcon || 'fas fa-check'"></i>
                </button>
                <button @click="handleDelete(item)"
                  class="btn btn-sm btn-icon btn-bg-light btn-active-color-alert btn-active-bg-warning my-2">
                  <i :class="icons.secondIcon || 'fas fa-trash'"></i>
                </button>
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <p class="text-center p-3">La tabla no tiene datos para mostrar</p>
          </template>

          <template v-slot:bottom="bottomProps">
            <Pagination class="py-2" :totalPages="bottomProps.pageCount" :currentPage="bottomProps.page" @page-change="page = $event"/>
          </template>
        </v-data-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
