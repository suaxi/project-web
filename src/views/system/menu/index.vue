<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.title"
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
      :load="loadMenu"
      :data="tableData"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @select="handleSelectChange"
      @select-all="handleSelectAllChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" label="菜单标题" width="auto" prop="title" />
      <el-table-column prop="icon" label="图标" align="center" width="60px">
        <template #default="scope">
          <svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />
        </template>
      </el-table-column>
      <el-table-column prop="menuSort" align="center" label="排序">
        <template #default="scope">
          {{ scope.row.sort }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="permission" label="权限标识" />
      <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column prop="iFrame" label="外链" width="75px">
        <template #default="scope">
          <span v-if="scope.row.iFrame">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="cache" label="缓存" width="75px">
        <template #default="scope">
          <span v-if="scope.row.cache">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="hidden" label="可见" width="75px">
        <template #default="scope">
          <span v-if="scope.row.hidden">否</span>
          <span v-else>是</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期" width="auto" />
    </el-table>

    <!-- 菜单信息编辑框 -->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="dialogTitle" width="580px">
      <el-form ref="form" :model="form" :inline="true" :rules="rules" size="small" label-width="80px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type" size="mini" style="width: 178px">
            <el-radio-button :label="0">目录</el-radio-button>
            <el-radio-button :label="1">菜单</el-radio-button>
            <el-radio-button :label="2">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type !== 2" label="菜单图标" prop="icon">
          <el-popover
            placement="bottom-start"
            width="450"
            trigger="click"
            @show="$refs['iconSelect'].reset()"
          >
            <IconSelect ref="iconSelect" @selected="selected" />
            <el-input slot="reference" v-model="form.icon" style="width: 450px;" placeholder="点击选择图标" readonly>
              <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item v-show="form.type !== 2" label="外链菜单" prop="iFrame">
          <el-radio-group v-model="form.iFrame" size="mini">
            <el-radio-button label="true">是</el-radio-button>
            <el-radio-button label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type === 1" label="菜单缓存" prop="cache">
          <el-radio-group v-model="form.cache" size="mini">
            <el-radio-button label="true">是</el-radio-button>
            <el-radio-button label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.type !== 2" label="是否可见" prop="hidden">
          <el-radio-group v-model="form.hidden" size="mini">
            <el-radio-button label="false">是</el-radio-button>
            <el-radio-button label="true">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="菜单标题" prop="title">
          <el-input v-model="form.title" :style=" form.type === 0 ? 'width: 450px' : 'width: 178px'" placeholder="菜单标题" />
        </el-form-item>
        <el-form-item v-if="form.type === 2" label="按钮名称" prop="title">
          <el-input v-model="form.title" placeholder="按钮名称" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="form.type !== 0" label="权限标识" prop="permission">
          <el-input v-model="form.permission" :disabled="form.iFrame === true" placeholder="权限标识" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="form.type !== 2" label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="路由地址" style="width: 178px;" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="sort">
          <el-input-number v-model.number="form.sort" :min="0" :max="999" controls-position="right" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-show="form.iFrame !== true && form.type === 1" label="组件名称" prop="name">
          <el-input v-model="form.name" style="width: 178px;" placeholder="匹配组件内Name字段" />
        </el-form-item>
        <el-form-item v-show="form.iFrame !== true && form.type === 1" label="组件路径" prop="component">
          <el-input v-model="form.component" style="width: 178px;" placeholder="组件路径" />
        </el-form-item>
        <el-form-item label="上级类目">
          <treeselect
            v-model="form.pid"
            :load-options="loadMenuList"
            :options="menuList"
            style="width: 450px;"
            placeholder="请选择上级类目"
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
import { getMenu, page, add, update, del, childList, superiorMenuList } from '@/api/system/menu'
import IconSelect from '@/components/IconSelect'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'ProjectMenu',
  components: {
    IconSelect,
    Treeselect
  },
  data() {
    return {
      loading: false,
      permission: {
        add: ['menu:add'],
        edit: ['menu:edit'],
        del: ['menu:del']
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined
      },
      tableData: [],
      selectData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      menuList: [],
      form: {},
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ]
      },
      buttonLoading: false
    }
  },
  created() {
    this.queryPage()
    this.menuList.splice(0)
    this.menuList.push({ id: 0, label: '顶级类目', children: null })
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
        num: 1,
        size: 10,
        name: undefined,
        dataScope: undefined
      }
      this.queryPage()
    },
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: undefined
      }
      this.form = {
        id: null,
        title: null,
        sort: 999,
        path: null,
        component: null,
        name: null,
        iFrame: false,
        pid: 0,
        icon: null,
        cache: false,
        hidden: false,
        type: 0,
        permission: null
      }
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
      this.dialogTitle = '新增菜单'
    },
    handleUpdate() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '修改菜单'
      getMenu(this.selectData[0].id).then(res => {
        this.form = { ...res }
      })
      // treeSelect根节点id处理
      // if (!this.form.pid) {
      //   this.form.pid = 0
      // } else {
      //   this.getSuperiorMenuList(this.form.pid)
      // }
    },
    loadMenu(tree, treeNode, resolve) {
      setTimeout(() => {
        childList(tree.id).then(res => {
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
              this.dialogFormVisible = false
              this.queryPage()
              this.buttonLoading = false
            })
          } else {
            add(this.form).then(() => {
              ElementUI.Message.success('保存成功')
              this.dialogFormVisible = false
              this.queryPage()
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
        ElementUI.Message.warning('请选择要删除的菜单！')
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
        this.queryPage()
      })
    },
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    // 懒加载菜单树
    loadMenuList({ action, parentNode, callback }) {
      if (action === 'LOAD_CHILDREN_OPTIONS') {
        childList(parentNode.id).then(res => {
          parentNode.children = res.records.map(function(obj) {
            if (!obj.leaf) {
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
    // 根据id查询同级与上级菜单列表
    getSuperiorMenuList(id) {
      superiorMenuList(id).then(res => {
        const children = res.records.map(function(obj) {
          if (!obj.leaf && !obj.children) {
            obj.children = null
          }
          return obj
        })
        this.menuList.splice(0)
        this.menuList = [{ id: 0, label: '顶级类目', children: children }]
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
  height: 30px;
  line-height: 30px;
}
</style>
