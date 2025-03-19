<template>
  <div class="planear-mantenimiento-form">
    <header class="form-header">
      <div>
        <h2 class="title">Gestión de actividades de mantenimiento</h2>
        <h4 class="subtitle">Solicitud de mantenimiento</h4>
      </div>
    </header>

    <form class="form-container" v-if="requestData">
      <section class="form-section">
        <h3 class="section-title">Información del bien</h3>

        <div class="details-container">
          <div class="details-info">
            <div class="info-group">
              <div class="info-item">
                <label>Ambiente</label>
                <p>
                  {{
                    requestData.assetInfo?.environmentId.name ||
                    "No disponible"
                  }}
                </p>
              </div>

              <div class="info-item">
                <label>Ubicación</label>
                <p>{{ requestData.assetInfo?.location || "No disponible" }}</p>
              </div>
            </div>

            <div class="info-group">
              <div class="info-item">
                <label>Marca</label>
                <p>{{ requestData.assetInfo?.brand || "No disponible" }}</p>
              </div>

              <div class="info-item">
                <label>Modelo</label>
                <p>{{ requestData.assetInfo?.modelo || "No disponible" }}</p>
              </div>
            </div>

            <div class="info-group">
              <div class="info-item">
                <label>Número de serie</label>
                <p>
                  {{ requestData.assetInfo?.serialNumber || "No disponible" }}
                </p>
              </div>

              <div class="info-item">
                <label>Tipo de equipo</label>
                <p>
                  {{ requestData.assetInfo?.equipmentType || "No disponible" }}
                </p>
              </div>
            </div>

            <div class="info-group">
              <div class="info-item">
                <label>Fecha de adquisición</label>
                <p>{{ formatDate(requestData.assetInfo?.acquisitionDate) }}</p>
              </div>

              <div class="info-item">
                <label>Estado</label>
                <p>{{ requestData.assetInfo?.status || "No disponible" }}</p>
              </div>
            </div>

            <div class="info-group">
              <div class="info-item">
                <label>Cuentadante</label>
                <p>
                  {{ requestData.assetInfo?.accountHolder || "No disponible" }}
                </p>
              </div>
            </div>
          </div>

          <div class="details-image">
            <img
              :src="requestData.image"
              alt="Asset image"
              class="equipment-image"
            />
            <button
              class="specs-button"
              :disabled="isLoading"
              @click="handleSubmit"
            >
              <i class="fas fa-cog"></i>
              Especificaciones técnicas
            </button>

            <div class="report-buttons">
              <span class="report-label">Reportes:</span>
              <button class="report-btn pdf" @click="downloadPDF">
                <i class="fas fa-file-pdf"></i>
              </button>
              <button class="report-btn excel" @click="downloadExcel">
                <i class="fas fa-file-excel"></i>
              </button>
            </div>
          </div>
        </div>

        <h3 class="section-title">Información Proveedor</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>Cuentadante</label>
            <p>
              {{ requestData.assetInfo?.manufacturer.name || "No disponible" }}
            </p>
          </div>

          <div class="form-group">
            <label>Número de serie</label>
            <p>
              {{ requestData.assetInfo?.manufacturer.phone || "No disponible" }}
            </p>
          </div>

          <div class="form-group">
            <label>Tipo de equipo</label>
            <p>
              {{
                requestData.assetInfo?.manufacturer.address || "No disponible"
              }}
            </p>
          </div>
        </div>

        <h3 class="section-title">Información Accesorios</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>Cuentadante</label>
            <p>{{ requestData.assetInfo?.supplier.name || "No disponible" }}</p>
          </div>

          <div class="form-group">
            <label>Número de serie</label>
            <p>
              {{ requestData.assetInfo?.supplier.phone || "No disponible" }}
            </p>
          </div>

          <div class="form-group">
            <label>Tipo de equipo</label>
            <p>
              {{ requestData.assetInfo?.supplier.address || "No disponible" }}
            </p>
          </div>
        </div>
      </section>

      <hr />
      <section
        class="form-section"
        v-if="
          requestData.maintenanceHistory &&
          requestData.maintenanceHistory.length > 0
        "
      >
        <h3 class="section-title">Historial de mantenimiento</h3>
        <div class="table-responsive">
          <table class="maintenance-table">
            <thead>
              <tr>
                <th>Tipo de Mantenimiento</th>
                <th>Orden de trabajo</th>
                <th>Horas</th>
                <th>Costo</th>
                <th>Trabajo Realizado</th>
                <th>Observaciones</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="maintenance in requestData.maintenanceHistory"
                :key="maintenance._id"
              >
                <td>
                  {{
                    maintenance?.orderId?.solicitud?.solicitudId
                      ?.maintenanceType || "No especificado"
                  }}
                </td>
                <td>{{ maintenance?.orderId?.radicado || "Sin radicado" }}</td>
                <td>{{ maintenance?.hours || "0" }}</td>
                <td>${{ maintenance?.costs?.toFixed(2) || "0.00" }}</td>
                <td>{{ maintenance?.workDone || "No especificado" }}</td>
                <td>{{ maintenance?.observation || "Sin observaciones" }}</td>
                <td>{{ formatDate(maintenance?.createdAt) }}</td>
                <td>
                  <button
                    class="view-button"
                    @click="viewMaintenanceDetail(maintenance)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="form-actions"></div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "../../service/apiservice";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Cookies from "js-cookie";

const router = useRouter();
const isLoading = ref(false);
const requestData = ref({
  assetInfo: null,
  maintenanceHistory: [],
});

const loadMaintenanceHistory = async (serialNumber) => {
  if (!serialNumber) {
    console.error("No hay número de serie disponible");
    return [];
  }

  try {
    const response = await apiService.get(
      `/work-report/maintenanceHistory/${serialNumber}`
    );

    if (Array.isArray(response)) {
      return response.map((item) => ({
        ...item,
        costs: parseFloat(item.costs || 0),
        hours: parseInt(item.hours || 0),
        orderId: {
          ...item.orderId,
          solicitud: item.orderId?.solicitud || { solicitudId: {} },
        },
      }));
    }
    return [];
  } catch (error) {
    console.error("Error al obtener historial de mantenimiento:", error);
    return [];
  }
};

// Función principal para cargar los datos del activo
const loadAssetData = async () => {
  const assetId = Cookies.get("editAssetId");
  if (!assetId) {
    console.error("No se encontró ID del activo");
    router.push("/assets");
    return;
  }

  isLoading.value = true;
  try {
    const assetResponse = await apiService.get(`/assets/${assetId}`);

    if (!assetResponse) {
      throw new Error("No se recibieron datos del activo");
    }

    const history = await loadMaintenanceHistory(assetResponse.serialNumber);

    requestData.value = {
      assetInfo: assetResponse,
      maintenanceHistory: history,
    };
    requestData.value.image = `${assetResponse.image}`;
  } catch (error) {
    console.error("Error al cargar datos:", error);
    if (error.response?.status === 403) {
      router.push("/login");
    }
  } finally {
    isLoading.value = false;
  }
};

// Iniciar carga de datos cuando el componente se monta
onMounted(() => {
  loadAssetData();
});

const unregisterRouteGuard = router.beforeEach((to, from, next) => {
  if (to.path !== "/detalles") {
    Cookies.remove("editAssetId");
  }
  next();
});

onUnmounted(() => {
  unregisterRouteGuard();
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("es-CO", options);
};

const handleSubmit = async () => {
  if (requestData.value?.assetInfo?.serialNumber) {
    localStorage.setItem(
      "serialNumber",
      requestData.value.assetInfo.serialNumber
    );
    router.push("/detalles");
  } else {
    console.error("No hay número de serie disponible");
  }
};


const downloadPDF = () => {
  const doc = new jsPDF();

  // Título del documento
  doc.setFontSize(18);
  doc.text('Información del Bien', 10, 10);

  // Información del bien
  doc.setFontSize(12);
  doc.text(`Ambiente: ${requestData.value.assetInfo?.environmentId.name || "No disponible"}`, 10, 20);
  doc.text(`Ubicación: ${requestData.value.assetInfo?.location || "No disponible"}`, 10, 30);
  doc.text(`Marca: ${requestData.value.assetInfo?.brand || "No disponible"}`, 10, 40);
  doc.text(`Modelo: ${requestData.value.assetInfo?.modelo || "No disponible"}`, 10, 50);
  doc.text(`Número de serie: ${requestData.value.assetInfo?.serialNumber || "No disponible"}`, 10, 60);
  doc.text(`Tipo de equipo: ${requestData.value.assetInfo?.equipmentType || "No disponible"}`, 10, 70);
  doc.text(`Fecha de adquisición: ${formatDate(requestData.value.assetInfo?.acquisitionDate)}`, 10, 80);
  doc.text(`Estado: ${requestData.value.assetInfo?.status || "No disponible"}`, 10, 90);
  doc.text(`Cuentadante: ${requestData.value.assetInfo?.accountHolder || "No disponible"}`, 10, 100);

  // Información del proveedor
  doc.text('Información del Proveedor', 10, 110);
  doc.text(`Cuentadante: ${requestData.value.assetInfo?.manufacturer.name || "No disponible"}`, 10, 120);
  doc.text(`Número de serie: ${requestData.value.assetInfo?.manufacturer.phone || "No disponible"}`, 10, 130);
  doc.text(`Tipo de equipo: ${requestData.value.assetInfo?.manufacturer.address || "No disponible"}`, 10, 140);

  // Información de accesorios
  doc.text('Información de Accesorios', 10, 150);
  doc.text(`Cuentadante: ${requestData.value.assetInfo?.supplier.name || "No disponible"}`, 10, 160);
  doc.text(`Número de serie: ${requestData.value.assetInfo?.supplier.phone || "No disponible"}`, 10, 170);
  doc.text(`Tipo de equipo: ${requestData.value.assetInfo?.supplier.address || "No disponible"}`, 10, 180);

  // Guardar el PDF
  doc.save('informacion_bien.pdf');
};

const downloadExcel = () => {
  const data = [
    ['Ambiente', requestData.value.assetInfo?.environmentId.name || "No disponible"],
    ['Ubicación', requestData.value.assetInfo?.location || "No disponible"],
    ['Marca', requestData.value.assetInfo?.brand || "No disponible"],
    ['Modelo', requestData.value.assetInfo?.modelo || "No disponible"],
    ['Número de serie', requestData.value.assetInfo?.serialNumber || "No disponible"],
    ['Tipo de equipo', requestData.value.assetInfo?.equipmentType || "No disponible"],
    ['Fecha de adquisición', formatDate(requestData.value.assetInfo?.acquisitionDate)],
    ['Estado', requestData.value.assetInfo?.status || "No disponible"],
    ['Cuentadante', requestData.value.assetInfo?.accountHolder || "No disponible"],
    ['Proveedor - Cuentadante', requestData.value.assetInfo?.manufacturer.name || "No disponible"],
    ['Proveedor - Número de serie', requestData.value.assetInfo?.manufacturer.phone || "No disponible"],
    ['Proveedor - Tipo de equipo', requestData.value.assetInfo?.manufacturer.address || "No disponible"],
    ['Accesorios - Cuentadante', requestData.value.assetInfo?.supplier.name || "No disponible"],
    ['Accesorios - Número de serie', requestData.value.assetInfo?.supplier.phone || "No disponible"],
    ['Accesorios - Tipo de equipo', requestData.value.assetInfo?.supplier.address || "No disponible"]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Información del Bien');

  XLSX.writeFile(wb, 'informacion_bien.xlsx');
};
</script>

<style scoped>
.planear-mantenimiento-form {
  border-radius: 20%;
  max-width: 1200px;
  margin: 0 auto;
  padding:0 2rem;
}

.form {
  margin-bottom: 2rem;
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

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
}

.form-section-content-image {
  margin: auto;
}

.section-title[data-v-6e17d3ef] {
  color: #2ea12e;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  margin: initial;
  align-content: center;
  text-align: center; /* Añade esta línea para centrar el texto */
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  border-color: #2ea12e;
  box-shadow: 0 0 0 2px rgba(46, 161, 46, 0.1);
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn-submit {
  background-color: #2ea12e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #248f24;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.tracking-number-container {
  position: relative;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.generate-button {
  background-color: #2ea12e;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.generate-button:hover {
  background-color: #248f24;
}

.generate-button i {
  font-size: 1.2rem;
}

.fa-spinner {
  margin-right: 8px;
}

.maintenance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-all {
  color: #2ea12e;
  text-decoration: none;
  font-size: 0.9rem;
}

.maintenance-table {
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #f5f5f5;
  padding: 1rem;
  text-align: left;
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
  font-size: 0.9rem;
}

.view-button {
  background: transparent;
  border: none;
  color: #2ea12e;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.view-button:hover {
  background: rgba(46, 161, 46, 0.1);
}
.form-section-content-image {
  margin: auto;
}
.view-button i {
  font-size: 1.1rem;
}

.details-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 1rem;
}

.details-info {
  flex: 1;
  max-width: 70%;
}

.info-group {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.info-item {
  flex: 1;
}

.info-item label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.info-item p {
  margin: 0;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  color: #666;
}

.details-image {
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.equipment-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.specs-button {
  width: 100%;
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.specs-button:hover {
  background: #45a049;
}

.report-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.report-label {
  color: #666;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.report-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.report-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.report-btn.pdf i {
  color: #dc3545;
  font-size: 1.5rem;
}

.report-btn.excel i {
  color: #28a745;
  font-size: 1.5rem;
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
  .details-container {
    flex-direction: column;
  }

  .details-info {
    max-width: 100%;
  }

  .info-group {
    flex-direction: column;
    gap: 1rem;
  }

  .details-image {
    width: 180px;
    margin: 0 auto;
  }
}
</style>