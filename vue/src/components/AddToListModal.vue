<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-box">
      <h2>Ajouter à une liste</h2>

      <div v-if="userLists.length">
        <label for="listSelect">Choisir une liste :</label>
        <select v-model="selectedListId" id="listSelect">
          <option v-for="list in userLists" :key="list.id" :value="list.id">{{ list.name }}</option>
        </select>
      </div>
      <div v-else>
        <p>Vous n’avez encore aucune liste 📭</p>
      </div>

      <label for="newList">Ou créer une nouvelle liste :</label>
      <input v-model="newListName" id="newList" placeholder="Nom de la nouvelle liste" />

      <div class="modal-actions">
        <button @click="addToList">Ajouter ❤️</button>
        <button @click="close">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useToken } from '@/stores/token';

const props = defineProps({
  show: Boolean,
  film: Object
});
const emit = defineEmits(['close']);

const tokenstore = useToken();
const userLists = ref([]);
const selectedListId = ref(null);
const newListName = ref('');

watch(() => props.show, (val) => {
  if (val && tokenstore.token) fetchUserLists();
});

function close() {
  emit('close');
}

async function fetchUserLists() {
  try {
    const res = await fetch('http://localhost:5000/api/lists/user', {
      headers: {
        Authorization: `Bearer ${tokenstore.token}`
      }
    });
    const data = await res.json();
    userLists.value = data;
    selectedListId.value = data[0]?.id || null;
  } catch (err) {
    console.error('Erreur récupération listes :', err);
  }
}

async function addToList() {
  let listId = selectedListId.value;

  try {
    // Si un nom est donné, on crée une nouvelle liste
    if (newListName.value.trim()) {
      const res = await fetch('http://localhost:5000/api/lists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenstore.token}`
        },
        body: JSON.stringify({ name: newListName.value })
      });

      const created = await res.json();
      if (!res.ok) return alert(created.message || "Erreur lors de la création.");

      listId = created.id;
      userLists.value.push(created);
      selectedListId.value = created.id;
      newListName.value = '';
    }

    if (!listId) {
      alert("Veuillez sélectionner ou créer une liste.");
      return;
    }

    const res = await fetch(`http://localhost:5000/api/lists/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenstore.token}`
      },
      body: JSON.stringify({
        listId,
        film_id: props.film.id,
        title: props.film.title,
        poster_path: props.film.poster_path
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Film ajouté à la liste ✅');
      close();
    } else {
      alert(data.message || 'Erreur lors de l’ajout.');
    }

  } catch (error) {
    console.error('Erreur réseau :', error);
    alert("Erreur de connexion au serveur.");
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: #fff;
  color: #333;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.modal-box label {
  display: block;
  margin-top: 1rem;
}

.modal-box input,
.modal-box select {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
}

.modal-actions button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #007bff;
  color: white;
}

.modal-actions button:last-child {
  background-color: #ccc;
}
</style>
