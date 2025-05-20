<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.name"
        clearable
        size="small"
        placeholder="请输入名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="queryPage"
      />
      <span>
        <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="queryPage">搜索</el-button>
        <el-button class="filter-item" size="mini" icon="el-icon-refresh-left" @click="resetQuery">重置</el-button>
      </span>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      @current-change="handleSingleExpSelect"
    >
      <el-table-column width="55" align="center">
        <template #default="scope">
          <!-- 可以手动的修改label的值，从而控制选择哪一项 -->
          <el-radio v-model="radioSelected" :label="scope.row.id">{{ '' }}</el-radio>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="类型" align="center" prop="type">
        <template #default="scope">
          <div v-if="scope.row.type === 1">动态选择</div>
          <div v-if="scope.row.type === 2">动态选择</div>
        </template>
      </el-table-column>
      <el-table-column label="表达式内容" align="center" prop="expression" />
    </el-table>
    <!-- 分页 -->
    <Pagination
      :page-num.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :total="total"
      @page="queryPage"
    />
  </div>
</template>

<script>
import { StrUtil } from '@/utils/StrUtil'
import Pagination from '@/components/Crud/Pagination'
import { page } from '@/api/workflow/expression'

export default {
  name: 'WorkFlowExpression',
  components: {
    Pagination
  },
  props: {
    // 回显数据传值
    selectValues: {
      type: Array,
      default: () => [],
      required: false
    }
  },
  data() {
    return {
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      total: 0,
      tableData: [],
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      radioSelected: null // 单选框传值
    }
  },
  watch: {
    selectValues: {
      handler(newVal) {
        if (StrUtil.isNotBlank(newVal)) {
          this.radioSelected = newVal[0].id
        }
      },
      immediate: true
    }
  },
  created() {
    this.queryPage()
  },
  methods: {
    queryPage() {
      this.loading = true
      page(this.queryParams).then(res => {
        this.tableData = res.records?.filter(item => item.status === 1)
        this.total = this.tableData.length
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    resetQuery() {
      this.queryParams = {
        num: 1,
        size: 10,
        name: undefined
      }
      this.queryPage()
    },
    // 单选框选中数据
    handleSingleExpSelect(selection) {
      if (selection.status === 0) {
        this.$message.error(`流程表达式“${selection.name}”未启用，请重新选择！`)
        return
      }
      this.radioSelected = selection.id// 点击当前行时,radio同样有选中效果
      this.$emit('handleSingleExpSelect', selection)
    }
  }
}
</script>
