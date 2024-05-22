<script setup>
import {ref,getCurrentInstance,watch,computed} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import LiquidChart from '@/components/MainKanban/LiquidChart'
import ProjectTable from '@/components/MainKanban/ProjectTable'
import QueryListBox from '@/components/MainKanban/QueryListBox'
import QueryBox from '@/components/QueryBox'
import gsap from 'gsap'
import {useLocalDataStore} from "@/storage/index.js";
import {copy} from "@/components/MainKanban/LiquidChart/liquidChartData.js";
import {priorityDict, productLineDict, showTypeDict, statusDict} from "@/components/MainKanban/Dict.js";
const {proxy} = getCurrentInstance()
const emit = defineEmits(['filterMainData'])
const store = useLocalDataStore()
const expandBtnId = 'expand-query-id'

const initQueryParams = { // 初始查询数据
  priority:'全部', // 优先级
  status:'全部', // 状态
  productLine:'全部', // 产品线
}
let lastParams = copy(initQueryParams) // 上一次查询的数据
const queryParams = ref(copy(initQueryParams)) // 当前查询的数据
const btnList = ref([
  {
    name:'切换全局模式',
    deactiveName:'切换均匀模式',
    class:'reload',
    id:'change-mode-btn',
    active:false,
    onclick:()=>{
      btnList.value[0].active = !btnList.value[0].active
      store.mapMode = btnList.value[0].active?1:0;
      gsap.fromTo(`#change-mode-btn i`,{
        rotateZ:0
      },{
        rotateZ:`${360*5}deg`,
        duration:1,
        ease:'power2.inOut'
      })
    },
  },
  {
    name:'重置',
    class:'reload',
    id:'reload-btn',
    onclick:()=>{
      console.clear()
      if(copy(queryParams.value) != copy(initQueryParams)){
        queryParams.value = {...initQueryParams}
        console.log(queryParams.value)
      }
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
    show:false,
    deactiveName:'收起筛选',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    onclick:()=>{
      proxy.$refs.QueryBoxRef.expand()
    },
    active:false,
  },
  { // 优先级筛选
    name:'优先级',
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'main-select-btn-priority',
    onclick:()=>proxy.$refs.PriorityQueryRef.expand(),
    active:false,
  },
  { // 状态筛选
    name:'状态',
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'main-select-btn-status',
    onclick:()=>proxy.$refs.StatusQueryRef.expand(),
    active:false,
  },
  { // 业务线筛选
    name:'业务线',
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'main-select-btn-productLine',
    onclick:()=>proxy.$refs.ProductLineQueryRef.expand(),
    active:false,
  },
  { // 展示方式筛选
    name:showTypeDict.find(o=>o.value==store.showType).label,
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'main-select-btn-show-type',
    onclick:()=>proxy.$refs.ShowTypeQueryRef.expand(),
    active:false,
  },
])

let chartData = []
let tableData = []
function dataReady(chartSrc, tableSrc, auto=false){
  chartData = chartSrc
  tableData = tableSrc
  if(auto && currentQueryParams!==undefined){ // 自动刷新需要保留筛选项
    filterData(currentQueryParams)
  }else{  // 来自手动刷新
    proxy.$refs.LiquidChartRef.dataReady(copy(chartSrc))
    proxy.$refs.ProjTableRef.dataReady(copy(tableSrc))
  }
}

let currentQueryParams = undefined
// 数据过滤
function filterData(params){
  currentQueryParams = params
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
watch(queryParams,(nv,ov)=>{
  let count = 0
  if((nv.priority !== lastParams.priority) && (++count)){ // 优先级改变
    let label = priorityDict.find(o=>o.value==nv.priority).label
    if(label == '全部') label='优先级'
    btnList.value[3].name = btnList.value[3].deactiveName = label
  }
  if((nv.status !== lastParams.status) && (++count)){ // 状态改变
    let label = statusDict.find(o=>o.value==nv.status).label
    if(label == '全部') label='状态'
    btnList.value[4].name = btnList.value[4].deactiveName = label
  }
  if((nv.productLine !== lastParams.productLine) && (++count)){ // 状态改变
    let label = productLineDict.find(o=>o.value==nv.productLine).label
    if(label == '全部') label='业务线'
    btnList.value[5].name = btnList.value[5].deactiveName = label
  }
  if(count>0){ // 有东西被改了
    lastParams = {...nv}
    filterData(nv) // 提交修改
  }
},{deep:true})

watch(()=>store.mapMode,(nv,ov)=>{
  proxy.$refs.QueryBoxRef.filterData()
})
defineExpose({
  dataReady
})

function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}
let fade = ref(false)
watch(()=>store.selectProjId,(nv,ov)=>{
  fade.value = (nv !==undefined)
})

</script>

<template>
<!--  主看板  控制轮播切换-->
  <div class="kanban-wrapper full">
    <content-header title="项目数据统计" :btn-list="btnList" :fade="fade"/>
    <query-list-box v-if="false" ref="QueryBoxRef" class="query-list-box" :btn-id="expandBtnId" @filter-data="filterData" @change="(()=>getChangeFun(2))()"/>
    <query-box
        ref="PriorityQueryRef" class="query-box"
        :btn-id="btnList[3].id" dom-id="priority-dom-id"
        :options="priorityDict"
        :height="(1.13+0.5)*Math.ceil(priorityDict.length/2) + 0.5*2"
        @change="(()=>getChangeFun(3))()"
        v-model:value="queryParams.priority" />
    <query-box
        ref="StatusQueryRef" class="query-box"
        :btn-id="btnList[4].id" dom-id="status-dom-id"
        :options="statusDict"
        :height="(1.13+0.5)*Math.ceil(statusDict.length/2) + 0.5*2"
        @change="(()=>getChangeFun(4))()"
        v-model:value="queryParams.status" />
    <query-box
        ref="ProductLineQueryRef" class="query-box"
        :btn-id="btnList[5].id" dom-id="product-line-dom-id"
        :options="productLineDict"
        :height="(1.13+0.5)*Math.ceil(productLineDict.length/2) + 0.5*2"
        @change="(()=>getChangeFun(5))()"
        v-model:value="queryParams.productLine" />
    <query-box
        ref="ShowTypeQueryRef" class="query-box"
        :btn-id="btnList[6].id" dom-id="show-type-dom-id"
        :options="showTypeDict"
        :height="(1.13+0.5)*Math.ceil(showTypeDict.length/2) + 0.5*2"
        @change="(()=>getChangeFun(6))()"
        v-model:value="store.showType" />

    <liquid-chart ref="LiquidChartRef" class="tab-content full" :class="{show:store.showType == 0}" />
    <project-table ref="ProjTableRef"  class="tab-content"
     :class="{
      show:store.showType == 1,
      fade:store.selectProjId !== undefined && store.showType == 1}" />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.kanban-wrapper{
  padding:0.75rem 2.25rem;
  width:100%;
  position:relative;
}
.query-list-box{
  top:calc($content-header-h + 0.75rem + 1.19rem);
  width:calc(100% - 2.25rem * 2);
}
.query-box{
  top:calc($content-header-h + 1rem );
  width:8rem;
  max-height: calc(22rem - $content-header-h - 1.5rem * 2 - 0.6rem);
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
  pointer-events: none;
  &.show{
    pointer-events: all;
    opacity: 1;
  }
  &.fade{
    opacity: 0.1;
    pointer-events: none;
  }
}
</style>
