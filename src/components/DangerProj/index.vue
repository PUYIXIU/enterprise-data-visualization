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
    <content-header title="风险项目" :btn-list="btnList" />
  </div>
</template>

<style scoped lang="scss">
.kanban-wrapper{
  padding:1.5rem 1.5rem 2.94rem 1.5rem;
}
</style>
