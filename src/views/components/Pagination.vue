<template>
  <nav aria-label="Page navigation">
    <ul class="pagination justify-content-end mb-0">
      <li class="page-item" :class="{ disabled: page <= 1 }">
        <button class="page-link" @click="previousPage" :disabled="page <= 1">
          <i class="fas fa-chevron-left"></i>
        </button>
      </li>
      
      <li 
        v-for="pageNumber in pages" 
        :key="pageNumber"
        class="page-item"
        :class="{ active: pageNumber === page, disabled: pageNumber === '...' }"
      >
        <button 
          class="page-link" 
          @click="changePage(pageNumber)"
          :disabled="pageNumber === '...'"
        >
          {{ pageNumber }}
        </button>
      </li>
      
      <li class="page-item" :class="{ disabled: page >= totalPages }">
        <button class="page-link" @click="nextPage" :disabled="page >= totalPages">
          <i class="fas fa-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:page']);

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const pages = computed(() => {
  const current = props.page;
  const total = totalPages.value;
  const items = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      items.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        items.push(i);
      }
      items.push('...');
      items.push(total);
    } else if (current >= total - 3) {
      items.push(1);
      items.push('...');
      for (let i = total - 4; i <= total; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      items.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        items.push(i);
      }
      items.push('...');
      items.push(total);
    }
  }
  
  return items;
});

const changePage = (page) => {
  if (page === '...') return;
  emit('update:page', page);
};

const previousPage = () => {
  if (props.page > 1) {
    emit('update:page', props.page - 1);
  }
};

const nextPage = () => {
  if (props.page < totalPages.value) {
    emit('update:page', props.page + 1);
  }
};
</script>

<style scoped>
.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.5rem 0.75rem;
  color: #344767;
  background-color: #fff;
  border: 1px solid #dee2e6;
  cursor: pointer;
}

.page-link:hover {
  color: #344767;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #344767;
  border-color: #344767;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}
</style>
