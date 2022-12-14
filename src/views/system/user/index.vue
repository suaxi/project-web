<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-model="crud.params.username"
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
          v-for="(item, index) in user_status"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <RrOperation />
    </div>
    <!-- 增删改查按钮 -->
    <CrudOperation :permission="permission" />
    <el-table
      v-loading="crud.loading"
      :data="crud.tableData"
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
          <el-switch ref="enabled" v-model="scope.row.enabled" />
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
    <el-dialog append-to-body :title="dialogTitle" :visible.sync="dialogFormVisible" width="680px">
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
        <el-form-item label="部门" prop="dept">
          <el-select ref="deptSelect" v-model="dept" placeholder="请选择部门">
            <el-option v-model="dept" style="height: max-content;width: 100%;padding: 0">
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
          <el-select v-model="jobs" multiple placeholder="请选择岗位" @change="setJob">
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
            <el-radio v-for="item in user_status" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="roles" multiple placeholder="请选择角色" @change="setRole">
            <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser(form)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ElementUI from 'element-ui'
import CRUD, { presenter } from '@/components/Crud/crud'
import CrudOperation from '@/components/Crud/CRUD.operation'
import Pagination from '@/components/Crud/Pagination'
import RrOperation from '@/components/Crud/RR.operation'

export default {
  name: 'ProjectUser',
  components: {
    RrOperation,
    Pagination,
    CrudOperation
  },
  cruds() {
    return CRUD({ title: '用户', url: '/user/queryPage' })
  },
  mixins: [presenter()],
  data() {
    return {
      dialogFormVisible: false,
      dialogTitle: '',
      permission: {
        add: ['user:add'],
        edit: ['user:edit'],
        del: ['user:del']
      },
      user_status: [{ label: '激活', value: true }, { label: '禁用', value: false }],
      props: { children: 'children', label: 'label', isLeaf: 'leaf' },
      deptList: [],
      dept: {},
      jobList: [],
      jobs: [],
      roleList: [],
      roles: [],
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
        dept: [
          { required: true, message: '请选择部门', trigger: 'blur' }
        ],
        roles: [
          { required: true, message: '请选择角色', trigger: 'blur' }
        ]
      }
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
    handleCurrentChange(selectRow) {
      if (!selectRow) {
        return
      }
      this.mapForm(selectRow)
      this.$request.put('/user', this.form).then(() => {
        this.crud.refresh()
      })
    },
    // 修改时值映射
    mapForm(selectRow) {
      if (selectRow.deptName && selectRow.jobIds && selectRow.roleIds) {
        this.dept = selectRow.deptName
        this.jobs = selectRow.jobIds.split(',').map(item => Number(item))
        this.roles = selectRow.roleIds.split(',').map(item => Number(item))
        this.form = { ...selectRow }
      }
    },
    // 选中某一行时
    handleSelectionChange(rows) {
      this.crud.selectData = rows
    },
    // 新增、修改、删除
    [CRUD.HOOK.setOperation](crud, operation) {
      // 清空缓存
      this.dept = {}
      this.jobs = []
      this.roles = []
      this.form = {
        sex: '男',
        enabled: false
      }

      if (operation === 'put') {
        this.dialogTitle = '修改用户'
        this.mapForm(this.crud.selectData[0])
      } else {
        this.dialogTitle = '新增用户'
      }
      // 修改不打开编辑弹框
      this.dialogFormVisible = operation !== 'delete'
      this.$store.commit('SET_OPERATION', operation)
      if (operation !== 'delete') {
        this.getRoleAndJobInfo()
      } else {
        this.crud.delChangePage()
        this.updateUser(this.crud.selectData.map(item => item.id))
      }
    },
    getRoleAndJobInfo() {
      // 角色列表
      this.$request.get('/role/queryList').then(res => {
        this.roleList = res
      })
      // 岗位列表
      this.$request.get('/job/queryList').then(res => {
        this.jobList = res
      })
    },
    // 部门列表（懒加载）
    loadDept(node, resolve) {
      const pid = node.level === 0 ? null : node.data.id
      this.$request.get('/dept/queryChildListByPid', { params: { pid }}).then(res => {
        this.deptList = res.records
        resolve(this.deptList)
      })
    },
    setDept(node) {
      this.form.deptId = node.id
      this.dept = node.name
      this.$refs.deptSelect.visible = false
    },
    setJob() {
      this.form.jobIds = this.jobs.join(',')
    },
    setRole() {
      this.form.roleIds = this.roles.join(',')
    },
    updateUser(data) {
      this.$refs.form.validate(valid => {
        if (valid) {
          const operation = this.$store.state.operation
          this.$request({
            url: '/user',
            method: operation,
            data
          }).then(() => {
            ElementUI.Message.success('操作成功')
            this.dialogFormVisible = false
            this.crud.refresh()
          })
        } else {
          return false
        }
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
