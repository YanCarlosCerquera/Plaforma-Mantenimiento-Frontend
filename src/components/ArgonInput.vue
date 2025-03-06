<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  size: {
    type: String,
    default: "default",
  },
  success: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: "",
  },
  iconDir: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  prefix: {
    type: String,
    default: "",
  },
  isRequired: {
    type: Boolean,
    default: false,
  },  
});

const isPasswordVisible = ref(false);

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const inputType = computed(() => {
  if (props.type === 'password') {
    return isPasswordVisible.value ? 'text' : 'password';
  }
  return props.type;
});

const getClasses = (size, success, error) => {
  let sizeValue, isValidValue;

  sizeValue = size ? `form-control-${size}` : null;

  if (error) {
    isValidValue = "is-invalid";
  } else if (success) {
    isValidValue = "is-valid";
  } else {
    isValidValue = "";
  }

  return `${sizeValue} ${isValidValue}`;
};
const getIcon = (icon) => (icon ? icon : null);
const hasIcon = (icon) => (icon ? "input-group" : null);
</script>

<template>
  <div class="form-group">
    <div :class="hasIcon(icon)" class="input-wrapper">
      <span v-if="iconDir === 'left'" class="input-group-text">
        <i :class="getIcon(icon)"></i>
      </span>
      <span v-if="prefix != ''" class="input-group-text">
        {{ prefix }}
      </span>
      <input :id="id" :type="inputType" class="form-control" :class="getClasses(size, success, error)" :name="name"
        :value="modelValue" :placeholder="placeholder" :required="isRequired" @input="emit('update:modelValue', $event.target.value)" />
      <span v-if="iconDir === 'right'" class="input-group-text">
        <i :class="getIcon(icon)"></i>
      </span>
      <span v-if="type === 'password'" class="password-toggle" @click="togglePasswordVisibility">
        <svg v-if="isPasswordVisible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #6c757d;
}

.password-toggle:hover {
  color: #495057;
}

.password-toggle svg {
  width: 100%;
  height: 100%;
}
</style>
