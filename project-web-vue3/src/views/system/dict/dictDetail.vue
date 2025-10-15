<template>
  <div>
    <div v-if="!queryParams.dictId">点击字典查看详情</div>
    <div v-else>
      <div class="dict-detail-header">
        <span>字典详情</span>
        <el-button v-permission="permission.add" type="primary" icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </div>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" highlight-current-row>
        <el-table-column label="所属字典">
          {{ queryParams.dictName }}
        </el-table-column>
        <el-table-column prop="label" label="字典标签" />
        <el-table-column prop="value" label="字典值" />
        <el-table-column prop="sort" label="排序" />
        <el-table-column label="操作" width="130px" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-permission="permission.edit"
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
            />
            <el-popover :visible="scope.row.visible" placement="top" :width="180">
              <p>确定删除本条数据吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="small" @click="scope.row.visible = false">取消</el-button>
                <el-button size="small" type="primary" @click="handleDelete(scope.row)">
                  确定
                </el-button>
              </div>
              <template #reference>
                <el-button
                  v-permission="permission.del"
                  link
                  type="danger"
                  icon="Delete"
                  @click="scope.row.visible = true"
                />
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        v-model:page-num="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        @pagination="queryPage"
      />

      <!-- 数据字典详细信息编辑弹框 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogFormVisible"
        append-to-body
        destroy-on-close
        width="500px"
      >
        <el-form ref="formRef" :model="form" :rules="rules" size="small" label-width="70px">
          <el-row>
            <el-col :span="18">
              <el-form-item label="字典标签" prop="label">
                <el-input v-model="form.label" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="18">
              <el-form-item label="字典值" prop="value">
                <el-input v-model="form.value" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="18">
              <el-form-item label="排序" prop="sort">
                <el-input-number v-model.number="form.sort" :min="0" controls-position="right" />
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
  </div>
</template>

<script setup name="DictDetail">
import { ElMessage } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { getDictDetail, page, add, update, del } from '@/api/system/dictDetail'
import { onUnmounted, reactive, ref } from 'vue'

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
  dictId: undefined,
  dictName: undefined
})
const total = ref(0)
const tableData = ref([])
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
let form = reactive({
  id: undefined,
  dictId: undefined,
  label: undefined,
  value: undefined,
  sort: 999
})

const rules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
}

const queryPage = () => {
  loading.value = true
  page(queryParams)
    .then((res) => {
      tableData.value = res.records.map((item) => ({
        ...item,
        visible: false
      }))
      total.value = res.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

const resetForm = () => {
  queryParams.pageNum = 1
  queryParams.pageSize = 10

  form.id = undefined
  form.dictId = undefined
  form.label = undefined
  form.value = undefined
  form.sort = 999
}

const handleAdd = () => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '新增数据字典详情'
}

const handleUpdate = (row) => {
  resetForm()
  dialogFormVisible.value = true
  dialogTitle.value = '修改数据字典详情'
  getDictDetail(row.id).then((res) => {
    form.id = res.id
    form.dictId = res.dictId
    form.label = res.label
    form.value = res.value
    form.sort = res.sort
  })
}

const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const submitForm = {
        ...form,
        dictId: queryParams.dictId
      }

      confirmButtonLoading.value = true
      if (submitForm.id) {
        update(submitForm)
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
        add(submitForm)
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

const handleDelete = (row) => {
  if (!row.id) {
    ElMessage.warning('请选择要删除的数据字典详情信息！')
    return
  }
  del([row.id])
    .then(() => {
      row.visible = false
      ElMessage.success('删除成功')
      queryPage()
    })
    .catch(() => {
      row.visible = false
    })
}

onUnmounted(() => {
  queryParams.dictId = undefined
  queryParams.dictName = undefined
  resetForm()
})

defineExpose({
  queryParams,
  resetForm,
  queryPage
})
</script>

<style lang="scss" scoped>
.dict-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
</style>
