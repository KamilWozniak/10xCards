<template>
 <div class="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Tailwind działa! 🎉</h1>
      <p class="text-gray-600 mb-4">Jeśli widzisz gradientowe tło i stylowaną kartę, Tailwind jest poprawnie skonfigurowany.</p>
      <TestComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
  import TestComponent from './components/TestComponent.vue'
</script>