<script setup>
import { onMounted, ref } from 'vue';
import AuthorsTable from './AuthorsTable.vue';
import apiService from '../../service/apiService';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const loading = ref(false);
const word_ordens = ref([]);
const word_informes = ref([]);
const activeTab = ref('ordenes');

const props = defineProps({
    userData: {
        type: Object,
        required: true,
    }
});

const headers_ordens = ref([
    'Maquinaria y/o equipo',
    'Ubicación',
    'Fecha de asignación',
    'Fecha limite de ejecución',
    'Estado',
]);
const headers_informes = ref([
    'Informe',
    'Código inventario',
    'Horas',
    'Costo',
    'Trabajo realizado',
    'Ejecutado por',
]);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${day}.${month}.${year} - ${formattedHours}.${minutes} ${ampm}`;
};

const getEstado = (state, prioridad) => {
    if (state) {
        return 'Ejecutada';
    } else if (!state && prioridad) {
        return 'Vencida';
    } else {
        return 'Sin ejecutar';
    }
};

const getEstadoClass = (estado) => {
    if (estado === 'Ejecutada') {
        return 'estado-ejecutada';
    } else if (estado === 'Vencida') {
        return 'estado-vencida';
    } else {
        return 'estado-sin-ejecutar';
    }
};

const fields_ordens = ref({
    maquinaria: {
        showAvatar: true,
        avatar: "solicitud.asset.image",
        main: "solicitud.asset.name",
    },
    ubicacion: {
        value: 'solicitud.asset.location',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    fecha_asignacion: {
        value: (row) => formatDate(row.fechaInicio),
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    fecha_limite: {
        value: (row) => formatDate(row.fechaFin),
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    state: {
        value: (row) => getEstado(row.state, row.prioridad),
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
        customClass: (row) => getEstadoClass(getEstado(row.state, row.prioridad)),
    },
});

const fields_informes = ref({
    informe: {
        value: 'orderId.radicado',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold mb-0',
    },
    codigo_inventario: {
        value: 'orderId.solicitud.InventoryCode',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    horas: {
        value: 'hours',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    costo: {
        value: 'costs',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    trabajo_realizado: {
        value: 'workDone',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
    ejecutado_por: {
        value: 'orderId.tecnicoId.name',
        class: 'align-middle',
        textClass: 'text-xs font-weight-bold',
    },
});

const fetchWordOrdens = async () => {
    try {
        loading.value = true;
        const { userId, role } = props.userData;
        let url = '/word-orden';
        
        if (role === 'instructor' || role === 'tecnico') {
            url += `?${role}Id=${userId}`;
        }

        const data = await apiService.get(url);
        word_ordens.value = data;
        loading.value = false;
    } catch (error) {
        console.error('Error fetching ordens:', error);
        alert('Error al cargar las ordenes');
        loading.value = false;
    }
};

const fetchWorkReports = async () => {
    try {
        loading.value = true;
        const { userId, role } = props.userData;
        let url = '/work-report';
        
        if (role === 'instructor' || role === 'tecnico') {
            url += `?${role}Id=${userId}`;
        }

        const data = await apiService.get(url);
        word_informes.value = data;
        loading.value = false;
    } catch (error) {
        console.error('Error fetching work reports:', error);
        alert('Error al cargar los informes');
        loading.value = false;
    }
};

const changeTab = (tab) => {
    activeTab.value = tab;
};

const handeDetailOrden = (row) => {
    const doc = new jsPDF();
    const rowData = row;

    doc.text('Detalle de la Orden de Trabajo', 10, 10);
    doc.text(`Maquinaria y/o equipo: ${rowData.solicitud.asset.name}`, 10, 20);
    doc.text(`Ubicación: ${rowData.solicitud.asset.location}`, 10, 30);
    doc.text(`Fecha de asignación: ${formatDate(rowData.fechaInicio)}`, 10, 40);
    doc.text(`Fecha limite de ejecución: ${formatDate(rowData.fechaFin)}`, 10, 50);
    doc.text(`Estado: ${getEstado(rowData.state, rowData.prioridad)}`, 10, 60);

    doc.save('detalle_orden_trabajo.pdf');
};

const handleDetailReporte = (row) => {
    const doc = new jsPDF();
    const rowData = row;

    doc.text('Detalle del Informe de Mantenimiento', 10, 10);
    doc.text(`Informe: ${rowData.orderId.radicado}`, 10, 20);
    doc.text(`Código inventario: ${rowData.orderId.solicitud.InventoryCode}`, 10, 30);
    doc.text(`Horas: ${rowData.hours}`, 10, 40);
    doc.text(`Costo: ${rowData.costs}`, 10, 50);
    doc.text(`Trabajo realizado: ${rowData.workDone}`, 10, 60);
    doc.text(`Ejecutado por: ${rowData.orderId.tecnicoId.name}`, 10, 70);

    doc.save('detalle_informe_mantenimiento.pdf');
}

const handleDeleteReporte = async (row) => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo!',
        cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apiService.delete(`/work-report/${row._id}`);
                    await fetchWorkReports();
                    Swal.fire({
                        title: "Reporte eliminado",
                        text: "El informe ha sido eliminado correctamente.",
                        icon: "success",
                        position: "bottom-right",
                        toast: true,
                        timer: 3000,
                        background: "#28a745",
                        color: "white",
                        iconColor: "white",
                        showConfirmButton: false,
                        customClass: {
                            title: "swal-title-white",
                        },
                    });
                } catch (error) {
                    console.error('Error deleting report:', error);
                    alert('Error al eliminar el reporte');
                }
            }
    })
};

const icons_ordens = ref([
    { class: "fa-solid fa-download",  method: handeDetailOrden },
]);

const icons_reportes = ref([
    { class: "fa-solid fa-download",  method: handleDetailReporte },
    { class: "fa-solid fa-trash", method: handleDeleteReporte },
])

onMounted(async () => {
    await fetchWordOrdens();
    await fetchWorkReports();
});
</script>

<template>
    <div class="work-orders-container">
        <div class="header">
            <h2 class="title text-success">{{ activeTab === 'ordenes' ? 'Ordenes de trabajo' : 'Informe de mantenimiento' }}</h2>
            
            <div class="tab-switcher">
                <button 
                    :class="['tab-button', { active: activeTab === 'ordenes' }]" 
                    @click="changeTab('ordenes')"
                >
                    Ordenes
                </button>
                <button 
                    :class="['tab-button', { active: activeTab === 'informes' }]" 
                    @click="changeTab('informes')"
                >
                    Informes
                </button>
            </div>
        </div>
        
        <div class="tab-content">
            <div v-if="activeTab === 'ordenes'">
                <AuthorsTable
                    :fields="fields_ordens"
                    :headers="headers_ordens"
                    :rows="word_ordens"
                    :icons="icons_ordens"
                    :searchOption="false"
                    :exportOption="false"
                />
            </div>
            <div v-else>
                <AuthorsTable
                    :fields="fields_informes"
                    :headers="headers_informes"
                    :rows="word_informes"
                    :icons="icons_reportes"
                    :searchOption="false"
                    :exportOption="false"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.work-orders-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #4CAF50;
    margin: 0;
}

.tab-switcher {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tab-button {
    padding: 8px 20px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
    background-color: white;
    color: #333;
}

.tab-button.active {
    background-color: #4CAF50;
    color: white;
}

.tab-content {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
}

.estado-ejecutada {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
}

.estado-vencida {
    background-color: #fff8e1;
    color: #ff8f00;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
}

.estado-sin-ejecutar {
    background-color: #ffebee;
    color: #c62828;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
}

.options-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
}

.download-btn, .search-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
}

.download-btn:hover, .search-btn:hover {
    color: #4CAF50;
}

/* Responsive styles */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .tab-button {
        padding: 6px 15px;
        font-size: 0.9rem;
    }
    
    .title {
        font-size: 1.3rem;
    }
}
</style>