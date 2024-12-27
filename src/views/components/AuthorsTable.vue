<script setup>
import { defineProps, defineEmits, ref, computed } from "vue";

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
const itemsPerPage = ref(5);
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
  return headers.map((header, index) => ({
    title: header,
    key: Object.keys(fields)[index] || "actions",
    sortable: true,
    align: index === 0 ? "start" : "center",
  }));
});

const allHeaders = computed(() => [
  ...tableHeaders.value,
  { title: "Acciones", key: "actions", sortable: false, align: "center" },
]);

</script>

<template>
  <div class="card bg-white rounded-lg shadow-sm">
    <div v-if="title" class="card-header">
      <h6 class="text-xl font-semibold">{{ title }}</h6>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="allHeaders"
          :items="rows"
          :items-per-page-options="[5, 10, 25]"
        >
          <!-- Custom header slot -->
          <template v-slot:header="{ props }">
            <thead>
              <tr>
                <th
                  v-for="header in props.headers"
                  :key="header.key"
                  class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 border-b"
                  :class="{ 'ps-2': header.key !== Object.keys(fields)[0] }"
                >
                  {{ header.title }}
                </th>
              </tr>
            </thead>
          </template>

          <!-- Custom item slot -->
          <template v-slot:item="{ item }">
            <tr class="hover:bg-gray-50">
              <td v-for="(field, index) in Object.keys(fields)" :key="field">
                <div v-if="index === 0" class="d-flex px-2 py-1">
                  <div v-if="fields[field].showAvatar">
                    <img
                      :src="
                        getFieldValue(item, fields[field].avatar) ||
                        '../../assets/img/team-2.jpg'
                      "
                      class="avatar avatar-sm me-3 rounded-circle"
                      alt="user"
                    />
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-sm">
                      {{ getFieldValue(item, fields[field].main) }}
                    </h6>
                    <p
                      v-if="fields[field].sub"
                      class="text-xs text-secondary mb-0"
                    >
                      {{ getFieldValue(item, fields[field].sub) }}
                    </p>
                  </div>
                </div>
                <div v-else :class="fields[field].class || 'px-2 py-1'">
                  <span
                    :class="
                      fields[field].textClass || 'text-xs font-weight-bold'
                    "
                  >
                    {{ getFieldValue(item, fields[field].value) }}
                  </span>
                </div>
              </td>
              <td class="align-middle text-center text-sm">
                <button
                  @click="handleEdit(item)"
                  class="btn btn-sm btn-icon btn-bg-light btn-active-color-green btn-active-bg-warning mx-lg-2"
                >
                  <i :class="icons.firstIcon || 'fas fa-check'"></i>
                </button>
                <button
                  @click="handleDelete(item)"
                  class="btn btn-sm btn-icon btn-bg-light btn-active-color-alert btn-active-bg-warning"
                >
                  <i :class="icons.secondIcon || 'fas fa-trash'"></i>
                </button>
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <p class="text-center p-3">La tabla no tiene datos para mostrar</p>
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
