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
        v-model="queryParams.enabled"
        clearable
        size="small"
        placeholder="状态"
        class="filter-item"
        style="width: 90px"
        @change="queryPage"
      >
        <el-option
          v-for="(item, index) in job_status"
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

    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="loading"
      :data="tableData"
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="sort" label="排序">
        <template #default="scope">
          {{ scope.row.sort }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.enabled" type="success" size="small">启用</el-tag>
          <el-tag v-else type="danger" size="small">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期" />
    </el-table>
    <!-- 分页 -->
    <Pagination
      :page-num.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :total="total"
      @page="queryPage"
    />

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
        <el-button :loading="buttonLoading" type="primary" @click="submit(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ElementUI from 'element-ui'
import Pagination from '@/components/Crud/Pagination'
import { getJob, page, add, update, del } from '@/api/system/job'

export default {
  name: 'ProjectJob',
  components: {
    Pagination
  },
  data() {
    return {
      loading: false,
      permission: {
        add: ['job:add'],
        edit: ['job:edit'],
        del: ['job:del']
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        enabled: undefined
      },
      total: 0,
      job_status: [{ label: '启用', value: true }, { label: '禁用', value: false }],
      tableData: [],
      selectData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      form: {},
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      buttonLoading: false
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
        enabled: undefined
      }
      this.queryPage()
    },
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        enabled: undefined
      }
      this.form = {
        id: undefined,
        name: undefined,
        sort: 999,
        enabled: true
      }
    },
    handleSelectionChange(rows) {
      this.selectData = rows
    },
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '新增岗位'
    },
    handleUpdate() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '修改岗位'
      getJob(this.selectData[0].id).then(res => {
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
        ElementUI.Message.warning('请选择要删除的岗位！')
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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>
