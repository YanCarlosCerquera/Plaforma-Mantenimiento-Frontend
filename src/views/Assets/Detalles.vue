<template>
  <div class="maquinaria-details">
    <div class="container">
      <div class="content-card">
        <button @click="goBack" class="back-button">
          <span class="arrow">←</span>
          <span>Volver</span>
        </button>

        <div class="two-column-layout">
          <!-- Columna izquierda -->
          <div class="left-column">
            <h2 class="asset-name">
              {{ assetData?.name || "Nombre de Activo" }}
            </h2>

            <!-- Especificaciones Técnicas -->
            <div class="section">
              <h3 class="section-title">Especificaciones técnicas</h3>
              <ul class="item-list">
                <li v-for="(value, key) in specifications" :key="key">
                  <span class="bullet">•</span>
                  <span>{{ key }}: {{ value || "N/A" }}</span>
                </li>
              </ul>
            </div>

            <!-- Accesorios -->
            <div
              class="section"
              v-if="assetData?.categoryId?.accessories?.length"
            >
              <h3 class="section-title">Accesorios</h3>
              <ul class="item-list">
                <li
                  v-for="(accessory, index) in assetData.categoryId.accessories"
                  :key="index"
                >
                  <span class="bullet">•</span>
                  <span>{{ accessory }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="right-column">
            <!-- Imagen -->
            <div class="image-container">
              <img
                :src="assetData?.image"
                :alt="assetData?.image || 'Asset Image'"
                class="asset-image"
              />
            </div>

            <!-- Variables -->
            <div
              class="section"
              v-if="assetData?.categoryId?.operationVars?.length"
            >
              <h3 class="section-title">Variables</h3>
              <ul class="item-list">
                <li
                  v-for="(variable, index) in assetData.categoryId
                    .operationVars"
                  :key="index"
                >
                  <span class="bullet">•</span>
                  <span>{{ variable }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from "vue";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
import apiService from "../../service/apiservice";
const router = useRouter();
const assetData = ref({
  name: "",
  image: "",
  brand: "",
  modelo: "",
  equipmentType: "",
  location: "",
  acquisitionDate: "",
  serialNumber: "",
  inventoryCode: "",
  categoryId: {
    name: "",
    operationVars: [],
    accessories: [],
  },
  manufacturer: {
    name: "",
    address: "",
    phone: "",
  },
  supplier: {
    name: "",
    address: "",
    phone: "",
  },
  status: false,
});

const specifications = computed(() => ({
  Marca: assetData.value.brand,
  Modelo: assetData.value.modelo,
  "Tipo de equipo": assetData.value.equipmentType,
  Ubicación: assetData.value.location,
  "Fecha de adquisición": assetData.value.acquisitionDate,
  Serial: assetData.value.serialNumber,
  "Cód. Inventario": assetData.value.inventoryCode,
}));

onMounted(async () => {
  const assetId = Cookies.get("editAssetId");
  if (assetId) {
    try {
      const response = await apiService.get(`/assets/${assetId}`);
      assetData.value = response;

      console.log("Asset Data:", assetData.value);
    } catch (error) {
      console.error("Error fetching asset data:", error);
    }
  }else{
    router.push("/assets/detail");
  }
});

function goBack() {
  router.push("/assets/detail");
}

const unregisterRouteGuard = router.beforeEach((to, from, next) => {
  if (to.path !== "/assets/detail") {
    Cookies.remove("editAssetId");
  }
  next();
});

onUnmounted(() => {
  unregisterRouteGuard();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.content-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #39a900;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #2d8000;
}

.arrow {
  font-size: 1.25rem;
}

.two-column-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
}

.left-column,
.right-column {
  flex: 1;
  min-width: 300px;
}

.asset-name {
  font-size: 2rem;
  font-weight: bold;
  color: #202224;
  margin-bottom: 1.5rem;
}

.section {
  margin-bottom: 2rem;
  margin-bottom: 2cqmax;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #39a900;
  margin-bottom: 1rem;
}

.item-list {
  list-style-type: none;
  padding: 0;
}

.item-list li {
  display: flex;

  align-items: flex-start;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.bullet {
  color: #39a900;
  margin-right: 0.75rem;
  font-size: 1.2rem;
}
.image-container {
  display: flex;
  align-items: center;
  margin: 0 auto 2rem;
  width: 100%;
  padding: 1rem;
}

.asset-image {
  width: 50%;
  min-width: 50px;
  max-width: 50%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 1024px) {
  .two-column-layout {
    flex-direction: column;
  }

  .right-column {
    order: -1;
  }

  .image-container {
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .content-card {
    padding: 1.5rem;
  }

  .asset-name {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
