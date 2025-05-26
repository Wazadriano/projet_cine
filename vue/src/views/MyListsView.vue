<template>
  <div class="my-lists-container">
    <h1>🎬 Mes listes de films</h1>

    <!-- Bloc sélection/suppression -->
    <div class="card section-box">
      <h2>Liste sélectionnée</h2>
      <div class="list-controls">
        <select v-model="selectedListId" @change="fetchFilms">
          <option v-for="list in lists" :key="list.id" :value="list.id">{{ list.name }}</option>
        </select>
        <button class="danger" @click="deleteList">🗑 Supprimer</button>


          <!-- 🆕 Ligne dédiée au partage -->
        <div class="share-section">
          <input v-model="shareEmail" placeholder="Email de votre ami" />
          <button @click="shareList">🔗 Partager</button>
       </div>

      </div>
    </div>

    <!-- Grille de films -->
    <div v-if="films.length" class="movies-grid">
      <div v-for="film in films" :key="film.id" class="movie-card">
        <img :src="'https://image.tmdb.org/t/p/w300' + film.poster_path" :alt="film.title" />
        <h3>{{ film.title }}</h3>
        <button @click="removeFromList(film.id)">❌ Retirer</button>
      </div>
    </div>

    <div v-else-if="selectedListId" class="empty">
      <p>Cette liste est vide.</p>
    </div>

    <!-- Création nouvelle liste -->
    <div class="card create-box">
      <h2>➕ Créer une nouvelle liste</h2>
      <input v-model="newListName" placeholder="Nom de la nouvelle liste" />
      <button @click="createList">Créer</button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useToken } from '@/stores/token';

const tokenStore = useToken();
const lists = ref([]);
const selectedListId = ref(null);
const films = ref([]);
const newListName = ref('');

async function fetchLists() {
  try {
    const res = await fetch('/api/lists/user', {
      headers: { Authorization: `Bearer ${tokenStore.token}` }
    });
    const data = await res.json();
    lists.value = data;
    selectedListId.value = data[0]?.id || null;
    if (selectedListId.value) await fetchFilms();
  } catch (error) {
    console.error("Erreur fetchLists :", error);
  }
}

async function fetchFilms() {
  if (!selectedListId.value) return;
  try {
    const res = await fetch(`/api/lists/${selectedListId.value}`, {
      headers: { Authorization: `Bearer ${tokenStore.token}` }
    });
    const data = await res.json();
    films.value = data;
  } catch (error) {
    console.error("Erreur fetchFilms :", error);
  }
}

async function createList() {
  if (!newListName.value.trim()) return alert("Merci d'indiquer un nom.");
  try {
    const res = await fetch('/api/lists/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStore.token}`
      },
      body: JSON.stringify({ name: newListName.value })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Erreur création liste.");
    lists.value.push(data);
    selectedListId.value = data.id;
    newListName.value = '';
    await fetchFilms();
  } catch (error) {
    console.error("Erreur création liste :", error);
  }
}

async function deleteList() {
  if (!selectedListId.value || !confirm("Supprimer cette liste ?")) return;
  try {
    const res = await fetch(`/api/lists/${selectedListId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenStore.token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      return alert(data.message || "Erreur suppression.");
    }
    lists.value = lists.value.filter(list => list.id !== selectedListId.value);
    selectedListId.value = lists.value[0]?.id || null;
    await fetchFilms();
  } catch (error) {
    console.error("Erreur suppression liste :", error);
  }
}

async function removeFromList(filmId) {
  if (!confirm("Supprimer ce film ?")) return;
  try {
    const res = await fetch(`/api/lists/${selectedListId.value}/${filmId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenStore.token}` }
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Erreur suppression.");
    films.value = films.value.filter(f => f.id !== filmId);
  } catch (error) {
    console.error("Erreur suppression film :", error);
  }
}

const shareEmail = ref('');

async function shareList() {
  if (!selectedListId.value || !shareEmail.value.trim()) return alert("Email requis.");

  const res = await fetch('/api/lists/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenStore.token}`
    },
    body: JSON.stringify({
      listId: selectedListId.value,
      userEmail: shareEmail.value
    })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Liste partagée avec succès !");
    shareEmail.value = '';
  } else {
    alert(data.message || "Erreur lors du partage.");
  }
}


onMounted(fetchLists);
</script>

<style scoped>
.my-lists-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

h1 {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--color-heading);
}

.card {
  background-color: var(--color-background-soft);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.section-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.list-controls select {
  flex: 1;
  min-width: 200px;
  padding: 0.6rem;
}

.create-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

.create-box input {
  padding: 0.6rem;
}

.create-box button {
  padding: 0.6rem;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
}

.movie-card {
  background-color: var(--color-background-soft);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.movie-card img {
  width: 100%;
  border-radius: 4px;
  object-fit: cover;
  margin-bottom: 0.5rem;
  max-height: 270px;
}


.movie-card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
}

.movie-card {
  background-color: var(--color-background-soft);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  text-align: center;
}


.movie-card button:hover {
  background-color: #a71d2a;
}

button.danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

button.danger:hover {
  background-color: #a71d2a;
}

.empty {
  text-align: center;
  font-style: italic;
  opacity: 0.8;
}
.share-section {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  align-items: center;
}

.share-section input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.share-section button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background-color: var(--vt-c-indigo);
  color: white;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.share-section button:hover {
  background-color: #2b4d80;
}


</style>
