  <script setup>
  import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
  import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";

  import CategoriesList from "./components/CategoriesList.vue";

  import US from "@/assets/img/icons/flags/US.png";
  import DE from "@/assets/img/icons/flags/DE.png";
  import GB from "@/assets/img/icons/flags/GB.png";
  import BR from "@/assets/img/icons/flags/BR.png";

  const sales = {
    us: {
      country: "Fresadora",
      sales: "Laboratorio TI", 
      value: "12/11/2024",
      bounce: "Ejecutada",
      flag: US,
    },
    germany: {
      country: "DSX 5000",
      sales: "Laboratorio ME",
      value: "12/11/2024",
      bounce: "Ejecutada",
      flag: DE,
    },
    britain: {
      country: "Ultimaker 3",
      sales: "Ambiente 215",
      value: "12/11/2024",
      bounce: "Ejecutada",
      flag: GB,
    },
    brasil: {
      country: "Fusionadora",
      sales: "Ambiente 145",
      value: "12/11/2024",
      bounce: "Sin ejecutar",
      flag: BR,
    },






    
  };
  </script>
  <template>
    <div class="py-4 container-fluid">
      <div class="row">
        <div class="col-lg-12">
          <div class="row">
            <div class="col-lg-3 col-md-6 col-12">
              <mini-statistics-card
                title="Usuarios registrados"
                value="53"
                :icon="{
                  component: 'ni ni-money-coins',
                  background: 'bg-gradient-primary',
                  shape: 'rounded-circle',
                }"
              />
            </div>
            <div class="col-lg-3 col-md-6 col-12">
              <mini-statistics-card
                title="Ordenes de trabajo"
                value="300"
                :icon="{
                  component: 'ni ni-world',
                  background: 'bg-gradient-danger',
                  shape: 'rounded-circle',
                }"
              />
            </div>
            <div class="col-lg-3 col-md-6 col-12">
              <mini-statistics-card
                title="Ordenes de trabajo ejecutadas"
                value="62"              
                :icon="{
                  component: 'ni ni-paper-diploma',
                  background: 'bg-gradient-success',
                  shape: 'rounded-circle',
                }"
              />
            </div>
            <div class="col-lg-3 col-md-6 col-12">
              <mini-statistics-card
                title="Ordenes de trabajo sin ejecutar"
                value="30"           
                :icon="{
                  component: 'ni ni-cart',
                  background: 'bg-gradient-warning',
                  shape: 'rounded-circle',
                }"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-lg-12 mb-lg">
              <div class="card z-index-2">
                <gradient-line-chart
                  id="chart-line"
                  title="Ordenes de trabajo ejecutadas"
                  :chart="{
                    labels: [
                      'Ene',
                      'Feb',
                      'Mar',
                      'Abr',
                      'May',
                      'Jun',
                      'Jul',
                      'Ago',
                      'Sep',
                      'Oct',
                      'Nov',
                      'Dic',
                    ], 
                    datasets: [
                      {
                        label: 'Ordenes de trabajo',
                        data: [50, 40, 300, 220, 500, 250, 400, 230, 500, 100, 200, 300],
                      },
                    ],
                  }"
                />
              </div>
            </div>
            <div class="col-lg-6">
              
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-lg-7 mb-lg-0 mb-4 col-12">
              <div class="card">
                <div class="p-3 pb-0 card-header">
                  <div class="d-flex justify-content-between">
                    <h6 class="mb-2">Ordenes de trabajo</h6>
                  </div>
                </div>
                <div class="table-responsive">
                  <table class="table align-items-center">
                    <tbody>
                      <tr v-for="(sale, index) in sales" :key="index">
                        <td class="w-30">
                          <div class="px-2 py-1 d-flex align-items-center">
                            <div>
                              <img :src="sale.flag" alt="Country flag" />
                            </div>
                            <div class="ms-4">
                              <p class="mb-0 text-xs font-weight-bold">
                                Maquinaria y/o equipo:
                              </p>
                              <h6 class="mb-0 text-sm">{{ sale.country }}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="text-center">
                            <p class="mb-0 text-xs font-weight-bold">Ubicación:</p>
                            <h6 class="mb-0 text-sm">{{ sale.sales }}</h6>
                          </div>
                        </td>
                        <td>
                          <div class="text-center">
                            <p class="mb-0 text-xs font-weight-bold">Fecha de asignación:</p>
                            <h6 class="mb-0 text-sm">{{ sale.value }}</h6>
                          </div>
                        </td>
                        <td class="text-sm align-middle">
                          <div class="text-center col">
                            <p class="mb-0 text-xs font-weight-bold">Fecha limite de ejecución:</p>
                            <h6 class="mb-0 text-sm">{{ sale.bounce }}</h6>
                          </div>
                        </td>
                        <td class="text-sm align-middle">
                          <div class="text-center col">
                            <p class="mb-0 text-xs font-weight-bold">Estado:</p>
                            <h6 class="mb-0 text-sm">{{ sale.bounce }}</h6>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-lg-5">
              <categories-list title="Categorías de Equipos" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
