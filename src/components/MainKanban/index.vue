<script setup>
import {ref} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import LiquidChart from '@/components/MainKanban/LiquidChart'
import ProjectTable from '@/components/MainKanban/ProjectTable'
const btnList = ref([
  {
    name:'重置',
    class:'reload',
    onclick:()=>{}
  },  {
    name:'展开筛选',
    class:'expand',
    onclick:()=>{}
  },
])

// showIndex = 0 展示水球图 showIndex = 1 展示表格
const showIndex = ref(0)
</script>

<template>
<!--  主看板  控制轮播切换-->
  <div class="kanban-wrapper full">
    <content-header title="项目数据统计" :btn-list="btnList" />
    <liquid-chart v-show="showIndex==0" />
    <project-table v-show="showIndex==1" />
  </div>
</template>

<style scoped lang="scss">
.kanban-wrapper{
  padding:0.75rem 2.25rem;
}
</style>
