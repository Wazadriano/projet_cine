<template>
  <div class="input-field">
    <label :for="id">{{ label }}</label>
    <input
      :type="type"
      :id="id"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="{ 'input-error': !!error }"
    />
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  type: { type: String, default: 'text' },
  id: String,
  placeholder: String,
  modelValue: String,
  required: Boolean,
  error: String
});
</script>

<style scoped>
.input-field {
  margin-bottom: 1rem;
}

.input-error {
  border: 1px solid red;
  outline: none;
}

.error-message {
  color: red;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}
</style>
