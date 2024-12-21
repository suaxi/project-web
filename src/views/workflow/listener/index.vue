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
      <el-select v-model="crud.params.type" size="small" placeholder="请选择类型" clearable>
        <el-option
          v-for="(item, index) in taskListenerType"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="crud.loading"
      :data="crud.tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="监听类型" align="center" prop="type" />
      <el-table-column label="事件类型" align="center" prop="eventType" />
      <el-table-column label="值类型" align="center" prop="valueType">
        <template #default="scope">
          <div v-if="scope.row.valueType === 'classListener'">Java类</div>
          <div v-if="scope.row.valueType === 'expressionListener'">表达式</div>
          <div v-if="scope.row.valueType === 'delegateExpressionListener'">代理表达式</div>
        </template>
      </el-table-column>
      <el-table-column label="执行内容" align="center" prop="executeContent" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination />

    <!-- 添加或修改流程监听对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="监听类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择监听类型">
            <el-option
              v-for="(item, index) in taskListenerType"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 1" label="事件类型" prop="eventType">
          <el-select v-model="form.eventType" placeholder="请选择事件类型">
            <el-option
              v-for="(item, index) in taskListenerEventList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="事件类型" prop="eventType">
          <el-select v-model="form.eventType" placeholder="请选择事件类型">
            <el-option
              v-for="(item, index) in executionListenerEventList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="值类型" prop="valueType">
          <el-radio-group v-model="form.valueType">
            <el-radio
              v-for="(item, index) in listenerValueType"
              :key="index"
              :label="item.label"
              :value="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行内容" prop="executeContent">
          <el-input v-model="form.executeContent" placeholder="请输入执行内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import { add, update, del, findById } from '@/api/workflow/listener'
import RrOperation from '@/components/Crud/RR.operation.vue'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowListener',
  components: {
    RrOperation,
    Pagination
  },
  cruds() {
    return CRUD({ title: '流程监听器', url: '/workflow/listener/queryPage' })
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
      // 弹出层标题
      title: '',
      // 显示搜索条件
      showSearch: true,
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      taskListenerType: [
        { label: '任务监听', value: 1 },
        { label: '执行监听', value: 2 }
      ],
      taskListenerEventList: [
        { label: 'create', value: 'create' },
        { label: 'assignment', value: 'assignment' },
        { label: 'complete', value: 'complete' },
        { label: 'delete', value: 'delete' }
      ],
      executionListenerEventList: [
        { label: 'start', value: 'start' },
        { label: 'end', value: 'end' },
        { label: 'take', value: 'take' }
      ],
      listenerValueType: [
        { label: 'Java类', value: 'classListener' },
        { label: '表达式', value: 'expressionListener' },
        { label: '代理表达式', value: 'delegateExpressionListener' }
      ]
    }
  },
  methods: {
    // 取消按钮
    cancel() {
      this.open = false
      this.form = {}
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.form = {}
      this.open = true
      this.title = '添加流程监听'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = {}
      findById(row.id).then(res => {
        this.form = res
        this.open = true
        this.title = '修改流程监听'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            update(this.form).then(() => {
              this.$message.success('修改成功！')
              this.open = false
              this.crud.refresh()
            })
          } else {
            add(this.form).then(() => {
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
      const ids = this.ids.length > 0 ? this.ids : [row.id]
      this.$confirm('是否确认删除编号为"' + ids + '"的流程监听？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(ids).then(() => {
          this.$message.success('删除成功！')
          this.crud.refresh()
        })
      })
    }
  }
}
</script>
