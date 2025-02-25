<script setup>
import { ref, onMounted } from 'vue';
import apiService from '../../service/apiService';
import AuthorsTable from '../components/AuthorsTable.vue';

const headers = ref(["Nombre", "Variables Operaciones", "Características", "Especificaciones", "Estado"]);

const fields = ref({
  name: {
    value: 'name',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  },
  operationVars: {
    value: 'operationVars',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  },
  accessories: {
    value: 'accessories',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  },
  specs: {
    value: 'specs',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  },
  status: {
    value: 'status',
    class: 'align-middle text-center',
    textClass: 'text-secondary text-xs font-weight-bold'
  },
});

const rows = ref([]);
const fetchData = async () => {
  try {
    const response = await apiService.get('/Categorias');
    rows.value = response;
    console.log(rows.value);
  } catch (error) {
    console.error("Error fetching asset data:", error);
  }
};

const handleEdit = (row) => {
  console.log('Edit:', row);
};

const handleDelete = async (row) => {
  console.log('Delete:', row);
};

onMounted(() => {
  fetchData();
});
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
