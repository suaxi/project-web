<template>
  <div class="app-container">
    <!-- 字典列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <!-- 搜索 -->
            <el-input v-model="crud.params.name" clearable size="small" placeholder="请输入名称" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
            <span>
              <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="crud.toQuery">搜索</el-button>
              <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="reset">重置</el-button>
            </span>
            <!-- 增删改查按钮 -->
            <crudOperation :permission="permission" />
          </div>
          <!-- 表格渲染 -->
          <el-table ref="table" v-loading="crud.loading" :data="crud.tableData" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
            <el-table-column type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="name" label="名称" />
            <el-table-column :show-overflow-tooltip="true" prop="description" label="描述" />
          </el-table>

          <!-- 分页 -->
          <Pagination />
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典详情</span>
            <el-button
              v-if="$refs.dictDetail && $refs.dictDetail.crud.tableData.length > 0"
              v-permission="['dict:edit']"
              class="filter-item"
              size="mini"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="$refs.dictDetail && $refs.dictDetail.crud.setOperation('post')"
            >新增</el-button>
          </div>
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
        <el-button :loading="buttonLoading" type="primary" @click="updateDict(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import CrudOperation from '@/components/Crud/CRUD.operation'
import Pagination from '@/components/Crud/Pagination'
import { del } from '@/api/dict'
import dictDetail from '@/views/system/dict/dictDetail'

export default {
  name: 'ProjectDict',
  components: {
    CrudOperation,
    Pagination,
    dictDetail
  },
  cruds() {
    return CRUD({ title: '字典', url: '/dict/queryPage' })
  },
  mixins: [presenter()],
  data() {
    return {
      dialogTitle: '',
      dialogFormVisible: false,
      permission: {
        add: ['dict:add'],
        edit: ['dict:edit'],
        del: ['dict:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      form: {},
      buttonLoading: false
    }
  },
  created() {
    this.$store.dispatch('GetUserInfo').then(() => {
      this.crud.optShow = {
        add: true,
        edit: true,
        delete: true,
        download: true
      }
    })
  },
  methods: {
    [CRUD.HOOK.setOperation](crud, operation) {
      // 清空缓存
      this.form = {
        id: null,
        name: null,
        description: null
      }

      if (operation === 'post') {
        this.dialogTitle = '新增数据字典'
        this.$store.commit('SET_OPERATION', operation)
      } else if (operation === 'put') {
        this.dialogTitle = '编辑数据字典'
        this.$store.commit('SET_OPERATION', operation)
        this.form = { ...this.crud.selectData[0] }
      } else if (operation === 'delete') {
        const ids = this.crud.selectData.map(item => item.id)
        del(ids).then(() => {
          this.$message.success('删除成功')
          this.crud.delChangePage()
          this.crud.refresh()
        })
      }
      if (operation !== 'delete') {
        this.dialogFormVisible = true
      }
    },
    updateDict(data) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true
          const operation = this.$store.state.operation
          this.$request({
            url: '/dict',
            method: operation,
            data
          }).then(() => {
            this.buttonLoading = false
            this.$message.success('操作成功')
            this.dialogFormVisible = false
            this.crud.refresh()
          }).catch(() => {
            this.buttonLoading = false
          })
        } else {
          return false
        }
      })
    },
    // 选中数据字典项时设置字典详情数据
    handleCurrentChange(val) {
      if (val) {
        this.$refs.dictDetail.crud.params.dictId = val.id
        this.$refs.dictDetail.dictName = val.name
        this.$refs.dictDetail.crud.toQuery()
      }
    },
    reset() {
      this.crud.resetQueryParams()
      // 清除数据字典详细信息缓存
      this.$refs.dictDetail.dictName = ''
      this.$refs.dictDetail.crud.tableData.splice(0)
    }
  }
}
</script>

<style scoped>

</style>
