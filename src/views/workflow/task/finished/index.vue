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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" align="center" prop="taskId" :show-overflow-tooltip="true" />
      <el-table-column label="流程名称" align="center" prop="procDefName" :show-overflow-tooltip="true" />
      <el-table-column label="任务节点" align="center" prop="taskName" />
      <el-table-column label="流程发起人" align="center">
        <template #default="scope">
          <label>{{ scope.row.startUserName }} <el-tag type="info" size="mini">{{ scope.row.startDeptName }}</el-tag></label>
        </template>
      </el-table-column>
      <el-table-column label="接收时间" align="center" prop="createTime" width="180" />
      <el-table-column label="审批时间" align="center" prop="finishTime" width="180" />
      <el-table-column label="耗时" align="center" prop="duration" width="180" />
      <el-table-column label="操作" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-tickets"
            @click="handleFlowRecord(scope.row)"
          >流转记录</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-refresh-left"
            @click="handleRevoke(scope.row)"
          >撤回
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
import { getDeployment, addDeployment, updateDeployment, revokeProcess } from '@/api/workflow/finished'
import RrOperation from '@/components/Crud/RR.operation.vue'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowTaskFinished',
  components: {
    Pagination,
    RrOperation
  },
  cruds() {
    return CRUD({ title: '已办任务', url: '/workflow/task/finishedList' })
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
      // 已办任务列表数据
      finishedList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      src: '',
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    }
  },
  methods: {
    setIcon(val) {
      if (val) {
        return 'el-icon-check'
      } else {
        return 'el-icon-time'
      }
    },
    setColor(val) {
      if (val) {
        return '#2bc418'
      } else {
        return '#b3bdbb'
      }
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加流程定义'
    },
    /** 流程流转记录 */
    handleFlowRecord(row) {
      this.$router.push({ path: '/workflow/task/finished/detail',
        query: {
          procInsId: row.procInsId,
          deployId: row.deployId,
          taskId: row.taskId
        }})
    },
    /** 撤回任务 */
    handleRevoke(row) {
      const params = {
        instanceId: row.procInsId
      }
      revokeProcess(params).then(() => {
        this.$message.success('撤回成功！')
        this.getList()
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getDeployment(id).then(res => {
        this.form = res
        this.open = true
        this.title = '修改流程定义'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDeployment(this.form).then(() => {
              this.$message.success('修改成功！')
              this.open = false
              this.crud.refresh()
            })
          } else {
            addDeployment(this.form).then(() => {
              this.$message.success('新增成功！')
              this.open = false
              this.crud.refresh()
            })
          }
        }
      })
    }
  }
}
</script>

