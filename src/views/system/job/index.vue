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
      <el-select
        v-model="crud.params.enabled"
        clearable
        size="small"
        placeholder="状态"
        class="filter-item"
        style="width: 90px"
        @change="crud.toQuery"
      >
        <el-option
          v-for="(item, index) in job_status"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <RrOperation />
    </div>
    <!-- 增删改查按钮 -->
    <CrudOperation :permission="permission" />
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.tableData" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="sort" label="排序">
        <template #default="scope">
          {{ scope.row.sort }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.enabled"
            active-color="#409EFF"
            inactive-color="#F56C6C"
            @change="changeEnabled(scope.row, scope.row.enabled)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期" />
    </el-table>

    <!-- 分页 -->
    <Pagination />

    <!-- 岗位信息编辑框 -->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="dialogTitle" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model.number="form.sort"
            :min="0"
            :max="999"
            controls-position="right"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio
            v-for="item in job_status"
            :key="item.name"
            v-model="form.enabled"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="updateJob(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import CrudOperation from '@/components/Crud/CRUD.operation'
import RrOperation from '@/components/Crud/RR.operation'
import Pagination from '@/components/Crud/Pagination'
import { del, edit } from '@/api/system/job'

export default {
  name: 'ProjectJob',
  components: {
    CrudOperation,
    RrOperation,
    Pagination
  },
  cruds() {
    return CRUD({ title: '岗位', url: '/job/queryPage' })
  },
  mixins: [presenter()],
  data() {
    return {
      dialogTitle: '',
      dialogFormVisible: false,
      permission: {
        add: ['job:add'],
        edit: ['job:edit'],
        del: ['job:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      job_status: [{ label: '正常', value: true }, { label: '停用', value: false }],
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
        sort: 999,
        enabled: true
      }

      if (operation === 'post') {
        this.dialogTitle = '新增岗位'
        this.$store.commit('SET_OPERATION', operation)
      } else if (operation === 'put') {
        this.dialogTitle = '编辑岗位'
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
    updateJob(data) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true
          const operation = this.$store.state.operation
          this.$request({
            url: '/job',
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
    changeEnabled(data, val) {
      this.$confirm(`此操作将设置 ${data.name} 的状态为“${val ? '正常' : '停用'}”，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        edit(data).then(() => {
          this.$message.success('修改成功')
        }).catch(() => {
          data.enabled = !data.enabled
        })
      }).catch(() => {
        data.enabled = !data.enabled
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
