<template>
  <el-pagination
    v-model:current-page="currentPageNum"
    v-model:page-size="currentPageSize"
    :page-sizes="pageSizes"
    :layout="layout"
    :total="total"
    :pager-count="pagerCount"
    style="margin-top: 8px"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pageNum: {
    type: Number,
    require: true,
    default: 1
  },
  pageSize: {
    type: Number,
    require: true,
    default: 20
  },
  pageSizes: {
    type: Array,
    require: true,
    default() {
      return [10, 20, 50, 100]
    }
  },
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
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
})

const emit = defineEmits(['update:pageNum', 'update:pageSize', 'pagination'])

const currentPageNum = computed({
  get() {
    return props.pageNum
  },
  set(val) {
    emit('update:pageNum', val)
  }
})
const currentPageSize = computed({
  get() {
    return props.pageSize
  },
  set(val) {
    emit('update:pageSize', val)
  }
})

// 每页条数改变
const handleSizeChange = (size) => {
  if (currentPageNum.value * size > props.total) {
    currentPageNum.value = 1
  }
  emit('pagination', { pageNum: currentPageNum.value, pageSize: size })
}

// 页数改变
const handlePageChange = (num) => {
  emit('pagination', { pageNum: num, pageSize: currentPageSize.value })
}
</script>

<style scoped></style>
