<template>
  <div class="form-container">
    <h1>Connexion</h1>
    <form @submit.prevent="handleLogin" autocomplete="off">
      <InputField
        label="Email"
        v-model="email"
        type="email"
        id="email"
        placeholder="exemple@mail.com"

      />

      <InputField
        label="Mot de passe"
        v-model="password"
        type="password"
        id="password"
        placeholder="Votre mot de passe"

      />

      <FormButton>Se connecter</FormButton>
    </form>
  </div>
</template>

<script setup>
import InputField from '@/components/InputField.vue'
import FormButton from '@/components/FormButton.vue'
import { useRouter } from 'vue-router'
import { useToken } from '@/stores/token'
import { jwtDecode } from 'jwt-decode'
import { ref } from 'vue'

const router = useRouter()
const tokenstore = useToken()

const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      const decoded = jwtDecode(data.token)

      tokenstore.setToken(data.token)
      tokenstore.setUsername(decoded.username)

      router.push('/profile')
    } else {
      alert(data.message || 'Erreur lors de la connexion')
    }
  } catch (err) {
    console.error('Erreur réseau :', err)
    alert('Erreur de connexion au serveur')
  }
}
</script>
