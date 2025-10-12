<template>
  <div class="test-component">
    <h1>Hello World</h1>
    <Button>Click me</Button>
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
    </Avatar>
  </div>
</template>
<script setup lang="ts">
import { Button } from '@/components/ui/button'

onMounted(() => {
  console.log('TestComponent mounted')
})
</script>
<style scoped>
.test-component {
  color: red;
}
</style>
