<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

interface Station {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  scheduleToLebakBulusHoliday: string[];
  scheduleToBundaranHIHoliday: string[];
  scheduleToLebakBulus: string[];
  scheduleToBundaranHI: string[];
}

interface SelectedStation {
  name: string;
  scheduleToLebakBulusHoliday: string[];
  scheduleToBundaranHIHoliday: string[];
  scheduleToLebakBulus: string[];
  scheduleToBundaranHI: string[];
}

const stations = ref<Station[]>([])
const selectedStation = ref<SelectedStation>({ name: '', scheduleToLebakBulusHoliday: [], scheduleToBundaranHIHoliday: [], scheduleToLebakBulus: [], scheduleToBundaranHI: [] })
const isHolidaySchedule = ref(false)
const isDarkMode = ref(false)
const selectedSchedule = computed(() => {
  if (isHolidaySchedule.value) {
    return { nextSchedulesLebakBulus: selectedStation.value.scheduleToLebakBulusHoliday, nextSchedulesBundaranHI: selectedStation.value.scheduleToBundaranHIHoliday }
  } else {
    return { nextSchedulesLebakBulus: selectedStation.value.scheduleToLebakBulus, nextSchedulesBundaranHI: selectedStation.value.scheduleToBundaranHI }
  }
})
const nextSchedulesBundaranHI = computed(() => {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  return selectedSchedule.value.nextSchedulesBundaranHI
    .filter(time => {
      const [hours, minutes] = time.split(':').map(Number)
      const scheduleTime = hours * 60 + minutes
      return scheduleTime > currentTime
    })
    .slice(0, 2)
})
const nextSchedulesLebakBulus = computed(() => {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  return selectedSchedule.value.nextSchedulesLebakBulus
    .filter(time => {
      const [hours, minutes] = time.split(':').map(Number)
      const scheduleTime = hours * 60 + minutes
      return scheduleTime > currentTime
    })
    .slice(0, 2)
})
const { t, locale } = useI18n()

onMounted(async () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  try {
    const response = await fetch('/stations.json')
    stations.value = await response.json()
    selectedStation.value = stations.value[0]
  } catch (error) {
    console.error('Error loading stations data:', error)
  }
})

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'id' : 'en'
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark')
}

function calculateMinutesLeft(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const scheduleTime = new Date()
  scheduleTime.setHours(hours, minutes, 0)

  const now = new Date()
  const diffMs = scheduleTime.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  return diffMinutes > 0 ? diffMinutes : '1'
}

function findNearestStation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const userLat = position.coords.latitude
    const userLon = position.coords.longitude

    const nearest = stations.value.reduce((prev, curr) => {
      const prevDist = getDistance(userLat, userLon, prev.latitude, prev.longitude)
      const currDist = getDistance(userLat, userLon, curr.latitude, curr.longitude)
      return currDist < prevDist ? curr : prev
    })

    selectedStation.value = nearest
  }, () => {
    alert('Unable to retrieve your location')
  })
}

function getDistance(lat1: number, lon1: number, lat2: string, lon2: string) {
  const R = 6371
  const dLat = deg2rad(parseFloat(lat2) - lat1)
  const dLon = deg2rad(parseFloat(lon2) - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(parseFloat(lat2))) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}
</script>

<template>
  <div :class="{ 'dark': isDarkMode }" class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">{{ t('title') }}</h1>
        <div class="flex space-x-2">
          <button @click="toggleLanguage"
            class="p-2 rounded-full w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
            {{ locale === 'en' ? 'ID' : 'EN' }}
          </button>
          <button @click="toggleDarkMode" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <svg v-if="!isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-300" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-6">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">{{ t('selectStation') }}</h2>
          <div class="mt-2 relative">
            <select v-model="selectedStation"
              class="w-full border-gray-500 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-12 py-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
              <option v-for="station in stations" :key="station.id" :value="station">
                {{ station.name }}
              </option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">{{ selectedStation.name }}</h2>
            <div class="flex items-center">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="isHolidaySchedule" class="sr-only peer">
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                </div>
              </label>
              <span class="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">{{ isHolidaySchedule ?
                t('holiday') : t('weekday') }}</span>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span class="text-md font-semibold text-gray-700 dark:text-gray-300">{{ t('towardsHI') }}</span>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <div v-if="nextSchedulesBundaranHI.length > 0">
                  <div v-for="(time, index) in nextSchedulesBundaranHI" :key="index"
                    class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ time }}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ calculateMinutesLeft(time) }} {{
                      t('minutes') }}</span>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('noSchedule') }}
                </div>
              </div>
            </div>
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span class="text-md font-semibold text-gray-700 dark:text-gray-300">{{ t('towardsLB') }}</span>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <div v-if="nextSchedulesLebakBulus.length > 0">
                  <div v-for="(time, index) in nextSchedulesLebakBulus" :key="index"
                    class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ time }}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ calculateMinutesLeft(time) }} min</span>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('noSchedule') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button @click="findNearestStation"
        class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
        {{ t('nearestStation') }}
      </button>
    </div>
    <div class="text-center mt-8">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        This web is made using <a href="https://www.jadwalmrt.id/" target="_blank" rel="noopener noreferrer"
          class="text-blue-600 hover:underline dark:text-blue-400">jadwalmrt.id</a> as a reference
      </p>
    </div>
  </div>
</template>
