<template>
  <span>
    <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="crud.toQuery">搜索</el-button>
    <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="crud.resetQueryParams">重置</el-button>
  </span>
</template>

<script>
import { crud } from '@/components/Crud/crud'

export default {
  name: 'RrOperation',
  mixins: [crud()]
}
</script>

<style scoped>

</style>
