// Import necessary Vue methods
import { createApp, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'

// Check for jwt before vue initialization
document.addEventListener('DOMContentLoaded', () => {
  fetch('/validate-token', { // validate with server
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    } // no body since token is in cookies
  })
    .then(response => {
      if (response.ok) {
        window.location.href = '/hidden/sudoku.html' // If token is valid, redirect to sudoku.html
      }
    })
    .catch(error => console.error('token validation error:', error))
})

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

    const sendLoginData = () => {
      fetch('/login', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ email: email.value, password: password.value })
      })
        .then(response => {
          if (response.ok) {
            window.location.href = '/hidden/sudoku.html' // on success, redirect to sudoku page
            console.log('login successful')
            displayToast('login successful')
          } else {
            return response.text().then(errorMessage => {
              console.error('login failed:', errorMessage)
              displayToast('login failed: ' + errorMessage)
            })
          }
        })
        .then(data => console.log(data))
    }

    return { email, password, showToast, toastMessage, sendLoginData, handleInvalid }
  }
}).mount('#app')
