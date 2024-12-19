<template>
  <div class="card">
    <div class="card-header pb-0">
      <h6>Control de acceso</h6>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0">
          <thead>
            <tr>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Nombre de usuario
              </th>
              <th
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2"
              >
                Teléfono
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Tipo de documento
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Numero de documento
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Fecha de solicitud
              </th>
              <th
                class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"
              >
                Acciones
              </th>
            
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="d-flex px-2 py-1">
                  <div>
                    <img
                      src="../../assets/img/team-2.jpg"
                      class="avatar avatar-sm me-3"
                      alt="user1"
                    />
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-sm">Yan Carlos Cerquera</h6>
                    <p class="text-xs text-secondary mb-0">
                      yancerquera@sena.edu.co
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <p class="text-xs font-weight-bold mb-0">(+57) 3114919985</p>
              </td>
             
              <td class="align-middle text-center">
                <span class="text-secondary text-xs font-weight-bold"
                  >Cédula de ciudadanía</span
                >
              </td>
              <td class="align-middle text-center">
                <span class="text-secondary text-xs font-weight-bold"
                  >1 234 567 890</span
                >
              </td>
              <td class="align-middle text-center">
                <span class="text-secondary text-xs font-weight-bold"
                  >12/09/2024</span
                >
              </td>
       
                <td class="align-middle text-center text-sm">
                <button class="btn btn-sm btn-icon btn-bg-light btn-active-color-green btn-active-bg-warning mx-lg-2"><i class="fas fa-check"></i></button>
                <button class="btn btn-sm btn-icon btn-bg-light btn-active-color-alert btn-active-bg-warning"><i class="fas fa-trash"></i></button>
                
  
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
