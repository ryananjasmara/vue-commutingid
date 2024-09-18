<script setup lang="ts">
defineEmits(['click'])
</script>

<template>
    <button @click="$emit('click')"
        class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
        <slot></slot>
    </button>
</template>
