<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiService";

const headers = ref([
    { text: "Nombre usuario", value: "actionLog.userId.name" },
    { text: "Rol", value: "actionLog.userId.assignedRol.name" },
    { text: "Fecha de acción", value: "actionLog.date" },
    { text: "Hora de acción", value: "actionLog.time" },
    { text: "Acción", value: "actionLog.action" },
    { text: "Modulo", value: "actionLog.moduloId.name" },
]);

const fields = ref({
    user: {
        value: "userId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
    },
    rol: {
        value: "userId.assignedRol.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    date: {
        value: "date",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    time: {
        value: "time",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    action: {
        value: "action",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    module: {
        value: "moduloId.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
});

const rows = ref([]);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('es-ES', options);
};

const fetchData = async () => {
    try {
        const response = await apiService.get(
            "/action-log",
            {},
        );
        rows.value = response.map((action) => ({
            ...action,
            date: formatDate(action.dateTime),
            time: formatTime(action.dateTime),
        }));
    } catch (error) {
        console.error("Error fetching rols:", error);
        alert("Error al cargar los usuarios");
    }
};

const handleDetail = () => {
    console.log("Detalle");
};

const icons = ref([
{ class: 'fa-solid fa-magnifying-glass', method:  handleDetail},
]);

onMounted(async () => {
    await fetchData();
});
</script>

<template>
    <div class="py-4 container-fluid">
        <div class="row">
            <div class="col-12">
                <AuthorsTable :title="'Historial de acciones'" :headers="headers" :rows="rows" :fields="fields"
                :icons="icons" />
            </div>
        </div>
    </div>
</template>

<style scoped>

.btn-custom {
    background-color: white; 
    color: #28a745; 
    border: 1px solid #28a745; 
    transition: all 0.3s ease; 
    margin-bottom: 0%;
}

.btn-custom:hover {
    background-color: #28a745; 
    color: white; 
}

.v-card {
    color: rgba(0, 0, 0, 0.87);
}

.v-card-title {
    color: rgba(0, 0, 0, 0.87);
}

.v-card-text {
    color: rgba(0, 0, 0, 0.6);
}
</style>