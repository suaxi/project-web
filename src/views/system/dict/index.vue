<template>
  <div class="app-container">
    <!-- 字典列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
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
            <span>
              <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="queryPage">搜索</el-button>
              <el-button class="filter-item" size="mini" icon="el-icon-refresh-left" @click="resetQuery">重置</el-button>
            </span>
          </div>

          <div class="crud-opts">
            <span class="crud-opts-left">
              <el-button
                v-permission="permission.add"
                class="filter-item"
                size="mini"
                type="primary"
                icon="el-icon-plus"
                @click="handleAdd"
              >新增</el-button>
              <el-button
                v-permission="permission.edit"
                class="filter-item"
                size="mini"
                type="success"
                icon="el-icon-edit"
                :disabled="selectData.length !== 1"
                @click="handleUpdate"
              >修改</el-button>
              <el-button
                v-permission="permission.del"
                class="filter-item"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="handleDelete"
              >删除</el-button>
            </span>
          </div>

          <!-- 表格渲染 -->
          <el-table
            ref="table"
            v-loading="loading"
            :data="tableData"
            highlight-current-row
            style="width: 100%;"
            @selection-change="handleSelectionChange"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="name" label="名称" />
            <el-table-column :show-overflow-tooltip="true" prop="description" label="描述" />
          </el-table>
          <!-- 分页 -->
          <Pagination
            :page-num.sync="queryParams.pageNum"
            :page-size.sync="queryParams.pageSize"
            :total="total"
            @page="queryPage"
          />
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <dictDetail ref="dictDetail" :permission="permission" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据字典信息编辑框 -->
    <el-dialog append-to-body :close-on-click-modal="false" :visible="dialogFormVisible" :title="dialogTitle" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submit(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ElementUI from 'element-ui'
import Pagination from '@/components/Crud/Pagination'
import { getDict, page, add, update, del } from '@/api/system/dict'
import dictDetail from '@/views/system/dict/dictDetail'

export default {
  name: 'ProjectDict',
  components: {
    Pagination,
    dictDetail
  },
  data() {
    return {
      loading: false,
      permission: {
        add: ['dict:add'],
        edit: ['dict:edit'],
        del: ['dict:del']
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      total: 0,
      tableData: [],
      selectData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      form: {},
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      buttonLoading: false
    }
  },
  created() {
    this.queryPage()
    this.selectData = []
  },
  methods: {
    queryPage() {
      this.loading = true
      page(this.queryParams).then(res => {
        if (this.$refs.dictDetail) {
          this.resetDictDetail()
        }

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
        name: undefined
      }
      this.queryPage()
    },
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      }
      this.form = {
        id: undefined,
        name: undefined,
        description: undefined
      }
    },
    handleSelectionChange(rows) {
      this.selectData = rows
    },
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '新增字典'
    },
    handleUpdate() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '修改字典'
      getDict(this.selectData[0].id).then(res => {
        this.form = { ...res }
      })
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
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
    handleDelete() {
      if (this.selectData.length === 0) {
        ElementUI.Message.warning('请选择要删除的字典！')
        return
      }
      const ids = this.selectData.map(item => item.id)
      this.$confirm('是否确认删除？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return del(ids)
      }).then(() => {
        this.$message.success('删除成功！')
        this.queryPage()
      })
    },
    // 选中数据字典项时设置字典详情数据
    handleCurrentChange(val) {
      if (val) {
        this.$refs.dictDetail.dictId = val.id
        this.$refs.dictDetail.dictName = val.name
        this.$refs.dictDetail.queryPage()
      }
    },
    resetDictDetail() {
      this.$refs.dictDetail.dictName = undefined
      this.$refs.dictDetail.resetForm()
      this.$refs.dictDetail.tableData = []
    }
  }
}
</script>

<style scoped>

</style>
