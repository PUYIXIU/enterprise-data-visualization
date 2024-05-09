<script setup>
import {ref, onMounted, reactive, watch, getCurrentInstance} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import {mockData} from './mockData.js'
import {getpx} from "@/utils/style.js";
import QueryBox from "@/components/QueryBox/index.vue";
const {proxy} = getCurrentInstance()
const btnList = ref([
  {
    name:'所有部门',
    class:'expand',
    deactiveIconStyle:{
      transform:'rotateZ(-180deg)'
    },
    active:false,
    id:'danger-proj-select-btn',
    onclick:()=>{
      proxy.$refs.DangerProjQueryRef.expand()
    }
  },
])
const colorList = [
  '#FF505D',
  '#6459F4',
  '#A26CE6',
]
const data = ref(mockData)

const departmentOptions = [
  {value:'所有部门',label:'所有部门'},
  {value:'综合部',label:'综合部'},
  {value:'商务部',label:'商务部'},
  {value:'财务部',label:'财务部'},
  {value:'工业设计部',label:'工业设计部'},
  {value:'多媒体事业部',label:'多媒体事业部'},
  {value:'产品测试部',label:'产品测试部'},
  {value:'软件开发部',label:'软件开发部'},
  {value:'AI部',label:'AI部'},
]
const queryParams = reactive({
  department:'所有部门'
})
function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}
watch(()=>queryParams.department,(nv,ov)=>{
  if(nv!==ov){
    btnList.value[0].name=nv
    btnList.value[0].deactiveName=nv
  }
})
</script>

<template>
  <div class="kanban-wrapper">
    <content-header title="风险项目" :btn-list="btnList" />
    <query-box
        ref="DangerProjQueryRef"
        class="query-box"
        :btn-id="btnList[0].id" dom-id="danger-proj-dom-id"
        :options="departmentOptions"
        :height="(1.13+0.5)*Math.ceil(departmentOptions.length/2) + 0.5*2"
        @change="(()=>getChangeFun(0))()"
        v-model:value="queryParams.department" />
    <div class="kanban-content">
      <div class="kanban-item"  v-for="(item, index) in data"
           :style="{
              '--color':colorList[index]||'#B3B5BB',
              '--bg-color':colorList[index]?colorList[index]+'33':'#D9D9D933',
              '--inner-color':colorList[index]||'#D9D9D9',
              '--index':index,
           }">
        <div class="index num">{{index+1}}</div>
        <div class="progress-box">
          <div class="progress-label">
            <p class="name">{{item.name}}</p>
            <p class="predict">预计{{item.predict}}%</p>
          </div>
          <el-progress
              :percentage="item.progress/item.predict*100"
              :show-text=false
              stroke-linecap="butt"
              :stroke-width="getpx(0.5)"
          />
        </div>
        <div class="progress-num">
          <span class="num">{{item.progress}}</span>
          <span class="sign">%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.kanban-wrapper{
  padding:1.5rem 1.5rem 2.94rem 1.5rem;
  position:relative;
}

.query-box{
  top:calc($content-header-h + 1.5rem + 0.6rem);
  width:10.5rem;
  max-height: calc(22rem - $content-header-h - 1.5rem - 2.94rem - 0.6rem);
}
.kanban-content{
  padding-top:1.75rem;
  .kanban-item{
    height:2.13rem;
    display: flex;
    color:#001133;
    margin-bottom:1.13rem;
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
    .num{font-family: D-DINExp}
    .index{
      width:2.13rem;
      height:100%;
      background: rgba(235, 239, 250, 0.8);
      border-radius: 0.38rem 0.38rem 0.38rem 0.38rem;
      line-height: 2.13rem;
      text-align: center;
      font-size: 1.5rem;
      color:var(--color);
      margin-right:0.44rem;
      opacity: 0.8;
    }
    .progress-box{
      width:20.88rem;
      display: flex;
      flex-direction:column;
      justify-content: space-between;
      .progress-label{
        display: flex;
        justify-content: space-between;
        $font-size:0.88rem;
        $max-len:17;
        .name{
          font-family: SourceHanSansCN-Medium;
          font-size: $font-size;
          max-width: calc($font-size * $max-len);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          opacity: 0.8;
        }
        .predict{
          font-family: SourceHanSansCN-Normal;
          font-size: 0.75rem;
          color: rgba(29,29,29,0.7);
        }
      }
    }
    &:nth-child(1),&:nth-child(2),&:nth-child(3){
      .progress-num{ color:var(--color)}
    }
    .progress-num{
      flex:1;
      text-align: right;
      .num{
        font-size: 2rem;
      }
      .sign{
        font-family: D-DINExp;
        font-size: 0.88rem;
      }
    }
  }
}

// 进度条
::v-deep(.el-progress-bar__outer){
  background-color: var(--bg-color);
  border-radius:0rem;
  .el-progress-bar__inner{
    background-color: var(--inner-color);
    border-radius:0rem;
  }
}
</style>
