<script setup>
import { onMounted, watch, ref, onBeforeUnmount } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    default: "300",
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  chart: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      datasets: []
    })
  },
});

// Referencia para el gráfico
const chartInstance = ref(null);
// Referencia para controlar si el componente está montado
const isMounted = ref(false);
// Referencia para el timeout
const chartTimeout = ref(null);

// Función para crear o actualizar el gráfico
const createOrUpdateChart = () => {
  // Verificar si el componente está montado
  if (!isMounted.value) return;

  // Obtener el elemento canvas de forma segura
  const canvas = document.getElementById(props.id);
  if (!canvas) {
    console.warn(`Canvas con id ${props.id} no encontrado, reintentando...`);
    // Reintentar después de un breve retraso
    if (chartTimeout.value) clearTimeout(chartTimeout.value);
    chartTimeout.value = setTimeout(() => createOrUpdateChart(), 200);
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error(`No se pudo obtener el contexto 2D para el canvas ${props.id}`);
    return;
  }

  // Verificar datos del gráfico
  if (!props.chart || !props.chart.labels || !props.chart.datasets) {
    console.warn("Datos de gráfico inválidos o incompletos:", props.chart);
    return;
  }

  try {
    // Limpiar cualquier gráfico existente
    cleanupChart();

    // Crear gradientes
    const gradientStroke1 = ctx.createLinearGradient(0, 230, 0, 50);
    gradientStroke1.addColorStop(1, "rgba(203,12,159,0.2)");
    gradientStroke1.addColorStop(0.2, "rgba(72,72,176,0.0)");
    gradientStroke1.addColorStop(0, "rgba(203,12,159,0)");

    const gradientStroke2 = ctx.createLinearGradient(0, 230, 0, 50);
    gradientStroke2.addColorStop(1, "rgba(20,23,39,0.2)");
    gradientStroke2.addColorStop(0.2, "rgba(72,72,176,0.0)");
    gradientStroke2.addColorStop(0, "rgba(20,23,39,0)");

    // Preparar los datasets
    const datasets = [];
    
    if (props.chart.datasets && props.chart.datasets.length > 0) {
      // Primer dataset
      datasets.push({
        label: props.chart.datasets[0]?.label || "Dataset 1",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        borderColor: "#4BB543",
        backgroundColor: gradientStroke1,
        fill: true,
        data: props.chart.datasets[0]?.data || [],
        maxBarThickness: 6,
      });

      // Segundo dataset (si existe)
      if (props.chart.datasets.length > 1) {
        datasets.push({
          label: props.chart.datasets[1]?.label || "Dataset 2",
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
          borderColor: "#3A416F",
          backgroundColor: gradientStroke2,
          fill: true,
          data: props.chart.datasets[1]?.data || [],
          maxBarThickness: 6,
        });
      }
    }

    // Determinar el tipo de gráfico basado en los datos
    const isBarChart = props.title && props.title.includes("categoría");
    const chartType = isBarChart ? "bar" : "line";

    // Configuración específica para gráficos de barras
    const barOptions = isBarChart ? {
      barPercentage: 0.6,
      categoryPercentage: 0.7,
    } : {};

    // Crear el nuevo gráfico
    chartInstance.value = new Chart(ctx, {
      type: chartType,
      data: {
        labels: props.chart.labels || [],
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...barOptions,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
          }
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5],
            },
            ticks: {
              display: true,
              padding: 10,
              color: "#fbfbfb",
              font: {
                size: 11,
                family: "Open Sans",
                style: "normal",
                lineHeight: 2,
              },
            },
          },
          x: {
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: false,
              drawTicks: false,
              borderDash: [5, 5],
            },
            ticks: {
              display: true,
              color: "#ccc",
              padding: 20,
              font: {
                size: 11,
                family: "Open Sans",
                style: "normal",
                lineHeight: 2,
              },
              // Rotar las etiquetas para categorías largas
              maxRotation: isBarChart ? 45 : 0,
              minRotation: isBarChart ? 45 : 0,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error al crear el gráfico:", error);
  }
};

// Función para limpiar el gráfico existente
const cleanupChart = () => {
  try {
    // Destruir la instancia actual si existe
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }
    
    // Verificar si hay un gráfico existente con el mismo ID
    const existingChart = Chart.getChart(props.id);
    if (existingChart) {
      existingChart.destroy();
    }
  } catch (error) {
    console.warn("Error al limpiar el gráfico:", error);
  }
};

// Función para inicializar el gráfico con reintento
const initializeChart = () => {
  // Limpiar cualquier timeout existente
  if (chartTimeout.value) {
    clearTimeout(chartTimeout.value);
  }
  
  // Intentar crear el gráfico con un pequeño retraso
  chartTimeout.value = setTimeout(() => {
    createOrUpdateChart();
  }, 300);
};

// Observar cambios en los datos del gráfico
watch(() => props.chart, () => {
  if (isMounted.value) {
    initializeChart();
  }
}, { deep: true });

onMounted(() => {
  isMounted.value = true;
  initializeChart();
  
  // Agregar listener para el evento de visibilidad
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  isMounted.value = false;
  
  // Limpiar timeouts y listeners
  if (chartTimeout.value) {
    clearTimeout(chartTimeout.value);
  }
  
  cleanupChart();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

// Manejar cambios de visibilidad (cuando el usuario cambia de pestaña y vuelve)
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && isMounted.value) {
    // Reinicializar el gráfico cuando la página vuelve a ser visible
    initializeChart();
  }
};
</script>

<template>
  <div class="card z-index-2">
    <div class="pb-0 card-header mb-0">
      <h6>{{ props.title }}</h6>
      <!--  eslint-disable-next-line vue/no-v-html -->
      <p v-if="props.description" class="text-sm" v-html="props.description" />
    </div>
    <div class="p-3 card-body">
      <div class="chart">
        <canvas
          :id="props.id"
          class="chart-canvas"
          :height="props.height"
        ></canvas>
      </div>
    </div>
  </div>
</template>