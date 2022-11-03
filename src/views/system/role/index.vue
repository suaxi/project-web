<template>
  <div>
    <div class="head-container">
      <!--增删改查按钮-->
      <div class="crud-opts">
      <span class="crud-opts-left">
           <!--左侧插槽-->
           <slot name="left"/>
           <el-button
               class="filter-item"
               size="mini"
               type="primary"
               icon="el-icon-plus"
               v-permission="['roles:add']"
               @click="setOperation('post')"
           >
             新增
           </el-button>
           <el-button
               class="filter-item"
               size="mini"
               type="success"
               icon="el-icon-edit"
               v-permission="['roles:edit']"
           >
             修改
           </el-button>
           <el-button
               slot="reference"
               class="filter-item"
               type="danger"
               icon="el-icon-delete"
               size="mini"
               v-permission="['roles:del']"
           >
             删除
           </el-button>
           <el-button
               class="filter-item"
               size="mini"
               type="warning"
               icon="el-icon-download"
           >导出</el-button>
        <!--右侧-->
           <slot name="right"/>
        </span>
        <el-button-group class="crud-opts-right">
          <el-button
              size="mini"
              plain
              type="info"
              icon="el-icon-search"
          />
          <el-button
              size="mini"
              icon="el-icon-refresh"
          />
          <el-popover
              placement="bottom-end"
              width="150"
              trigger="click"
          >
            <el-button
                slot="reference"
                size="mini"
                icon="el-icon-s-grid"
            >
              <i
                  class="fa fa-caret-down"
                  aria-hidden="true"
              />
            </el-button>
            <el-checkbox
            >
              全选
            </el-checkbox>
          </el-popover>
        </el-button-group>
      </div>
    </div>
    <el-table
        :data="tableData"
        style="width: 100%">
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
    <!--角色信息编辑弹窗-->
    <el-dialog :visible.sync="dialogFormVisible" :close-on-click-modal="false" append-to-body width="520px">
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
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRole(form)">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {getDeptList} from "@/api/dept";
import ElementUI from "element-ui";

export default {
  name: "ProjectRole",
  components: {Treeselect},
  created() {
    this.getRoleList();
    this.$store.dispatch('GetUserInfo').then(() => {

    })
    //页面加载时读取sessionStorage中的状态信息，解决页面刷新vuex状态清空的问题
    if (sessionStorage.getItem('store')) {
      this.$store.replaceState(JSON.parse(sessionStorage.getItem('store')))
    }
    //页面刷新时将vuex中的信息保存到sessionStorage中
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('store', JSON.stringify(this.$store.state))
    })
  },
  data() {
    return {
      selectData: [],
      tableData: [],
      dialogFormVisible: false,
      dataScopeList: ['全部', '本级', '自定义'],
      //树形下拉框options
      deptList: [],
      //树形下拉框选中的数据
      deptDataList: [],
      form: {
        name: '',
        dataScope: '',
        description: '测试角色新增',
        level: 3,
        dept: []
      }
    }
  },
  methods: {
    getRoleList() {
      this.$request.get('role/queryPage').then(res => {
        this.tableData = res.records
      })
    },
    setOperation(operation) {
      if (operation === 'post') {
        this.dialogFormVisible = true;
        this.$store.commit('SET_OPERATION', operation)
      }
    },
    changeScope() {
      if (this.form.dataScope === '自定义') {
        this.getDeptList();
      }
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
      let operation = this.$store.state.operation
      //数组对象转ids
      data.dept = this.deptDataList.map(item => item.value)
      this.$request({
        url: '/role',
        method: operation,
        data
      }).then(() => {
          ElementUI.Message.success('操作成功');
          this.dialogFormVisible = false;
          this.getRoleList()
      })
    }
  }
}
</script>

<style scoped>

</style>