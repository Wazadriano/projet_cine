<template>
  <div class="form-container">
    <h1>Mon Profil</h1>

    <div v-if="username">
      <p><strong>Pseudo :</strong> {{ username }}</p>

      <div class="form-section">
        <h2>Changer de mot de passe</h2>
        <form @submit.prevent="handlePasswordChange">
          <InputField
            label="Nouveau mot de passe"
            v-model="newPassword"
            type="password"
            id="new-password"
            placeholder="Votre nouveau mot de passe"
            required
          />
          <FormButton>Mettre à jour</FormButton>
        </form>
      </div>

      <div class="navigation-section">
        <h2>Mes Films</h2>
        <RouterLink class="list-link" to="/my-lists">
          Accéder à mes listes de films 🎬
        </RouterLink>
      </div>
    </div>

    <div v-else>
      <p>Chargement du profil...</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToken } from '@/stores/token'
import { useRouter, RouterLink } from 'vue-router'
import InputField from '@/components/InputField.vue'
import FormButton from '@/components/FormButton.vue'

const tokenstore = useToken()
const router = useRouter()

const username = ref(tokenstore.getLoggedUser())
const newPassword = ref('')

async function handlePasswordChange() {
  if (!newPassword.value.trim()) {
    alert('Veuillez entrer un nouveau mot de passe.')
    return
  }

  try {
    const response = await fetch('http://localhost:5000/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenstore.token}`
      },
      body: JSON.stringify({
        password: newPassword.value
      })
    })

    const data = await response.json()

    if (data.ok) {
      alert('Mot de passe modifié avec succès 🎉')
      newPassword.value = ''
    } else {
      alert(data.message || 'Erreur lors du changement de mot de passe.')
    }
  } catch (error) {
    console.error('Erreur réseau :', error)
    alert('Erreur de connexion au serveur')
  }
}
</script>
