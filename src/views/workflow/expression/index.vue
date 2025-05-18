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
          v-for="(item, index) in expressionType"
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
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="类型" align="center" prop="type">
        <template #default="scope">
          <div v-if="scope.row.type === 1">动态选择</div>
          <div v-if="scope.row.type === 2">动态选择</div>
        </template>
      </el-table-column>
      <el-table-column label="表达式内容" align="center" prop="expression" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="danger">禁用</el-tag>
          <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
        </template>
      </el-table-column>
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

    <!-- 添加或修改流程达式对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="500px" destroy-on-close append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入表达式名称" />
        </el-form-item>
        <el-form-item label="内容" prop="expression">
          <el-input v-model="form.expression" placeholder="请输入表达式内容" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio
              v-for="(item, index) in expressionType"
              :key="index"
              :label="item.value"
              :value="item.label"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="(item, index) in expressionStatus"
              :key="index"
              :label="item.value"
              :value="item.label"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
import { getExpression, page, add, update, del } from '@/api/workflow/expression'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowExpression',
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
      expressionType: [
        {
          label: '系统指定',
          value: 1
        },
        {
          label: '动态选择',
          value: 2
        }
      ],
      expressionStatus: [
        {
          label: '禁用',
          value: 0
        },
        {
          label: '启用',
          value: 1
        }
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
        expression: [
          { required: true, message: '请输入表达式内容', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
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
        expression: undefined,
        status: 1
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
      this.dialogTitle = '添加流程达式'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.resetForm()
      getExpression(row.id ? row.id : this.selectData[0].id).then(res => {
        this.form = {
          ...res
        }
        this.dialogFormVisible = true
        this.dialogTitle = '修改流程达式'
      })
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

      this.$confirm('是否确认删除编号为"' + ids + '"的流程达式？', '警告', {
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
