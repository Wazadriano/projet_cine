<template>
  <div class="input-group">
    <label :for="id">{{ label }}</label>
    <input
  :id="id"
  :type="type"
  :placeholder="placeholder"
  :value="modelValue"
  @input="$emit('update:modelValue', $event.target.value)"
  :required="required"
  autocomplete="username"
/>

  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: String,
    placeholder: String,
    type: {
      type: String,
      default: 'text'
    },
    id: String,
    required: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue']
};
</script>


<style scoped>
.input-group {
  margin-bottom: 1rem;
}
input {
  width: 100%;
  padding: 0.5rem;
}
label {
  display: block;
  margin-bottom: 0.3rem;
}
</style>
