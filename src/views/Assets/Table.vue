<template>
    <div class="table-container">
      <v-card class="mb-4 pa-4">
        <v-table height="300px" fixed-header>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Brand</th>
              <th class="text-left">Model</th>
              <th class="text-left">Serial Number</th>
              <th class="text-left">Inventory Code</th>
              <th class="text-left">Training Center</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in assets" :key="item._id">
              <td>{{ item.name }}</td>
              <td>{{ item.location }}</td>
              <td>{{ item.modelo }}</td>
              <td>{{ item.serialNumber }}</td>
              <td>{{ item.inventoryCode }}</td>
              <td>{{ item.trainingCenterId?.name || "Sin asignar" }}</td>
              <td>
                <div class="d-flex justify-center gap-2">
                  <v-btn
                    color="error"
                    size="small"
                    variant="text"
                    @click="deleteAsset(item._id)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                  </v-btn>
  
                  <v-btn
                    color="primary"
                    size="small"
                    variant="text"
                    @click="downloadAsset(item._id)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                    </svg>
                  </v-btn>
  
                  <v-btn
                    color="warning"
                    size="small"
                    variant="text"
                    @click="editAsset(item._id)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
  
      <div class="text-center">
        <v-pagination 
          v-model="page" 
          :length="totalPages" 
          rounded="circle"
          @update:model-value="fetchAssets"
        ></v-pagination>
      </div>
  
      <!-- Dialog de confirmación para eliminar -->
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h5">
            Confirmar eliminación
          </v-card-title>
          <v-card-text>
            ¿Está seguro que desea eliminar este elemento?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="deleteDialog = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              @click="confirmDelete"
            >
              Eliminar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  import apiService from '../../service/apiService';
  
  export default {
    name: 'AssetTable',
    data() {
      return {
        page: 1,
        assets: [],
        totalPages: 1,
        itemsPerPage: 10,
        deleteDialog: false,
        selectedAssetId: null,
        loading: false,
      };
    },
    methods: {
      async fetchAssets() {
        this.loading = true;
        try {
          const response = await apiService.get("/assets", {
            params: {
              page: this.page,
              limit: this.itemsPerPage
            }
          });
          
          if (Array.isArray(response)) {
            this.assets = response;
          } else if (response && typeof response === 'object') {
            this.assets = [response];
          } else {
            console.error('Unexpected API response structure:', response);
            this.assets = [];
          }
          
          this.totalPages = Math.ceil(this.assets.length / this.itemsPerPage);
          this.totalPages = Math.max(this.totalPages, 1);
          
        } catch (error) {
          console.error("Error fetching assets:", error);
          this.assets = [];
          this.totalPages = 1;
        } finally {
          this.loading = false;
        }
      },
  
      deleteAsset(id) {
        this.selectedAssetId = id;
        this.deleteDialog = true;
      },
  
      async confirmDelete() {
        if (!this.selectedAssetId) return;
        
        try {
          await apiService.delete(`/assets/${this.selectedAssetId}`);
          await this.fetchAssets();
          this.$emit('asset-deleted');
        } catch (error) {
          console.error('Error deleting asset:', error);
        } finally {
          this.deleteDialog = false;
          this.selectedAssetId = null;
        }
      },
  
      editAsset(id) {
        // Implementar lógica de edición
        console.log('Editing asset:', id);
      },
  
      downloadAsset(id) {
        // Implementar lógica de descarga
        console.log('Downloading asset:', id);
      }
    },
    watch: {
      page() {
        this.fetchAssets();
      },
    },
    created() {
      this.fetchAssets();
    },
  };
  </script>
  
  <style scoped>
  .table-container {
    padding: 20px;
    margin: 0 auto;
  }
  
  .gap-2 {
    gap: 8px;
  }
  
  .v-table {
    background: white;
    border-radius: 8px;
  }
  
  /* Estilos para los botones de acción */
  .v-btn--size-small {
    width: 32px;
    height: 32px;
    padding: 4px;
  }
  
  .v-btn--size-small svg {
    width: 100%;
    height: 100%;
  }
  </style>