<script setup>
import { ref, onMounted } from 'vue';
import apiService from '../service/apiService';

// Declarar `rows` como `ref` para que sea reactivo
const rows = ref([]);

// Función para obtener datos
const fetchData = async () => {
  try {
    const response = await apiService.get('/users');
    rows.value = response.data.filter(user => user.state === false);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
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
