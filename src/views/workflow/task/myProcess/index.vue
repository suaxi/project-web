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

    <div class="crud-opts">
      <span class="crud-opts-left">
        <el-button
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >发起流程</el-button>
        <el-button
          class="filter-item"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </span>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="流程编号" align="center" prop="procInsId" :show-overflow-tooltip="true" />
      <el-table-column label="流程名称" align="center" prop="procDefName" :show-overflow-tooltip="true" />
      <el-table-column label="流程类别" align="center" prop="category" width="100px" />
      <el-table-column label="流程版本" align="center" width="80px">
        <template #default="scope">
          <el-tag size="medium">v{{ scope.row.procDefVersion }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="createTime" width="180" />
      <el-table-column label="流程状态" align="center" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.completeTime == null" size="mini">进行中</el-tag>
          <el-tag v-if="scope.row.completeTime != null" type="success" size="mini">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="耗时" align="center" prop="duration" width="180" />
      <el-table-column label="当前节点" align="center" prop="taskName" />
      <el-table-column label="办理人" align="center">
        <template #default="scope">
          <label v-if="scope.row.assigneeName">{{ scope.row.assigneeName }}
            <el-tag type="info" size="mini">{{ scope.row.assigneeDeptName }}</el-tag>
          </label>
          <!--          <label v-if="scope.row.candidate">{{scope.row.candidate}}</label>-->
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" size="small" @click="handleFlowRecord(scope.row)">详情</el-button>
          <el-button v-if="scope.row.completeTime == null" type="text" size="small" @click="handleStop(scope.row)">取消申请</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleDelete(scope.row)"
          >删除
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

    <!-- 发起流程 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="60%" destroy-on-close append-to-body>
      <el-form ref="queryProcessForm" :model="processQueryParams" :inline="true" label-width="68px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="processQueryParams.name"
            class="filter-item"
            placeholder="请输入名称"
            clearable
            size="small"
            @keyup.enter.native="queryDefinitionPage"
          />
        </el-form-item>
        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" size="mini" @click="queryDefinitionPage">搜索</el-button>
          <el-button class="filter-item" icon="el-icon-refresh" size="mini" @click="resetQueryDefinitionPage">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="processLoading" fit :data="definitionTableData" border>
        <el-table-column label="流程名称" align="center" prop="name" />
        <el-table-column label="流程版本" align="center">
          <template #default="scope">
            <el-tag size="medium">v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="流程分类" align="center" prop="category" />
        <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit-outline"
              @click="handleStartProcess(scope.row)"
            >发起流程
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        :page-num.sync="processQueryParams.pageNum"
        :page-size.sync="processQueryParams.pageSize"
        :total="processTotal"
        @page="queryDefinitionPage"
      />
    </el-dialog>

  </div>
</template>

<script>
import {
  getDeployment,
  delDeployment,
  addDeployment,
  updateDeployment,
  exportDeployment
} from '@/api/workflow/finished'
import { queryMyProcessPage, stopProcess } from '@/api/workflow/process'
import { page as definitionPage } from '@/api/workflow/definition'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowMyProcessDeploy',
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
      multiple: true,
      dialogFormVisible: false,
      dialogTitle: '',
      processTotal: 0,
      src: '',
      definitionTableData: [],
      processLoading: true,
      processQueryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },
  created() {
    this.queryPage()
  },
  methods: {
    queryPage() {
      this.loading = true
      queryMyProcessPage(this.queryParams).then(res => {
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
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        deployTime: null
      }
      this.form = {}
    },
    handleSelectionChange(rows) {
      this.selectData = rows
      this.ids = rows.map(item => item.procInsId)
      this.single = rows.length !== 1
      this.multiple = !rows.length
    },
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '发起流程'
      this.queryDefinitionPage()
    },
    queryDefinitionPage() {
      this.processLoading = true
      definitionPage(this.processQueryParams).then(res => {
        this.definitionTableData = res.records
        this.processTotal = res.total
        this.processLoading = false
      }).catch(() => {
        this.processLoading = false
      })
    },
    resetQueryDefinitionPage() {
      this.processQueryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      }
      this.queryDefinitionPage(this.processQueryParams)
    },
    handleStartProcess(row) {
      this.$router.push({
        path: '/workflow/task/myProcess/start',
        query: {
          deployId: row.deploymentId,
          procDefId: row.id
        }
      })
    },
    handleStop(row) {
      const params = {
        instanceId: row.procInsId
      }

      this.loading = true
      stopProcess(params).then(() => {
        this.$message.success('取消成功')
        this.loading = false
        this.queryPage()
      }).catch(() => {
        this.loading = false
      })
    },
    handleFlowRecord(row) {
      this.$router.push({
        path: '/workflow/task/myProcess/detail',
        query: {
          procInsId: row.procInsId,
          deployId: row.deployId,
          taskId: row.taskId
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.resetForm()
      const id = row.id || this.ids
      getDeployment(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改流程定义'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDeployment(this.form).then(response => {
              this.$message.success('修改成功！')
              this.open = false
              this.crud.refresh()
            })
          } else {
            addDeployment(this.form).then(response => {
              this.$message.success('新增成功！')
              this.open = false
              this.crud.refresh()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.procInsId ? row.procInsId : this.ids // 暂不支持删除多个流程
      if (ids.length === 0) {
        this.$message.warning('请选择要删除的数据！')
        return
      }

      this.$confirm('是否确认删除流程定义编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        delDeployment(ids).then(() => {
          this.$message.success('删除成功')
          this.loading = false
          this.queryPage()
        }).catch(() => {
          this.loading = false
        })
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有流程定义数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return exportDeployment(queryParams)
      }).then(response => {
        this.download(response.msg)
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
