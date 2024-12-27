<template>
  <div class="planear-mantenimiento-form">
    <header class="form-header">
      <div>
        <h1 class="title">Gestion de actividades de mantenimiento</h1>
        <h2 class="subtitle">Solicitud de mantenimiento</h2>
      </div>
      <img src="../assets/logoSena.jpg" alt="SENA Logo" class="sena-logo" />
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
              />
            </div>
  
            <div class="form-group">
              <label>Fecha de solicitud</label>
              <input 
                type="text"
                class="form-input"
                placeholder="19-06-2024"
              />
            </div>
  
            <div class="form-group">
              <label>Tipo de mantenimiento</label>
              <select 
                class="form-select"
              >
                <option>Preventivo</option>
              </select>
            </div>
  
            <div class="form-group">
              <label>Codigo inventario</label>
              <input 
                type="text"
                class="form-input"
                placeholder="95271025953"
              />
            </div>
          </div>
  
          <img
            class="form-section-content-image"
            src="../assets/img/image-planear-mantenimiento.png"
            alt=""
          >
        </div>

      </section>

      <section class="form-section">
        <h3 class="section-title">Informacion del bien</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>Centro de formacion</label>
            <p>
              Centro de la empresa la industria y los Servicios.
            </p>
          </div>

          <div class="form-group">
            <label>Ubicacion</label>
            <p>
              Lab. Tecnologias de la informacion
            </p>
          </div>

          <div class="form-group">
            <label>Fecha de adquisición</label>
            <p>
              11-09-2015
            </p>
          </div>

          <div class="form-group">
            <label>Marca</label>
            <p>
              Fluke
            </p>
          </div>

          <div class="form-group">
            <label>Modelo</label>
            <p>
              DSX-5000
            </p>
          </div>

          <div class="form-group">
            <label>Cuentadante</label>
            <p>
              Edgar Eduardo Olarte
            </p>
          </div>

          <div class="form-group">
            <label>Numero de serie</label>
            <p>
              1818116396
            </p>
          </div>

          <div class="form-group">
            <label>Tipo de equipo</label>
            <p>
              Tecnico
            </p>
          </div>

          <div class="form-group">
            <label>Estado</label>
            <p>
              Bueno
            </p>
          </div>
        </div>

        <div class="form-group">
          <label>Descripcion de la solicitud</label>
          <textarea
            class="form-input"
            rows="4"
          >Describa el motivo de la solicitud</textarea>
        </div>
      </section>

      <div class="form-actions">
        <button 
          type="submit"
          class="btn-submit"
        >
          Enviar solicitud
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const handleSubmit = () => {
  console.log('Form submitted');
};
</script>

<style scoped>
.planear-mantenimiento-form {
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
  color: #0f610f;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.subtitle {
  color: rgba(#0f610f, 0.7);
  font-size: 1.25rem;
  font-weight: 500;
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
  border-color: #2EA12E;
  box-shadow: 0 0 0 2px rgba(46, 161, 46, 0.1);
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
  .planear-mantenimiento-form {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>