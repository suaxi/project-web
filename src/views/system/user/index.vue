<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.username"
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
          v-for="(item, index) in userStatus"
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
        <el-button
          class="filter-item"
          size="mini"
          type="warning"
          icon="el-icon-download"
        >导出</el-button>
      </span>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      highlight-current-row
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column fixed prop="username" label="用户名" width="150" />
      <el-table-column prop="nickName" label="昵称" width="120" />
      <el-table-column prop="sex" label="性别" width="120" />
      <el-table-column prop="phone" label="电话" width="200" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="deptName" label="部门" width="120" />
      <el-table-column prop="enabled" label="状态" width="120">
        <template #default="scope">
          <el-switch ref="enabled" v-model="scope.row.enabled" @click.stop />
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="createTime"
        label="创建日期"
        width="200"
      />
    </el-table>
    <!-- 分页 -->
    <Pagination />

    <!-- 用户信息编辑弹框 -->
    <el-dialog append-to-body :title="dialogTitle" :visible.sync="dialogFormVisible" destroy-on-close width="680px">
      <el-form ref="form" :model="form" :rules="rules" :inline="true" size="small" label-width="66px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="部门" prop="deptName">
          <el-select ref="deptSelect" v-model="form.deptName" placeholder="请选择部门">
            <el-option v-model="form.deptName" style="height: max-content;width: 100%;padding: 0">
              <el-tree
                :props="props"
                :load="loadDept"
                lazy
                style="width: 100%"
                @node-click="setDept"
              />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="form.jobIds" multiple placeholder="请选择岗位">
            <el-option v-for="item in jobList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex" style="width: 178px">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.enabled">
            <el-radio v-for="item in userStatus" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
            <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ElementUI from 'element-ui'
import Pagination from '@/components/Crud/Pagination'
import { getUser, page, add, update, del } from '@/api/system/user'
import { getDeptList } from '@/api/system/dept'
import { list as getRoleList } from '@/api/system/role'
import { list as getJobList } from '@/api/system/job'

export default {
  name: 'ProjectUser',
  components: {
    Pagination
  },
  data() {
    return {
      loading: false,
      permission: [],
      queryParams: {
        num: 1,
        size: 10,
        username: undefined,
        enabled: undefined
      },
      userStatus: [{ label: '激活', value: true }, { label: '禁用', value: false }],
      tableDate: [],
      selectData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      deptList: [],
      props: { children: 'children', label: 'label', isLeaf: 'leaf' },
      jobList: [],
      roleList: [],
      form: {},
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ],
        deptName: [
          { required: true, message: '请选择部门', trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: '请选择角色', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.$store.dispatch('GetUserInfo').then(res => {
      res?.permissions
        .filter(item => item.startsWith('user'))
        .forEach(item => {
          this.permission[item.split(':')[0]] = item
        })
    })
    this.queryPage()
  },
  methods: {
    queryPage() {
      const params = {
        pageNum: this.queryParams.num,
        pageSize: this.queryParams.size,
        username: this.queryParams.username,
        enabled: this.queryParams.enabled
      }
      this.loading = true
      page(params).then(res => {
        this.tableDate = res.data
        this.tableData = res.records
        this.page.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    resetQuery() {
      this.queryParams = {
        num: 1,
        size: 10,
        username: undefined,
        enabled: undefined
      }
      this.queryPage()
    },
    resetForm() {
      this.form = {
        id: undefined,
        deptId: undefined,
        username: undefined,
        nickName: undefined,
        sex: '男',
        phone: undefined,
        email: undefined,
        enabled: true,
        deptName: undefined,
        jobIds: [],
        roleIds: []
      }
    },
    // 选中某一行时
    handleSelectionChange(rows) {
      this.selectData = rows
    },
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '新增用户'

      getRoleList({}).then(res => {
        this.roleList = res
      })
      getJobList().then(res => {
        this.jobList = res
      })
    },
    handleUpdate() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '修改用户'
      getUser(this.selectData[0].id).then(res => {
        this.form = { ...res }
        this.form.jobIds = res.jobIds.split(',').map(item => Number(item))
        this.form.roleIds = res.roleIds.split(',').map(item => Number(item))
        this.form.password = undefined
      })
      getRoleList({}).then(res => {
        this.roleList = res
      })
      getJobList().then(res => {
        this.jobList = res
      })
    },
    // 部门列表（懒加载）
    loadDept(node, resolve) {
      const pid = node.level === 0 ? null : node.data.id
      getDeptList({ pid }).then(res => {
        this.deptList = res.records
        resolve(this.deptList)
      })
    },
    setDept(node) {
      this.form.deptId = node.id
      this.form.deptName = node.name
      this.$refs.deptSelect.visible = false
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.jobIds = this.form.jobIds.join(',')
          this.form.roleIds = this.form.roleIds.join(',')

          if (this.form.id) {
            update(this.form).then(() => {
              ElementUI.Message.success('修改成功')
              this.dialogFormVisible = false
              this.queryPage()
            })
          } else {
            add(this.form).then(() => {
              ElementUI.Message.success('保存成功')
              this.dialogFormVisible = false
              this.queryPage()
            })
          }
        } else {
          return false
        }
      })
    },
    handleDelete() {
      if (this.selectData.length === 0) {
        ElementUI.Message.warning('请选择要删除的用户！')
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
::v-deep .vue-treeselect__control, ::v-deep .vue-treeselect__placeholder, ::v-deep .vue-treeselect__single-value {
  height: 30px;
  line-height: 30px;
}
</style>
