<template>
  <div>
    <div class="head-container">
      <!--增删改查按钮-->
      <CrudOperation></CrudOperation>
    </div>

    <el-row :gutter="15">

      <!--角色管理-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">角色列表</span>
          </div>
          <el-table
              v-loading="crud.loading"
              :data="crud.tableData"
              style="width: 100%"
              highlight-current-row
              @selection-change="handleSelectionChange"
              @current-change="handleCurrentChange">
            <el-table-column
                type="selection"
                width="55">
            </el-table-column>
            <el-table-column
                fixed
                prop="name"
                label="名称"
                width="150">
            </el-table-column>
            <el-table-column
                prop="dataScope"
                label="数据权限"
                width="120">
            </el-table-column>
            <el-table-column
                prop="level"
                label="角色级别"
                width="120">
            </el-table-column>
            <el-table-column
                prop="description"
                label="描述"
                width="200">
            </el-table-column>
            <el-table-column
                :show-overflow-tooltip="true"
                prop="createTime"
                label="创建时间">
            </el-table-column>
          </el-table>
          <!--分页-->
          <el-pagination
              :page-size.sync="crud.page.pageSize"
              :total="crud.page.total"
              :current-page.sync="crud.page.pageNum"
              style="margin-top: 8px;"
              layout="total, prev, pager, next, sizes"
              @size-change="crud.sizeChangeHandler"
              @current-change="crud.pageChangeHandler"
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
                v-if="crud.optShow.edit"
                v-permission="['roles:edit']"
                :disabled="!showButton"
                :loading="menuLoading"
                icon="el-icon-check"
                size="mini"
                style="float: right; padding: 6px 9px"
                type="primary"
                @click="saveMenu"
            >保存
            </el-button>
          </div>
          <el-tree
              ref="menu"
              lazy
              :default-checked-keys="menuIds"
              :load="loadMenuList"
              :props="defaultProps"
              show-checkbox
              check-strictly
              accordion
              node-key="id"
              @check="menuChange"
          />
        </el-card>
      </el-col>
    </el-row>

    <!--角色信息编辑弹窗-->
    <el-dialog append-to-body :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="520px">
      <el-form ref="form" :inline="true" :model="form" size="small" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" style="width: 145px;"/>
        </el-form-item>
        <el-form-item label="角色级别" prop="level">
          <el-input-number v-model.number="form.level" :min="1" controls-position="right" style="width: 145px;"/>
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
        <el-form-item v-if="form.dataScope === '自定义'" label="数据权限" prop="depts">
          <treeselect
              v-model="deptDataList"
              :load-options="loadDeptList"
              :options="deptList"
              multiple
              style="width: 380px"
              placeholder="请选择"
          />
        </el-form-item>
        <el-form-item label="描述信息" prop="description">
          <el-input v-model="form.description" style="width: 380px;" rows="5" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRole(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {getDeptList, getDeptSuperiorList} from "@/api/dept";
import ElementUI from "element-ui";
import {getChild} from "@/api/menu";
import {del} from "@/api/role";
import CRUD, {presenter} from "@/components/Crud/crud";
import CrudOperation from "@/components/Crud/CRUD.operation";

export default {
  name: "ProjectRole",
  components: {
    CrudOperation,
    Treeselect
  },
  cruds() {
    return CRUD({title: '角色', url: '/role/queryPage'})
  },
  mixins: [presenter()],
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
  data() {
    return {
      dialogTitle: '',
      dialogFormVisible: false,
      dataScopeList: ['全部', '本级', '自定义'],
      //树形下拉框options
      deptList: [],
      //树形下拉框选中的数据
      deptDataList: [],
      form: {},
      //树形选择内置属性对照名称
      defaultProps: {children: 'children', label: 'label', isLeaf: 'leaf'},
      menuList: [],
      menuIds: [],
      currentId: 0,
      menuLoading: false,
      showButton: false
    }
  },
  methods: {
    //刷新列表后调用钩子函数执行apply
    [CRUD.HOOK.afterRefresh]() {
      this.$refs.menu.setCheckedKeys([])
    },
    //提交前表单校验
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.dataScope === '自定义' && this.deptDataList.length === 0) {
        this.$message({
          message: '自定义数据权限不能为空',
          type: 'warning'
        });
        return false
      }
      return true
    },
    [CRUD.HOOK.setOperation](operation) {
      //清空缓存
      this.form = {};

      if (operation === 'post') {
        this.dialogTitle = '新增角色';
        this.$store.commit('SET_OPERATION', operation)
      } else if (operation === 'put') {
        this.form = {...this.crud.selectData[0]};
        this.$store.commit('SET_OPERATION', operation);
        if (this.crud.selectData[0].dataScope === '自定义') {
          //自定义权限范围部门树回显
          this.deptDataList = this.form.depts.map(dept => dept.id)
          getDeptSuperiorList(this.deptDataList).then(res => {
            const depts = res.records;
            this.buildDepts(depts);
            this.deptList = depts
          })
        }
        this.dialogTitle = '编辑角色';
      } else if (operation === 'delete') {
        let ids = this.crud.selectData.map(item => item.id)
        del(ids).then(() => {
          ElementUI.Message.success('删除成功');
          this.crud.delChangePage();
          this.crud.refresh()
        })
      }
      if (operation !== 'delete') {
        this.dialogFormVisible = true
      }
    },
    //父级部门添加下拉箭头
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
        this.getDeptList();
      }
    },
    //复选框触发事件
    handleSelectionChange(rows) {
      this.crud.selectData = rows
    },
    //懒加载部门树
    loadDeptList({action, parentNode, callback}) {
      if (action === 'LOAD_CHILDREN_OPTIONS') {
        getDeptList({pid: parentNode.id}).then(res => {
          parentNode.children = res.records.map(function (obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          });
          setTimeout(() => {
            callback()
          }, 200)
        })
      }
    },
    //获取部门树据
    getDeptList() {
      getDeptList({pid: null}).then(res => {
        this.deptList = res.records.map(function (obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    updateRole(data) {
      if (!this[CRUD.HOOK.afterValidateCU]) {
        return
      }
      let operation = this.$store.state.operation
      //数据权限为自定义时，同步保存角色-部门关联数据
      data.depts = this.deptDataList.map(item => {
        return {id: item}
      })
      this.$request({
        url: '/role',
        method: operation,
        data
      }).then(() => {
          ElementUI.Message.success('操作成功');
          this.dialogFormVisible = false;
          this.crud.refresh()
      })
    },
    //加载菜单列表
    loadMenuList(node, resolve) {
      let pid = node.level === 0 ? 0 : node.data.id;
      this.$request.get('/menu/queryChildListByPid', {params: {pid}}).then(res => {
        this.menuList = res.records;
        resolve(this.menuList)
      })
    },
    //根据选中行加载对应的菜单权限列表
    handleCurrentChange(val) {
      if (val) {
        this.$refs.menu.setCheckedKeys([]);
        this.menuIds = [];
        //当前角色id
        this.currentId = val.id;
        val.menus.forEach(menu => {
          this.menuIds.push(menu.id)
        })
        this.showButton = true
      }
    },
    menuChange(menu) {
      //点击复选框时根据id查询子级菜单（包含自身）
      getChild(menu.id).then(res => {
        //判断当前id是否在menuIds中，存在则删除（取消选中），反之添加
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
    saveMenu() {
      this.menuLoading = true;
      const role = {id: this.currentId, menus: []};
      //role.menuIds添加已选中的key
      this.menuIds.forEach(function (id) {
        const menu = {id}
        role.menus.push(menu)
      });
      this.$request.put('/role/menu', role).then(() => {
        ElementUI.Message.success('保存成功');
        this.menuLoading = false;
        this.crud.refresh()
      }).catch(() => {
        this.menuLoading = false;
      })
    }
  }
}
</script>

<style scoped>

</style>