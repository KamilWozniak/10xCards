<template>
  <div>
    <ClientOnly>
      <Toaster position="top-center" />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '~/components/ui/sonner'
</script>
