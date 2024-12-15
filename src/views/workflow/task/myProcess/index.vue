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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增流程
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="crud.loading"
      :data="crud.tableData"
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
    <Pagination />

    <!-- 发起流程 -->
    <el-dialog :title="title" :visible.sync="open" width="60%" append-to-body>
      <el-form v-show="showSearch" ref="queryProcessForm" :model="queryProcessParams" :inline="true" label-width="68px">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="queryProcessParams.name"
            placeholder="请输入名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleProcessQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetProcessQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="processLoading" fit :data="definitionList" border>
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
      <pagination
        :total="processTotal"
        :page.sync="queryProcessParams.pageNum"
        :limit.sync="queryProcessParams.pageSize"
        @pagination="listDefinition"
      />
    </el-dialog>

  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import {
  getDeployment,
  delDeployment,
  addDeployment,
  updateDeployment,
  exportDeployment
} from '@/api/workflow/finished'
import { stopProcess } from '@/api/workflow/process'
import { listDefinition } from '@/api/workflow/definition'
import RrOperation from '@/components/Crud/RR.operation.vue'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowMyProcessDeploy',
  components: { Pagination, RrOperation },
  cruds() {
    return CRUD({ title: '我发起的任务', url: '/workflow/task/myProcess' })
  },
  mixins: [presenter()],
  data() {
    return {
      // 遮罩层
      processLoading: true,
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
      processTotal: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      src: '',
      definitionList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null
      },
      // 查询参数
      queryProcessParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },
  methods: {
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        category: null,
        key: null,
        tenantId: null,
        deployTime: null,
        derivedFrom: null,
        derivedFromRoot: null,
        parentDeploymentId: null,
        engineVersion: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleProcessQuery() {
      this.listDefinition()
    },
    /** 重置按钮操作 */
    resetProcessQuery() {
      this.queryProcessParams = {
        pageNum: 1,
        pageSize: 10
      }
      this.handleProcessQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.procInsId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true
      this.title = '发起流程'
      this.listDefinition()
    },
    listDefinition() {
      listDefinition(this.queryProcessParams).then(response => {
        this.definitionList = response.records
        this.processTotal = response.total
        this.processLoading = false
      })
    },
    /**  发起流程申请 */
    handleStartProcess(row) {
      this.$router.push({
        path: '/workflow/task/myProcess/start',
        query: {
          deployId: row.deploymentId,
          procDefId: row.id
        }
      })
    },
    /**  取消流程申请 */
    handleStop(row) {
      const params = {
        instanceId: row.procInsId
      }
      stopProcess(params).then(() => {
        this.$message.success('取消成功！')
        this.crud.refresh()
      })
    },
    /** 流程流转记录 */
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
      this.reset()
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
      const ids = row.procInsId.toString().split('') || this.ids// 暂不支持删除多个流程
      this.$confirm('是否确认删除流程定义编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return delDeployment(ids)
      }).then(() => {
        this.crud.refresh()
        this.$message.success('删除成功！')
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

