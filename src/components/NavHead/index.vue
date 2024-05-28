<script setup>
import {ref, onMounted, reactive, watch, getCurrentInstance} from 'vue'
import dayjs from "dayjs";
import QueryBox from "@/components/QueryBox/index.vue";
import BtnList from "@/components/ContentHeader/BtnList.vue";
import {defaultHotParams, useLocalDataStore} from "@/storage/index.js";
const store = useLocalDataStore()
const {proxy} = getCurrentInstance()
const queryParams = reactive(defaultHotParams)
const filterDayOptions = [
  {value:1,label:'近七天'},
  {value:2,label:'近15天'},
  {value:3,label:'近1个月'},
  {value:4,label:'近2个月'},
  {value:5,label:'近3个月'},
  {value:6,label:'近半年'},
  {value:7,label:'近一年'},
]

const filterTypeOptions = [
  {value:1,label:'综合'},
  {value:2,label:'工时'},
  {value:3,label:'参与人数'},
  {value:4,label:'提交次数'},
]
const visitModeOptions = [
  {value:0,label:'管理者模式'},
  {value:1,label:'访客模式'},
]
const btnList = ref([
  {
    name:visitModeOptions.find(o=>o.value==store.visitMode).label,
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'visit-mode-select-btn',
    onclick:()=>{
      proxy.$refs.VisitModeSelectRef.expand()
    },
    active:false,
  },
  {
    name:filterDayOptions.find(o=>o.value==queryParams.filterDay).label,
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'hot-time-select-btn',
    onclick:()=>{
      proxy.$refs.TimeRangeQueryRef.expand()
    },
    active:false,
  },
  {
    name:filterTypeOptions.find(o=>o.value==queryParams.filterType).label+'热度',
    class:'expand',
    id:'hot-depart-select-btn',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    onclick:()=>{
      proxy.$refs.DepartSelectQueryRef.expand()
    },
    active:false
  },
  {
    name:filterDayOptions.find(o=>o.value==queryParams.filterDay).label,
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'info-hot-time-select-btn',
    onclick:()=>{
      proxy.$refs.InfoTimeRangeQueryRef.expand()
    },
    active:false,
    show:false,
  },
])
function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}
const emit = defineEmits(['queryChange'])
// 请求页面数据
watch(queryParams,(nv,ov)=>{
  emit('queryChange',queryParams)
})
watch(()=>store.timeTrigger,()=>{ // 定时请求数据
  emit('queryChange',queryParams, true)
})
watch(()=>queryParams.filterDay,(nv,ov)=>{
  if(nv!==ov){
    store.timeRange = nv // 时间长度修改
    let label = filterDayOptions.find(o=>o.value==nv).label
    btnList.value[1].name = btnList.value[1].deactiveName = label
    btnList.value[3].name = btnList.value[3].deactiveName = label
  }
})
watch(()=>queryParams.filterType,(nv,ov)=>{
  if(nv!==ov){
    let label = filterTypeOptions.find(o=>o.value==nv).label
    btnList.value[2].name = btnList.value[2].deactiveName = label+'热度'
  }
})
// 模式修改
watch(()=>store.visitMode,(nv,ov)=>{
  if(nv!==ov){
    let label = visitModeOptions.find(o=>o.value==nv).label
    btnList.value[0].name = btnList.value[0].deactiveName = label
  }
})
// 详情界面的时间修改
watch(()=>store.infoFilterDay,(nv,ov)=>{
  if(nv!==ov){
    let label = visitModeOptions.find(o=>o.value==nv).label
    btnList.value[3].name = btnList.value[3].deactiveName = label
  }
})
// 当跳转页面详情页时，按钮状态修改
watch(()=>store.selectProjId,nv=>{
  let i = 0
  for(i = 0;i<3;i++){
    btnList.value[i].show = nv == undefined
  }
  btnList.value[i].show = nv !== undefined
  console.log(btnList.value.map(i=>i.show))
})


function getCurrentTime(){
  return dayjs().format('YYYY.MM.DD HH:mm')
}

const time = ref(getCurrentTime())

onMounted(()=>{
  setInterval(()=>{
    time.value = getCurrentTime()
  },1000)
})

</script>

<template>
  <div class="nav-head-wrapper full" id="nav-head-dom">
    <p class="time-box">{{time}}</p>
    <h1>广联研发进度监控大屏</h1>
    <div class="query-box-wrapper">
      <btn-list :btn-list="btnList" />
      <query-box
          ref="VisitModeSelectRef"
          class="query-box visit-mode"
          :btn-id="btnList[0].id" dom-id="visit-mode-dom-id"
          :options="visitModeOptions"
          :height="(1.13+0.5)*Math.ceil(visitModeOptions.length/2) + 0.5*2"
          @change="(()=>getChangeFun(0))()"
          v-model:value="store.visitMode" />
      <query-box
          ref="TimeRangeQueryRef"
          class="query-box"
          :btn-id="btnList[1].id" dom-id="time-range-dom-id"
          :options="filterDayOptions"
          :height="(1.13+0.5)*Math.ceil(filterDayOptions.length/2) + 0.5*2"
          @change="(()=>getChangeFun(1))()"
          v-model:value="queryParams.filterDay" />

      <query-box
          ref="DepartSelectQueryRef"
          class="query-box"
          :btn-id="btnList[2].id" dom-id="depart-range-dom-id"
          :options="filterTypeOptions"
          @change="(()=>getChangeFun(2))()"
          :height="(1.13+0.5)*Math.ceil(filterTypeOptions.length/2) + 0.5*2"
          v-model:value="queryParams.filterType" />
      <query-box
          ref="InfoTimeRangeQueryRef"
          class="query-box"
          :btn-id="btnList[3].id" dom-id="info-time-range-dom-id"
          :options="filterDayOptions"
          :height="(1.13+0.5)*Math.ceil(filterDayOptions.length/2) + 0.5*2"
          @change="(()=>getChangeFun(3))()"
          v-model:value="store.infoFilterDay" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.query-box{
  top:calc($content-header-h + 1.5rem );
  width:7.5rem;
  max-height: calc(22rem - $content-header-h - 1.5rem * 2 - 0.6rem);
  &.visit-mode{
    width:9.5rem;
  }
}
.nav-head-wrapper{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left:0.75rem;
  padding-right:3rem;
  .time-box{
    font-family: D-DINExp;
    font-size: 1rem;
    color: #4971D7;
    word-spacing: 0.5rem;
  }
  h1{
    font-family: D-DINExp;
    font-size: 2rem;
    color: #4971D7;
    text-align: center;
  }
  .query-box-wrapper{
    width:10rem;
    white-space: nowrap;
    display: flex;
    justify-content: right;
  }
}
</style>
