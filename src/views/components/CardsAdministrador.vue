<script setup>
import apiService from "../../service/apiService";
import { ref, onMounted } from "vue";

const maintenances = ref({
    total: 0,
    executed: 0,
    pending: 0,
});

const workOrders = ref({
    total: 0,
    executed: 0,
    expired: 0,
});

onMounted(async () => {
    try {
        const response = await apiService.get("/application-maintenance/statics");
        maintenances.value.total = response.All;
        maintenances.value.executed = response.Executed;
        maintenances.value.pending = response.Pending;

    } catch (error) {
        console.error("Error fetching maintenances:", error);
    }

    try {
        const response = await apiService.get("/word-orden/statics");
        workOrders.value.total = response.All;
        workOrders.value.executed = response.Executed;
        workOrders.value.expired = response.Expired;
    } catch (error) {
        console.error("Error fetching work orders:", error);
    }
});

</script>

<template>
<h4 class="text-success text-center my-4">Solicitudes de actividades de mantenimiento</h4>
        
        <div class="dashboard-cards">
          <div class="dashboard-card">
            <div class="card-content">
              <div class="card-info">
                <p class="card-title">Total Solicitudes</p>
                <h2 class="card-value">{{ maintenances.total  }}</h2>
              </div>
              <div class="card-icon green-bg">
                <i class="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-content">
              <div class="card-info">
                <p class="card-title">Total Ejecutadas</p>
                <h2 class="card-value">{{ maintenances.executed  }}</h2>
              </div>
              <div class="card-icon green-bg">
                <i class="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-content">
              <div class="card-info">
                <p class="card-title">Total pendientes</p>
                <h2 class="card-value">{{ maintenances.pending  }}</h2>
              </div>
              <div class="card-icon orange-bg">
                <i class="fas fa-clock"></i>
              </div>
            </div>
          </div>
        </div>
        
        <h4 class="text-success text-center my-4">Ordenes de trabajo</h4>
        
        <div class="dashboard-cards">
          <div class="dashboard-card">
            <div class="card-content">
              <div class="card-info">
                <p class="card-title">Total Ordenes Trabajo</p>
                <h2 class="card-value">{{ workOrders.total  }}</h2>
              </div>
              <div class="card-icon green-bg">
                <i class="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-content">
              <div class="card-info">
                <p class="card-title">Total OT Ejecutadas</p>
                <h2 class="card-value">{{ workOrders.executed  }}</h2>
              </div>
              <div class="card-icon green-bg">
                <i class="fas fa-chart-line"></i>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-content">
              <div class="card-info">
                <p class="card-title">Total Vencidas</p>
                <h2 class="card-value">{{ workOrders.expired  }}</h2>
              </div>
              <div class="card-icon red-bg">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
          </div>
        </div>
</template>

<style scoped>
/* Estilos para las tarjetas del dashboard */
.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 20px;
  width: 100%;
  margin-bottom: 30px;
  margin-top: 30px;
}

.dashboard-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 350px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 8px;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
}

.green-bg {
  background-color: #28a745;
}

.orange-bg {
  background-color: #fd7e14;
}

.red-bg {
  background-color: #dc3545;
}

@media (max-width: 768px) {

    .dashboard-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .dashboard-card {
    max-width: 100%;
  }
}
</style>