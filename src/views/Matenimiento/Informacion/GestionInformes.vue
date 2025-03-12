<script>
import { ref, onMounted } from "vue";
import apiService from "../../../service/apiService";
import Swal from "sweetalert2";
import AuthorsTable from "../../components/AuthorsTable.vue";

export default {
  components: {
    AuthorsTable,
  },
  setup() {
    // Estados
    const isLoading = ref(false);
    const rows = ref([]); 

    // Definición de columnas
    const headers = ref([
      "Informe",
      "Código Inventario",
      "Horas",
      "Costos",
      "Trabajo Realizado",
      "Ejecutado Por",
    ]);

    const fields = ref({
      Informe: { value: "Informe", class: "align-middle", textClass: "text-xs font-weight-bold" },
      CodigoInventario: { value: "CodigoInventario", class: "align-middle", textClass: "text-xs font-weight-bold mb-0" },
      Horas: { value: "Horas", class: "align-middle", textClass: "text-xs font-weight-bold" },
      Costos: { value: "Costos", class: "align-middle", textClass: "text-xs font-weight-bold" },
      TrabajoRealizado: { value: "TrabajoRealizado", class: "align-middle", textClass: "text-xs font-weight-bold" },
      EjecutadoPor: { value: "Ejecutado Por", class: "align-middle", textClass: "text-xs font-weight-bold" },
    });

    // Iconos de acciones
    const icons = ref([
      { class: "fas fa-check" },
      { class: "fas fa-trash" },
      { class: "fas fa-edit" },
    ]);

    // Función para obtener datos
    const fetchData = async () => {
      isLoading.value = true;
      try {
         const response = await apiService.get("/work-report/Informes");
         rows.value = response
      

        Swal.fire({
          icon: "success",
          title: "Datos cargados",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al obtener informes:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: "No se pudieron obtener los informes. Intenta de nuevo.",
        });
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(fetchData);

    return {
      headers,
      fields,
      icons,
      rows,
      isLoading,
      fetchData,
    };
  },
};
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div v-if="isLoading" class="text-center my-4">
          <i class="fa-solid fa-spinner fa-spin-pulse fa-spin-reverse text-primary text-3xl"></i>
          <p class="mt-2 text-lg font-semibold">Cargando datos...</p>
        </div>
        <div v-else>
          <AuthorsTable
            title="Gestion de Informes"
            :headers="headers"
            :rows="rows"
            :fields="fields"
            :icons="icons"
            
          />
        </div>
      </div>
    </div>
  </div>
</template>
