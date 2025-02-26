<template>
  <div class="plantamiento">
    <!-- Watermark (logo tenue de fondo). 
         Ajusta la ruta de tu imagen/logo en `src` -->

    <!-- Botón Volver (opcional) -->
    <button @click="goBack" class="button">Volver</button>

    <!-- Contenido principal en dos columnas (en pantallas medianas o más grandes) -->
    <div class="flex flex-col md:flex-row md:space-x-6">
      <div class="flex-1">
        <h2 class="text-2xl font-bold mb-4">
          {{ assetData?.name || "Nombre de Activo" }}
        </h2>

        <!-- Especificaciones Técnicas -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Especificaciones técnicas</h3>
          <ul class="list-disc list-inside space-y-1">
            <!-- Aquí puedes mapear o ajustar lo que consideres “especificaciones”. 
                 Puedes mezclar datos estáticos con dinámicos del JSON. 
                 Debajo se muestran algunos ejemplos genéricos. -->
            <li>Marca: {{ assetData?.brand || "N/A" }}</li>
            <li>Modelo: {{ assetData?.modelo || "N/A" }}</li>
            <li>Tipo de equipo: {{ assetData?.equipmentType || "N/A" }}</li>
            <li>Ubicación: {{ assetData?.location || "N/A" }}</li>
            <li>Fecha de adquisición: {{ formattedDate }}</li>
            <li>Serial: {{ assetData?.serialNumber || "N/A" }}</li>
            <li>Cód. Inventario: {{ assetData?.inventoryCode || "N/A" }}</li>
          </ul>
        </div>

        <!-- Accesorios (desde categoryId.accessories) -->
        <div class="mb-6" v-if="assetData?.categoryId?.accessories?.length">
          <h3 class="text-xl font-semibold mb-2">Accesorios</h3>
          <ul class="list-disc list-inside space-y-1">
            <li
              v-for="(accessory, index) in assetData.categoryId.accessories"
              :key="index"
            >
              {{ accessory }}
            </li>
          </ul>
        </div>

        <div
          class="Variables"
          v-if="assetData?.categoryId?.operationVars?.length"
        >
          <h3 class="text-xl font-semibold mb-2">Variables</h3>
          <ul class="list-disc list-inside space-y-1">
            <li
              v-for="(variable, index) in assetData.categoryId.operationVars"
              :key="index"
            >
              {{ variable }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Columna Derecha: Imagen -->
      <div class="Img">
        <img
          src="../../assets/img/image-planear-mantenimiento.png"
          alt="SENA Logo"
          class="sena-logo"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import apiService from "../../service/apiService";

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

onMounted(async () => {
  const assetId = localStorage.getItem("selectedAssetId");
  if (assetId) {
    try {
      const response = await apiService.get(`/assets/${assetId}`);
      assetData.value = response;
      console.log("Asset Data:", assetData.value);
    } catch (error) {
      console.error("Error fetching asset data:", error);
    }
  }
});

function goBack() {
  window.history.back();
}
</script>

<style>
.plantamiento {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;

}

.button {
  padding: 6px 12px;
  background-color: #1f8a36;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.button::before {
  content: "←";
  font-size: 1.1rem;
}
.Variables {
  position: absolute;
  right: 0;
  top: 70%;
  transform: translateY(-50%);
  margin-right: 400px;
}
.Img {
  position: absolute;
  right: 0;
  top: 42%;
  transform: translateY(-50%);
  margin-right: 310px;
}
@media (max-width: 768px) {
  .planear-mantenimiento-form {
    padding: 1rem;
  }
}
</style>
