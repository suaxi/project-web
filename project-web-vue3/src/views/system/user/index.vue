<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <el-form :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="用户名称" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名称"
            clearable
            style="width: 200px"
            @keyup.enter="queryPage"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select
            v-model="queryParams.enabled"
            placeholder="用户状态"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="(item, index) in userStatus"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="queryPage">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="selectData.length !== 1"
          @click="handleUpdate"
          >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download">导出</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column fixed prop="username" label="用户名" width="150" />
      <el-table-column prop="nickName" label="昵称" width="120" />
      <el-table-column prop="sex" label="性别" width="120" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="deptName" label="部门" />
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
    <Pagination
      v-model:page-num="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      @pagination="queryPage"
    />

    <!-- 用户信息编辑弹框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      append-to-body
      destroy-on-close
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" size="small" label-width="66px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="form.nickName" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.phone" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门" prop="deptName">
              <el-tree-select
                ref="deptTreeSelectRef"
                v-model="form.deptName"
                lazy
                :load="loadDeptTree"
                :props="deptTreeProps"
                expand-on-click-node
                highlight-current
                placeholder="请选择部门"
                value-key="id"
                @node-click="handleDeptSelected"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="jobIds">
              <el-select v-model="form.jobIds" multiple placeholder="请选择岗位">
                <el-option
                  v-for="item in jobList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio-group v-model="form.sex">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.enabled">
                <el-radio v-for="item in userStatus" :key="item.value" :label="item.value">
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" />
        </el-row>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { getUser, page, add, update, del } from '@/api/system/user'
import { childList as getDeptList } from '@/api/system/dept'
import { list as getRoleList } from '@/api/system/role'
import { list as getJobList } from '@/api/system/job'
import { onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const permission = {
  add: ['user:add'],
  edit: ['user:edit'],
  del: ['user:del']
}
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: undefined,
  enabled: undefined
})
const total = ref(0)
const userStatus = [
  { label: '激活', value: true },
  { label: '禁用', value: false }
]
const tableData = ref([])
const selectData = ref([])
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const deptList = ref([])
const deptTreeProps = { children: 'children', label: 'label', isLeaf: 'leaf' }
const jobList = ref([])
const roleList = ref([])
const formRef = ref(null)
let form = reactive({
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
})
const deptTreeSelectRef = ref(null)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  deptName: [{ required: true, message: '请选择部门', trigger: 'blur' }],
  jobIds: [{ required: true, message: '请选择岗位', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'blur' }]
}

const queryPage = () => {
  loading.value = true
  page(queryParams)
    .then((res) => {
      tableData.value = res.records
      total.value = res.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

const resetQuery = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.username = undefined
  queryParams.enabled = undefined
  queryPage()
}

const resetForm = () => {
  queryParams.num = 1
  queryParams.size = 10
  queryParams.username = undefined
  queryParams.enabled = undefined

  total.value = 0

  form.id = undefined
  form.deptId = undefined
  form.username = undefined
  form.nickName = undefined
  form.sex = '男'
  form.phone = undefined
  form.email = undefined
  form.enabled = true
  form.deptName = undefined
  form.jobIds = []
  form.roleIds = []
}

// 选中某一行时
const handleSelectionChange = (rows) => {
  selectData.value = rows
}

const handleAdd = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '新增用户'

  getRoleList({}).then((res) => {
    roleList.value = res
  })
  getJobList().then((res) => {
    jobList.value = res
  })
}

const handleUpdate = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '修改用户'
  getUser(selectData.value[0].id).then((res) => {
    form.id = res.id
    form.deptId = res.deptId
    form.username = res.username
    form.nickName = res.nickName
    form.sex = res.sex
    form.phone = res.phone
    form.email = res.email
    form.enabled = res.enabled
    form.deptName = res.deptName
    form.jobIds = res.jobIds.split(',').map((item) => Number(item))
    form.roleIds = res.roleIds.split(',').map((item) => Number(item))
    form.password = undefined
  })
  getRoleList({}).then((res) => {
    roleList.value = res
  })
  getJobList().then((res) => {
    jobList.value = res
  })
}

const loadDeptTree = (node, resolve) => {
  const pid = node.level === 0 ? 0 : node.data.id
  getDeptList(pid).then((res) => {
    deptList.value = res.records
    resolve(deptList.value)
  })
}

const handleDeptSelected = (val) => {
  form.deptId = val.id
  form.deptName = val.name
  deptTreeSelectRef.value.blur()
}

const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      form = {
        ...form,
        jobIds: form.jobIds.join(','),
        roleIds: form.roleIds.join(',')
      }

      if (form.id) {
        update(form).then(() => {
          ElMessage.success('修改成功')
          dialogFormVisible.value = false
          queryPage()
        })
      } else {
        add(form).then(() => {
          ElMessage.success('保存成功')
          dialogFormVisible.value = false
          queryPage()
        })
      }
    } else {
      return false
    }
  })
}

const handleDelete = () => {
  if (selectData.value.length === 0) {
    ElMessage.warning('请选择要删除的用户！')
    return
  }
  const ids = selectData.value.map((item) => item.id)
  ElMessageBox.confirm('是否确认删除？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return del(ids)
    })
    .then(() => {
      ElMessage.success('删除成功！')
      queryPage()
    })
}

onMounted(() => {
  queryPage()
})
</script>

<style lang="scss" scoped></style>
