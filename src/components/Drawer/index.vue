<script setup>
import DrawerBox from './DrawerBox'
import TaskHourBar from './TaskHourBar'
import TaskGant from './TaskGant'
import TaskProgress from './TaskProgress'
import gsap from 'gsap'
import {ref, onMounted, getCurrentInstance, watch, onBeforeUnmount,nextTick} from "vue";
import request from '@/utils/request.js'
import {mockData as taskHourBarMockData} from './TaskHourBar/mockData.js'
import {mockData as taskGantMockData} from './TaskGant/mockData.js'
import {MockProgressTimelineData as TaskProgressMockData} from './TaskProgress/mockData.js'
import {MockProgressTimelineData} from "@/components/Drawer/TaskProgress/mockData.js";
import {useLocalDataStore} from "@/storage/index.js";
import {filterBarData, filterGantData, filterTimelineData} from "@/utils/dataFilter.js";
const props = defineProps(['domId'])

const store = useLocalDataStore()
const {proxy} = getCurrentInstance()
const taskGantData = ref(taskGantMockData)
const taskProgressData = ref(TaskProgressMockData)

const visible = ref(false)

// 监听当前选中的项目id
watch(()=>store.selectProjId,(nv,ov)=>{
  if(nv == undefined) return
  setTimeout(()=>{
    !visible.value && expand(nv)
  })
})

// 获取柱状图数据
const selectProjectBarChartDetails = params => request.get('/erp/visualize/selectProjectBarChartDetails',{params})
function getTaskHourBarData(projId){
  // 获取柱状图数据，传项目id 和时间长度
  return selectProjectBarChartDetails({erpProjectId:projId, filterDay:store.timeRange}).then(res=>{
    res.data = filterBarData(res.data)
    proxy.$refs.TaskHourBarRef.initChart(res.data)
    if(window.debugModeEnable){
      console.group('请求任务详情柱状图数据:',projId)
      console.log(res)
      console.groupEnd()
    }
  })
}

// 获取项目甘特图数据
const selectProjectGanttChartDetails = params => request.get('/erp/visualize/selectProjectGanttChartDetails',{params})
function getTaskGantData(projId){
  return selectProjectGanttChartDetails({erpProjectId:projId}).then(res=>{
    res.data = filterGantData(res.data)
    proxy.$refs.TaskGantRef.dataReady(res.data)
    if(window.debugModeEnable){
      console.group('请求项目甘特图数据:',projId)
      console.log(res)
      console.groupEnd()
    }
  })
}

// 获取任务进度数据
const selectTaskProgress = params => request.get('/erp/visualize/selectTaskProgress',{params})

function getTaskProgressData(projId){
  return selectTaskProgress({erpProjectId:projId, filterDay:store.timeRange}).then(res=>{
    if(window.debugModeEnable){
      console.group('请求任务进度数据:',projId)
      console.log(res)
      console.groupEnd()
    }
    res.data = filterTimelineData(res.data)
    return res.data
  })
}

// 初始化所有数据
function initAll(projId){
  store.loading = true
  Promise.all([
    getTaskHourBarData(projId),
    getTaskGantData(projId),
    getTaskProgressData(projId),
  ]).then(res=>{
    proxy.$refs.TaskProgressRef.init(res[2])
    store.loading = false
  })
}

function expand(projId){
  visible.value = true
  initAll(projId)
  setTimeout(()=>{
    window.addEventListener('click',clickCheck)
  },300)
}

function collapse(){
  visible.value = false
  store.currentProjectIndex = undefined
  store.selectProjId = undefined
  proxy.$refs.TaskHourBarRef.dispose()
  proxy.$refs.TaskGantRef.dispose()
  proxy.$refs.TaskProgressRef.dispose()
  window.removeEventListener('click',clickCheck)
}

function clickCheck(e){
  const target = document.getElementById(props.domId)
  const r = target.getBoundingClientRect() // 获取包围盒
  const x = e.x, y = e.y;
  if(x >= r.left && x <= r.right){ // 鼠标在x范围内
    if(y>= r.top && y<= r.bottom){ // 鼠标在y范围内
      return
    }
  }
  collapse()
}



onMounted(()=>{
  // expand(123)
})

</script>

<template>
  <div class="drawer-wrapper" :class="{'expand':visible}" :id="domId">
    <h3>项目详情</h3>
    <drawer-box title="项目甘特图" height="11.19rem">
      <task-gant ref="TaskGantRef" dom-id="task-gant-id" />
    </drawer-box>
    <drawer-box title="任务工时" height="15.69rem" :tooltip="{width:230, context:'鼠标拖动查看更多数据'}">
      <task-hour-bar ref="TaskHourBarRef" dom-id="task-hour-bar-id" />
    </drawer-box>
    <drawer-box id="progress-wrapper-dom" title="任务进度" height="24.5rem"  :tooltip="{width:400, context:'按住Shift+滚轮缩放，左右拖动查看更多数据'}" style="background-color:rgba(255, 255, 255)">
      <task-progress ref="TaskProgressRef" dom-id="task-progress-id" />
    </drawer-box>
  </div>
</template>

<style scoped lang="scss">
.drawer-wrapper{
  &.expand{
    transform: translateX(0%);
  }
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  transform: translateX(100%);
  position:absolute;
  z-index:999;
  right:0.38rem;
  top:4.22rem;
  width: 60rem;
  height: 58.44rem;
  background: linear-gradient( 90deg, #e6ecfc 0%, rgba(33, 51, 98, 0) 100%);
  backdrop-filter: blur(0.75rem);
  filter:drop-shadow(-1px 0px 0.5rem rgba(217, 226, 255, 0.2));
  box-shadow:
      0rem 0rem 0.1rem 0.05rem rgba(230, 235, 255, 0.8),
      0.1rem 0rem 0.3rem 0rem rgba(153, 182, 250, 0.5),
      0.2rem 0.25rem 1.25rem 0rem rgba(145, 177, 255, 0.25),
      0.4rem 0.25rem 2.5rem 0rem rgba(149, 179, 253, 0.15);
  border-radius: 1rem 0.1rem 0.1rem 1rem;

  box-sizing: border-box;
  padding-top:1.06rem;
  padding-left:1.88rem;
  padding-right:1.13rem;
  padding-bottom:1.19rem;

  overflow: hidden;
}

h3{
  color: #001133;
  font-weight: 400;
  font-size: 1.5rem;
  font-family: 时尚中黑简体;
  margin-bottom: 1.5rem;
  padding-left:0.75rem;
}
</style>
