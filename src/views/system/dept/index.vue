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
      <el-select
        v-model="crud.params.enabled"
        clearable
        size="small"
        placeholder="状态"
        class="filter-item"
        style="width: 90px"
        @change="crud.toQuery"
      >
        <el-option
          v-for="(item, index) in dept_status"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <RrOperation />
    </div>
    <!-- 增删改查按钮 -->
    <CrudOperation :permission="permission" />

    <el-table
      ref="table"
      v-loading="crud.loading"
      lazy
      :load="getDepts"
      :data="crud.tableData"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="id"
      @select="crud.selectChange"
      @select-all="crud.selectAllChange"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column :selectable="checkboxT" type="selection" width="55" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="状态" align="center" prop="enabled">
        <template #default="scope">
          <el-switch
            v-model="scope.row.enabled"
            :disabled="scope.row.id === 1"
            active-color="#409EFF"
            inactive-color="#F56C6C"
            @change="changeEnabled(scope.row, scope.row.enabled,)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期" />
    </el-table>

    <!-- 部门信息编辑框 -->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="dialogTitle" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="部门排序" prop="sort">
          <el-input-number
            v-model.number="form.sort"
            :min="0"
            :max="999"
            controls-position="right"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="顶级部门">
          <el-radio-group v-model="form.isTop" style="width: 140px">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio-group v-model="form.enabled" size="mini">
            <el-radio-button label="true">正常</el-radio-button>
            <el-radio-button label="false">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.isTop === '0'" style="margin-bottom: 0;" label="上级部门" prop="pid">
          <treeselect
            v-model="form.pid"
            :load-options="loadDepts"
            :options="depts"
            style="width: 370px;"
            placeholder="选择上级类目"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="updateDept(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import CrudOperation from '@/components/Crud/CRUD.operation'
import RrOperation from '@/components/Crud/RR.operation'
import { getDeptList, getDeptSuperiorList, edit } from '@/api/dept'
import { del } from '@/api/dept'
import treeselect from '@riophae/vue-treeselect'
import ElementUI from 'element-ui'

export default {
  name: 'ProjectDept',
  components: {
    CrudOperation,
    RrOperation,
    treeselect
  },
  cruds() {
    return CRUD({ title: '部门', url: '/dept/queryPage' })
  },
  mixins: [presenter()],
  data() {
    return {
      dialogTitle: '',
      dialogFormVisible: false,
      permission: {
        add: ['dept:add'],
        edit: ['dept:edit'],
        del: ['dept:del']
      },
      depts: [],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      dept_status: [{ label: '正常', value: true }, { label: '禁用', value: false }],
      form: {},
      buttonLoading: false
    }
  },
  watch: {
    form: {
      deep: true,
      handler(value) {
        if (value.isTop && this.$store.state.operation === 'post') {
          if (value.isTop === '0') {
            this.getRootDeptList()
          }
        }
      }
    }
  },
  created() {
    this.$store.dispatch('GetUserInfo').then(() => {
      this.crud.optShow = {
        add: true,
        edit: true,
        delete: true,
        download: true
      }
    })
  },
  methods: {
    getDepts(tree, treeNode, resolve) {
      setTimeout(() => {
        getDeptList({ pid: tree.id }).then(res => {
          resolve(res.records)
        })
      }, 100)
    },
    [CRUD.HOOK.setOperation](crud, operation) {
      // 清空缓存
      this.form = {
        id: null,
        name: null,
        isTop: '1',
        subCount: 0,
        pid: null,
        sort: 999,
        enabled: 'true'
      }

      if (operation === 'post') {
        this.dialogTitle = '新增部门'
        this.$store.commit('SET_OPERATION', operation)
      } else if (operation === 'put') {
        this.dialogTitle = '编辑部门'
        this.$store.commit('SET_OPERATION', operation)
        const selectData = { ...this.crud.selectData[0] }
        if (selectData.pid) {
          // radio不支持对未创建的对象直接复制，即不能使用 this.form.isTop = '0'的方式
          this.form = {
            isTop: '0',
            ...selectData
          }
          this.getSuperiorDeptList(this.form.id)
        } else {
          this.form = {
            isTop: '1',
            ...selectData
          }
          this.getRootDeptList()
        }
      } else if (operation === 'delete') {
        const ids = this.crud.selectData.map(item => item.id)
        del(ids).then(() => {
          ElementUI.Message.success('删除成功')
          this.crud.delChangePage()
          this.crud.refresh()
        })
      }
      if (operation !== 'delete') {
        this.dialogFormVisible = true
      }
    },
    // 新增时加载部门树
    getRootDeptList() {
      getDeptList({ pid: null }).then(res => {
        this.depts.splice(0)
        this.depts = res.records.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    // 编辑弹框懒加载部门树
    loadDepts({ action, parentNode, callback }) {
      if (action === 'LOAD_CHILDREN_OPTIONS') {
        getDeptList({ pid: parentNode.id }).then(res => {
          parentNode.children = res.records.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 200)
        })
      }
    },
    // 根据id查找同级与上级部门树
    getSuperiorDeptList(id) {
      getDeptSuperiorList(id).then(res => {
        this.depts.splice(0)
        const data = res.records
        this.dealDeptChildren(data)
        this.depts = data
      })
    },
    dealDeptChildren(deptList) {
      deptList.forEach(dept => {
        if (dept.children) {
          this.dealDeptChildren(dept.children)
        }
        if (dept.hasChildren && !dept.children) {
          dept.children = null
        }
      })
    },
    updateDept(data) {
      this.buttonLoading = true
      const operation = this.$store.state.operation
      this.$request({
        url: '/dept',
        method: operation,
        data
      }).then(() => {
        this.buttonLoading = false
        this.$message.success('操作成功')
        this.dialogFormVisible = false
        this.crud.refresh()
      }).catch(() => {
        this.buttonLoading = false
      })
    },
    // 根节点不可选
    checkboxT(row, rowIndex) {
      return row.id !== 1
    },
    // 部门状态改变
    changeEnabled(data, val) {
      this.$confirm(`此操作将设置该部门及所有其子部门的状态为“${val ? '正常' : '禁用'}”，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        edit(data).then(() => {
          this.$message.success('修改成功')
        }).catch(() => {
          data.enabled = !data.enabled
        })
      }).catch(() => {
        data.enabled = !data.enabled
      })
    }
  }
}
</script>

<style scoped>

</style>
