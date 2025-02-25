<template>
    <div class="orden-trabajo">
      <h1>Gestión de actividades de mantenimiento</h1>
      <h2>Formato orden de trabajo (desarrollo)</h2>
  
      <div class="orden-info">
        <p><strong>Orden de trabajo:</strong> OT-2024-9054</p>
      </div>
  
      <table class="tabla-info">
        <tr>
          <th>Numero de serie</th>
          <th>Orden de Trabajo</th>
          <th>Realizar informe</th>
        </tr>
        <tr>
          <td>Nombre de contacto</td>
          <td>Numero de placa</td>
          <td>Fecha inicio</td>
        </tr>
        <tr>
          <td>Ubicación</td>
          <td>Teléfono</td>
          <td>Fecha fin</td>
        </tr>
        <tr>
          <td></td>
          <td>Hora inicio</td>
          <td>Hora fin</td>
        </tr>
      </table>
  
      <div class="trabajo-realizado">
        <h3>Trabajo realizado</h3>
        <div class="mantenimiento">
          <label>
            <input type="checkbox" v-model="preventivo"> Preventivo
          </label>
          <label>
            <input type="checkbox" v-model="correctivo"> Correctivo
          </label>
        </div>
  
        <div class="descripcion">
          <h4>Descripción del trabajo y/o servicio solicitado</h4>
          <textarea v-model="descripcion"></textarea>
        </div>
  
        <div class="observaciones">
          <h4>Observaciones</h4>
          <textarea v-model="observaciones"></textarea>
        </div>
  
        <div class="estado">
          <label>
            <input type="checkbox" v-model="ejecutado"> Ejecutado
          </label>
          <label>
            <input type="checkbox" v-model="pendiente"> Pendiente
          </label>
        </div>
  
        <div class="ejecutado-por">
          <h4>Ejecutado por:</h4>
          <p>A&t to edit ✓✓✓</p>
        </div>
  
        <div class="repuestos">
          <h4>Repuestos requeridos</h4>
          <label>
            <input type="checkbox" v-model="repuestosSi"> Si
          </label>
          <label>
            <input type="checkbox" v-model="repuestosNo"> No
          </label>
          <label>
            <input type="checkbox" v-model="repuestosNoAplica"> No aplica
          </label>
        </div>
  
        <div class="detalle-repuestos">
          <h4>Detalle de repuestos</h4>
          <textarea v-model="detalleRepuestos"></textarea>
        </div>
  
        <div class="firma">
          <p>Firma técnico</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        preventivo: false,
        correctivo: false,
        descripcion: '',
        observaciones: '',
        ejecutado: false,
        pendiente: false,
        repuestosSi: false,
        repuestosNo: false,
        repuestosNoAplica: false,
        detalleRepuestos: ''
      };
    }
  };
  </script>
  
  <style scoped>
  .orden-trabajo {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  
  .tabla-info {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  .tabla-info th, .tabla-info td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  
  .trabajo-realizado {
    margin-top: 20px;
  }
  
  .mantenimiento, .estado, .repuestos {
    margin-bottom: 20px;
  }
  
  textarea {
    width: 100%;
    height: 100px;
    margin-top: 10px;
  }
  
  .firma {
    margin-top: 20px;
    text-align: right;
  }
  </style>