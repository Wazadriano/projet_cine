<template>
  <div class="layout">
    <Navbar />

    <main class="content">
      <Transition name="fade" mode="out-in">
        <RouterView v-slot="{ Component, route }">
          <Suspense>
            <template #default>
              <component :is="Component" />
            </template>
            <template #fallback>
              <div class="loader-container">
                <div class="loader"></div>
              </div>
            </template>
          </Suspense>
        </RouterView>
      </Transition>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content {
  flex: 1;
  padding: 2rem;
}

/* Animation fade entre les routes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Loader */
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #333;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
