<template>
  <div class="my-lists-container">
    <h1>Mes Listes de Films 🎬</h1>

    <div class="create-list-section">
      <input
        v-model="newListName"
        type="text"
        placeholder="Nom de la nouvelle liste"
      />
      <button @click="createList">Créer la liste</button>
    </div>

    <div v-if="lists.length > 0" class="select-list-section">
      <label for="selectList">Choisissez votre liste :</label>
      <select v-model="selectedListId" id="selectList">
        <option disabled value="">-- Choisir une liste --</option>
        <option v-for="list in lists" :key="list.id" :value="list.id">
          {{ list.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedListId" class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un film..."
        @keyup.enter="searchMovies"
      />
      <button @click="searchMovies">Rechercher</button>
    </div>

    <div v-if="movies.length > 0" class="movies-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <img
          v-if="movie.poster_path"
          :src="'https://image.tmdb.org/t/p/w300' + movie.poster_path"
          alt="Affiche film"
        />
        <h3>{{ movie.title }}</h3>
        <button @click="addMovieToList(movie)">Ajouter à ma liste</button>
      </div>
    </div>

    <div v-else-if="searchDone && selectedListId">
      <p>Aucun film trouvé...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToken } from '@/stores/token'

const tokenstore = useToken()

const newListName = ref('')
const lists = ref([])
const selectedListId = ref('')
const searchQuery = ref('')
const movies = ref([])
const searchDone = ref(false)

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

async function createList() {
  if (!newListName.value.trim()) {
    alert('Veuillez entrer un nom de liste.')
    return
  }

  try {
    const response = await fetch('http://localhost:5000/api/lists/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenstore.token}`
      },
      body: JSON.stringify({ name: newListName.value })
    })

    const data = await response.json()

    if (response.ok) {
      alert('Liste créée 🎉')
      newListName.value = ''
      await fetchLists()
    } else {
      alert(data.message || 'Erreur lors de la création.')
    }
  } catch (error) {
    console.error('Erreur création liste:', error)
  }
}

async function fetchLists() {
  try {
    const response = await fetch('http://localhost:5000/api/my-lists', {
      headers: {
        Authorization: `Bearer ${tokenstore.token}`
      }
    })
    const data = await response.json()
    lists.value = data.lists || []
  } catch (error) {
    console.error('Erreur chargement listes:', error)
  }
}

async function searchMovies() {
  if (!searchQuery.value.trim()) return

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery.value)}&language=fr-FR`, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    })

    const data = await response.json()
    movies.value = data.results || []
    searchDone.value = true
  } catch (err) {
    console.error('Erreur TMDb:', err)
  }
}

async function addMovieToList(movie) {
  try {
    const response = await fetch(`http://localhost:5000/api/lists/${selectedListId.value}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenstore.token}`
      },
      body: JSON.stringify({
        film_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path
      })
    })

    const data = await response.json()

    if (response.ok) {
      alert('Film ajouté à la liste 🎬✅')
    } else {
      alert(data.message || 'Erreur lors de l\'ajout du film.')
    }
  } catch (error) {
    console.error('Erreur ajout film:', error)
  }
}

onMounted(() => {
  fetchLists()
})
</script>
