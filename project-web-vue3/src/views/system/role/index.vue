<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <el-form :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
            @keyup.enter="queryPage"
          />
        </el-form-item>
        <el-form-item label="权限范围" prop="dataScope">
          <el-select
            v-model="queryParams.dataScope"
            placeholder="权限范围"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="(item, index) in dataScopeList"
              :key="index"
              :label="item"
              :value="item"
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

    <el-row :gutter="15">
      <!-- 角色管理 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <template v-slot:header>
            <div class="clearfix">
              <span class="role-span">角色列表</span>
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="tableData"
            style="width: 100%"
            highlight-current-row
            @selection-change="handleSelectionChange"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column fixed prop="name" label="名称" width="150" />
            <el-table-column prop="dataScope" label="数据权限" width="120" />
            <el-table-column prop="level" label="角色级别" width="120" />
            <el-table-column :show-overflow-tooltip="true" prop="description" label="描述" />
            <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建时间" />
          </el-table>
          <!-- 分页 -->
          <Pagination
            v-model:page-num="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :total="total"
            @pagination="queryPage"
          />
        </el-card>
      </el-col>

      <!-- 菜单授权 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <template v-slot:header>
            <div class="clearfix">
              <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
                <span class="role-span">菜单分配</span>
              </el-tooltip>
              <el-button
                :disabled="!showButton"
                :loading="menuLoading"
                icon="Check"
                style="float: right; padding: 6px 9px"
                type="primary"
                @click="saveRoleMenu"
                >保存
              </el-button>
            </div>
          </template>
          <el-tree
            ref="menuTreeRef"
            lazy
            :load="loadMenuTree"
            :default-checked-keys="menuIds"
            :props="treeProps"
            show-checkbox
            check-strictly
            accordion
            node-key="id"
            @check="handleMenuCheck"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 角色信息编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      append-to-body
      destroy-on-close
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" size="small" label-width="70px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色级别" prop="level">
              <el-input-number
                v-model.number="form.level"
                :min="1"
                controls-position="right"
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据范围" prop="dataScope">
              <el-select v-model="form.dataScope" placeholder="请选择数据范围">
                <el-option v-for="item in dataScopeList" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.dataScope === '自定义'" label="数据权限">
              <el-tree-select
                ref="deptTreeSelectRef"
                v-model="deptDataList"
                :data="deptTreeData"
                :default-checked-keys="checkedDeptList"
                :props="treeProps"
                expand-on-click-node
                placeholder="请选择部门"
                node-key="id"
                multiple
                show-checkbox
                clearable
                size="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述信息" prop="description">
              <el-input v-model="form.description" :rows="5" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button :loading="confirmButtonLoading" type="primary" @click="submit"
            >确 定</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Role">
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { tree as deptTree } from '@/api/system/dept'
import { childList as getMenuChildList, child as getMenuChild } from '@/api/system/menu'
import { getRole, page, add, update, del, updateRoleMenu } from '@/api/system/role'
import { onMounted, reactive, ref, watch } from 'vue'

const loading = ref(false)
const confirmButtonLoading = ref(false)
const permission = {
  add: ['roles:add'],
  edit: ['roles:edit'],
  del: ['roles:del']
}
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  dataScope: undefined
})
const total = ref(0)
const dataScopeList = ['全部', '本级', '自定义']
const tableData = ref([])
const selectData = ref([])
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const treeProps = { children: 'children', label: 'label', isLeaf: 'leaf' }
const deptDataList = ref([])
const checkedDeptList = ref([])
const formRef = ref(null)
let form = reactive({
  id: undefined,
  name: undefined,
  level: undefined,
  description: undefined,
  dataScope: undefined
})
const deptTreeSelectRef = ref(null)
const deptTreeData = ref([])
const menuTreeRef = ref(null)
const menuIds = ref([])
const currentId = ref(0)
const menuLoading = ref(false)
const showButton = ref(false)

const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  dataScope: [{ required: true, message: '请选择数据范围', trigger: 'blur' }]
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
  queryParams.name = undefined
  queryParams.dataScope = undefined

  menuIds.value = []
  menuTreeRef.value.setCheckedKeys(menuIds.value)

  queryPage()
}

const resetForm = () => {
  queryParams.num = 1
  queryParams.size = 10
  queryParams.name = undefined
  queryParams.dataScope = undefined

  total.value = 0

  form.id = undefined
  form.name = undefined
  form.level = undefined
  form.description = undefined
  form.dataScope = undefined
  form.depts = undefined

  deptDataList.value = []
  checkedDeptList.value = []
}

// 选中某一行时
const handleSelectionChange = (rows) => {
  selectData.value = rows
}

const handleAdd = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '新增角色'
}

const handleUpdate = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '修改角色'
  getRole(selectData.value[0].id).then(async (res) => {
    form.id = res.id
    form.name = res.name
    form.level = res.level
    form.description = res.description
    form.dataScope = res.dataScope
    form.depts = res.depts

    if (form.dataScope === '自定义') {
      // 自定义权限范围部门树回显
      const depts = form.depts.map((dept) => dept.id)
      deptDataList.value = depts
      checkedDeptList.value = depts
    }
  })
}

const submit = () => {
  if (form.dataScope === '自定义' && deptDataList.value.length === 0) {
    ElMessage.warning('自定义数据权限不能为空！')
    return
  } else {
    form.depts = deptDataList.value.map((item) => {
      return { id: item }
    })
  }

  formRef.value.validate((valid) => {
    if (valid) {
      confirmButtonLoading.value = true
      if (form.id) {
        update(form)
          .then(() => {
            ElMessage.success('修改成功')
            dialogFormVisible.value = false
            confirmButtonLoading.value = false
            queryPage()
          })
          .catch(() => {
            confirmButtonLoading.value = false
          })
      } else {
        add(form)
          .then(() => {
            ElMessage.success('保存成功')
            dialogFormVisible.value = false
            confirmButtonLoading.value = false
            queryPage()
          })
          .catch(() => {
            confirmButtonLoading.value = false
          })
      }
      menuIds.value = []
      menuTreeRef.value.setCheckedKeys(menuIds.value)
    } else {
      return false
    }
  })
}

const handleDelete = () => {
  if (selectData.value.length === 0) {
    ElMessage.warning('请选择要删除的角色！')
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
      ElMessage.success('删除成功')
      queryPage()
      menuIds.value = []
      menuTreeRef.value.setCheckedKeys(menuIds.value)
    })
}

// 加载菜单列表
const loadMenuTree = (node, resolve) => {
  const pid = node.level === 0 ? 0 : node.data.id
  getMenuChildList(pid).then((res) => {
    resolve(res.records)
  })
}

// 根据选中行加载对应的菜单权限列表
const handleCurrentChange = (val) => {
  if (val) {
    menuTreeRef.value.setCheckedKeys([])
    menuIds.value = []

    // 当前角色id
    currentId.value = val.id
    menuIds.value = val.menus.map((item) => item.id)
    showButton.value = true
  } else {
    showButton.value = false
  }
}

const handleMenuCheck = (menu) => {
  // 点击复选框时根据id查询子级菜单（包含自身）
  getMenuChild(menu.id).then((res) => {
    // 判断当前id是否在menuIds中，存在则删除（取消选中），反之添加
    if (menuIds.value.indexOf(menu.id) !== -1) {
      for (let i = 0; i < res.records.length; i++) {
        const index = menuIds.value.indexOf(res.records[i].id)
        if (index !== -1) {
          menuIds.value.splice(index, 1)
        }
      }
    } else {
      for (let i = 0; i < res.records.length; i++) {
        const index = menuIds.value.indexOf(res.records[i].id)
        if (index === -1) {
          menuIds.value.push(res.records[i].id)
        }
      }
    }
    menuTreeRef.value.setCheckedKeys(menuIds.value)
  })
}

const saveRoleMenu = () => {
  menuLoading.value = true
  const role = { id: currentId.value, menus: [] }
  // role.menuIds添加已选中的key
  menuIds.value.forEach(function (id) {
    const menu = { id }
    role.menus.push(menu)
  })
  updateRoleMenu(role)
    .then(() => {
      ElMessage.success('保存成功')
      menuLoading.value = false
      queryPage()
    })
    .catch(() => {
      menuLoading.value = false
    })
}

watch(dialogFormVisible, async (val) => {
  if (val) {
    const datas = await deptTree()
    deptTreeData.value = datas
  }
})

onMounted(() => {
  queryPage()
})
</script>

<style lang="scss">
.role-span {
  font-weight: bold;
  color: #303133;
  font-size: 15px;
}
</style>
