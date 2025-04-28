<template>
  <div class="form-container">
    <h1>Inscription</h1>
    <form @submit.prevent="handleRegister">
      <InputField
        label="Nom d'utilisateur"
        v-model="username"
        id="username"
        placeholder="Pseudo"
        required
      />

      <InputField
        label="Email"
        v-model="email"
        type="email"
        id="email"
        placeholder="exemple@mail.com"
        required
      />

      <InputField
        label="Mot de passe"
        v-model="password"
        type="password"
        id="password"
        placeholder="Votre mot de passe"
        required
      />

      <FormButton>Créer un compte</FormButton>
    </form>
  </div>
</template>

<script setup>
import InputField from '@/components/InputField.vue'
import FormButton from '@/components/FormButton.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')

async function handleRegister() {
  try {
    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      alert('Inscription réussie 🎉')
      router.push('/login')
    } else {
      alert(data.message || 'Erreur lors de l’inscription')
    }
  } catch (err) {
    console.error('Erreur réseau :', err)
    alert('Erreur de connexion au serveur')
  }
}
</script>
