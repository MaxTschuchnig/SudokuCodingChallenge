import { createApp, ref, onMounted, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'

createApp({
  setup() {
    let userId = ''
    let userRank = ref('')
    let profileName = ref('user')
    let personalSolved = []
    let allSolved = []
    const personalChart = ref(null)
    const overallChart = ref(null)
    let personalSolves = ref(0)
    let allSolves = ref(0)
    let bestUsers = ref([])
    let previouslyBestUsers = ref([])
    
    let overallTargets = ref([10000, 1000000, 20000000, 200000000])
    let overallRank = ref(0)


    const progressPercentage = computed(() => {
      return Math.min((allSolves.value / overallTargets.value[overallRank.value]) * 100, 100)
    })

    const getLatestSolves = (user) => {
      const now = user.numberSolved
      const previousUser = previouslyBestUsers.value.find(item => item.name === user.name)

      if (!previousUser) {
        return false
      }

      const before = previousUser.numberSolved
      return now - before
    }

    const hasNewlySolved = (user) => {
      const now = user.numberSolved
      const previousUser = previouslyBestUsers.value.find(item => item.name === user.name)

      if (!previousUser) {
        return false
      }

      const before = previousUser.numberSolved
      return now > before
    }

    const fetchUserInfo = () => {
      return fetch('/user')
        .then(response => response.json())
        .then(user => {
          userId = user._id
          profileName.value = user.name
          return 'ok'
        })
        .catch(error => {
          console.error('Error fetching user profile:', error)
        })
    }

    const fetchBestUsers = () => {
      return fetch('/bestUsers')
        .then(response => response.json())
        .then(data => {
          for (let i = 0; i < data.bestUsers.length; i++) {
            data.bestUsers[i].rank = i + 1
            if (data.bestUsers[i]._id === userId) {
              userRank.value = data.bestUsers[i].rank
            }
          }
          bestUsers.value = data.bestUsers
          previouslyBestUsers.value = data.previouslyBest
          return 'ok'
        })
        .catch(error => {
          console.error('Error fetching best users:', error)
        })
    }

    const fetchSolved = () => {
      return fetch('/solved')
        .then(response => response.json())
        .then(data => {
          personalSolved = data

          let count = 0 // count solves per quantization
          personalSolved.forEach(element => {
            count += element.count
          })
          personalSolves.value = count
          return 'ok'
        })
        .catch(error => {
          console.error('Error fetching solved:', error)
        })
    }

    const calcRank = (count) => {
      if (count < overallTargets.value[0]) {
        overallRank.value = 0
      }
      if (count > overallTargets.value[0]) {
        overallRank.value = 1
      }
      if (count > overallTargets.value[1]) {
        overallRank.value = 2
      }
      if (count > overallTargets.value[2]) {
        overallRank.value = 3
      }
      if (count > overallTargets.value[3]) {
        overallRank.value = 4
      }
    }

    const fetchAllSolved = () => {
      return fetch('/allSolved')
        .then(response => response.json())
        .then(data => {
          allSolved = data

          let count = 0 // count solves per quantization
          allSolved.forEach(element => {
            count += element.count
          })
          allSolves.value = count

          return 'ok'
        })
        .catch(error => {
          console.error('Error fetching all solved:', error)
        })
    }

    const logout = () => {
      fetch('/logout', {
        method: 'POST'
      })
        .then(response => response.text())
        .then(data => {
          console.log(data)
          window.location.href = '/'
        })
        .catch(error => {
          console.error('Logout failed:', error)
        })
    }

    const edit = () => {
      fetch('/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: profileName.value })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update user')
          }
          return response.json()
        })
        .then(updatedUser => {
          alert(`change successful. New name: ${JSON.stringify(updatedUser.name)}`)
        })
        .catch(error => {
          console.error('Error updating user profile:', error)
        })
    }

    const handleEdit = () => {
      if (profileName.value.trim()) {
        edit()
      } else {
        alert('Please enter a valid profile name.')
      }
    }

    let personalChartInstance = null
    let overallChartInstance = null

    const renderCharts = () => {
      const ctx_personal = personalChart.value
      const ctx_overall = overallChart.value

      // Destroy existing charts if they exist
      if (personalChartInstance) {
        personalChartInstance.destroy()
      }
      if (overallChartInstance) {
        overallChartInstance.destroy()
      }

      // Prepare labels and data points from the pre-quantized data
      const labels = personalSolved.map(interval => {
        const start = new Date(interval.startingTime).toLocaleTimeString()
        const end = new Date(interval.endingTime).toLocaleTimeString()
        return `${start} - ${end}`
      })

      const personalDataPoints = personalSolved.map(interval => interval.count || 0) // Use personalCount if it exists, or 0
      const overallDataPoints = allSolved.map(interval => interval.count || 0)

      // Create new chart instances for personal data
      personalChartInstance = new Chart(ctx_personal, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '# of solved sudokus (Personal)',
            data: personalDataPoints,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })

      // Create new chart instances for overall data
      overallChartInstance = new Chart(ctx_overall, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '# of solved sudokus (Overall)',
            data: overallDataPoints,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }


    onMounted(async () => {
      await fetchUserInfo()
      await fetchSolved()
      await fetchAllSolved()
      await fetchBestUsers()
      calcRank(allSolves.value)
      renderCharts()
      setInterval(async () => {
        await fetchSolved()
        await fetchAllSolved()
        await fetchBestUsers()
        renderCharts()
        calcRank(allSolves.value)
      }, 1000 * 30) // 1000 * 30
    });

    return { userRank, profileName, bestUsers, personalSolves, allSolves, personalChart, overallChart, handleEdit, edit, logout, hasNewlySolved, getLatestSolves, progressPercentage, overallRank, overallTargets }
  }
}).mount('#app')