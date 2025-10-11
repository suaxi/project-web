<template>
  <div class="app-container">
    <el-row :gutter="10">
      <!-- 字典列表 -->
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <div class="head-container">
            <el-form :model="queryParams" :inline="true" label-width="68px">
              <el-form-item label="字典名称" prop="name">
                <el-input
                  v-model="queryParams.name"
                  placeholder="请输入字典名称"
                  clearable
                  style="width: 120px"
                  @keyup.enter="queryPage"
                />
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
            highlight-current-row
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" prop="name" label="名称" />
            <el-table-column :show-overflow-tooltip="true" prop="description" label="描述" />
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

      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <dictDetail ref="dictDetailRef" :permission="permission" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据字典信息编辑弹框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      append-to-body
      destroy-on-close
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" size="small" label-width="66px">
        <el-row>
          <el-col :span="18">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="描述" prop="description">
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

<script setup name="Dict">
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { getDict, page, add, update, del } from '@/api/system/dict'
import dictDetail from '@/views/system/dict/dictDetail.vue'
import { onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const confirmButtonLoading = ref(false)
const permission = {
  add: ['dict:add'],
  edit: ['dict:edit'],
  del: ['dict:del']
}
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined
})
const total = ref(0)
const tableData = ref([])
const selectData = ref([])
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const dictDetailRef = ref(null)
const formRef = ref(null)
let form = reactive({
  id: undefined,
  name: undefined,
  description: undefined
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
}

const queryPage = () => {
  loading.value = true
  page(queryParams)
    .then((res) => {
      if (dictDetailRef.value) {
        resetDictDetail()
      }

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
  queryPage()
}

const resetForm = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.name = undefined

  form.id = undefined
  form.name = undefined
  form.description = undefined
}

const handleSelectionChange = (rows) => {
  selectData.value = rows
}

const handleAdd = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '新增字典'
}

const handleUpdate = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '修改字典'
  getDict(selectData.value[0].id).then((res) => {
    form.id = res.id
    form.name = res.name
    form.description = res.description
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
    ElMessage.warning('请选择要删除的字典！')
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

const handleCurrentChange = (val) => {
  if (val) {
    dictDetailRef.value.queryParams.dictId = val.id
    dictDetailRef.value.queryParams.dictName = val.name
    dictDetailRef.value.queryPage()
  }
}

const resetDictDetail = () => {
  dictDetailRef.value.queryParams.dictId = undefined
  dictDetailRef.value.queryParams.dictName = undefined
  dictDetailRef.value.resetForm()
  dictDetailRef.value.tableData = []
}

onMounted(() => {
  queryPage()
})
</script>

<style lang="scss" scoped></style>
