<template>
  <div>
    <div v-show="dictName === undefined">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-show="dictName">
      <div slot="header" class="clearfix">
        <span>{{ dictName }} 字典详情</span>
        <el-button
          v-show="dictId && dictName"
          v-permission="['dict:edit']"
          class="filter-item"
          size="mini"
          style="float: right;padding: 4px 10px"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >新增</el-button>
      </div>
      <!-- 数据字典详细信息 -->
      <el-table
        ref="table"
        v-loading="loading"
        row-key="id"
        :data="tableData"
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="所属字典">
          {{ dictName }}
        </el-table-column>
        <el-table-column prop="label" label="字典标签" />
        <el-table-column prop="value" label="字典值" />
        <el-table-column prop="sort" label="排序" />
        <el-table-column label="操作" width="130px" align="center" fixed="right">
          <template #default="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(scope.row)" />&nbsp;
            <el-popover :ref="`popover-${scope.row.id}`" v-model="scope.row.visible" placement="top" width="160" trigger="manual">
              <p>确定删除本条数据吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="scope.row.visible = false">取消</el-button>
                <el-button type="primary" size="mini" @click="handleDelete(scope.row)">确定</el-button>
              </div>
              <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini" @click="scope.row.visible = true" />
            </el-popover>
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

      <!-- 数据字典详细信息编辑框 -->
      <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="dialogTitle" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="字典标签" prop="label">
            <el-input v-model="form.label" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="字典值" prop="value">
            <el-input v-model="form.value" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model.number="form.sort" :min="0" :max="999" controls-position="right" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submit(form)">确认</el-button>
        </div>
      </el-dialog>
    </div>
  </div></template>

<script>
import ElementUI from 'element-ui'
import Pagination from '@/components/Crud/Pagination'
import { getDictDetail, page, add, update, del } from '@/api/system/dictDetail'

export default {
  name: 'DictDetail',
  components: {
    Pagination
  },
  data() {
    return {
      dictId: undefined,
      dictName: undefined,
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      tableData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      form: {},
      rules: {
        label: [
          { required: true, message: '请输入字典标签', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入字典值', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      buttonLoading: false,
      visible: false
    }
  },
  beforeDestroy() {
    this.dictId = undefined
    this.dictName = undefined
  },
  methods: {
    queryPage() {
      this.queryParams = {
        ...this.queryParams,
        dictId: this.dictId
      }

      this.loading = true
      page(this.queryParams).then(res => {
        this.tableData = res.records.map(item => ({
          ...item,
          visible: false
        }))
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        dictId: undefined
      }
      this.form = {
        id: undefined,
        dictId: undefined,
        label: undefined,
        value: undefined,
        sort: 0
      }
    },
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '新增数据字典详情'
    },
    handleUpdate(row) {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '修改数据字典详情'
      getDictDetail(row.id).then(res => {
        this.form = { ...res }
      })
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form = {
            ...this.form,
            dictId: this.dictId
          }
          this.buttonLoading = true
          if (this.form.id) {
            update(this.form).then(() => {
              ElementUI.Message.success('修改成功')
              this.dialogFormVisible = false
              this.buttonLoading = false
              this.queryPage()
            }).catch(() => {
              this.buttonLoading = false
            })
          } else {
            add(this.form).then(() => {
              ElementUI.Message.success('保存成功')
              this.dialogFormVisible = false
              this.buttonLoading = false
              this.queryPage()
            }).catch(() => {
              this.buttonLoading = false
            })
          }
        } else {
          return false
        }
      })
    },
    handleDelete(row) {
      if (!row.id) {
        ElementUI.Message.warning('请选择要删除的数据字典详情信息！')
        return
      }
      del([row.id]).then(() => {
        row.visible = false
        this.$message.success('删除成功！')
        this.queryPage()
      }).catch(() => {
        row.visible = false
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>
