<template>
  <div class="pagination">
      <button class="arrow" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          &lt;
      </button>

      <button v-if="currentPage > 3" class="page-number" @click="goToPage(1)">
          1
      </button>

      <span v-if="currentPage > 3" class="dots">...</span>

      <button v-for="page in dynamicPages" :key="page" :class="{ 'page-number': true, active: page === currentPage }"
          @click="goToPage(page)">
          {{ page }}
      </button>

      <span v-if="currentPage < totalPages - 2" class="dots">...</span>

      <button v-if="currentPage < totalPages - 2" class="page-number" @click="goToPage(totalPages)">
          {{ totalPages }}
      </button>

      <button class="arrow" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          &gt;
      </button>
  </div>
</template>

<script>
export default {
  props: {
      totalPages: {
          type: Number,
          required: true,
      },
      currentPage: {
          type: Number,
          default: 1,
      },
  },
  computed: {
      dynamicPages() {
          const pages = [];
          if (this.currentPage <= 3) {
              for (let i = 1; i <= Math.min(3, this.totalPages); i++) {
                  pages.push(i);
              }
          } else if (this.currentPage >= this.totalPages - 2) {
              for (let i = Math.max(1, this.totalPages - 2); i <= this.totalPages; i++) {
                  pages.push(i);
              }
          } else {
              pages.push(this.currentPage);     
          }
          return pages;
      },
  },
  methods: {
      goToPage(page) {
          if (page >= 1 && page <= this.totalPages) {
              this.$emit("page-change", page);
          }
      },
  },
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

.page-number,
.arrow {
  background: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.page-number.active {
  border-color: #39A900;
  color: #39A900;
  font-weight: bold;
}

.page-number:hover:not(.active),
.arrow:hover:not(:disabled) {
  background: #e0e0e0;
}

.arrow:disabled {
  opacity: 0.5;
  cursor: not-allowed;    
  background: rgb(129, 129, 129);
}

.dots {
  color: #999;
  padding: 0 8px;
}
</style>
