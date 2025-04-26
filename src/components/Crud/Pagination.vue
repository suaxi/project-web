<template>
  <el-pagination
    :current-page="pageNum"
    :page-size="pageSize"
    :page-sizes="pageSizes"
    :layout="layout"
    :total="total"
    style="margin-top: 8px;"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  />
</template>

<script>

export default {
  name: 'ProjectPagination',
  props: {
    pageNum: {
      type: Number,
      require: true,
      default: 1
    },
    pageSize: {
      type: Number,
      require: true,
      default: 10
    },
    pageSizes: {
      type: Array,
      require: true,
      default() {
        return [10, 20, 50, 100]
      }
    },
    total: {
      type: Number,
      require: true,
      default: 0
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    }
  },
  data() {
    return {
      page: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  methods: {
    // 每页条数改变
    handleSizeChange(size) {
      this.$emit('update:pageSize', size)
      this.$emit('page', { pageNum: this.pageNum, pageSize: size })
    },
    // 页数改变
    handlePageChange(num) {
      this.$emit('update:pageNum', num)
      this.$emit('page', { pageNum: num, pageSize: this.pageSize })
    }
  }
}
</script>

<style scoped>

</style>
