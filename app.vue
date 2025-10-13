<template>
  <div
    class="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Tailwind działa! 🎉</h1>
      <p class="text-gray-600 mb-4">
        Jeśli widzisz gradientowe tło i stylowaną kartę, Tailwind jest poprawnie skonfigurowany.
      </p>

      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-xl font-semibold text-gray-800 mb-3">Supabase Connection Test</h2>

        <div v-if="pending" class="text-gray-600">Ładowanie danych z Supabase...</div>

        <div v-else-if="error" class="text-red-600">
          <p class="font-semibold">Błąd połączenia:</p>
          <p class="text-sm">{{ error }}</p>
        </div>

        <div v-else class="space-y-2">
          <p class="text-green-600 font-semibold">✓ Połączenie z Supabase działa!</p>
          <div class="text-gray-700">
            <p class="font-medium">Liczba fiszek: {{ flashcards?.length || 0 }}</p>
            <div v-if="flashcards && flashcards.length > 0" class="mt-3">
              <p class="font-medium mb-2">Fiszki:</p>
              <div
                v-for="card in flashcards"
                :key="card.id"
                class="bg-white p-3 rounded shadow-sm mb-2"
              >
                <p class="text-sm"><strong>Front:</strong> {{ card.front }}</p>
                <p class="text-sm"><strong>Back:</strong> {{ card.back }}</p>
              </div>
            </div>
            <p v-else class="text-gray-500 text-sm mt-2">
              Brak fiszek w bazie danych (to jest OK - tabela jest pusta)
            </p>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <TestComponent />
        <div class="mt-2">
          <span class="text-gray-700">Count: {{ count }}</span>
          <button
            class="ml-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="increment"
          >
            Increment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TestComponent from './components/TestComponent.vue'
import { useTestStore } from './store/testStore'
import { storeToRefs } from 'pinia'
import { useSupabase } from './composables/useSupabase'

const { count } = storeToRefs(useTestStore())
const { increment } = useTestStore()

// Test Supabase connection
const { supabase } = useSupabase()

const {
  data: flashcards,
  error,
  pending,
} = await useAsyncData('flashcards', async () => {
  const { data, error } = await supabase.from('flashcards').select('*')
  console.log(data)
  if (error) {
    throw error
  }

  return data
})
</script>
