<template>
  <div class="planear-mantenimiento-form">
    <header class="form-header">
      <div>
        <h2 class="title">Gestion de actividades de mantenimiento</h2>
        <h5 class="subtitle">Solicitud de mantenimiento</h5>
      </div>
    </header>

    <form @submit.prevent="handleSubmit" class="form-container">
      <section class="form-section">
        <h3 class="section-title">Informacion de la planeacion</h3>

        <div class="form-section-content">
          <div class="form-grid">
            <div class="form-group">
              <label>Solicitado por</label>
              <input 
                type="text"
                class="form-input"
                placeholder="Yan Carlos Cerquera" 
                readonly
                v-model="maintenanceRequest.requesterName"
              />
            </div>
  
            <div class="form-group">
              <label>Fecha de solicitud</label>
              <input 
                type="date"
                class="form-input"
                placeholder="19-06-2024"
                v-model="maintenanceRequest.createdAt"
              />
            </div>
  
            <div class="form-group">
              <label>Tipo de mantenimiento</label>
              <select 
                class="form-select"
                v-model="maintenanceRequest.maintenanceType"
              >
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
              </select>
            </div>
  
            <div class="form-group">
              <label>Codigo inventario</label>
              <ArgonAutocomplete 
                placeholder="95271025953"
                :items="assetsData"
                v-model="maintenanceRequest.InventoryCode"
              />
            </div>
          </div>
  
          <img
            class="form-section-content-image"
            :src="asset.image"
            alt="Imagen del bien"
          >
        </div>
      </section>

      <section class="form-section" v-if="hasAssetData">
        <h3 class="section-title">Informacion del bien</h3>

        <div class="form-grid asset-info-grid">
          <div class="form-group">
            <label>Centro de formacion</label>
            <p>
              {{ asset.centro_formacion }}
            </p>
          </div>

          <div class="form-group">
            <label>Ubicacion</label>
            <p>
              {{ asset.ubicacion }}
            </p>
          </div>

          <div class="form-group">
            <label>Fecha de adquisición</label>
            <p>
              {{ asset.fecha }}
            </p>
          </div>

          <div class="form-group">
            <label>Marca</label>
            <p>
              {{ asset.marca }}
            </p>
          </div>

          <div class="form-group">
            <label>Modelo</label>
            <p>
              {{ asset.modelo }}
            </p>
          </div>

          <div class="form-group">
            <label>Cuentadante</label>
            <p>
              {{ asset.cuentadante }}
            </p>
          </div>

          <div class="form-group">
            <label>Numero de serie</label>
            <p>
              {{ asset.serie }}
            </p>
          </div>

          <div class="form-group">
            <label>Tipo de equipo</label>
            <p>
              {{ asset.tipo_equipo }}
            </p>
          </div>

          <div class="form-group">
            <label>Estado</label>
            <p>
              {{ asset.estado }}
            </p>
          </div>
        </div>

        <div class="form-group">
          <label>Descripcion de la solicitud</label>
          <textarea
            class="form-input"
            rows="4"
            v-model="maintenanceRequest.issueDescription"
          >Describa el motivo de la solicitud</textarea>
        </div>
        <div class="form-actions" v-if="hasAssetData">
          <button 
            type="submit"
            class="btn-submit"
          >
            Enviar solicitud
          </button>
        </div>
      </section>

    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import defaultImage from '@/assets/img/logos/image_upload.svg'
import apiService from '../service/apiService';
import ArgonAutocomplete from '../components/ArgonAutocomplete.vue';
import Cookies from 'js-cookie';
import Swal from "sweetalert2";
import { useRouter } from 'vue-router';

const jwt_decode = require("jwt-decode");
const token = Cookies.get("authToken");
const decodedToken = jwt_decode.jwtDecode(token);
const userId = decodedToken.sub;
const assetsData = ref([])
const router = useRouter()

const asset = ref({
  centro_formacion: '',
  ubicacion: '',
  fecha: '',
  marca: '',
  modelo: '',
  cuentadante: '',
  serie: '',
  tipo_equipo: '',
  estado: '',
  image: defaultImage
});

const maintenanceRequest = ref({
  requesterName: '',
  requesterPhone: '',
  serialNumber: '',
  maintenanceType: '',
  InventoryCode: '',
  issueDescription: '',
  createdAt: '',
});

const hasAssetData = computed(() => {
  const rest = { ...asset.value };
  delete rest.image;
  return Object.values(rest).some(value => value !== '');
});

async function getUser() {
  try {
    const response = await apiService.get(
      `users/${userId}`,
      {},
      { Authorization: `Bearer ${token}` }
    );

    maintenanceRequest.value.requesterName = response?.name;
    maintenanceRequest.value.requesterPhone = response?.phone;

  } catch (error) {
    Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        "Hubo un problema al cargar la información.",
      icon: "error",
      position: "bottom-right",
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "text-succes",
      },
    });
  }
}

const fetchAssets = async () => {
  try {
    const response = await apiService.get('/assets');
    assetsData.value = response.map(asset => ({
      value: asset.inventoryCode,
      subtitle: asset.name,
      title: asset.inventoryCode
    }));
  } catch (error) {
    console.error("error al cargar bienes: "+error)
  }
}

const fetchSelectAsset = async (inventoryCode) => {
  try {
    const response = await apiService.get(`/assets/InventoryCode/${inventoryCode}`);
    asset.value = {
      centro_formacion: response.trainingCenterId.name,
      ubicacion: response.location,
      fecha: response.createdAt,
      marca: response.brand,
      modelo: response.modelo,
      cuentadante: response.accountHolderId,
      serie: response.serialNumber,
      tipo_equipo: response.equipmentType,
      estado: response.status,
      image: response.image || defaultImage
    };
    maintenanceRequest.value.InventoryCode = inventoryCode;
    maintenanceRequest.value.serialNumber = response.serialNumber;
  } catch (error) {
    console.error("error al cargar el bien: " + error);
  }
}

const handleSubmit = async () => {
  try {
    const response = await apiService.post('/application-maintenance', maintenanceRequest.value);
    Swal.fire({
      title: "Solicitud enviada",
      text: response.trackingNumber,
      icon: "success",
      timer: 3000,
      showConfirmButton: false,
    });

    setTimeout(() => {
      router.push('/mantenimientos/GestionActividaes');
    }, 1000);
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Hubo un problema al enviar la solicitud.",
      icon: "error",
      position: "bottom-right",
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "text-error",
      },
    });
  }
};

watch(() => maintenanceRequest.value.InventoryCode, (newInventoryCode) => {
  if (newInventoryCode) {
    fetchSelectAsset(newInventoryCode);
  }
});

onMounted(() => {
  fetchAssets();
  getUser()
});
</script>

<style scoped>
.planear-mantenimiento-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.title {
  color: #ffffff;
  margin: 0;
}

.subtitle {
  color: #494949;
  margin: 0;
}

.sena-logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fff;
  padding: 6px;
}

.form-section {
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-section-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.form-section-content-image {
  margin: auto;
  max-width: 200px;
  min-width: 100px;
  max-height: 200px;
  min-height: 100px;
}

.section-title {
  color: #39A900;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.asset-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group p {
  margin-left: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

textarea {
  color: rgb(103, 116, 142);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #39A900;
  box-shadow: 0 0 0 2px rgba(46, 161, 46, 0.1);
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn-submit {
  background-color: #39A900;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #2d8000;
}

@media (max-width: 768px) {
  .planear-mantenimiento-form {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-section-content {
    grid-template-columns: 1fr;
  }

  .form-section-content-image {
    order: 1; /* Mueve la imagen debajo del autocomplete */
    margin-top: 1rem;
  }

  .asset-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>