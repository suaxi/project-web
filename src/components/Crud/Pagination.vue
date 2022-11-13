<template>
  <el-pagination
      :page-size.sync="page.pageSize"
      :total="page.total"
      :current-page.sync="page.pageNum"
      style="margin-top: 8px;"
      layout="total, prev, pager, next, sizes"
      @size-change="crud.sizeChangeHandler"
      @current-change="crud.pageChangeHandler"
  />
</template>

<script>
import {pagination} from "@/components/Crud/crud";

export default {
  name: "ProjectPagination",
  mixins:[pagination()]
}
</script>

<style scoped>

</style>