<script setup>
import ArgonButton from "@/components/ArgonButton.vue";
</script>
<template>
  <div class="card h-100 mb-4">
    <div class="ccard-header pb-0 px-3">
      <div class="row">
        <div class="col-6 d-flex align-items-center">
          <h6 class="mb-0">Informes Realizados</h6>
        </div>
        <div class="col-6 text-end">
          <argon-button color="success" size="sm" variant="outline"
            >Detalls</argon-button
          >
        </div>
      </div>
    </div>
    <div class="card-body p-3 pb-0 mb-0">
      <ul class="list-group">
        <li
          class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg"
        >
          <div class="d-flex flex-column">
            <h6 class="mb-1 text-dark font-weight-bold text-sm">
              March, 01, 2020
            </h6>
            <span class="text-xs">#MS-415646</span>
          </div>
          <div class="d-flex align-items-center text-sm">
            
            <button>
              <i class="far fa-file-excel fa-lg" style="color: #047c22;"></i>            
            </button>

            <button class="btn btn-link text-dark text-sm mb-0 px-0 ms-4">
              <i class="fa-solid fa-file-pdf fa-lg" style="color: #bd0000;"></i>            
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
