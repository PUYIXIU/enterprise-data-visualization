<script setup>
import {ref, reactive,getCurrentInstance,watch} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import QueryBox from '@/components/QueryBox'
import {mockData} from './mockData.js'
import {defaultHotParams} from "@/storage/index.js";
const {proxy} = getCurrentInstance()

const colorList = [
  '#FF505D',
  '#A26CE6',
  '#6459F4',
]

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

const queryParams = reactive(defaultHotParams)

const btnList = ref([
  {
    name:filterDayOptions.find(o=>o.value==queryParams.filterDay).label,
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    id:'hot-time-select-btn',
    onclick:()=>{
      proxy.$refs.TimeRangeQueryRef.expand()
    },
    active:false,

  },  {
    name:filterTypeOptions.find(o=>o.value==queryParams.filterType).label,
    class:'expand',
    id:'hot-depart-select-btn',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    onclick:()=>{
      proxy.$refs.DepartSelectQueryRef.expand()
    },
    active:false
  },
])


function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}

watch(()=>queryParams.filterDay,(nv,ov)=>{
  if(nv!==ov){
    let label = filterDayOptions.find(o=>o.value==nv).label
    btnList.value[0].name = btnList.value[0].deactiveName = label
  }
})
watch(()=>queryParams.filterType,(nv,ov)=>{
  if(nv!==ov){
    let label = filterDayOptions.find(o=>o.value==nv).label
    btnList.value[1].name = btnList.value[1].deactiveName = label
  }
})

const emit = defineEmits(['queryChange'])
// 请求页面数据
watch(queryParams,(nv,ov)=>{
  emit('queryChange',queryParams)
})

const data = ref(mockData)

</script>

<template>
  <div class="kanban-wrapper">
    <content-header title="项目热度" :btn-list="btnList" />

    <query-box
        ref="TimeRangeQueryRef"
        class="query-box"
        :btn-id="btnList[0].id" dom-id="time-range-dom-id"
        :options="filterDayOptions"
        :height="(1.13+0.5)*Math.ceil(filterDayOptions.length/2) + 0.5*2"
        @change="(()=>getChangeFun(0))()"
        v-model:value="queryParams.filterDay" />

    <query-box
        ref="DepartSelectQueryRef"
        class="query-box"
        :btn-id="btnList[1].id" dom-id="depart-range-dom-id"
        :options="filterTypeOptions"
        @change="(()=>getChangeFun(1))()"
        :height="(1.13+0.5)*Math.ceil(filterTypeOptions.length/2) + 0.5*2"
        v-model:value="queryParams.filterType" />
    <div class="kanban-content">
      <div class="kanban-item" v-for="(item, index) in data"
           :style="{
              '--color':colorList[index]||'#B3B5BB',
              '--index':index,
          }">
        <div class="index num">{{index + 1}}</div>
        <div class="split-line"></div>
        <div class="info-box">
          <div class="proj-name">{{item.projectName}}</div>
          <div class="commander-name">{{item.commander}}</div>
        </div>
        <div class="grade num">{{item.grade}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.kanban-wrapper{
  padding:1.5rem;
  position:relative;
}
.query-box{
  top:calc($content-header-h + 1.5rem + 0.6rem);
  width:7.5rem;
  max-height: calc(22rem - $content-header-h - 1.5rem * 2 - 0.6rem);
}
.kanban-content{
  padding-top:1.19rem;
  .num{ // 数字类型
    font-family: D-DINExp;
    font-size: 1.5rem;
  }
  .kanban-item{
    --color:#B3B5BB;
    color: #001133;
    display: flex;
    margin-bottom:0.9rem;
    align-items: center;
    height: 2.5rem;
    position:relative;
    &:before{
      content:'123';
      position:absolute;
      right:0;
      top:0;
      width:100%;
      height:100%;
      color:transparent;
      z-index:1;
      background: #ffffff;
      animation:slide-in 1s linear forwards;
      animation-delay: calc(var(--index) * 0.1s);
      @keyframes slide-in  {
        to{
          width:0%;
        }
      }
    }
    &:last-child{margin-bottom: 0;}
    .index{
      height: 2.13rem;
      width: 2.13rem;
      line-height: 2.13rem;
      text-align: center;
      background: rgba(235, 239, 250, 0.8);
      border-radius: 0.38rem 0.38rem 0.38rem 0.38rem;
      color:var(--color);
      margin-right:0.69rem;
      opacity: 0.8;
    }
    .split-line{
      width:0.13rem;
      height:1.5rem;
      background-color: var(--color);
      margin-right:0.5rem;
      opacity: 0.8;
    }
    .info-box{
      height:100%;
      font-family: SourceHanSansCN-Regular;
      .proj-name{
        font-family: SourceHanSansCN-Medium;
        opacity: 0.8;
        $font-size:0.88rem; // 字体大小
        $max-font-len:21; // 最大展示22个字符
        font-size: $font-size;
        max-width: calc($font-size * $max-font-len);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .commander-name{
        font-size: 0.75rem;
      }
    }
    .grade{
      flex:1;
      text-align: right;
    }
  }
}
</style>
