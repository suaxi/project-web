<template>
  <div>
    <el-row :gutter="20">
      <!-- 工具栏 -->
      <div class="head-container">
        <!-- 搜索 -->
        <el-input
          v-model="crud.params.name"
          clearable
          size="small"
          placeholder="请输入角色名称"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <RrOperation />
      </div>
      <el-col :span="18" :xs="24">
        <el-table
          v-show="checkType === 'multiple'"
          ref="dataTable"
          v-loading="crud.loading"
          :data="crud.tableData"
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
          v-loading="crud.loading"
          :data="crud.tableData"
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
        <Pagination />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import { StrUtil } from '@/utils/StrUtil'
import RrOperation from '@/components/Crud/RR.operation'
import Pagination from '@/components/Crud/Pagination'

export default {
  name: 'WorkFlowFlowRole',
  components: { Pagination, RrOperation },
  cruds() {
    return CRUD({ title: '角色列表', url: '/role/queryPage' })
  },
  mixins: [presenter()],
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
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
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
  mounted() {
    this.roleList = []
    this.roleList = this.modelerStore.roleList
  },
  methods: {
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
