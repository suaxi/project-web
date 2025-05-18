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
      <el-select
        v-model="queryParams.type"
        clearable
        size="small"
        class="filter-item"
        style="width: 200px"
        placeholder="请选择类型"
        @change="queryPage"
      >
        <el-option
          v-for="(item, index) in taskListenerType"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
        >新增</el-button>
        <el-button
          class="filter-item"
          size="mini"
          type="success"
          icon="el-icon-edit"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
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
    <Pagination
      :page-num.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :total="total"
      @page="queryPage"
    />

    <!-- 添加或修改流程监听对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="500px" destroy-on-close append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="监听类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择监听类型" @change="form.eventType = undefined">
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
        <el-form-item v-else label="执行类型" prop="eventType">
          <el-select v-model="form.eventType" placeholder="请选择执行类型">
            <el-option
              v-for="(item, index) in executionListenerEventList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="值类型">
          <el-radio-group v-model="form.valueTypeLabel" @input="handleInput">
            <el-radio
              v-for="(item, index) in listenerValueType"
              :key="index"
              :label="item.label"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行内容" prop="executeContent">
          <el-input v-model="form.executeContent" placeholder="请输入执行内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getListener, page, add, update, del } from '@/api/workflow/listener'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowListener',
  components: {
    Pagination
  },
  data() {
    return {
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        type: undefined
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
      ],
      total: 0,
      tableData: [],
      selectData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        eventType: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                if (this.form.type === 1) {
                  callback(new Error('请选择事件类型'))
                } else {
                  callback(new Error('请选择执行类型'))
                }
              }
              callback()
            },
            trigger: 'change'
          }
        ],
        executeContent: [
          { required: true, message: '请输入执行内容', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.queryPage()
  },
  methods: {
    queryPage() {
      this.loading = true
      page(this.queryParams).then(res => {
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
        type: undefined
      }
      this.queryPage()
    },
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        type: undefined
      }
      this.form = {
        id: undefined,
        name: undefined,
        type: 1,
        eventType: undefined,
        valueTypeLabel: 'Java类',
        valueType: undefined,
        executeContent: undefined,
        status: 1,
        remark: undefined
      }
    },
    // 多选框选中数据
    handleSelectionChange(rows) {
      this.selectData = rows
      this.ids = rows.map(item => item.id)
      this.single = rows.length !== 1
      this.multiple = !rows.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '添加流程监听'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.resetForm()
      getListener(row.id ? row.id : this.selectData[0].id).then(res => {
        this.form = {
          ...res
        }
        this.form.valueTypeLabel = this.listenerValueType.filter(item => item.value === res.valueType)[0].label
        this.dialogFormVisible = true
        this.dialogTitle = '修改流程监听'
      })
    },
    handleInput(label) {
      this.form.valueType = this.listenerValueType.filter(item => item.label === label)[0].value
      this.form.valueTypeLabel = label
    },
    /** 提交按钮 */
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id) {
            update(this.form).then(() => {
              this.$message.success('修改成功')
              this.dialogFormVisible = false
              this.queryPage()
            })
          } else {
            add(this.form).then(() => {
              this.$message.success('新增成功')
              this.dialogFormVisible = false
              this.queryPage()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = this.ids.length > 0 ? this.ids : [row.id]
      if (ids.length === 0) {
        this.$message.warning('请选择要删除的数据！')
        return
      }

      this.$confirm('是否确认删除编号为"' + ids + '"的流程监听？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(ids).then(() => {
          this.$message.success('删除成功')
          this.queryPage()
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
