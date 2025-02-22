// Import necessary Vue methods
import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'

// Define and mount the Vue application
createApp({
  setup() {
    const email = ref('')
    const password = ref('')
    const showToast = ref(false)
    const toastMessage = ref('')

    const handleInvalid = (message) => {
      displayToast(message)
    }

    const displayToast = (message) => {
      toastMessage.value = message
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, 3000) // show toast for 3 seconds
    }

    const sendRegistrationData = () => {
      fetch('/register', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ email: email.value, password: password.value })
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(errorMessage => {
              console.error('registration failed:', errorMessage)
              displayToast('registration failed: ' + errorMessage)
            })
          }
          return response.text()
        })
        .then(data => {
          if (data === 'user registered successfully') {
            console.log('registration successful', data)
            displayToast('registration successful')
          }
        })
    }

    return { email, password, showToast, toastMessage, sendRegistrationData, handleInvalid }
  }
}).mount('#app')
