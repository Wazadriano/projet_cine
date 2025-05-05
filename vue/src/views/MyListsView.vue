<template>
  <div class="my-lists-container">
    <h1>Mes listes de films 🎬</h1>

    <div v-if="lists.length === 0">
      <p>Vous n’avez pas encore de liste 📭</p>
      <input v-model="newListName" placeholder="Nom de votre première liste" />
      <button @click="createList">Créer ma première liste ➕</button>
    </div>

    <div v-else>
      <div class="list-selector">
        <label for="list-select">Liste :</label>
        <select v-model="selectedListId" @change="fetchFilms" id="list-select">
          <option v-for="list in lists" :key="list.id" :value="list.id">{{ list.name }}</option>
        </select>
        <button @click="deleteList" class="danger">🗑️ Supprimer cette liste</button>
      </div>

      <div class="create-list-section">
        <input v-model="newListName" placeholder="Nouvelle liste" />
        <button @click="createList">Créer ➕</button>
      </div>

      <div class="films-grid" v-if="films.length">
        <div v-for="film in films" :key="film.id" class="film-item">
          <img :src="'https://image.tmdb.org/t/p/w300' + film.poster_path" :alt="film.title" />
          <h3>{{ film.title }}</h3>
          <button @click="removeFromList(film.id)">❌ Retirer</button>
        </div>
      </div>

      <div v-else>
        <p>Cette liste est vide.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToken } from '@/stores/token';

const tokenstore = useToken();
const lists = ref([]);
const selectedListId = ref(null);
const films = ref([]);
const newListName = ref('');

async function fetchLists() {
  const res = await fetch('http://localhost:5000/api/lists/user', {
    headers: {
      Authorization: `Bearer ${tokenstore.token}`
    }
  });
  const data = await res.json();
  lists.value = data;

  if (data.length > 0) {
    selectedListId.value = data[0].id;
    await fetchFilms();
  } else {
    films.value = [];
    selectedListId.value = null;
  }
}

async function fetchFilms() {
  if (!selectedListId.value) return;
  const res = await fetch(`http://localhost:5000/api/lists/${selectedListId.value}`, {
    headers: {
      Authorization: `Bearer ${tokenstore.token}`
    }
  });
  const data = await res.json();
  films.value = data;
}

async function createList() {
  if (!newListName.value.trim()) {
    alert("Merci de donner un nom à votre liste.");
    return;
  }

  const res = await fetch('http://localhost:5000/api/lists/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenstore.token}`
    },
    body: JSON.stringify({ name: newListName.value })
  });

  const data = await res.json();
  if (res.ok) {
    lists.value.push(data);
    selectedListId.value = data.id;
    newListName.value = '';
    fetchFilms();
  } else {
    alert(data.message || "Erreur lors de la création.");
  }
}

async function deleteList() {
  if (!selectedListId.value || !confirm("Supprimer cette liste et tous ses films ?")) return;

  const res = await fetch(`http://localhost:5000/api/lists/${selectedListId.value}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${tokenstore.token}`
    }
  });

  if (res.ok) {
    const index = lists.value.findIndex(l => l.id === selectedListId.value);
    lists.value.splice(index, 1);
    selectedListId.value = lists.value[0]?.id || null;
    fetchFilms();
  } else {
    const data = await res.json();
    alert(data.message || "Erreur lors de la suppression.");
  }
}

async function removeFromList(filmId) {
  if (!confirm("Supprimer ce film de la liste ?")) return;

  const res = await fetch(`http://localhost:5000/api/lists/${selectedListId.value}/${filmId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${tokenstore.token}`
    }
  });

  const data = await res.json();
  if (res.ok) {
    films.value = films.value.filter(f => f.id !== filmId);
  } else {
    alert(data.message || "Erreur lors de la suppression.");
  }
}

onMounted(fetchLists);
</script>

<style scoped>
.my-lists-container {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
}

.list-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.create-list-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.films-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.film-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.film-item img {
  width: 80px;
  height: auto;
  border-radius: 6px;
  object-fit: cover;
}

.film-item h3 {
  margin: 0;
  flex-grow: 1;
}

.film-item button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.film-item button:hover {
  background-color: #cc0000;
}

input {
  padding: 0.5rem;
  flex: 1;
}

button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

button:hover {
  background-color: #0056b3;
}

button.danger {
  background-color: #dc3545;
}

button.danger:hover {
  background-color: #a71d2a;
}
</style>
