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
          v-for="(item, index) in expressionType"
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
          <el-tag v-if="scope.row.status === 0" type="warning">禁用</el-tag>
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
    <Pagination />

    <!-- 添加或修改流程达式对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import { add, update, del, findById } from '@/api/workflow/expression'
import RrOperation from '@/components/Crud/RR.operation.vue'
import Pagination from '@/components/Crud/Pagination.vue'

export default {
  name: 'WorkFlowExpression',
  components: {
    RrOperation,
    Pagination
  },
  cruds() {
    return CRUD({ title: '流程表达式', url: '/workflow/expression/queryPage' })
  },
  mixins: [presenter()],
  data() {
    return {
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
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
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
      this.form = {
        type: 1,
        status: 1
      }
      this.open = true
      this.title = '添加流程达式'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = {}
      const id = row.id || this.ids
      findById(id).then(res => {
        this.form = res
        this.open = true
        this.title = '修改流程达式'
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
      this.$confirm('是否确认删除编号为"' + ids + '"的流程达式？', '警告', {
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
