<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "./components/AuthorsTable.vue";
import apiService from "../service/apiService";

const headers = ref([
  "Nombre de usuario",
  "Teléfono",
  "Tipo de documento",
  "Número de documento",
  "Fecha de registro"
]);

// Definición de campos y cómo mapearlos
const fields = ref({
  usuario: {
    showAvatar: true,
    avatar: 'avatar',
    main: 'name',
    sub: 'email'
  },
  telefono: {
    value: 'phone',
    class: 'px-2 py-1',
    textClass: 'text-xs font-weight-bold mb-0'
  },
  tipoDocumento: {
    value: 'typeDocument',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  },
  numeroDocumento: {
    value: 'numberDocument',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  },
  fecha: {
    value: 'createdAt',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  }
});

const rows = ref([]);

const fetchData = async () => {
  try {
    const response = await apiService.get("/users");
    const data = response.data || response;

    rows.value = data.filter(user => user.state === false);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


const handleEdit = (row) => {
  console.log("Edit:", row);
};

const handleDelete = (id) => {
  console.log("Delete:", id);
};

onMounted(fetchData);
</script>

<template>
  <div class="py-5 container-fluid">
    <div class="row">
      <div class="col-12">
        <AuthorsTable
          :headers="headers"
          :rows="rows"
          :fields="fields"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>
