<script setup>
import {ref, getCurrentInstance, onMounted, reactive, watch, computed,nextTick} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import QueryBox from '@/components/QueryBox'
import RingPie from './RingPie.vue'
import {mockData} from "@/components/ProjPercent/mockData.js";
import {ringPieColorList} from "@/components/ProjPercent/colorConfig.js";
import {useLocalDataStore} from "@/storage/index.js";
import request from "@/utils/request.js";
import {filterProgressData} from "@/utils/dataFilter.js";

const store = useLocalDataStore()
const {proxy} = getCurrentInstance()

const data = ref(mockData)

const queryParams = reactive({
  department:undefined // 0表示综合
})

const btnList = ref([
  {
    name:'所有部门',
    class:'expand',
    deactiveIconStyle:{
      transform:'rotateZ(-180deg)'
    },
    active:false,
    id:'proj-percent-select-btn',
    onclick:()=>{
      proxy.$refs.ProjPercentQueryRef.expand()
    }
  },
])

function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}
const selectProjectProportion = params => request.get('/erp/visualize/selectProjectProportion', {params}) // 请求项目占比数据
// 获取项目占比数据
function getProjPercentData(){
  return selectProjectProportion({deptId:queryParams.department}).then(res=>{
    data.value = filterProgressData(res.data)
    if(window.debugModeEnable){
      console.group('项目占比数据')
      console.log(data.value)
      console.groupEnd()
    }
    nextTick(()=>{
      proxy.$refs.RingPieRef.updateChart()
    })
  })
}

// 项目部门变化/定时器被触发 请求数据
watch(()=>[queryParams.department, store.timeTrigger],(nv,ov)=>{
  if(nv!==ov){
    getProjPercentData()
    let label = store.deptList.find(o=>o.value == queryParams.department).label
    btnList.value[0].name = btnList.value[0].deactiveName = label
  }
})


function init(){
  proxy.$refs.RingPieRef.initChart()
  queryParams.department = store.deptList[0].value
}

defineExpose({
  init
})

</script>

<template>
  <div class="kanban-wrapper">
    <content-header title="项目占比" :btn-list="btnList" />
    <query-box
        ref="ProjPercentQueryRef"
        class="query-box"
        :btn-id="btnList[0].id" dom-id="proj-percent-dom-id"
        :options="store.deptList"
        :height="(1.13+0.5)*Math.ceil(store.deptList.length/2)+0.5*2"
        @change="(()=>getChangeFun(0))()"
        v-model:value="queryParams.department" />

    <div class="kanban-content">
      <RingPie ref="RingPieRef" dom-id="ring-pie-id" :data="data" />
      <div class="tooltip-box">
        <div class="tooltip-item" v-for="(item,index) in data" :style="{'--color':ringPieColorList[index]||'#B3B5BB'}">
          <div class="tooltip-icon"></div>
          <div class="tooltip-info">
            <div>{{item.name}}</div>
            <p>（{{item.taskNum}}）</p>
          </div>
          <div class="tooltip-num">
            <span class="num">{{String(item.percent).padStart(2,'0')}}</span>
            <span class="sign">%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
$padding-top:1.5rem;
$padding-bottom:0.88rem;
.kanban-wrapper{
  padding:$padding-top 1.5rem $padding-bottom 1.69rem;
  height:100%;
  position:relative;
}

.query-box{
  top:calc($content-header-h + $padding-top + 0.6rem);
  width:13rem;
  right:0;
  max-height: calc(22rem - $content-header-h - $padding-top - $padding-bottom - 0.6rem);
}
.kanban-content{
  display: flex;
  width: 100%;
  height:calc(100% - $content-header-h - $padding-top - $padding-bottom);
  align-items: center;
  justify-content: space-between;
  padding-top:0.38rem;
  filter:saturate(1.3);
}


$item-width:6.7rem;
$item-mr:2.75rem;
.tooltip-box{
  margin-left: 2.25rem;
  display: flex;
  flex:1;
  height:100%;
  flex-flow:row wrap;
  justify-content: space-between;
  .tooltip-item{
    --color:#B3B5BB;
    width:$item-width;
    display: flex;
    //margin-right:$item-mr;
    color: #001133;
    font-size: 0.65rem;
    height:2.19rem;
    align-items: center;
    margin-bottom:0.75rem;
    &:nth-child(2n){margin-right: 0}

    .tooltip-icon{
      width:0.5rem;height:0.5rem;
      background-color: var(--color);
      margin-right: 0.25rem;
      opacity: 0.9;
    }
    .tooltip-info{
      width:3rem;
      font-family: SourceHanSansCN-Normal;
    }
    .tooltip-num{
      flex:1;
      text-align: right;
      .num{
        font-family: D-DINExp-Bold;
        font-size: 1.3rem;
      }
      .sign{
        font-family: D-DINExp;}
    }
  }
}
</style>
