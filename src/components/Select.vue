<script setup lang="ts">
import { PropType } from 'vue'

const props = defineProps({
    modelValue: Object as PropType<any>,
    options: Array as PropType<any[]>
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event: Event) => {
    const selectedId = (event.target as HTMLSelectElement).value
    const selectedOption = props.options?.find(option => option.id.toString() === selectedId)
    emit('update:modelValue', selectedOption)
}
</script>

<template>
    <div class="relative">
        <select :value="modelValue ? modelValue.id : ''" @change="handleChange"
            class="w-full border-gray-500 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-12 py-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
            <slot></slot>
        </select>
        <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
        </div>
    </div>
</template>
