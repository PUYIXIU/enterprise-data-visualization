<script setup>
import {ref,getCurrentInstance} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import LiquidChart from '@/components/MainKanban/LiquidChart'
import ProjectTable from '@/components/MainKanban/ProjectTable'
import QueryBox from '@/components/MainKanban/QueryBox'
import gsap from 'gsap'
import {useLocalDataStore} from "@/storage/index.js";
import {copy} from "@/components/MainKanban/ProjectTable/liquidChartData.js";
const {proxy} = getCurrentInstance()
const emit = defineEmits(['filterMainData'])
const store = useLocalDataStore()
const expandBtnId = 'expand-query-id'
const btnList = ref([
  {
    name:'重置',
    class:'reload',
    id:'reload-btn',
    onclick:()=>{
      proxy.$refs.QueryBoxRef.reset()
      gsap.fromTo(`#reload-btn i`,{
        rotateZ:0
      },{
        rotateZ:`${360*5}deg`,
        duration:1,
        ease:'power2.inOut'
      })
    },
    active:false,
  },
  {
    name:'展开筛选',
    class:'expand',
    id:expandBtnId,
    deactiveName:'收起筛选',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    onclick:()=>{
      proxy.$refs.QueryBoxRef.expand()
    },
    active:false,
  },
])

let chartData = []
let tableData = []
// 图表数据处理结束
function chartDataReady(src){
  chartData = src
  proxy.$refs.LiquidChartRef.dataReady(copy(src))
}

// 表格数据处理结束
function tableDataReady(src){
  tableData = src
  proxy.$refs.ProjTableRef.dataReady(copy(src))

}

// 数据过滤
function filterData(params){
  let filterChartData = []
  let filterTableData = []
  for(let i = 0; i<chartData.length; i++){
    let row = tableData[i]
    if(params.priority == '全部' || row.priority == params.priority){
      if(params.status == '全部' || row.status == params.status){
        if(params.productLine == '全部' || row.productLine == params.productLine){
          filterChartData.push(chartData[i])
          filterTableData.push(tableData[i])
        }
      }
    }
  }
  proxy.$refs.LiquidChartRef.dataReady(copy(filterChartData))
  proxy.$refs.ProjTableRef.dataReady(copy(filterTableData))
}

defineExpose({
  chartDataReady,
  tableDataReady
})

function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}

</script>

<template>
<!--  主看板  控制轮播切换-->
  <div class="kanban-wrapper full">
    <content-header title="项目数据统计" :btn-list="btnList" />
    <query-box ref="QueryBoxRef" class="query-box" :btn-id="expandBtnId" @filter-data="filterData" @change="(()=>getChangeFun(1))()"/>
    <liquid-chart ref="LiquidChartRef" class="tab-content full" :class="{show:store.showType == 0}" />
    <project-table ref="ProjTableRef"  class="tab-content" :class="{show:store.showType == 1}" />
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
.tab-content{
  position:absolute;
  top:calc($content-header-h + 0.75rem);
  left:2.25rem;
  width:calc(100% - 2.25rem * 2);
  opacity:0;
  transition-property: opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  &.show{
    opacity: 1;
  }
}
</style>
