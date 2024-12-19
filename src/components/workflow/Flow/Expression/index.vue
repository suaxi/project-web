<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-model="crud.params.name"
        clearable
        size="small"
        placeholder="请输入名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="crud.toQuery"
      />
      <RrOperation />
    </div>

    <el-table
      v-loading="crud.loading"
      :data="crud.tableData.filter(item => item.status === 1)"
      @current-change="handleSingleExpSelect"
    >
      <el-table-column width="55" align="center">
        <template #default="scope">
          <!-- 可以手动的修改label的值，从而控制选择哪一项 -->
          <el-radio v-model="radioSelected" :label="scope.row.id">{{ '' }}</el-radio>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="类型" align="center" prop="type">
        <template #default="scope">
          <div v-if="scope.row.type === 1">动态选择</div>
          <div v-if="scope.row.type === 2">动态选择</div>
        </template>
      </el-table-column>
      <el-table-column label="表达式内容" align="center" prop="expression" />
    </el-table>
    <!-- 分页 -->
    <Pagination />
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import { StrUtil } from '@/utils/StrUtil'
import RrOperation from '@/components/Crud/RR.operation.vue'
import Pagination from '@/components/Crud/Pagination'

export default {
  name: 'WorkFlowExpression',
  components: {
    RrOperation,
    Pagination
  },
  cruds() {
    return CRUD({ title: '流程表达式', url: '/workflow/expression/queryPage' })
  },
  mixins: [presenter()],
  props: {
    // 回显数据传值
    selectValues: {
      type: Array,
      default: () => [],
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
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 流程达式表格数据
      expressionList: [],
      // 是否显示弹出层
      open: false,
      radioSelected: null // 单选框传值
    }
  },
  watch: {
    selectValues: {
      handler(newVal) {
        if (StrUtil.isNotBlank(newVal)) {
          this.radioSelected = newVal[0].id
        }
      },
      immediate: true
    }
  },
  methods: {
    // 单选框选中数据
    handleSingleExpSelect(selection) {
      if (selection.status === 0) {
        this.$message.error(`流程表达式“${selection.name}”未启用，请重新选择！`)
        return
      }
      this.radioSelected = selection.id// 点击当前行时,radio同样有选中效果
      this.$emit('handleSingleExpSelect', selection)
    }
  }
}
</script>
