<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="crud.params.title" clearable size="small" placeholder="请输入名称" style="width: 200px;"
                class="filter-item" @keyup.enter.native="crud.toQuery"/>
      <RrOperation/>
      <!-- 增删改查按钮 -->
      <CrudOperation :permission="permission"/>
    </div>

    <el-table
        ref="table"
        v-loading="crud.loading"
        lazy
        :load="getMenus"
        :data="crud.tableData"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        row-key="id"
        @select="crud.selectChange"
        @select-all="crud.selectAllChange"
        @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" label="菜单标题" width="auto" prop="title" />
      <el-table-column prop="icon" label="图标" align="center" width="60px">
        <template v-slot="scope">
          <svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />
        </template>
      </el-table-column>
      <el-table-column prop="menuSort" align="center" label="排序">
        <template v-slot="scope">
          {{ scope.row.sort }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="permission" label="权限标识" />
      <el-table-column :show-overflow-tooltip="true" prop="component" label="组件路径" />
      <el-table-column prop="iFrame" label="外链" width="75px">
        <template v-slot="scope">
          <span v-if="scope.row.iFrame">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="cache" label="缓存" width="75px">
        <template v-slot="scope">
          <span v-if="scope.row.cache">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="hidden" label="可见" width="75px">
        <template v-slot="scope">
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
        <el-form-item label="上级类目" prop="pid">
          <treeselect
              v-model="form.pid"
              :options="menus"
              :load-options="loadMenuList"
              style="width: 450px;"
              placeholder="请选择上级类目"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="updateMenu(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import CRUD, {presenter} from "@/components/Crud/crud";
import CrudOperation from "@/components/Crud/CRUD.operation";
import RrOperation from "@/components/Crud/RR.operation";
import {getChildListByPid} from "@/api/menu";
import IconSelect from "@/components/IconSelect";
import treeselect from "@riophae/vue-treeselect";

export default {
  name: "ProjectMenu",
  components: {
    RrOperation,
    CrudOperation,
    IconSelect,
    treeselect
  },
  cruds() {
    return CRUD({title: '菜单', url: '/menu/queryPage'})
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
    });
    this.menus.splice(0);
    this.menus.push({ id: 0, label: '顶级类目', children: null })
  },
  data() {
    return {
      dialogTitle: '',
      dialogFormVisible: false,
      permission: {
        add: ['menu:add'],
        edit: ['menu:edit'],
        del: ['menu:del']
      },
      form: {},
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ]
      },
      menus: [],
      buttonLoading: false,
    }
  },
  methods: {
    getMenus(tree, treeNode, resolve) {
      setTimeout(() => {
        getChildListByPid(tree.id).then(res => {
          resolve(res.records)
        })
      }, 100)
    },
    [CRUD.HOOK.setOperation](crud, operation) {
      //清空缓存
      this.form = {
        id: null,
        title: null,
        sort: 999,
        path: null,
        component: null,
        name: null,
        iFrame: false,
        roles: [],
        pid: 0,
        icon: null,
        cache: false,
        hidden: false,
        type: 0,
        permission: null
      };

      if (operation === 'post') {
        this.dialogTitle = '新增菜单';
        this.$store.commit('SET_OPERATION', operation);
      } else if (operation === 'put') {
        this.dialogTitle = '编辑菜单';
        this.form = {...this.crud.selectData[0]}
        this.$store.commit('SET_OPERATION', operation)
      } else if (operation === 'delete') {
        let ids = this.crud.selectData.map(item => item.id)
      }
      if (operation !== 'delete') {
        this.dialogFormVisible = true
      }
    },
    //选择图标
    selected(name) {
      this.form.icon = name
    },
    //懒加载菜单树
    loadMenuList({action, parentNode, callback}) {
      if (action === 'LOAD_CHILDREN_OPTIONS') {
        getChildListByPid(parentNode.id).then(res => {
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
    updateMenu(data) {
      let operation = this.$store.state.operation;
      this.$request({
        url: 'menu',
        method: operation,
        data
      }).then(() => {
        this.$message.success('操作成功');
        this.dialogFormVisible = false;
        this.crud.refresh()
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