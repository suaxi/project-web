<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
          v-model="crud.params.name"
          clearable
          size="small"
          placeholder="请输入名称"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
      />
      <el-date-picker
          v-model="crud.params.deployTime"
          clearable
          size="small"
          type="date"
          placeholder="选择时间"
          value-format="yyyy-MM-dd"
          @keyup.enter.native="crud.toQuery"
      />
      <RrOperation :permission="{}" />
    </div>

    <el-table
        v-loading="crud.loading"
        :data="crud.tableData"
        border
        @selection-change="handleSelectionChange">
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
    <Pagination />
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import RrOperation from '@/components/Crud/RR.operation.vue'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowToDo',
  components: { Pagination, RrOperation },
  cruds() {
    return CRUD({ title: '待办任务', url: '/workflow/task/todoList' })
  },
  mixins: [presenter()],
  data() {
    return {
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },
  methods: {
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
      this.open = false
      this.reset()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.taskId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    }
  }
}
</script>

