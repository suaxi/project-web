<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <el-form :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="岗位名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入岗位名称"
            clearable
            style="width: 200px"
            @keyup.enter="queryPage"
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
              v-for="(item, index) in jobStatus"
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
        <el-button v-permission="permission.add" type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="permission.edit"
          type="success"
          plain
          icon="Edit"
          :disabled="selectData.length !== 1"
          @click="handleUpdate"
          >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permission="permission.del"
          type="danger"
          plain
          icon="Delete"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <!--      <el-col :span="1.5">-->
      <!--        <el-button type="warning" plain icon="Download">导出</el-button>-->
      <!--      </el-col>-->
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      highlight-current-row
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

    <!-- 岗位信息编辑弹框 -->
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
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.enabled">
                <el-radio :value="true">启用</el-radio>
                <el-radio :value="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
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

<script setup name="Job">
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { getJob, page, add, update, del } from '@/api/system/job'
import { onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const confirmButtonLoading = ref(false)
const permission = {
  add: ['job:add'],
  edit: ['job:edit'],
  del: ['job:del']
}
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  enabled: undefined
})
const total = ref(0)
const jobStatus = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]
const tableData = ref([])
const selectData = ref([])
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
let form = reactive({
  id: undefined,
  name: undefined,
  sort: 999,
  enabled: true
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
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
  queryParams.enabled = undefined
  queryPage()
}

const resetForm = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.name = undefined
  queryParams.enabled = undefined

  form.id = undefined
  form.name = undefined
  form.sort = 999
  form.enabled = true
}

const handleSelectionChange = (rows) => {
  selectData.value = rows
}

const handleAdd = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '新增岗位'
}

const handleUpdate = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '修改岗位'
  getJob(selectData.value[0].id).then((res) => {
    form.id = res.id
    form.name = res.name
    form.sort = res.sort
    form.enabled = res.enabled
  })
}

const submit = () => {
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
    } else {
      return false
    }
  })
}

const handleDelete = () => {
  if (selectData.value.length === 0) {
    ElMessage.warning('请选择要删除的岗位！')
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
    })
}

onMounted(() => {
  queryPage()
})
</script>

<style lang="scss" scoped></style>
