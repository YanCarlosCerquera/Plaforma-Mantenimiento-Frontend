<template>
    <transition name="fade">
      <div v-if="show" :class="['alert', `alert-${type}`]">
        {{ message }}
      </div>
    </transition>
  </template>
  
  <script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  }
});

defineEmits(['close']);
</script>
  
  <style scoped>
  .alert {
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .alert-info {
    background-color: #e3f2fd;
    color: #0c5460;
  }
  
  .alert-success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .alert-warning {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .alert-error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  </style>
  
  