<template>
  <div class="app-container">
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
      <el-select
        v-model="queryParams.enabled"
        clearable
        size="small"
        placeholder="状态"
        class="filter-item"
        style="width: 90px"
        @change="queryPage"
      >
        <el-option
          v-for="(item, index) in dept_status"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span>
        <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="queryPage">搜索</el-button>
        <el-button class="filter-item" size="mini" icon="el-icon-refresh-left" @click="resetQuery">重置</el-button>
      </span>
    </div>

    <div class="crud-opts">
      <span class="crud-opts-left">
        <el-button
          v-permission="permission.add"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
        >新增</el-button>
        <el-button
          v-permission="permission.edit"
          class="filter-item"
          size="mini"
          type="success"
          icon="el-icon-edit"
          :disabled="selectData.length !== 1"
          @click="handleUpdate"
        >修改</el-button>
        <el-button
          v-permission="permission.del"
          class="filter-item"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleDelete"
        >删除</el-button>
      </span>
    </div>

    <el-table
      ref="table"
      v-loading="loading"
      row-key="id"
      lazy
      :load="loadDept"
      :data="tableData"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @select="handleSelectChange"
      @select-all="handleSelectAllChange"
      @selection-change="handleSelectionChange"
    >
      <!--      <el-table-column :selectable="checkboxT" type="selection" width="55" />-->
      <el-table-column type="selection" width="55" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="状态" align="center" prop="enabled">
        <template #default="scope">
          <el-tag v-if="scope.row.enabled" type="success" size="small">启用</el-tag>
          <el-tag v-else type="danger" size="small">禁用</el-tag>
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
            <el-radio-button :label="true">正常</el-radio-button>
            <el-radio-button :label="false">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.isTop === '0'" style="margin-bottom: 0;" label="上级部门" prop="pid">
          <treeselect
            v-model="form.pid"
            :load-options="loadDeptList"
            :options="deptList"
            style="width: 370px;"
            placeholder="选择上级类目"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submit(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ElementUI from 'element-ui'
import { getDept, page, add, update, del, childList, superiorList } from '@/api/system/dept'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'ProjectDept',
  components: {
    Treeselect
  },
  data() {
    return {
      loading: false,
      permission: {
        add: ['dept:add'],
        edit: ['dept:edit'],
        del: ['dept:del']
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        enabled: undefined
      },
      dept_status: [{ label: '启用', value: true }, { label: '禁用', value: false }],
      tableData: [],
      lazyTreeNodeData: {},
      selectData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      deptList: [],
      form: {},
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      buttonLoading: false
    }
  },
  watch: {
    form: {
      deep: true,
      handler(value) {
        if (!value.id && value.isTop && value.isTop === '0') {
          this.getRootDeptList()
        }
      }
    }
  },
  created() {
    this.queryPage()
  },
  methods: {
    queryPage() {
      this.loading = true
      page(this.queryParams).then(res => {
        this.tableData = res.records
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        enabled: undefined
      }
      // if (this.lazyTreeNodeData) {
      //   Object.values(this.lazyTreeNodeData).forEach(item => {
      //     if (item.treeNode.level !== 0) {
      //       this.$refs.table.store.states.lazyTreeNodeMap[item.tree.id] = []
      //     }
      //   })
      // }
      this.queryPage()
    },
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        enabled: undefined
      }
      this.form = {
        id: null,
        pid: undefined,
        subCount: 0,
        name: null,
        enabled: true,
        sort: 999,
        isTop: '0'
      }
      this.deptList = []
    },
    handleSelectChange(selection, row) {
      if (selection.find(val => { return val.id === row.id })) {
        if (row.children) {
          row.children.forEach(val => {
            this.$refs.table.toggleRowSelection(val, true)
            selection.push(val)
            if (val.children) {
              this.handleSelectChange(selection, val)
            }
          })
        }
      } else {
        this.toggleRowSelection(selection, row)
      }
    },
    toggleRowSelection(selection, data) {
      if (data.children) {
        data.children.forEach(val => {
          selection.splice(selection.findIndex(item => item.id === val.id), 1)
          this.$refs.table.toggleRowSelection(val, false)
          if (val.children) {
            this.toggleRowSelection(selection, val)
          }
        })
      }
    },
    handleSelectAllChange(selection) {
      // 如果选中的数目与请求到的数目相同就选中子节点，否则就清空选中
      if (selection && selection.length === this.tableData.length) {
        selection.forEach(val => {
          this.handleSelectChange(selection, val)
        })
      } else {
        this.$refs.table.clearSelection()
      }
    },
    handleSelectionChange(rows) {
      this.selectData = rows
    },
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '新增部门'
      this.form.isTop = '1'
    },
    handleUpdate() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '修改部门'
      getDept(this.selectData[0].id).then(res => {
        if (res.pid) {
          // radio不支持对未创建的对象直接复制，即不能使用 this.form.isTop = '0'的方式
          this.form = {
            isTop: '0',
            ...res
          }
          this.getSuperiorDeptList(res.id)
        } else {
          this.form = {
            isTop: '1',
            ...res
          }
          this.getRootDeptList()
        }
      })
    },
    loadDept(tree, treeNode, resolve) {
      this.lazyTreeNodeData[tree.id] = { tree, treeNode, resolve }
      setTimeout(() => {
        childList({ pid: tree.id }).then(res => {
          resolve(res.records)
          tree.children = res.records
        })
      }, 100)
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true
          if (this.form.id) {
            update(this.form).then(() => {
              ElementUI.Message.success('修改成功')
              this.reloadDept(this.form)
              this.dialogFormVisible = false
              this.buttonLoading = false
            }).catch(() => {
              this.buttonLoading = false
            })
          } else {
            add(this.form).then(res => {
              ElementUI.Message.success('保存成功')
              this.reloadDept(res)
              this.dialogFormVisible = false
              this.buttonLoading = false
            }).catch(() => {
              this.buttonLoading = false
            })
          }
        } else {
          return false
        }
      })
    },
    handleDelete() {
      if (this.selectData.length === 0) {
        ElementUI.Message.warning('请选择要删除的部门！')
        return
      }
      const ids = this.selectData.map(item => item.id)
      this.$confirm('是否确认删除？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return del(ids)
      }).then(() => {
        this.$message.success('删除成功！')

        this.selectData.forEach(item => {
          this.$refs.table.store.states.lazyTreeNodeMap[item.id] = []
          const { tree, treeNode, resolve } = this.lazyTreeNodeData[item.pid]
          this.loadDept(tree, treeNode, resolve)
        })
        this.$refs.table.clearSelection()
      })
    },
    // 新增时加载部门树
    getRootDeptList() {
      childList({}).then(res => {
        this.deptList = res.records.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    // 编辑弹框懒加载部门树
    loadDeptList({ action, parentNode, callback }) {
      if (action === 'LOAD_CHILDREN_OPTIONS') {
        childList({ pid: parentNode.id }).then(res => {
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
      superiorList(id).then(res => {
        const data = res.records
        this.dealDeptChildren(data)
        this.deptList = data
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
    reloadDept(data) {
      this.$refs.table.clearSelection()
      if (data.id) {
        this.$refs.table.store.states.lazyTreeNodeMap[data.id] = []
      }
      const { tree, treeNode, resolve } = this.lazyTreeNodeData[data.pid]
      this.loadDept(tree, treeNode, resolve)
    }
  }
}
</script>

<style scoped>

</style>
