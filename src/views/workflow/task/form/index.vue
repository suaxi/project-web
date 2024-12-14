<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-model="crud.params.formName"
        clearable
        size="small"
        placeholder="请输入表单名称"
        style="width: 200px;"
        class="filter-item"
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
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['flowable:form:remove']"
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="表单主键" align="center" prop="formId" />
      <el-table-column label="表单名称" align="center" prop="formName" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination />

    <!-- 添加或修改流程表单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="表单名称" prop="formName">
          <el-input v-model="form.formName" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="表单内容">
          <editor v-model="form.formContent" :min-height="192" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--表单详情-->
    <el-dialog :title="formTitle" :visible.sync="formRenderOpen" width="60%" append-to-body>
      <v-form-render ref="vFormRef" :form-data="formData" />
    </el-dialog>

    <!--表单设计器-->
    <el-dialog
      custom-class="dialogClass"
      :visible.sync="dialogVisible"
      :close-on-press-escape="false"
      :fullscreen="true"
      :before-close="handleClose"
      append-to-body
    >
      <v-form-designer ref="vfDesigner" :designer-config="designerConfig">
        <!-- 自定义按钮插槽演示 -->
        <template #customSaveButton>
          <el-button type="text" @click="saveFormJson"><i class="el-icon-s-promotion" />保存</el-button>
        </template>
      </v-form-designer>
    </el-dialog>

    <!--系统表单信息-->
    <el-dialog :title="formTitle" :visible.sync="formOpen" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="表单名称" prop="formName">
          <el-input v-model="form.formName" placeholder="请输入表单名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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
import { delForm, addForm, updateForm } from '@/api/workflow/form'
import Editor from '@/components/workflow/Editor'
import Pagination from '@/components/Crud/Pagination.vue'
import RrOperation from '@/components/Crud/RR.operation.vue'

export default {
  name: 'WorkFlowForm',
  components: {
    Pagination,
    RrOperation,
    Editor
  },
  cruds() {
    return CRUD({ title: '表单配置', url: '/workflow/form/queryPage' })
  },
  mixins: [presenter()],
  data() {
    return {
      // 遮罩层
      loading: true,
      dialogVisible: false,
      designerConfig: {
        exportCodeButton: false // 是否显示导出代码按钮
      },
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
      formRenderOpen: false,
      formTitle: '',
      formOpen: false,
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        formName: null,
        formContent: null
      },
      // 表单参数
      form: {
        formId: null,
        formName: null,
        formContent: null,
        remark: null
      },
      // 表单校验
      rules: {},
      formData: {}
    }
  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        formId: null,
        formName: null,
        formContent: null,
        createTime: null,
        updateTime: null,
        createBy: null,
        updateBy: null,
        remark: null
      }
      this.resetForm('form')
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.formId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 表单配置信息 */
    handleDetail(row) {
      this.formRenderOpen = true
      this.formTitle = '表单详情'
      this.$nextTick(() => {
        // if (this.$refs.vFormRef.$data.formJsonObj) {
        //   this.$refs.vFormRef.clearFormDataModel()
        // }
        // 回显数据
        this.$refs.vFormRef.setFormJson(JSON.parse(row.formContent))
        this.$nextTick(() => {
          // 表单禁用
          this.$refs.vFormRef.disableForm()
        })
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
      // this.dialogVisible = true;
      this.$router.push({ path: '/workflow/task/flowForm' })
    },
    // 保存表单数据
    saveFormJson() {
      const formJson = this.$refs.vfDesigner.getFormJson()
      this.form.formContent = JSON.stringify(formJson)
      this.formOpen = true
    },
    // 取消按钮
    cancel() {
      this.formOpen = false
      this.reset()
    },
    handleClose(done) {
      this.$confirm('确定要关闭吗？关闭未保存的修改都会丢失？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      // this.form = row;
      // this.dialogVisible = true;
      // this.$nextTick(() => {
      //   // 加载表单json数据
      //   this.$refs.vfDesigner.setFormJson(JSON.parse(row.formContent))
      // })
      this.$router.push({ path: '/workflow/task/flowForm', query: { formId: row.formId }})
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.formId != null) {
            updateForm(this.form).then(response => {
              this.$message.success('修改成功')
              this.formOpen = false
            })
          } else {
            addForm(this.form).then(response => {
              this.$message.success('新增成功')
              this.formOpen = false
            })
          }
          this.dialogVisible = false
        }
      })
    },
    /** 提交按钮 */
    submitFormData() {
      this.$refs.vFormRef.getFormData().then(formData => {
        // Form Validation OK
        console.log(JSON.stringify(formData))
      }).catch(error => {
        // Form Validation failed
        this.$message.error(error)
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const formIds = row.formId.toString().split('') || this.ids
      this.$confirm('是否确认删除表单编号为"' + formIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delForm(formIds)
      }).then(() => {
        this.$message.success('删除成功！')
        this.crud.refresh()
      })
    }
  }
}
</script>

<style scoped>
.test-form {
  margin: 15px auto;
  width: 800px;
  padding: 15px;
}

/deep/ .dialogClass .el-dialog__header {
  padding: 0;
}

/deep/ .dialogClass .el-dialog__body {
  padding: 0;
}
</style>
