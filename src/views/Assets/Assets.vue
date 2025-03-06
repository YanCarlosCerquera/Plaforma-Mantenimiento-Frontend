<template>
  <div class="inventory-form">
    <header class="form-header">
      <div>
        <h1 class="title">Inventarios</h1>
        <h2 class="subtitle">
          {{ isEditMode ? "Editar bien" : "Registrar nuevo bien" }}
        </h2>
      </div>
      <img src="../../assets/logoSena.jpg" alt="SENA Logo" class="sena-logo" />
    </header>

    <form @submit.prevent="handleSubmit" class="form-container">
      <!-- Equipment Data Section -->
      <section class="form-section">
        <h3 class="section-title">Datos del equipo</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Lenovo Thinkpad"
            />
          </div>

          <div class="form-group">
            <label for="trainingCenterId">Centro de formación</label>
            <select
              id="trainingCenterId"
              v-model="formData.trainingCenterId"
              class="form-select"
            >
              <option value="">Seleccionar...</option>
              <option
                v-for="centro in trainingCenters"
                :key="centro.value"
                :value="centro.value"
              >
                {{ centro.text }}
              </option>
            </select>
          </div>

          <div class="form-group category-group">
      <label for="categoryId">Categoría</label>
      <div class="category-input-group">
        <select
          id="categoryId"
          v-model="formData.categoryId"
          class="form-select"
        >
          <option value="">Seleccionar...</option>
          <option
            v-for="categoria in categories"
            :key="categoria.value"
            :value="categoria.value"
          >
            {{ categoria.text }}
          </option>
        </select>
        <button 
          type="button"
          class="add-category-btn"
          @click="openCategoryModal"
        >
          +
        </button>
      </div>
    </div>

          <div class="form-group">
            <label for="equipmentType">Tipo de equipo</label>
            <input
              id="equipmentType"
              v-model="formData.equipmentType"
              type="text"
              class="form-input"
              placeholder="Computador portátil"
            />
          </div>

          <div class="form-group">
            <label for="location">Ubicación</label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              class="form-input"
              placeholder="Ambiente 212"
            />
          </div>

          <div class="form-group">
            <label for="serialNumber">Número de serie</label>
            <input
              id="serialNumber"
              v-model="formData.serialNumber"
              type="text"
              class="form-input"
              placeholder="18123564"
            />
          </div>

          <div class="form-group">
            <label for="acquisitionDate">Fecha de adquisición</label>
            <input
              id="acquisitionDate"
              v-model="formData.acquisitionDate"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="status">Estado</label>
            <select id="status" v-model="formData.status" class="form-select">
              <option value="">Seleccionar...</option>
              <option :value="true">Bueno</option>
              <option :value="false">Malo</option>
            </select>
          </div>

          <div class="form-group">
            <label for="brand">Marca</label>
            <input
              id="brand"
              v-model="formData.brand"
              type="text"
              class="form-input"
              placeholder="Lenovo"
            />
          </div>

          <div class="form-group">
            <label for="inventoryCode">Código de inventario</label>
            <input
              id="inventoryCode"
              v-model="formData.inventoryCode"
              type="text"
              class="form-input"
              placeholder="95270241"
            />
          </div>

          <div class="form-group">
            <label for="modelo">Modelo</label>
            <input
              id="modelo"
              v-model="formData.modelo"
              type="text"
              class="form-input"
              placeholder="Thinkpad"
            />
          </div>

          <div class="form-group">
            <label for="accountHolder">Cuentadante</label>
            <input
              id="accountHolder"
              v-model="formData.accountHolder"
              type="text"
              class="form-input"
              placeholder="Yan Carlos Cerquera"
            />
          </div>
        </div>
      </section>

      <!-- Image Upload Section -->
      <section class="image-section">
        <h3 class="section-title">Cargar imagen del bien</h3>

        <div class="image-container">
          <!-- Lado izquierdo - Carga de imagen -->
          <div class="upload-side">
            <h4 class="upload-title">Cargar Img</h4>
            <div class="upload-box">
              <input
                id="image"
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                class="file-input"
              />
              <p class="upload-text">Suelta tu imagen aquí</p>
              <p class="upload-formats">Agrega PNG, JPG, JPEG, WEBP</p>
            </div>
          </div>

          <!-- Lado derecho - Vista previa -->
          <div class="preview-side">
            <h4 class="preview-title">Ver la Img</h4>
            <div class="preview-box">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Vista previa"
                class="preview-image"
              />
              <div v-else class="empty-preview">
                <span>Vista previa de la imagen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Manufacturer Data Section -->
      <section class="form-section">
        <h3 class="section-title">Datos del fabricante</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="manufacturerName">Nombre</label>
            <input
              id="manufacturerName"
              v-model="formData.manufacturer.name"
              type="text"
              class="form-input"
              placeholder="ColTec S.A.S"
            />
          </div>

          <div class="form-group">
            <label for="manufacturerAddress">Dirección</label>
            <input
              id="manufacturerAddress"
              v-model="formData.manufacturer.address"
              type="text"
              class="form-input"
              placeholder="Cra 5 # 17-45 Bogota"
            />
          </div>

          <div class="form-group">
            <label for="manufacturerPhone">Teléfono</label>
            <input
              id="manufacturerPhone"
              v-model="formData.manufacturer.phone"
              type="tel"
              class="form-input"
              placeholder="608 875 42 36"
            />
          </div>
        </div>
      </section>

      <!-- Provider Data Section -->
      <section class="form-section">
        <h3 class="section-title">Datos del proveedor</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="supplierName">Nombre</label>
            <input
              id="supplierName"
              v-model="formData.supplier.name"
              type="text"
              class="form-input"
              placeholder="ColTec S.A.S"
            />
          </div>

          <div class="form-group">
            <label for="supplierAddress">Dirección</label>
            <input
              id="supplierAddress"
              v-model="formData.supplier.address"
              type="text"
              class="form-input"
              placeholder="Cra 5 # 17-45 Bogota"
            />
          </div>

          <div class="form-group">
            <label for="supplierPhone">Teléfono</label>
            <input
              id="supplierPhone"
              v-model="formData.supplier.phone"
              type="tel"
              class="form-input"
              placeholder="608 875 42 36"
            />
          </div>
        </div>
      </section>

      <!-- Submit Button -->
      <div class="form-actions">
        <button type="submit" class="btn-submit">
          {{ isEditMode ? "Guardar cambios" : "Guardar" }}
        </button>
      </div>
    </form>
  </div>
  <CategoryModal
      :is-open="showCategoryModal"
      @close="closeCategoryModal"
      @save="handleCategoryModalSave"
    />
    
</template>

<script setup>
import Swal from "sweetalert2";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "../../service/apiService";
import CategoryModal from "../Category/CategoryModal.vue";

const router = useRouter();
const isEditMode = ref(false);
const requert = ref(false);

const formData = ref({
  name: '',
  location: '',
  acquisitionDate: '',
  brand: '',
  modelo: '',
  equipmentType: '',
  serialNumber: '',
  inventoryCode: '',
  accountHolder: '',
  trainingCenterId: '',
  categoryId: '',
  status: '',
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
});
const showCategoryModal = ref(false);

const openCategoryModal = () => {
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
};
const imagePreview = ref(null);
const trainingCenters = ref([]);
const categories = ref([]);

const handleCategoryModalSave = async (categoryData) => {
  try {
    // Here you would typically save the category data to your API
    const response = await apiService.post('/categories', {
      ...categoryData,
      name: formData.value.name // or however you want to structure your category data
    });
    requert.value = response
    // Refresh categories list
    const categoriesResponse = await apiService.get("/Categorias");
    categories.value = (categoriesResponse.data || categoriesResponse).map(
      (category) => ({
        value: category._id,
        text: category.name,
      })
    );

    // Show success message
    Swal.fire({
      title: "Categoría creada",
      icon: "success",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#28a745",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error saving category:", error);
    Swal.fire({
      title: "Error",
      text: "No se pudo guardar la categoría",
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
// Cargar datos si estamos en modo edición
const loadAssetData = async () => {
  const assetId = localStorage.getItem("editAssetId");
  console.log(assetId);

  if (assetId) {
    isEditMode.value = true;
    try {
      console.log("Cargando activo con ID:", assetId);
      const response = await apiService.get(`/assets/${assetId}`);
      const asset = response.data || response;
      console.log("Datos del activo:", asset);

      // Formatear la fecha para el input date
      const date = asset.acquisitionDate
        ? new Date(asset.acquisitionDate).toISOString().split("T")[0]
        : "";

      formData.value = {
        name: asset.name || "",
        location: asset.location || "",
        acquisitionDate: date,
        brand: asset.brand || "",
        modelo: asset.modelo || "",
        equipmentType: asset.equipmentType || "",
        serialNumber: asset.serialNumber || "",
        inventoryCode: asset.inventoryCode || "",
        accountHolder: asset.accountHolder || "",
        trainingCenterId: asset.trainingCenterId?._id || "",
        categoryId: asset.categoryId?._id || "",
        status: asset.status || false,
        manufacturer: {
          name: asset.manufacturer?.name || "",
          address: asset.manufacturer?.address || "",
          phone: asset.manufacturer?.phone || "",
        },
        supplier: {
          name: asset.supplier?.name || "",
          address: asset.supplier?.address || "",
          phone: asset.supplier?.phone || "",
        },
      };
    } catch (error) {
      console.error("Error loading asset:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar la información del activo",
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
  } else {
    isEditMode.value = false;
  }
};

const handleSubmit = async () => {
  try {
    const dataToSend = {
      ...formData.value,
      acquisitionDate: formData.value.acquisitionDate
        ? new Date(formData.value.acquisitionDate).toISOString()
        : null,
    };

    const assetId = localStorage.getItem("editAssetId");

    if (assetId) {
      // Modo edición - usar patch en lugar de put
      await apiService.patch(`/assets/${assetId}`, dataToSend);
      Swal.fire({
        title: "Activo actualizado",
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
      // Modo creación
      await apiService.post("/assets", dataToSend);
      Swal.fire({
        title: "Activo creado",
        icon: "success",
        position: "bottom-right",
        toast: true,
        timer: 3000,
        background: "#28a745",
        color: "white",
        iconColor: "white",
        showConfirmButton: false,
      });
    }
    // Limpiar el localStorage y redirigir
    localStorage.removeItem("editAssetId");
    router.push("/assets");
  } catch (error) {
    console.error("Error saving asset:", error);
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Error al guardar el activo",
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

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      formData.value.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Cargar datos iniciales
onMounted(async () => {
  try {
    // Cargar centros de formación
    const centersResponse = await apiService.get("/training-centers");
    trainingCenters.value = (centersResponse.data || centersResponse).map(
      (center) => ({
        value: center._id,
        text: center.name,
      })
    );

    // Cargar categorías
    const categoriesResponse = await apiService.get("/Categorias");
    categories.value = (categoriesResponse.data || categoriesResponse).map(
      (category) => ({
        value: category._id,
        text: category.name,
      })
    );

    // Cargar datos del activo si existe ID en localStorage
    await loadAssetData();
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
});
</script>

<style scoped>
.inventory-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.title {
  color: #2ea12e;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  color: #333;
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}

.sena-logo {
  height: 50px;
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

.section-title {
  color: #2ea12e;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.875rem;
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

.image-section {
  margin: 2rem 0;
}

.image-container {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.upload-side,
.preview-side {
  flex: 1;
  min-width: 0;
}

.upload-title,
.preview-title {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.upload-box,
.preview-box {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-box {
  background-color: #f9f9f9;
  cursor: pointer;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-text {
  color: #666;
  margin: 0.5rem 0;
}

.upload-formats {
  color: #999;
  font-size: 0.875rem;
}

.preview-box {
  background-color: white;
}

.preview-image {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
}

.empty-preview {
  color: #999;
  text-align: center;
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

@media (max-width: 768px) {
  .inventory-form {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .image-container {
    flex-direction: column;
  }

  .upload-side,
  .preview-side {
    width: 100%;
  }
  .category-group {
  position: relative;
}

.category-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.add-category-btn {
  background-color: #2ea12e;
  color: white;
 
}

.add-category-btn:hover {
  background-color: #248f24;
}
}
</style>
