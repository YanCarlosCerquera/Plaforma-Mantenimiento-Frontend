<script setup>
import { ref, onMounted, computed } from 'vue';
import apiService from '../../service/apiservice';
import AuthorsTable from '../components/AuthorsTable.vue';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie'; // Importar js-cookie
import { useRouter } from 'vue-router';

const router = useRouter();

const headers = ref(["Nombre", "Variables Operaciones", "Accesorios", "Especificaciones", "Estado"]);

const fields = ref({
  name: {
    value: 'name',
    class: 'align-middle text-center',
    textClass: ' text-xs font-weight-bold'
  },
  operationVars: {
    value: 'operationVars',
    class: 'align-middle text-center',
    textClass: ' text-xs font-weight-bold'
  },
  accessories: {
    value: 'accessories',
    class: 'align-middle text-center',
    textClass: ' text-xs font-weight-bold'
  },
  specs: {
    value: 'specs',
    class: 'align-middle text-center',
    textClass: ' text-xs font-weight-bold'
  },
  status: {
    value: 'state',
    class: 'align-middle text-center',
    textClass: ' text-xs font-weight-bold'
  },
});

const rows = ref([]);

const fetchData = async () => {
  try {
    const response = await apiService.get('/Categorias');
    rows.value = response.map(item => ({
      ...item,
      state: item.state ? 'Activo' : 'Inactivo'
    }));
  } catch (error) {
    console.error("Error fetching asset data:", error);
  }
};

const handleEdit = (row) => {
  Cookies.set('categoryId', row._id);
  router.push('/machineandteams/list');
};

const handleDelete = async (row) => {
  const result = await Swal.fire({
    title: "¿Estás seguro de que quieres eliminar la categoria?",
    text: "Esta acción no puede deshacerse.",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    customClass: {
      title: "text-succes",
      confirmButton: "btn-success",
      cancelButton: "btn-danger",
    },
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await apiService.delete(`Categorias/${row._id}`);
    Swal.fire({
      title: "Categoria eliminada correctamente",
      icon: "success",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#28a745",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "swal-title-white",
      },
    });
    await fetchData();
  } catch (error) {
    Swal.fire({
      title: "Error al eliminar usuario",
      text: error.response?.data?.message || "Algo salió mal.",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "swal-title-white",
      },
    });
  }
};

const icons = ref([
{ class: 'fas fa-edit', method: handleEdit },
{ class: 'fas fa-trash', method: handleDelete },
]);

const getFieldValue = (obj, path) => {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

const filteredRows = computed(() => {
  return rows.value.filter(row => {
    return filters.value.every(filter => {
      if (!filter.selectedOption) return true;  

      const fieldValue = getFieldValue(row, filter.field);

      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(filter.selectedOption);
      }

      return fieldValue === filter.selectedOption;
    });
  });
});

const filters = ref([
  {
    field: "operationVars",
    options: [
      { value: "", label: "variable operacion" },
      { value: "electricidad", label: "electricidad" },
      { value: "voltios", label: "voltios" },
      { value: "Presión", label: "Presión" },
    ],
    selectedOption: "",
  },
  {
    field: "specs",
    options: [
      { value: "", label: "especificaciones" },
      { value: "corei9", label: "corei9" },
      { value: "92gb ram", label: "92gb ram" },
    ],
    selectedOption: "",
  },
])

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <AuthorsTable
          :title="'Gestion de Categorias'"
          :headers="headers"
          :rows="filteredRows"
          :fields="fields"
          :icons="icons"
          :filters="filters"
        />
      </div>
    </div>
  </div>
</template>