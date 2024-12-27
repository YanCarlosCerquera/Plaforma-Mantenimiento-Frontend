<script setup>
import { defineProps, defineEmits } from "vue";
const { headers, rows, title, icons } = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  // Nuevo prop para mapear qué campos mostrar
  fields: {
    type: Object,
    required: true,
  },

  title: {
    type: String,
    required: false,
  },

  icons: {
    type: { firstIcon: "", secondIcon: ""},
    required: false,
  }
});

const emit = defineEmits(["edit", "delete"]);

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
</script>

<template>
  <div class="card">
    <div v-if="title" class="card-header pb-0">
      <h6>{{ title }}</h6>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <p v-if="!rows || rows.length === 0" class="text-center p-3">
          La tabla no tiene datos para mostrar
        </p>

        <table v-else class="table align-items-center mb-0">
          <thead>
            <tr>
              <th
                v-for="header in headers"
                :key="header"
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
                :class="{ 'ps-2': header !== headers[0] }"
              >
                {{ header }}
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id || row._id">
              <td v-for="(field, index) in Object.keys(fields)" :key="field">
                <!-- Si es la primera columna, mostramos el diseño especial con avatar -->
                <div v-if="index === 0" class="d-flex px-2 py-1">
                  <div v-if="fields[field].showAvatar">
                    <img
                      :src="
                        getFieldValue(row, fields[field].avatar) ||
                        '../../assets/img/team-2.jpg'
                      "
                      class="avatar avatar-sm me-3"
                      alt="user"
                    />
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-sm">
                      {{ getFieldValue(row, fields[field].main) }}
                    </h6>
                    <p
                      v-if="fields[field].sub"
                      class="text-xs text-secondary mb-0"
                    >
                      {{ getFieldValue(row, fields[field].sub) }}
                    </p>
                  </div>
                </div>
                <!-- Para el resto de columnas, mostramos el valor normal -->
                <div v-else :class="fields[field].class || 'px-2 py-1'">
                  <span
                    :class="
                      fields[field].textClass || 'text-xs font-weight-bold'
                    "
                  >
                    {{ getFieldValue(row, fields[field].value) }}
                  </span>
                </div>
              </td>
              <td class="align-middle text-center text-sm">
                <button
                  @click="handleEdit(row)"
                  class="btn btn-sm btn-icon btn-bg-light btn-active-color-green btn-active-bg-warning mx-lg-2"
                >
                  <i :class="icons.firstIcon || 'fas fa-check'"></i>
                </button>
                <button
                  @click="handleDelete(row)"
                  class="btn btn-sm btn-icon btn-bg-light btn-active-color-alert btn-active-bg-warning"
                >
                  <i :class="icons.secondIcon || 'fas fa-trash'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
