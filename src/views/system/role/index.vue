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
        v-model="queryParams.dataScope"
        clearable
        size="small"
        placeholder="请选择权限范围"
        class="filter-item"
        style="width: 200px"
        @change="queryPage"
      >
        <el-option
          v-for="(item, index) in dataScopeList"
          :key="index"
          :label="item"
          :value="item"
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

    <el-row :gutter="15">
      <!-- 角色管理 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">角色列表</span>
          </div>
          <el-table
            v-loading="loading"
            :data="tableData"
            style="width: 100%"
            highlight-current-row
            @selection-change="handleSelectionChange"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column fixed prop="name" label="名称" width="150" />
            <el-table-column prop="dataScope" label="数据权限" width="120" />
            <el-table-column prop="level" label="角色级别" width="120" />
            <el-table-column prop="description" label="描述" width="200" />
            <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建时间" />
          </el-table>
          <!-- 分页 -->
          <Pagination
            :page-num.sync="queryParams.pageNum"
            :page-size.sync="queryParams.pageSize"
            :total="total"
            @page="queryPage"
          />
        </el-card>
      </el-col>

      <!-- 菜单授权 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
              <span class="role-span">菜单分配</span>
            </el-tooltip>
            <el-button
              v-permission="['roles:edit']"
              :disabled="!showButton"
              :loading="menuLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveRoleMenu"
            >保存
            </el-button>
          </div>
          <el-tree
            ref="menu"
            lazy
            :default-checked-keys="menuIds"
            :load="loadMenu"
            :props="props"
            show-checkbox
            check-strictly
            accordion
            node-key="id"
            @check="handleMenuCheck"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 角色信息编辑弹窗 -->
    <el-dialog
      append-to-body
      :title="dialogTitle"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      width="520px"
    >
      <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" style="width: 145px;" />
        </el-form-item>
        <el-form-item label="角色级别" prop="level">
          <el-input-number v-model.number="form.level" :min="1" controls-position="right" style="width: 145px;" />
        </el-form-item>
        <el-form-item label="数据范围" prop="dataScope">
          <el-select v-model="form.dataScope" style="width: 145px" placeholder="请选择数据范围" @change="changeScope">
            <el-option
              v-for="item in dataScopeList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.dataScope === '自定义'" label="数据权限">
          <treeselect
            v-model="deptDataList"
            :load-options="loadDept"
            :options="deptList"
            multiple
            style="width: 380px"
            placeholder="请选择部门"
          />
        </el-form-item>
        <el-form-item label="描述信息" prop="description">
          <el-input v-model="form.description" style="width: 380px;" rows="5" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { childList as getDeptChildList, superiorList as getDeptSuperiorList } from '@/api/system/dept'
import ElementUI from 'element-ui'
import { childList as getMenuChildList, child as getMenuChild } from '@/api/system/menu'
import { getRole, page, add, update, del, updateRoleMenu } from '@/api/system/role'
import Pagination from '@/components/Crud/Pagination'

export default {
  name: 'ProjectRole',
  components: {
    Pagination,
    Treeselect
  },
  data() {
    return {
      loading: false,
      permission: {
        add: ['roles:add'],
        edit: ['roles:edit'],
        del: ['roles:del']
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        dataScope: undefined
      },
      total: 0,
      dataScopeList: ['全部', '本级', '自定义'],
      tableData: [],
      selectData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      // 树形下拉框options
      deptList: [],
      deptDataList: [],
      form: {},
      rules: {
        name: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        dataScope: [
          { required: true, message: '请选择数据范围', trigger: 'blur' }
        ]
        // deptDataList: [
        //   { required: true, message: '请选择数据权限', trigger: 'blur' }
        // ]
      },
      // 树形选择内置属性对照名称
      props: { children: 'children', label: 'label', isLeaf: 'leaf' },
      menuList: [],
      menuIds: [],
      currentId: 0,
      menuLoading: false,
      showButton: false
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
        name: undefined,
        dataScope: undefined
      }
      this.queryPage()
    },
    resetForm() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        dataScope: undefined
      }
      this.total = 0
      this.form = {
        id: undefined,
        name: undefined,
        level: undefined,
        description: undefined,
        dataScope: undefined
      }
      this.deptDataList = []
    },
    handleSelectionChange(rows) {
      this.selectData = rows
    },
    handleAdd() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '新增角色'
    },
    handleUpdate() {
      this.resetForm()
      this.dialogFormVisible = true
      this.dialogTitle = '修改角色'
      getRole(this.selectData[0].id).then(res => {
        this.form = { ...res }
      })

      if (this.form.dataScope === '自定义') {
        // 自定义权限范围部门树回显
        this.deptDataList = this.form.depts.map(dept => dept.id)
        getDeptSuperiorList(this.deptDataList).then(res => {
          const depts = res.records
          this.buildDepts(depts)
          this.deptList = depts
        })
      }
    },
    // 刷新列表后调用钩子函数执行apply
    // [CRUD.HOOK.afterRefresh]() {
    //   this.$refs.menu.setCheckedKeys([])
    // },
    // 提交前表单校验
    // [CRUD.HOOK.afterValidateCU]() {
    //   if (this.form.dataScope === '自定义' && this.deptDataList.length === 0) {
    //     this.$message({
    //       message: '自定义数据权限不能为空',
    //       type: 'warning'
    //     })
    //     return false
    //   }
    //   return true
    // },
    // [CRUD.HOOK.setOperation](crud, operation) {
    //   // 清空缓存
    //   this.form = {}
    //
    //   if (operation === 'post') {
    //     this.dialogTitle = '新增角色'
    //     this.$store.commit('SET_OPERATION', operation)
    //   } else if (operation === 'put') {
    //     this.form = { ...this.crud.selectData[0] }
    //     this.$store.commit('SET_OPERATION', operation)
    //     if (this.crud.selectData[0].dataScope === '自定义') {
    //       // 自定义权限范围部门树回显
    //       this.deptDataList = this.form.depts.map(dept => dept.id)
    //       getDeptSuperiorList(this.deptDataList).then(res => {
    //         const depts = res.records
    //         this.buildDepts(depts)
    //         this.deptList = depts
    //       })
    //     }
    //     this.dialogTitle = '编辑角色'
    //   } else if (operation === 'delete') {
    //     const ids = this.crud.selectData.map(item => item.id)
    //     del(ids).then(() => {
    //       ElementUI.Message.success('删除成功')
    //       this.crud.delChangePage()
    //       this.crud.refresh()
    //     })
    //   }
    //   if (operation !== 'delete') {
    //     this.dialogFormVisible = true
    //   }
    // },
    // 父级部门添加下拉箭头
    buildDepts(depts) {
      depts.forEach(dept => {
        if (dept.children) {
          this.buildDepts(dept.children)
        }
        if (dept.hasChildren && !dept.children) {
          dept.children = null
        }
      })
    },
    changeScope() {
      if (this.form.dataScope === '自定义') {
        this.getDeptList()
      }
    },
    // 懒加载部门树
    loadDept({ action, parentNode, callback }) {
      if (action === 'LOAD_CHILDREN_OPTIONS') {
        getDeptChildList({ pid: parentNode.id }).then(res => {
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
    // 获取部门树据
    getDeptList() {
      getDeptChildList({ pid: null }).then(res => {
        this.deptList = res.records.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    submit() {
      if (this.form.dataScope === '自定义' && this.deptDataList.length === 0) {
        ElementUI.Message.warning('自定义数据权限不能为空！')
        return
      } else {
        this.form.depts = this.deptDataList.map(item => {
          return { id: item }
        })
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id) {
            update(this.form).then(() => {
              ElementUI.Message.success('修改成功')
              this.dialogFormVisible = false
              this.queryPage()
            })
          } else {
            add(this.form).then(() => {
              ElementUI.Message.success('保存成功')
              this.dialogFormVisible = false
              this.queryPage()
            })
          }
        } else {
          return false
        }
      })
    },
    handleDelete() {
      if (this.selectData.length === 0) {
        ElementUI.Message.warning('请选择要删除的角色！')
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
    // 加载菜单列表
    loadMenu(node, resolve) {
      const pid = node.level === 0 ? 0 : node.data.id
      getMenuChildList(pid).then(res => {
        this.menuList = res.records
        resolve(this.menuList)
      })
    },
    // 根据选中行加载对应的菜单权限列表
    handleCurrentChange(val) {
      if (val) {
        this.$refs.menu.setCheckedKeys([])
        this.menuIds = []
        // 当前角色id
        this.currentId = val.id
        val.menus.forEach(menu => {
          this.menuIds.push(menu.id)
        })
        this.showButton = true
      } else {
        this.showButton = false
      }
    },
    handleMenuCheck(menu) {
      // 点击复选框时根据id查询子级菜单（包含自身）
      getMenuChild(menu.id).then(res => {
        // 判断当前id是否在menuIds中，存在则删除（取消选中），反之添加
        if (this.menuIds.indexOf(menu.id) !== -1) {
          for (let i = 0; i < res.records.length; i++) {
            const index = this.menuIds.indexOf(res.records[i].id)
            if (index !== -1) {
              this.menuIds.splice(index, 1)
            }
          }
        } else {
          for (let i = 0; i < res.records.length; i++) {
            const index = this.menuIds.indexOf(res.records[i].id)
            if (index === -1) {
              this.menuIds.push(res.records[i].id)
            }
          }
        }
        this.$refs.menu.setCheckedKeys(this.menuIds)
      })
    },
    saveRoleMenu() {
      this.menuLoading = true
      const role = { id: this.currentId, menus: [] }
      // role.menuIds添加已选中的key
      this.menuIds.forEach(function(id) {
        const menu = { id }
        role.menus.push(menu)
      })
      updateRoleMenu(role).then(() => {
        ElementUI.Message.success('保存成功')
        this.menuLoading = false
        this.queryPage()
      }).catch(() => {
        this.menuLoading = false
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.role-span {
  font-weight: bold;
  color: #303133;
  font-size: 15px;
}
</style>
