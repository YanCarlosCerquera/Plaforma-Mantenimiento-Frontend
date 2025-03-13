<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import apiService from '../../service/apiService';
import { useRouter } from "vue-router";

const store = useStore();
const isRTL = computed(() => store.state.isRTL);
const router = useRouter();

const props = defineProps({
  title: {
    type: String,
    default: "Categorias",
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const mergedCategories = ref([]);


const iconMap = {
  'equipo de computa': 'ni ni-mobile-button',
  'Equipos especiales': 'ni ni-tag',
  'Maquinaria amarilla': 'ni ni-box-2',
  'CNC': 'ni ni-satisfied',
};

const backgroundColors = ['primary', 'info', 'success', 'warning', 'danger'];

const handleCategotias = async () =>{
  router.push("/cateogitas")
}
const fetchCategories = async () => {
  try {
    const response = await apiService.get('/assets/count-by-category');
    
    if (response && Array.isArray(response)) {
      const apiCategories = response.map((item, index) => ({
        icon: {
          component: iconMap[item.category] || 'ni ni-building',
          background: backgroundColors[index % backgroundColors.length],
        },
        label: item.category,
        description: `${item.count} ${item.count === 1 ? 'Equipo' : 'Equipos'}`,
      }));
      
      mergedCategories.value = [...props.categories, ...apiCategories];
    } else {
      console.error('Respuesta inválida:', response);
      mergedCategories.value = [...props.categories];
    }
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    mergedCategories.value = [...props.categories];
  }
};

onMounted(fetchCategories);
watch(() => props.categories, fetchCategories);
</script>

<template>
  <div class="card">
    <div class="p-3 pb-0 card-header">
      <h6 class="mb-0">{{ title }}</h6>
    </div>
    <div class="p-3 card-body">
      <ul :class="`list-group ${isRTL ? 'pe-0' : ''}`">
        <li
          v-for="({ icon: { component, background }, label, description }, index) in mergedCategories"
          :key="index"
          :class="`mb-2 border-0 list-group-item d-flex justify-content-between border-radius-lg
          ${isRTL ? 'pe-0' : 'ps-0'}`"
        >
          <div class="d-flex align-items-center">
            <div
              :class="`text-center shadow icon icon-shape icon-sm bg-gradient-${background} ${
                isRTL ? 'ms-3' : 'me-3'
              }`"
            >
              <i :class="`${component} text-white `"></i>
            </div>
            <div class="d-flex flex-column">
              <h6 class="mb-1 text-sm text-dark">{{ label }}</h6>
              <span class="text-xs">{{ description }}</span>
            </div>
          </div>
          <div class="d-flex">
            <button @clik="handleCategotias"
              class="my-auto btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right"
            >
              <i
                :class="`ni ${isRTL ? 'ni-bold-left' : 'ni-bold-right'}`"
                aria-hidden="true"
              ></i>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>