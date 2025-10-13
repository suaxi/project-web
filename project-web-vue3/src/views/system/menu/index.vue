<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <el-form :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="菜单名称" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入菜单名称"
            clearable
            style="width: 200px"
            @keyup.enter="fuzzyQuery"
          />
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
      :data="menuList"
      row-key="id"
      lazy
      :load="loadMenu"
      :tree-props="menuTreeProps"
      :default-expand-all="expanded"
    >
      <el-table-column :show-overflow-tooltip="true" label="菜单标题" width="auto" prop="title" />
      <el-table-column prop="icon" label="图标" align="center" width="60px">
        <template #default="scope">
          <svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" align="center" label="排序">
        <template #default="scope">
          {{ scope.row.sort }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="permission" label="权限标识" />
      <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column prop="iFrame" label="外链" width="75px">
        <template #default="scope">
          <span v-if="scope.row.iFrame">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="cache" label="缓存" width="75px">
        <template #default="scope">
          <span v-if="scope.row.cache">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="hidden" label="可见" width="75px">
        <template #default="scope">
          <span v-if="scope.row.hidden">否</span>
          <span v-else>是</span>
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

    <!-- 菜单信息编辑框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      width="650px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" size="small" label-width="85px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="form.pid"
                lazy
                :load="loadMenuTree"
                :props="menuTreeProps"
                highlight-current
                placeholder="请选择上级菜单"
                value-key="id"
                check-strictly
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :value="0">目录</el-radio>
                <el-radio :value="1">菜单</el-radio>
                <el-radio :value="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 2">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover placement="bottom-start" :width="450" trigger="click">
                <template #reference>
                  <el-input
                    v-model="form.icon"
                    placeholder="请选择图标"
                    @blur="showSelectIcon"
                    readonly
                  >
                    <template #prefix>
                      <svg-icon
                        v-if="form.icon"
                        :icon-class="form.icon"
                        class="el-input__icon"
                        style="height: 32px; width: 16px"
                      />
                      <el-icon v-else style="height: 32px; width: 16px">
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select
                  ref="iconSelectRef"
                  @selected="handleIconSelected"
                  :active-icon="form.icon"
                />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 2">
            <el-form-item label="菜单标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入菜单标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 2">
            <el-form-item label="按钮名称" prop="title">
              <el-input v-model="form.title" placeholder="请输入菜单标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 2">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 0">
            <el-form-item>
              <el-input v-model="form.permission" placeholder="请输入权限标识" maxlength="100" />
              <template #label>
                <span>
                  <el-tooltip
                    content="控制器中定义的权限标识，如：@PreAuthorize(`@pre.check('user:list')`)"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  权限标识
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 1">
            <el-form-item prop="name">
              <template #label>
                <span>
                  <el-tooltip content="组件名称，如：`User`组件对应的名称为`User`" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件名称
                </span>
              </template>
              <el-input v-model="form.name" placeholder="请输入组件名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 1">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip
                    content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 2">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                    <el-icon><question-filled /></el-icon> </el-tooltip
                  >是否外链
                </span>
              </template>
              <el-radio-group v-model="form.iFrame">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 1">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  是否缓存
                </span>
              </template>
              <el-radio-group v-model="form.cache">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 2">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="form.hidden">
                <el-radio :value="false">显示</el-radio>
                <el-radio :value="true">隐藏</el-radio>
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

<script setup name="Menu">
import { ElMessage, ElMessageBox } from 'element-plus'
import { add, del, getMenu, update, childList, tree } from '@/api/system/menu'
import SvgIcon from '@/components/SvgIcon/index.vue'
import IconSelect from '@/components/IconSelect/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'

const tableRef = ref(null)
const loading = ref(false)
const confirmButtonLoading = ref(false)
const permission = {
  add: ['menu:add'],
  edit: ['menu:edit'],
  del: ['menu:del']
}
const queryParams = reactive({
  title: undefined
})
const menuList = ref([])
const menuTreeProps = { children: 'children', label: 'label', isLeaf: 'leaf' }
const refreshTable = ref(true)
const expanded = ref(false)
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const iconSelectRef = ref(null)
const formRef = ref(null)
let form = reactive({
  id: undefined,
  pid: undefined,
  type: 0,
  title: undefined,
  name: undefined,
  component: undefined,
  icon: undefined,
  path: undefined,
  iFrame: false,
  cache: false,
  hidden: false,
  permission: undefined,
  sort: 999
})
const maps = new Map()

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  path: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

const fuzzyQuery = () => {
  menuList.value = []

  loading.value = true
  tree(queryParams).then((res) => {
    menuList.value = res
    refreshTable.value = true
    expanded.value = true
    loading.value = false
  })
}

const getMenuList = () => {
  loading.value = true
  childList(0).then((res) => {
    menuList.value = res.records
    loading.value = false
  })
}

const loadMenu = (row, treeNode, resolve) => {
  maps.set(row.id, { row, treeNode, resolve })
  setTimeout(() => {
    childList(row.id).then((res) => {
      if (!res.records.length) {
        tableRef.value.store.states.lazyTreeNodeMap.value[row.id] = []
      }
      resolve(res.records)
    })
  }, 100)
}

const resetQuery = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.title = undefined

  refreshTable.value = false
  nextTick(() => {
    refreshTable.value = true
    getMenuList()
  })
}

const resetForm = () => {
  queryParams.num = 1
  queryParams.size = 10
  queryParams.title = undefined

  form.id = undefined
  form.pid = undefined
  form.type = 0
  form.title = undefined
  form.name = undefined
  form.component = undefined
  form.icon = undefined
  form.path = undefined
  form.iFrame = false
  form.cache = false
  form.hidden = false
  form.permission = undefined
  form.sort = 999
}

const handleExpanded = () => {
  refreshTable.value = false
  expanded.value = !expanded.value
  nextTick(() => {
    refreshTable.value = true
  })
}

const loadMenuTree = (node, resolve) => {
  if (!node || node.level === 0) {
    const rootMenu = {
      id: 0,
      pid: null,
      label: '根目录',
      children: [],
      hasChildren: true,
      leaf: false
    }
    resolve([rootMenu])
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
  dialogTitle.value = '新增菜单'

  if (row && row.id) {
    form.pid = row.id
  } else {
    form.pid = null
  }
}

const handleUpdate = (row) => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '修改菜单'

  getMenu(row.id).then((res) => {
    form.id = res.id
    form.pid = res.pid || 0
    form.type = res.type
    form.title = res.title
    form.name = res.name
    form.component = res.component
    form.icon = res.icon
    form.path = res.path
    form.iFrame = res.iFrame
    form.cache = res.cache
    form.hidden = res.hidden
    form.permission = res.permission
    form.sort = res.sort
  })
}

const updateTableData = (val) => {
  const treeData = maps.get(val.pid)
  if (treeData) {
    loadMenu(treeData.row, treeData.treeNode, treeData.resolve)
  } else if (val.pid === 0) {
    getMenuList()
  } else {
    loadMenu({ id: val.pid }, null, (nodes) => {
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

function handleDelete(row) {
  ElMessageBox.confirm(`是否确认删除 ${row.title}？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return del([row.id])
    })
    .then(() => {
      ElMessage.success('删除成功！')
      updateTableData(row)
    })
}

const showSelectIcon = () => {
  iconSelectRef.value.reset()
}

const handleIconSelected = (val) => {
  form.icon = val
}

onMounted(() => {
  getMenuList()
})
</script>
<style lang="scss" scoped></style>
