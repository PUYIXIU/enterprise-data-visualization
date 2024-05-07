<script setup>
import {ref,getCurrentInstance} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import LiquidChart from '@/components/MainKanban/LiquidChart'
import ProjectTable from '@/components/MainKanban/ProjectTable'
import QueryBox from '@/components/MainKanban/QueryBox'

const {proxy} = getCurrentInstance()
const expandBtnId = 'expand-query-id'
const btnList = ref([
  {
    name:'重置',
    class:'reload',
    onclick:()=>{},
    active:false,
  },
  {
    name:'展开筛选',
    class:'expand',
    id:expandBtnId,
    deactiveName:'收起筛选',
    deactiveIconStyle:{
      transform:'rotateZ(-180deg)'
    },
    onclick:()=>{
      proxy.$refs.QueryBoxRef.expand()
    },
    active:false,
  },
])
function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}
// showIndex = 0 展示水球图 showIndex = 1 展示表格
const showIndex = ref(0)
</script>

<template>
<!--  主看板  控制轮播切换-->
  <div class="kanban-wrapper full">
    <content-header title="项目数据统计" :btn-list="btnList" />
    <query-box ref="QueryBoxRef" class="query-box" :btn-id="expandBtnId" @change="(()=>getChangeFun(1))()" />
    <liquid-chart v-show="showIndex==0" />
    <project-table v-show="showIndex==1" />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.kanban-wrapper{
  padding:0.75rem 2.25rem;
  width:100%;
  position:relative;
}
.query-box{
  top:calc($content-header-h + 0.75rem + 1.19rem);
  width:calc(100% - 2.25rem * 2);
}
</style>
