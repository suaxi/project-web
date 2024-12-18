<template>
  <div>
    <el-row :gutter="20">
      <!-- 工具栏 -->
      <div class="head-container">
        <!-- 搜索 -->
        <el-input
          v-model="crud.params.username"
          clearable
          size="small"
          placeholder="请输入名称"
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
          @selection-change="handleMultipleUserSelect"
        >
          <el-table-column type="selection" :reserve-selection="true" width="50" align="center" />
          <el-table-column v-if="columns[0].visible" key="id" label="用户编号" align="center" prop="id" />
          <el-table-column v-if="columns[1].visible" key="username" label="登录账号" align="center" prop="username" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[2].visible" key="nickName" label="用户姓名" align="center" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[3].visible" key="deptName" label="部门" align="center" prop="deptName" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[4].visible" key="phonenumber" label="联系电话" align="center" prop="phone" width="120" />
        </el-table>
        <el-table
          v-show="checkType === 'single'"
          v-loading="crud.loading"
          :data="crud.tableData"
          @current-change="handleSingleUserSelect"
        >
          <el-table-column width="55" align="center">
            <template #default="scope">
              <el-radio v-model="radioSelected" :label="scope.row.id">{{ '' }}</el-radio>
            </template>
          </el-table-column>
          <el-table-column v-if="columns[0].visible" key="id" label="用户编号" align="center" prop="id" />
          <el-table-column v-if="columns[1].visible" key="userName" label="登录账号" align="center" prop="username" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[2].visible" key="nickName" label="用户姓名" align="center" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[3].visible" key="deptName" label="部门" align="center" prop="deptName" :show-overflow-tooltip="true" />
          <el-table-column v-if="columns[4].visible" key="phonenumber" label="联系电话" align="center" prop="phone" width="120" />
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
  name: 'WorkFlowUser',
  components: { Pagination, RrOperation },
  cruds() {
    return CRUD({ title: '用户列表', url: '/user/queryPage' })
  },
  mixins: [presenter()],
  props: {
    // 回显数据传值
    selectValues: {
      type: Array,
      default: null,
      required: false
    },
    // 表格类型
    checkType: {
      type: String,
      default: 'multiple',
      required: true
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
      userList: [],
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户名称`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `部门`, visible: true },
        { key: 4, label: `联系电话`, visible: true },
        { key: 5, label: `状态`, visible: true },
        { key: 6, label: `创建时间`, visible: true }
      ],
      radioSelected: 0, // 单选框传值
      selectUserList: [] // 回显数据传值
    }
  },
  watch: {
    selectValues: {
      handler(newVal) {
        if (StrUtil.isNotBlank(newVal)) {
          if (this.checkType === 'single') {
            this.radioSelected = newVal[0].id
          } else {
            this.selectUserList = newVal
          }
        }
      },
      immediate: true
    },
    userList: {
      handler(newVal) {
        if (StrUtil.isNotBlank(newVal) && this.selectUserList.length > 0) {
          this.$nextTick(() => {
            this.$refs.dataTable.clearSelection()
            this.selectUserList.forEach(item => {
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
    this.userList = []
    this.userList = this.modelerStore.userList
  },
  methods: {
    // 保存选中的数据id,row-key就是要指定一个key标识这一行的数据
    getRowKey(row) {
      return row.id
    },
    // 多选框选中数据
    handleMultipleUserSelect(selection) {
      this.$emit('handleUserSelect', selection)
    },
    // 单选框选中数据
    handleSingleUserSelect(selection) {
      this.radioSelected = selection.id// 点击当前行时,radio同样有选中效果
      this.$emit('handleUserSelect', selection)
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
