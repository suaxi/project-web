<template>
  <div>
    <el-row :gutter="20">
      <!-- 工具栏 -->
      <div class="head-container">
        <!-- 搜索 -->
        <el-input
          v-model="queryParams.name"
          clearable
          size="small"
          placeholder="请输入名称"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="queryPage"
        />
        <span>
          <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="queryPage">搜索</el-button>
          <el-button class="filter-item" size="mini" icon="el-icon-refresh-left" @click="resetQuery">重置</el-button>
        </span>
      </div>

      <el-col :span="18" :xs="24">
        <el-table
          v-show="checkType === 'multiple'"
          ref="dataTable"
          v-loading="loading"
          :data="tableData"
          :row-key="getRowKey"
          @selection-change="handleMultipleRoleSelect"
        >
          <el-table-column type="selection" :reserve-selection="true" width="50" align="center" />
          <el-table-column label="角色编号" prop="id" width="120" />
          <el-table-column label="角色名称" prop="name" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="数据权限" prop="dataScope" :show-overflow-tooltip="true" width="150" />
        </el-table>
        <el-table
          v-show="checkType === 'single'"
          v-loading="loading"
          :data="tableData"
          @current-change="handleSingleRoleSelect"
        >
          <el-table-column width="55" align="center">
            <template #default="scope">
              <!-- 可以手动的修改label的值，从而控制选择哪一项 -->
              <el-radio v-model="radioSelected" :label="scope.row.id">{{ '' }}</el-radio>
            </template>
          </el-table-column>
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="角色编号" prop="id" width="120" />
          <el-table-column label="角色名称" prop="name" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="数据权限" prop="dataScope" :show-overflow-tooltip="true" width="150" />
        </el-table>
        <!-- 分页 -->
        <Pagination
          :page-num.sync="queryParams.pageNum"
          :page-size.sync="queryParams.pageSize"
          :total="total"
          @page="queryPage"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { StrUtil } from '@/utils/StrUtil'
import Pagination from '@/components/Crud/Pagination'
import { page } from '@/api/system/role'

export default {
  name: 'WorkFlowFlowRole',
  components: { Pagination },
  props: {
    // 回显数据传值
    selectValues: {
      type: Array,
      default: () => [],
      required: false
    },
    checkType: {
      type: String,
      default: 'multiple',
      required: false
    }
  },
  data() {
    return {
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      total: 0,
      tableData: [],
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      roleList: [],
      radioSelected: 0, // 单选框传值
      selectRoleList: [] // 回显数据传值
    }
  },
  watch: {
    selectValues: {
      handler(newVal) {
        if (StrUtil.isNotBlank(newVal)) {
          if (this.checkType === 'single') {
            this.radioSelected = newVal[0].id
          } else {
            this.selectRoleList = newVal
          }
        }
      },
      immediate: true
    },
    roleList: {
      handler(newVal) {
        if (StrUtil.isNotBlank(newVal) && this.selectRoleList.length > 0) {
          this.$nextTick(() => {
            this.$refs.dataTable.clearSelection()
            this.selectRoleList.forEach(item => {
              this.$refs.dataTable.toggleRowSelection(newVal.find(
                val => item.id === val.id
              ), true)
            })
          })
        }
      }
    }
  },
  created() {
    this.roleList = []
    this.roleList = this.modelerStore.roleList
    this.queryPage()
  },
  methods: {
    queryPage() {
      this.loading = true
      page(this.queryParams).then(res => {
        this.tableData = res.records
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    resetQuery() {
      this.queryParams = {
        num: 1,
        size: 10,
        name: undefined
      }
      this.queryPage()
    },
    getRowKey(row) {
      return row.id
    },
    // 多选框选中数据
    handleMultipleRoleSelect(selection) {
      this.$emit('handleRoleSelect', selection)
    },
    // 单选框选中数据
    handleSingleRoleSelect(selection) {
      this.radioSelected = selection.id
      this.$emit('handleRoleSelect', selection)
    }
  }
}
</script>
<style>
/*隐藏radio展示的label及本身自带的样式*/
/*.el-radio__label{*/
/*  display:none;*/
/*}*/
</style>
