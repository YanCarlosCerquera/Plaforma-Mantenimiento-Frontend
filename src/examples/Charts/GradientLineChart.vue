<script setup>
import { onMounted, watch, ref, onBeforeUnmount, nextTick, onActivated, onDeactivated, provide } from "vue";
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
  // Nueva prop para forzar recarga
  forceRefresh: {
    type: Boolean,
    default: false
  }
});

// Referencias reactivas
const chartInstance = ref(null);
const isMounted = ref(false);
const chartTimeout = ref(null);
const retryCount = ref(0);
const MAX_RETRIES = 15; // Aumentado considerablemente
const RETRY_DELAY = 150; // Retraso base en ms
const isLoading = ref(true);
const canvasReady = ref(false);
const emit = defineEmits(['chart-ready', 'chart-error']);
const componentKey = ref(0); // Clave para forzar re-renderizado
const isVisible = ref(true); // Para detectar si el componente es visible
const uniqueChartId = `chart_${props.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`; // ID único

// Proporcionar al padre un método para reiniciar el gráfico
const resetChart = () => {
  if (isMounted.value) {
    cleanupChart();
    forceRerender();
  }
};

provide('resetChart', resetChart);

// Función para crear o actualizar el gráfico con manejo de errores mejorado
const createOrUpdateChart = async () => {
  // No continuar si el componente no está montado o visible
  if (!isMounted.value || !isVisible.value) return;
  
  // Activar estado de carga
  isLoading.value = true;
  
  try {
    // Esperar al siguiente ciclo de renderizado para asegurar que el DOM esté actualizado
    await nextTick();
    
    // Obtener el elemento canvas de forma segura
    const canvas = document.getElementById(uniqueChartId);
    
    if (!canvas) {
      if (retryCount.value < MAX_RETRIES) {
        console.warn(`Canvas con id ${uniqueChartId} no encontrado, reintentando... (${retryCount.value + 1}/${MAX_RETRIES})`);
        retryCount.value++;
        
        // Comprobar si el componente existe en el DOM
        const container = document.querySelector(`[data-chart-container="${uniqueChartId}"]`);
        if (!container) {
          console.warn(`Contenedor del gráfico no encontrado, esperando...`);
        }
        
        // Reintentar después de un breve retraso con backoff exponencial
        if (chartTimeout.value) clearTimeout(chartTimeout.value);
        chartTimeout.value = setTimeout(() => {
          if (isMounted.value && isVisible.value) {
            createOrUpdateChart();
          }
        }, RETRY_DELAY * Math.min(3, Math.pow(1.2, retryCount.value)));
      } else {
        console.error(`Canvas con id ${uniqueChartId} no encontrado después de ${MAX_RETRIES} intentos`);
        isLoading.value = false;
        emit('chart-error', { message: `Canvas no encontrado: ${uniqueChartId}` });
        // Forzar re-renderizado completo del componente
        setTimeout(() => forceRerender(), 200);
      }
      return;
    }

    // Canvas encontrado, marcar como listo
    canvasReady.value = true;
    
    // Resetear contador de intentos
    retryCount.value = 0;

    // Verificar que el contexto 2D esté disponible
    let ctx;
    try {
      ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Contexto 2D no disponible");
      }
    } catch (ctxError) {
      console.error(`Error al obtener contexto 2D: ${ctxError.message}`);
      isLoading.value = false;
      emit('chart-error', { message: `Error de contexto: ${ctxError.message}` });
      
      // Intentar recrear el canvas
      setTimeout(() => {
        if (isMounted.value && isVisible.value) {
          forceRerender();
        }
      }, 300);
      return;
    }

    // Verificar datos del gráfico
    if (!props.chart || !props.chart.labels || !props.chart.datasets) {
      console.warn("Datos de gráfico inválidos o incompletos:", props.chart);
      isLoading.value = false;
      emit('chart-error', { message: 'Datos de gráfico incompletos' });
      return;
    }

    // Limpiar cualquier gráfico existente
    cleanupChart();

    // Crear gradientes de forma segura
    let gradientStroke1, gradientStroke2;
    
    try {
      gradientStroke1 = ctx.createLinearGradient(0, 230, 0, 50);
      gradientStroke1.addColorStop(1, "rgba(203,12,159,0.2)");
      gradientStroke1.addColorStop(0.2, "rgba(72,72,176,0.0)");
      gradientStroke1.addColorStop(0, "rgba(203,12,159,0)");

      gradientStroke2 = ctx.createLinearGradient(0, 230, 0, 50);
      gradientStroke2.addColorStop(1, "rgba(20,23,39,0.2)");
      gradientStroke2.addColorStop(0.2, "rgba(72,72,176,0.0)");
      gradientStroke2.addColorStop(0, "rgba(20,23,39,0)");
    } catch (gradientError) {
      // Si falla la creación de gradientes, usar colores planos
      console.warn("Error al crear gradientes, usando colores planos:", gradientError);
      gradientStroke1 = "rgba(203,12,159,0.2)";
      gradientStroke2 = "rgba(20,23,39,0.2)";
    }

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

    // Crear el nuevo gráfico con un try-catch adicional
    try {
      // Comprobación final antes de crear el gráfico
      if (!canvas.isConnected || !document.body.contains(canvas)) {
        throw new Error("El canvas ya no está en el DOM");
      }
      
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
          // Añadir animación y agregar un evento para detectar cuando termina
          animation: {
            duration: 1000,
            onComplete: () => {
              // Desactivar estado de carga cuando la animación termine
              isLoading.value = false;
              // Emitir evento para indicar que el gráfico está listo
              emit('chart-ready', { id: props.id });
            }
          }
        },
      });
    } catch (chartError) {
      console.error("Error al instanciar Chart.js:", chartError);
      // Si falla la creación del Chart, intentar un re-renderizado completo
      setTimeout(() => {
        if (isMounted.value && isVisible.value) {
          forceRerender();
        }
      }, 500);
    }
  } catch (error) {
    console.error("Error al crear el gráfico:", error);
    // Si hay un error, intentar limpiar y reintentar
    if (retryCount.value < MAX_RETRIES) {
      retryCount.value++;
      if (chartTimeout.value) clearTimeout(chartTimeout.value);
      chartTimeout.value = setTimeout(() => {
        if (isMounted.value && isVisible.value) {
          cleanupChart();
          createOrUpdateChart();
        }
      }, RETRY_DELAY * Math.min(3, Math.pow(1.2, retryCount.value)));
    } else {
      isLoading.value = false;
      emit('chart-error', { message: error.message });
      // Último recurso: forzar re-renderizado completo
      setTimeout(() => forceRerender(), 400);
    }
  }
};

// Función para limpiar el gráfico existente con manejo de errores mejorado
const cleanupChart = () => {
  try {
    // Destruir la instancia actual si existe
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }
    
    // Verificar si hay un gráfico existente con el mismo ID
    try {
      const existingChart = Chart.getChart(uniqueChartId);
      if (existingChart) {
        existingChart.destroy();
      }
    } catch (e) {
      // Ignorar errores al obtener el gráfico existente
      console.warn("No se pudo obtener el gráfico existente:", e);
    }
    
    // Intentar limpiar todos los gráficos que puedan estar vinculados a este ID para evitar fugas de memoria
    try {
      const allCharts = Object.values(Chart.instances || {});
      allCharts.forEach(chart => {
        if (chart.canvas && (chart.canvas.id === uniqueChartId || chart.canvas.id === props.id)) {
          chart.destroy();
        }
      });
    } catch (e) {
      console.warn("Error al limpiar gráficos adicionales:", e);
    }
  } catch (error) {
    console.warn("Error al limpiar el gráfico:", error);
  }
};

// Función para forzar el re-renderizado completo del componente
const forceRerender = () => {
  cleanupChart();
  // Incrementar la clave del componente para forzar un re-renderizado completo
  componentKey.value += 1;
  // Resetear estados
  canvasReady.value = false;
  retryCount.value = 0;
  // Programar una nueva inicialización después del re-renderizado
  setTimeout(() => {
    if (isMounted.value && isVisible.value) {
      initializeChart();
    }
  }, 300);
};

// Función para inicializar el gráfico con reintento
const initializeChart = () => {
  // Solo inicializar si el componente está montado y visible
  if (!isMounted.value || !isVisible.value) return;
  
  // Activar estado de carga
  isLoading.value = true;
  
  // Limpiar cualquier timeout existente
  if (chartTimeout.value) {
    clearTimeout(chartTimeout.value);
  }
  
  // Resetear contador de intentos
  retryCount.value = 0;
  
  // Limpiar cualquier instancia antigua
  cleanupChart();
  
  // Intentar crear el gráfico con un pequeño retraso para asegurar que el DOM esté listo
  chartTimeout.value = setTimeout(() => {
    if (isMounted.value && isVisible.value) {
      createOrUpdateChart();
    }
  }, 200);
};

// Observar cambios en los datos del gráfico
watch(() => props.chart, () => {
  if (isMounted.value && isVisible.value) {
    initializeChart();
  }
}, { deep: true });

// Observar cambios en el ID del gráfico
watch(() => props.id, () => {
  if (isMounted.value && isVisible.value) {
    cleanupChart();
    initializeChart();
  }
});

// Observar la prop forceRefresh
watch(() => props.forceRefresh, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal === true && isMounted.value) {
    console.log("Forzando actualización por prop forceRefresh");
    forceRerender();
  }
});

// Función para comprobar si el componente está visible en la viewport
const checkVisibility = () => {
  if (!isMounted.value) return;
  
  try {
    const element = document.querySelector(`[data-chart-container="${uniqueChartId}"]`);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const isInViewport = (
      rect.top >= -rect.height &&
      rect.left >= -rect.width &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + rect.width
    );
    
    if (isInViewport !== isVisible.value) {
      isVisible.value = isInViewport;
      if (isInViewport && !chartInstance.value) {
        // Si acaba de volverse visible y no hay gráfico, inicializarlo
        initializeChart();
      }
    }
  } catch (e) {
    console.warn("Error al comprobar visibilidad:", e);
  }
};

// Listener para eventos de router (para Vue Router)
const handleRouteChange = () => {
  if (isMounted.value) {
    // Primero limpiar el gráfico actual
    cleanupChart();
    
    // Marcar como no visible temporalmente
    isVisible.value = false;
    
    // Dar tiempo a que la nueva ruta se establezca completamente
    setTimeout(() => {
      if (isMounted.value) {
        // Comprobar si ahora es visible
        checkVisibility();
        
        // Si estamos en la vista que contiene el gráfico, forzar reinicio
        if (document.getElementById(uniqueChartId) || document.querySelector(`[data-chart-container="${uniqueChartId}"]`)) {
          forceRerender();
        }
      }
    }, 300);
  }
};

// Detectar cambios en el historial (navegación del navegador)
const handleHistoryChange = () => {
  if (isMounted.value) {
    // Limpiar de inmediato
    cleanupChart();
    
    // Programar una reconstrucción
    setTimeout(() => {
      if (isMounted.value) {
        forceRerender();
      }
    }, 200);
  }
};

// Escuchar eventos de IntersectionObserver si está disponible
let observer = null;

const setupIntersectionObserver = () => {
  if (!isMounted.value) return;
  
  if ('IntersectionObserver' in window) {
    try {
      const element = document.querySelector(`[data-chart-container="${uniqueChartId}"]`);
      if (!element) return;
      
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const wasVisible = isVisible.value;
          isVisible.value = entry.isIntersecting;
          
          if (isVisible.value && !wasVisible) {
            // El elemento acaba de entrar en la vista
            if (!chartInstance.value) {
              initializeChart();
            }
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(element);
    } catch (e) {
      console.warn("Error al configurar IntersectionObserver:", e);
    }
  }
};

// Hooks para componentes que utilizan keep-alive
onActivated(() => {
  isVisible.value = true;
  
  if (isMounted.value) {
    // Si el componente se reactiva (con keep-alive), reiniciar el gráfico
    nextTick(() => {
      cleanupChart();
      initializeChart();
    });
  }
});

onDeactivated(() => {
  isVisible.value = false;
  // Limpiar el gráfico cuando el componente se desactiva (con keep-alive)
  cleanupChart();
});

onMounted(() => {
  isMounted.value = true;
  isVisible.value = true;
  
  // Inicializar el gráfico después de un pequeño retraso
  setTimeout(() => {
    if (isMounted.value) {
      initializeChart();
      setupIntersectionObserver();
    }
  }, 400);
  
  // Agregar listener para el evento de visibilidad
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Agregar listeners para detectar cambios de ruta y redimensionamientos
  window.addEventListener('popstate', handleHistoryChange);
  window.addEventListener('scroll', checkVisibility, { passive: true });
  window.addEventListener('resize', handleResize);
  
  // Verificar si estamos usando Vue Router
  if (typeof window !== 'undefined') {
    if (window.$router || window.router) {
      try {
        const router = window.$router || window.router;
        router.afterEach(() => {
          handleRouteChange();
        });
      } catch (e) {
        console.warn("No se pudo configurar el hook de Vue Router:", e);
      }
    }
    
    // Intentar detectar cambios de ruta de otras formas
    const pushState = window.history.pushState;
    window.history.pushState = function() {
      pushState.apply(window.history, arguments);
      handleRouteChange();
    };
    
    const replaceState = window.history.replaceState;
    window.history.replaceState = function() {
      replaceState.apply(window.history, arguments);
      handleRouteChange();
    };
  }
});

onBeforeUnmount(() => {
  // Marcar como desmontado antes de limpiar
  isMounted.value = false;
  isVisible.value = false;
  
  // Limpiar timeouts y listeners
  if (chartTimeout.value) {
    clearTimeout(chartTimeout.value);
    chartTimeout.value = null;
  }
  
  // Desconectar el observer si existe
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  // Limpiar el gráfico
  cleanupChart();
  
  // Eliminar listeners
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('popstate', handleHistoryChange);
  window.removeEventListener('scroll', checkVisibility);
  window.removeEventListener('resize', handleResize);
});

// Manejar cambios de visibilidad (cuando el usuario cambia de pestaña y vuelve)
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && isMounted.value) {
    // Reinicializar el gráfico cuando la página vuelve a ser visible
    cleanupChart();
    initializeChart();
  } else if (document.visibilityState === 'hidden') {
    // Limpiar cuando la página no es visible para liberar recursos
    cleanupChart();
  }
};

// Manejar redimensionamiento de ventana
const handleResize = () => {
  if (isMounted.value && chartInstance.value) {
    try {
      // Intentar redimensionar el gráfico existente
      chartInstance.value.resize();
    } catch (e) {
      console.warn("Error al redimensionar el gráfico, recreando...", e);
      // Si falla, recrear el gráfico
      cleanupChart();
      initializeChart();
    }
  }
};
</script>

<template>
  <div 
    class="card z-index-2" 
    :key="componentKey"
    :data-chart-container="uniqueChartId"
  >
    <div class="pb-0 card-header mb-0">
      <h6>{{ props.title }}</h6>
      <p v-if="props.description" class="text-sm" v-html="props.description" />
    </div>
    <div class="p-3 card-body">
      <div class="chart position-relative">
        <!-- Indicador de carga que se muestra sobre el gráfico -->
        <div v-if="isLoading" class="chart-loading-overlay">
          <div class="chart-loading-spinner">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="chart-loading-text mt-2">Cargando datos...</div>
          </div>
        </div>
        
        <!-- Mensaje de error si el gráfico no puede cargarse después de varios intentos -->
        <div v-if="retryCount >= MAX_RETRIES" class="chart-error-message">
          <button @click="forceRerender" class="btn btn-sm btn-primary">
            Reintentar cargar gráfico
          </button>
        </div>
        
        <!-- Canvas con ID único para evitar problemas con el cacheo -->
        <canvas
          :id="uniqueChartId"
          class="chart-canvas"
          :height="props.height"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  position: relative;
  min-height: 200px;
}

.chart-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
}

.chart-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-loading-text {
  font-size: 0.875rem;
  color: #666;
}

.chart-error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 5;
}
</style>