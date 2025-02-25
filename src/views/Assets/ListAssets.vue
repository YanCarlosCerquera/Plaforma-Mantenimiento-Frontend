<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from 'vuex';
import Swal from "sweetalert2";
import Table from "../components/Table.vue";
import router from "../../router";

const store = useStore();
const TABLE_ID = 'assets-list';

const headers = ref([
  "Codigo de Inventario",
  "Numero de Serie",
  "Nombre",
  "Ubicacion",
  "Fecha de adquisicion",
  "Categoria",
  "Estado"
]);

const fields = ref({
  inventoryCode: {
    value: "inventoryCode",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    filterable: true
  },
  serialNumber: {
    value: "serialNumber",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  name: {
    value: "name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  location: {
    value: "location",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    filterable: true
  },
  createdAt: {
    value: "createdAt",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  categoryId: {
    value: "categoryId",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    filterable: true
  },
  status: {
    value: "status",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    filterable: true
  }
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatStatus = (status) => {
  return status ? 'Activo' : 'Inactivo';
};

const formatCategory = (categoryId) => {
  return categoryId?.name;
};

const rows = computed(() => store.getters['tables/getTableData'](TABLE_ID));
const loading = computed(() => store.getters['tables/isTableLoading'](TABLE_ID));

// Configuración de filtros
const filterOptions = ref([
  {
    field: 'status',
    label: 'Estado',
    type: 'select',
    options: ['Activo', 'Inactivo']
  },
  {
    field: 'location',
    label: 'Ubicación',
    type: 'select',
    options: []
  },
  {
    field: 'categoryId',
    label: 'Categoría',
    type: 'select',
    options: []
  }
]);

const updateFilterOptions = (data) => {
  const locations = new Set();
  const categories = new Set();

  data.forEach(item => {
    if (item.location) locations.add(item.location);
    if (item.categoryId?.name) categories.add(item.categoryId.name);
  });

  filterOptions.value = filterOptions.value.map(filter => {
    if (filter.field === 'location') {
      filter.options = Array.from(locations).sort();
    } else if (filter.field === 'categoryId') {
      filter.options = Array.from(categories).sort();
    }
    return filter;
  });
};

const fetchData = async () => {
  await store.dispatch('tables/fetchTableData', {
    tableId: TABLE_ID,
    endpoint: "/assets",
    formatters: {
      createdAt: formatDate,
      status: formatStatus,
      categoryId: formatCategory

      
    }
  });

  // Actualizar opciones de filtros después de cargar los datos
  updateFilterOptions(rows.value);
};

const handleEdit = (row) => {
  localStorage.setItem('editAssetId', row._id);
  router.push('/assets/edit');
};

const handleView = (row) => {
  localStorage.setItem('selectedAssetId', row._id);
  router.push('/assets/detail');
};

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "¿Estás seguro de que quieres eliminar este activo?",
    text: "Esta acción no puede deshacerse.",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    customClass: {
      title: "text-success",
      confirmButton: "btn-success",
      cancelButton: "btn-danger",
    },
  });

  if (!result.isConfirmed) return;

  const { success } = await store.dispatch('tables/deleteTableItem', {
    tableId: TABLE_ID,
    endpoint: 'assets',
    id,
    refreshConfig: {
      tableId: TABLE_ID,
      endpoint: '/assets',
      formatters: {
        createdAt: formatDate,
        status: formatStatus,
        categoryId: formatCategory
      }
    }
  });

  if (success) {
    Swal.fire({
      title: "Activo eliminado correctamente",
      icon: "success",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#28a745",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
  } else {
    Swal.fire({
      title: "Error al eliminar el activo",
      text: "Algo salió mal al intentar eliminar el activo.",
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

// Manejar cambios en los filtros
const handleFilterChange = (filters) => {
  store.dispatch('tables/applyFilters', {
    tableId: TABLE_ID,
    filters
  });
};

onMounted(() => {
  fetchData();
});

// Recargar datos cuando se regresa a la página
router.beforeEach((to, from, next) => {
  if (to.path === '/assets' && from.path.startsWith('/assets/')) {
    fetchData();
  }
  next();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <Table
          v-else
          :tableId="TABLE_ID"
          title="Maquinas y Equipos"
          :headers="headers"
          :rows="rows"
          :fields="fields"
          :filters="true"
          :filterOptions="filterOptions"
          @edit="handleEdit"
          @delete="handleDelete"
          @view="handleView"
          @filter-change="handleFilterChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.table td,
.table th {
  white-space: nowrap;
}
</style>