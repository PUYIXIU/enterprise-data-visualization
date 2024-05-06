<script setup>
import {ref} from 'vue'
import ContentHeader from '@/components/ContentHeader'
const btnList = ref([
  {
    name:'所有部门',
    class:'expand',
    onclick:()=>{}
  },
])
</script>

<template>
  <div class="kanban-wrapper">
    <content-header title="项目占比" :btn-list="btnList" />
  </div>
</template>

<style scoped lang="scss">
.kanban-wrapper{
  padding:1.5rem 1.5rem 0.88rem 1.69rem;
}
</style>
