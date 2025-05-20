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
      <el-date-picker
        v-model="queryParams.deployTime"
        clearable
        size="small"
        type="date"
        placeholder="选择时间"
        value-format="yyyy-MM-dd"
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
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" align="center" prop="taskId" :show-overflow-tooltip="true" />
      <el-table-column label="流程名称" align="center" prop="procDefName" />
      <el-table-column label="当前节点" align="center" prop="taskName" />
      <el-table-column label="流程版本" align="center">
        <template #default="scope">
          <el-tag size="medium">v{{ scope.row.procDefVersion }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="流程发起人" align="center">
        <template #default="scope">
          <label>{{ scope.row.startUserName }} <el-tag type="info" size="mini">{{ scope.row.startDeptName }}</el-tag></label>
        </template>
      </el-table-column>
      <el-table-column label="接收时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit-outline"
            @click="handleProcess(scope.row)"
          >处理
          </el-button>
        </template>
      </el-table-column>
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
import Pagination from '@/components/Crud/Pagination.vue'
import { todoList } from '@/api/workflow/todo'

export default {
  name: 'WorkFlowToDo',
  components: { Pagination },
  data() {
    return {
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        deployTime: null
      },
      total: 0,
      tableData: [],
      selectData: [],
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true
    }
  },
  created() {
    this.queryPage()
  },
  methods: {
    queryPage() {
      this.loading = true
      todoList(this.queryParams).then(res => {
        this.tableData = res.records
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    resetQuery() {
      this.queryParams = {
        num: 1,
        size: 10,
        name: undefined,
        deployTime: null
      }
      this.queryPage()
    },
    // 跳转到处理页面
    handleProcess(row) {
      this.$router.push({ path: '/workflow/task/todo/detail',
        query: {
          procInsId: row.procInsId,
          executionId: row.executionId,
          deployId: row.deployId,
          taskId: row.taskId,
          taskName: row.taskName,
          startUser: row.startUserName + '-' + row.startDeptName
        }})
    },
    // 取消按钮
    cancel() {
      this.dialogFormVisible = false
      this.reset()
    },
    // 多选框选中数据
    handleSelectionChange(rows) {
      this.selectData = rows
      this.ids = rows.map(item => item.taskId)
      this.single = rows.length !== 1
      this.multiple = !rows.length
    }
  }
}
</script>

