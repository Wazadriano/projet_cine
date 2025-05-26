<template>
  <div class="home-container">
    <h1>👥 Listes partagées avec moi</h1>

    <div v-if="lists.length" class="list-container">
      <div v-for="list in lists" :key="list.id" class="shared-list">
        <h3>{{ list.name }}</h3>
        <p>Propriétaire : {{ list.owner_email }}</p>
        <RouterLink :to="`/liste-partagee/${list.id}`">Voir les films</RouterLink>
      </div>
    </div>

    <p v-else>Aucune liste partagée reçue.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToken } from '@/stores/token';

const tokenStore = useToken();
const lists = ref([]);

onMounted(async () => {
  try {
    const res = await fetch('/api/lists/shared', {
      headers: { Authorization: `Bearer ${tokenStore.token}` }
    });
    lists.value = await res.json();
  } catch (error) {
    console.error('Erreur chargement listes partagées :', error);
  }
});
</script>

<style scoped>
.home-container {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
  text-align: center;
}
.shared-list {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}
.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
