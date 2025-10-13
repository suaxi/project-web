<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <el-form :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入部门名称"
            clearable
            style="width: 200px"
            @keyup.enter="fuzzyQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select
            v-model="queryParams.enabled"
            placeholder="状态"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="(item, index) in deptStatus"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="fuzzyQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="handleExpanded">展开/折叠</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download">导出</el-button>
      </el-col>
    </el-row>

    <el-table
      ref="tableRef"
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="id"
      lazy
      :load="loadDept"
      :tree-props="deptTreeProps"
      :default-expand-all="expanded"
    >
      <el-table-column :show-overflow-tooltip="true" label="部门名称" width="auto" prop="name" />
      <el-table-column prop="sort" align="center" label="排序">
        <template #default="scope">
          {{ scope.row.sort }}
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" width="75px">
        <template #default="scope">
          <span v-if="scope.row.enabled">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期" width="auto" />
      <el-table-column
        label="操作"
        align="center"
        width="210"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button link type="success" icon="Edit" size="small" @click="handleUpdate(scope.row)"
            >修改
          </el-button>
          <el-button link type="primary" size="small" icon="Plus" @click="handleAdd(scope.row)"
            >新增
          </el-button>
          <el-button link type="danger" size="small" icon="Delete" @click="handleDelete(scope.row)"
            >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 部门信息编辑框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" size="small" label-width="70px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级部门">
              <el-tree-select
                v-model="form.pid"
                lazy
                :load="loadDeptTree"
                :props="deptTreeProps"
                highlight-current
                placeholder="请选择上级部门"
                value-key="id"
                check-strictly
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="enabled">
              <el-radio-group v-model="form.enabled">
                <el-radio :value="true">启用</el-radio>
                <el-radio :value="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
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

<script setup name="Dept">
import { ElMessage, ElMessageBox } from 'element-plus'
import { add, del, getDept, update, childList, tree } from '@/api/system/dept'
import { ref, reactive, nextTick, onMounted } from 'vue'

const tableRef = ref(null)
const loading = ref(false)
const confirmButtonLoading = ref(false)
const permission = {
  add: ['dept:add'],
  edit: ['dept:edit'],
  del: ['dept:del']
}
const queryParams = reactive({
  name: undefined,
  enabled: undefined
})
const deptStatus = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]
const deptList = ref([])
const deptTreeProps = { children: 'children', label: 'label', isLeaf: 'leaf' }
const refreshTable = ref(true)
const expanded = ref(false)
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
let form = reactive({
  id: undefined,
  pid: undefined,
  name: undefined,
  enabled: true,
  sort: 999
})
const maps = reactive(new Map())

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const fuzzyQuery = () => {
  deptList.value = []

  loading.value = true
  tree(queryParams).then((res) => {
    deptList.value = res
    refreshTable.value = true
    expanded.value = true
    loading.value = false
  })
}

const getDeptList = () => {
  loading.value = true
  childList(0).then((res) => {
    deptList.value = res.records
    loading.value = false
  })
}

const loadDept = (row, treeNode, resolve) => {
  maps.set(row.id, { row, treeNode, resolve })
  setTimeout(() => {
    childList(row.id).then((res) => {
      if (!res.records.length) {
        tableRef.value.store.states.lazyTreeNodeMap.value[row.id] = []
      } else {
        resolve(res.records)
      }
    })
  }, 100)
}

const resetQuery = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.name = undefined
  queryParams.enabled = undefined

  refreshTable.value = false
  nextTick(() => {
    refreshTable.value = true
    getDeptList()
  })
}

const resetForm = () => {
  queryParams.num = 1
  queryParams.size = 10
  queryParams.name = undefined
  queryParams.enabled = undefined

  form.id = undefined
  form.pid = undefined
  form.name = undefined
  form.enabled = true
  form.sort = 999
}

const handleExpanded = () => {
  refreshTable.value = false
  expanded.value = !expanded.value
  nextTick(() => {
    refreshTable.value = true
  })
}

const loadDeptTree = (node, resolve) => {
  if (!node || node.level === 0) {
    const rootDept = {
      id: 0,
      pid: null,
      label: '根目录',
      children: [],
      hasChildren: true,
      leaf: false
    }
    resolve([rootDept])
  } else if (node.data.id === 0) {
    childList(0).then((res) => {
      resolve(res.records)
    })
  } else {
    childList(node.data.id).then((res) => {
      resolve(res.records)
    })
  }
}

const handleAdd = (row) => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '新增部门'

  if (row && row.id) {
    form.pid = row.id
  } else {
    form.pid = null
  }
}

const handleUpdate = (row) => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '修改部门'

  getDept(row.id).then((res) => {
    form.id = res.id
    form.pid = res.pid
    form.name = res.name
    form.enabled = res.enabled
    form.sort = res.sort
  })
}

const updateTableData = (val) => {
  const treeData = maps.get(val.pid)
  if (treeData) {
    loadDept(treeData.row, treeData.treeNode, treeData.resolve)
  } else if (val.pid === 0) {
    getDeptList()
  } else {
    loadDept({ id: val.pid }, null, (nodes) => {
      tableRef.value.store.states.lazyTreeNodeMap[val.pid] = nodes
    })
  }
}

const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      confirmButtonLoading.value = true
      const submitForm = { ...form }
      if (submitForm.pid === 0 || submitForm.pid === null) {
        submitForm.pid = 0
      }

      if (submitForm.id) {
        update(submitForm)
          .then(() => {
            ElMessage.success('修改成功')
            updateTableData(submitForm)
            dialogFormVisible.value = false
            confirmButtonLoading.value = false
          })
          .catch(() => {
            confirmButtonLoading.value = false
          })
      } else {
        add(submitForm)
          .then(() => {
            ElMessage.success('保存成功')
            updateTableData(submitForm)
            dialogFormVisible.value = false
            confirmButtonLoading.value = false
          })
          .catch(() => {
            confirmButtonLoading.value = false
          })
      }
    } else {
      return false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`是否确认删除 ${row.name}？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return del([row.id])
    })
    .then(() => {
      ElMessage.success('删除成功')
      updateTableData(row)
    })
}

onMounted(() => {
  getDeptList()
})
</script>
<style lang="scss" scoped></style>
