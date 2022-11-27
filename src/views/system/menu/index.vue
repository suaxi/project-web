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

  </div>
</template>

<script>
import CRUD, {presenter} from "@/components/Crud/crud";
import CrudOperation from "@/components/Crud/CRUD.operation";
import RrOperation from "@/components/Crud/RR.operation";
import {getChildListByPid} from "@/api/menu";

export default {
  name: "ProjectMenu",
  components: {
    RrOperation,
    CrudOperation
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
    })
  },
  data() {
    return {
      dialogTitle: '',
      dialogFormVisible: false,
      permission: {
        add: ['menu:add'],
        edit: ['menu:edit'],
        del: ['menu:del']
      }
    }
  },
  methods: {
    getMenus(tree, treeNode, resolve) {
      setTimeout(() => {
        getChildListByPid(tree.id).then(res => {
          resolve(res.records)
        })
      }, 100)
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