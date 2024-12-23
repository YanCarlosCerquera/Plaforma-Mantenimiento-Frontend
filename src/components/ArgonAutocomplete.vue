<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "Selecciona una opción",
  },
});

const emit = defineEmits(["update:modelValue"]);

const selectedItem = ref(null);
const inputValue = ref("");

onMounted(() => {
  updateSelectedItem();
});

watch(() => props.modelValue, updateSelectedItem);
watch(() => props.items, updateSelectedItem, { deep: true });

function updateSelectedItem() {
  const item = props.items.find((item) => item.value === props.modelValue);
  if (item) {
    selectedItem.value = item;
    inputValue.value = item.title;
  } else {
    selectedItem.value = null;
    inputValue.value = "";
  }
}

function onSelect(item) {
  if (item) {
    selectedItem.value = item;
    inputValue.value = item.title;
    emit("update:modelValue", item.value);
  }
}
</script>

<template>
  <div class="custom-autocomplete">
    <v-autocomplete
      v-model="selectedItem"
      :items="items"
      :search-input="inputValue"
      @update:search-input="inputValue = $event"
      item-title="title"
      item-value="value"
      :placeholder="placeholder"
      return-object
      @update:model-value="onSelect"
      variant="outlined"
      density="comfortable"
      bg-color="white"
    >
      <template v-slot:selection="{ item }">
        {{ item.raw.title }}
      </template>
      <template v-slot:item="{ item, props }">
        <v-list-item v-bind="props" :title="item.raw.title"></v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>

<style scoped>
.custom-autocomplete :deep(.v-field) {
  border-radius: 6px !important;
  background: white !important;
  padding: 0 !important;
}

.custom-autocomplete :deep(.v-field__outline) {
  border-radius: 6px !important;
  border-color: #dee2e6 !important;
  color: #dee2e6 !important;
}

.custom-autocomplete :deep(.v-field__input) {
  padding: 8px 12px !important;
  min-height: 42px !important;
  font-size: 14px !important;
}

.custom-autocomplete :deep(.v-field__append-inner) {
  padding-inline-end: 12px !important;
}

.custom-autocomplete :deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-width: 1.5px !important;
}

.custom-autocomplete :deep(.v-field--variant-outlined) {
  --v-field-border-opacity: 1 !important;
}

.custom-autocomplete :deep(.v-field--variant-outlined .v-field__outline__start),
.custom-autocomplete :deep(.v-field--variant-outlined .v-field__outline__end) {
  border-color: #ced4da !important;
}

.custom-autocomplete :deep(.v-list-item) {
  min-height: 35px;
  padding: 0 12px;
}

.custom-autocomplete :deep(.v-list-item__content) {
  padding: 4px 0;
}
</style>
