<script setup>
import DropDownBox from '@/components/DropDownBox'
import {ref,reactive} from 'vue'
const visible = ref(false)
const props = defineProps(['btnId'])
const emit = defineEmits(['change'])
function expand(){
  visible.value = !visible.value
  emit('change', visible.value)
}

defineExpose({
  expand
})

const queryParams = reactive({
  showType:'图表展示',
  priority:'全部',
  timeRange:'近7天',
  status:'全部',
  product:'全部',
})

const queryOptions = [
  {
    title:'展示方式', // 标题
    propName:'showType',
    options:[
        {value:'图表展示',label:'图表展示'},
        {value:'列表展示',label:'列表展示'},
    ]
  },
  {
    title:'优先等级',
    propName:'priority',
    options:[
      {value:'全部',label:'全部'},
      {value:'高',label:'高'},
      {value:'中',label:'中'},
      {value:'低',label:'低'},
    ]
  },
  {
    title:'数据时间',
    propName:'timeRange',
    options:[
      {value:'近7天',label:'近7天'},
      {value:'近15天',label:'近15天'},
      {value:'近1个月',label:'近1个月'},
      {value:'近3个月',label:'近3个月'},
      {value:'近6个月',label:'近6个月'},
      {value:'近1年',label:'近1年'},
    ]
  },
  {
    title:'项目状态',
    propName:'status',
    options:[
      {value:'全部',label:'全部'},
      {value:'进行中',label:'进行中'},
      {value:'已完成',label:'已完成'},
      {value:'迭代中',label:'迭代中'},
      {value:'运维中',label:'运维中'},
      {value:'已逾期',label:'已逾期'},
    ]
  },
  {
    title:'产品业务线',
    propName:'product',
    options:[
      {value:'全部',label:'全部'},
      {value:'消防业务',label:'消防业务'},
      {value:'实操业务',label:'实操业务'},
      {value:'单品系列',label:'单品系列'},
      {value:'展馆业务',label:'展馆业务'},
      {value:'业务系列',label:'业务系列'},
      {value:'化工业务',label:'化工业务'},
      {value:'链工宝',label:'链工宝'},
      {value:'课程内容',label:'课程内容'},
    ]
  },
]

function queryChange(option,propName){
  queryParams[propName] = option.value
}

</script>

<template>
  <drop-down-box :visible-box="visible" :height="12.81" dom-id="main-query-box" @blur="expand" :btn-id="btnId">
    <div class="query-inner full">
      <div class="query-form-item" v-for="item in queryOptions">
        <span class="query-title">{{item.title}}</span>
        <p class="options-list">
          <span
              v-for="option in item.options"
              :class="{'active':option.value===queryParams[item.propName]}"
              @click="queryChange(option, item.propName)"
          >{{option.label}}</span>
        </p>
      </div>
    </div>
  </drop-down-box>
</template>

<style scoped lang="scss">
.query-inner{
  padding:1.63rem 1.5rem;
}
.query-form-item{
  display: flex;
  font-family: SourceHanSansCN-Medium;
  font-size: 0.88rem;
  height: 1.56rem;
  margin-bottom:0.5rem;
  &:last-child{margin-bottom: 0;}
  .query-title{
    width:5.5rem;
    color: rgba(29,29,29,0.7);
    line-height: 1.7rem;
  }
  .options-list{
    span{
      display: inline-block;
      height: 1.56rem;
      line-height: 1.7rem;
      background: #EFF4FF;
      border-radius: 0.78rem 0.78rem 0.78rem 0.78rem;
      width: 4.25rem;
      margin-right:0.75rem;
      text-align: center;
      color: rgba(126, 126, 126, 0.51);
      cursor:pointer;
      transition-property: color , background-color;
      transition-duration: 0.05s;
      transition-timing-function: ease-in-out;
      &:hover{
        color:#ffffffcc;
        background: #5a66f7;
      }
      &.active{
        color:#ffffffcc;
        background: #4078FE;
      }
    }
  }
}
</style>
