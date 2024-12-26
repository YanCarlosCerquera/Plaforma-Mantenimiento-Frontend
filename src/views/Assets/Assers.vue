<template>
  <div class="inventory-form">
    <header class="form-header">
      <div>
        <h1 class="title">Inventarios</h1>
        <h2 class="subtitle">Registrar nuevo bien</h2>
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

          <div class="form-group">
            <label for="categoryId">Categoría</label>
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
            <select 
              id="status"
              v-model="formData.status"
              class="form-select"
            >
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
        <button 
          type="submit"
          class="btn-submit"
        >
          Guardar
        </button>
      </div>
    </form>
  </div>
</template>
<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import apiService from '../../service/apiService';
import Swal from 'sweetalert2';

export default {
  name: 'InventoryForm',
  setup() {
    const formData = ref({
      name: "",
      location: "",
      acquisitionDate: "",
      brand: "",
      modelo: "",
      equipmentType: "",
      trainingCenterId: "",
      serialNumber: "",
      inventoryCode: "",
      accountHolder: "",
      categoryId: "",
      manufacturer: { name: "", address: "", phone: "" },
      supplier: { name: "", address: "", phone: "" },
      status: null,
      image: null,
    });

    const categories = ref([]);
    const trainingCenters = ref([]);
    const imagePreview = ref(null);

    const fetchCategories = async () => {
      try {
        const response = await apiService.get("/Categorias");
        if (response && Array.isArray(response)) {
          categories.value = response.map((category) => ({
            value: category._id,
            text: category.name,
          }));
        }
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
        categories.value = [];
      }
    };

    const fetchTrainingCenters = async () => {
      try {
        const response = await apiService.get("/training-centers");
        if (response && Array.isArray(response)) {
          trainingCenters.value = response.map((center) => ({
            value: center._id,
            text: center.name,
          }));
        }
      } catch (error) {
        console.error("Error al obtener los centros de formación:", error);
        trainingCenters.value = [];
      }
    };

    const validateForm = () => {
      const requiredFields = [
        'name', 'location', 'acquisitionDate', 'brand', 'modelo', 'equipmentType',
        'trainingCenterId', 'serialNumber', 'inventoryCode', 'accountHolder', 'categoryId',
        'status'
      ];

      for (const field of requiredFields) {
        if (!formData.value[field]) {
          Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text: `Por favor, complete el campo: ${field}`,
          });
          return false;
        }
      }

      if (!formData.value.manufacturer.name || !formData.value.manufacturer.address || !formData.value.manufacturer.phone) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Por favor, complete todos los campos del fabricante',
        });
        return false;
      }

      if (!formData.value.supplier.name || !formData.value.supplier.address || !formData.value.supplier.phone) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Por favor, complete todos los campos del proveedor',
        });
        return false;
      }

      return true;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        const formDataToSubmit = { ...formData.value };
        if (formDataToSubmit.acquisitionDate) {
          formDataToSubmit.acquisitionDate = new Date(formDataToSubmit.acquisitionDate);
        }
        const response = await apiService.post("/assets", formDataToSubmit);
        console.log("API Response:", response);
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El formulario se ha enviado correctamente.',
        });

        // Clear form fields
        Object.keys(formData.value).forEach(key => {
          if (typeof formData.value[key] === 'object' && formData.value[key] !== null) {
            Object.keys(formData.value[key]).forEach(subKey => {
              formData.value[key][subKey] = '';
            });
          } else {
            formData.value[key] = '';
          }
        });
        formData.value.status = null;
        imagePreview.value = null;

      } catch (error) {
        console.error("Error al enviar el formulario:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo.',
        });
      }
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        formData.value.image = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    onMounted(() => {
      fetchCategories();
      fetchTrainingCenters();
    });

    onBeforeUnmount(() => {
      if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
      }
    });

    return {
      formData,
      categories,
      trainingCenters,
      imagePreview,
      handleSubmit,
      handleImageUpload,
    };
  },
};
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
  color: #2EA12E;
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
  color: #2EA12E;
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
  border-color: #2EA12E;
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
  background-color: #2EA12E;
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
}
</style>