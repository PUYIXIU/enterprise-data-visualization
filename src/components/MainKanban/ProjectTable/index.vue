<script setup>
import {ref,computed,reactive} from 'vue'
import {mockData} from './mockData.js'
import {getpx} from "@/utils/style.js";
import {predictType, productType} from "@/components/MainKanban/ProjectTable/dataType.js";

const data = ref(mockData)
// 0 不筛选 1 降序 2 升序
let delaySort = ref(0) // 已开启天数
let restSort = ref(0) // 剩余天数
let progressSort = ref(0) // 项目进度
let hotSort = ref(0) // 项目热度
let hourSort = ref(0) // 工时

let status = ['no-sort','top-sort','bottom-sort']

// 排序
const sort = ref({
  duration:0,
  rest:0,
  progress:0,
  hot:0,
  hour:0,
})

function changeSortProp(propName){
  let propSortStatus = sort.value[propName]
  if(propSortStatus == 0){ // 该指标没有排序
    Object.keys(sort.value).forEach(prop=>sort.value[prop]=0) // 状态清空
    sort.value[propName] = 1 // 升序
  }else if(propSortStatus == 1){
    Object.keys(sort.value).forEach(prop=>sort.value[prop]=0) // 状态清空
    sort.value[propName] = 2 // 升序
  }else if(propSortStatus == 2){
    Object.keys(sort.value).forEach(prop=>sort.value[prop]=0) // 状态清空
  }

}

const sortTableData = computed(()=>{
  let prop = Object.entries(sort.value).find(([key,value])=>{
    return value!==0
  })
  if(prop == undefined) return data.value
  let o = prop[0]
  let dir = prop[1]==1?1:-1; // 升序还是降序
  let result = [...data.value]
  result.sort((a,b)=>{
    return dir * (a[o] - b[o])
  })
  return result
})

</script>

<template>
  <div class="table-wrapper">

    <el-table :data="sortTableData" :height="'100%'">
      <el-table-column prop="productName" label="产品名称" :width="getpx(9.19)" show-overflow-tooltip header-align="left"></el-table-column>
      <el-table-column prop="fakeName" label="代号" show-overflow-tooltip header-align="center" :width="getpx(5)"></el-table-column>
      <el-table-column prop="predict" label="优先级" header-align="center">
        <template #default="{row}">
        <span class="predict-item"
              :style="{
                '--color1':predictType[row.predict][0],
                '--color2':predictType[row.predict][1],
        }">{{row.predict}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="commander" label="产品负责人" show-overflow-tooltip header-align="center" class-name="medium"></el-table-column>
      <el-table-column prop="product" label="产品业务线" :width="getpx(8)" header-align="center">
        <template #default="{row}">
        <span class="predict-item"
              :style="{
                '--color1':productType[row.product][0],
                '--color2':productType[row.product][1],
        }">{{row.product}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="subCommander" label="分管负责人" show-overflow-tooltip header-align="center" class-name="medium"></el-table-column>
      <el-table-column prop="status" label="状态" show-overflow-tooltip header-align="center" class-name="lighter"></el-table-column>
      <el-table-column prop="startTime" label="开始时间" header-align="center" class-name="DIN" ></el-table-column>
      <el-table-column prop="endTime" label="结束时间" header-align="center" class-name="DIN" ></el-table-column>
      <el-table-column prop="duration" label="已开启天数" header-align="center" class-name="DIN">
        <template #header>
          <p class="header-p" @click="changeSortProp('duration')">
            <span>已开启天数</span>
            <i class="head-icon" :class="[status[sort.duration]]"></i>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="rest" label="剩余天数" header-align="center" class-name="DIN">
        <template #header>
          <p class="header-p" @click="changeSortProp('rest')">
            <span>剩余天数</span>
            <i class="head-icon" :class="[status[sort.rest]]"></i>
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="项目进度" header-align="center" class-name="DIN">
        <template #header>
          <p class="header-p" @click="changeSortProp('progress')">
            <span>项目进度</span>
            <i class="head-icon" :class="[status[sort.progress]]"></i>
          </p>
        </template>
        <template #default="{row}">
          <div class="progress-box" :style="{'--progress':row.progress+'%'}">
            <p class="text">{{row.progress}}%</p>
            <p class="progress-bar"><span> 1</span></p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="hot" label="项目热度" header-align="center" class-name="DIN">
        <template #header>
          <p class="header-p" @click="changeSortProp('hot')">
            <span>项目热度</span>
            <i class="head-icon" :class="[status[sort.hot]]"></i>
          </p>
        </template>
        <template #default="{row}">
          <div class="hot-box">
            <span class="text">{{row.hot}}</span>
            <div v-if="row.hotChange!==0" class="hot-div">
              <p v-if="row.hotChange>0" class="hot-p top">
                <span class="hot-icon top"></span>
                <span class="number top">+{{Math.abs(row.hotChange)}}</span>
              </p>
              <p v-if="row.hotChange<0" class="hot-p bottom">
                <span class="hot-icon bottom"></span>
                <span class="number bottom">-{{Math.abs(row.hotChange)}}</span>
              </p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="hour" label="工时" show-overflow-tooltip header-align="center" class-name="DIN" :width="getpx(5.5)">
        <template #header>
          <p class="header-p" @click="changeSortProp('hour')">
            <span>工时</span>
            <i class="head-icon" :class="[status[sort.hour]]"></i>
          </p>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
$padding-top:1.5rem;
.table-wrapper{
  box-sizing: border-box;
  padding-top:$padding-top;
  height:calc(100% - $content-header-h - $padding-top);
  //height:100%;
  overflow-y: hidden;
}
.predict-item{
  background: var(--color1);
  color:var(--color2);
  border-radius: 0.25rem 0.25rem 0.25rem 0.25rem;
  height: 1.44rem;
  padding:0.2rem 0.88rem;
  font-family: SourceHanSansCN-Medium;
  white-space: nowrap;
}
.header-p{
  display: flex;
  align-items: center;
  justify-content: center;
}
.head-icon{
  display: inline-block;
  width:1.13rem;
  height:1.13rem;
  margin-left:0.13rem;
  transition-property: background;
  transition-duration: 0.1s;
  &.no-sort{background: $no-sort-icon;}
  &.top-sort{background: $top-sort-icon;}
  &.bottom-sort{background: $down-sort-icon;}
}

// 进度条
.progress-box{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .text{
    color:#799EFF;
  }
  .progress-bar{
    width:5.13rem;
    height:0.25rem;
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: #DFE5F6;
    position:relative;
    span{
      border-radius: 0.75rem;
      position:absolute;
      left:0;
      top:0;
      color:transparent;
      display: inline-block;
      height:100%;
      width:var(--progress);
      background-color: #3f77fccc;
    }
  }
}
.hot-box{
  display: flex;
  .text{
    margin-right: 0.44rem;
  }
  .hot-div{
    .hot-p{
      .hot-icon{
        display: inline-block;
        width:0.58rem;
        height:0.5rem;
        margin-right: 0.25rem;
        &.top{
          background: $top-arrow;
        }
        &.bottom{
          background: $down-arrow;
        }
      }
      .number{
        &.top{color:#00C595;}
        &.bottom{color:#EB4651;}
      }
    }
  }
}
</style>
