<script setup>
import {ref} from 'vue'
import ContentHeader from '@/components/ContentHeader'
const btnList = ref([
  {
    name:'近七天',
    class:'expand',
    onclick:()=>{}
  },  {
    name:'综合',
    class:'expand',
    onclick:()=>{}
  },
])

const data = ref([
  {
    projectName:'山西煤矿及洗选煤报名与管理后台项目', // 项目名称
    commander:'张泽伟', // 负责人
    grade:100, // 分数
  },
  {
    projectName:'南京安全生产培训考核管理平台(安培超市)', // 项目名称
    commander:'刘邵峰', // 负责人
    grade:98, // 分数
  },
  {
    projectName:'AI智能焊接安全监管机器人', // 项目名称
    commander:'曹雪芹', // 负责人
    grade:96, // 分数
  },
  {
    projectName:'国家矿山安全监察局江苏局监察执法逢查必考系统', // 项目名称
    commander:'蒋文明', // 负责人
    grade:87, // 分数
  },
  {
    projectName:'美的高处特种作业证认证系统', // 项目名称
    commander:'李月', // 负责人
    grade:65, // 分数
  },
])

</script>

<template>
  <div class="kanban-wrapper">
    <content-header title="项目热度" :btn-list="btnList" />
    <div class="kanban-content">

    </div>
  </div>
</template>

<style scoped lang="scss">
.kanban-wrapper{
  padding:1.5rem;
}
</style>
