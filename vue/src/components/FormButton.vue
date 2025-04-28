<template>
  <button class="btn" type="submit">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 0.7rem 1.2rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  cursor: pointer;
}
.btn:hover {
  background-color: #1a242f;
}
</style>
