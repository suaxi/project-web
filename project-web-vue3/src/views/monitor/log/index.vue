<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <el-form :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="日志类型" prop="logType">
          <el-select
            v-model="queryParams.logType"
            placeholder="日志类型"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="(item, index) in logTypeOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="operationTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
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
        <el-button type="warning" plain icon="Download">导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableData" style="width: 100%" highlight-current-row>
      <el-table-column fixed prop="id" label="日志编号" width="100" />
      <el-table-column prop="logType" label="日志类型" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.logType === 'INFO'" type="success">{{
            scope.row.logType
          }}</el-tag>
          <el-tag v-else type="danger">{{ scope.row.logType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" width="120" />
      <el-table-column :show-overflow-tooltip="true" prop="method" label="请求方法" />
      <el-table-column prop="requestIp" label="请求ip" width="120" />
      <el-table-column prop="time" label="请求耗时" width="120">
        <template #default="scope"> {{ scope.row.time }}ms </template>
      </el-table-column>
      <el-table-column prop="username" label="操作用户" width="120" />
      <el-table-column prop="address" label="地址" width="120" />
      <el-table-column prop="browser" label="浏览器" width="120" />
      <el-table-column
        :show-overflow-tooltip="true"
        prop="createTime"
        label="操作日期"
        width="200"
      />
      <el-table-column label="操作" width="130px" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)"
            >详细</el-button
          >
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

    <!-- 操作日志详细信息弹框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogFormVisible"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="日志类型：">
              <el-tag v-if="form.logType === 'INFO'" type="success">{{ form.logType }}</el-tag>
              <el-tag v-else type="danger">{{ form.logType }}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述：">{{ form.description }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作用户："
              >{{ form.username }} / {{ form.requestIp }} / {{ form.address }} /
              {{ form.browser }}</el-form-item
            >
          </el-col>
          <el-col :span="24">
            <el-form-item :show-overflow-tooltip="true" label="请求参数：">{{
              form.params
            }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="耗时：">{{ form.time }}ms</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :show-overflow-tooltip="true"
              label="异常信息："
              v-if="form.logType === 'ERROR'"
              >{{ form.exceptionDetail }}</el-form-item
            >
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OperationLog">
import Pagination from '@/components/Pagination/index.vue'
import { page } from '@/api/monitor/log'
import { datetimeToStr } from '@/utils/date'
import { onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  logType: undefined
})
const operationTime = ref('')
const total = ref(0)
const logTypeOptions = [
  { label: 'INFO', value: 'INFO' },
  { label: 'ERROR', value: 'ERROR' }
]
const tableData = ref([])
const dialogFormVisible = ref(false)
const dialogTitle = ref('操作日志详细信息')
let form = reactive({
  id: undefined,
  logType: undefined,
  description: undefined,
  method: undefined,
  params: undefined,
  requestIp: undefined,
  time: undefined,
  username: undefined,
  address: undefined,
  browser: undefined,
  exceptionDetail: undefined,
  createTime: undefined
})

const queryPage = () => {
  loading.value = true

  const params = {
    ...queryParams
  }
  if (operationTime.value.length > 1) {
    const [startTime, endTime] = operationTime.value
    params.startTime = datetimeToStr(startTime)
    params.endTime = datetimeToStr(endTime)
  }

  page(params)
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
  queryParams.logType = undefined

  operationTime.value = ''

  form.id = undefined
  form.logType = undefined
  form.description = undefined
  form.method = undefined
  form.params = undefined
  form.requestIp = undefined
  form.time = undefined
  form.username = undefined
  form.address = undefined
  form.browser = undefined
  form.exceptionDetail = undefined
  form.createTime = undefined

  queryPage()
}

const handleDetail = (row) => {
  dialogFormVisible.value = true

  form.id = row.id
  form.logType = row.logType
  form.description = row.description
  form.method = row.method
  form.params = row.params
  form.requestIp = row.requestIp
  form.time = row.time
  form.username = row.username
  form.address = row.address
  form.browser = row.browser
  form.exceptionDetail = row.exceptionDetail
  form.createTime = row.createTime
}

onMounted(() => {
  queryPage()
})
</script>

<style lang="scss" scoped>
.el-form-item,
::v-deep(.el-form-item__error) {
  word-break: break-word;
  position: relative;
  top: 0;
}
</style>
