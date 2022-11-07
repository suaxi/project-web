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
              v-permission="['user:add']"
              @click="setOperation('post')"
          >
            新增
          </el-button>
          <el-button
              class="filter-item"
              size="mini"
              type="success"
              icon="el-icon-edit"
              v-permission="['user:edit']"
              @click="setOperation('put')"
              :disabled="selectData.length !== 1"
          >
            修改
          </el-button>
          <el-button
              slot="reference"
              class="filter-item"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="setOperation('delete')"
              :disabled="selectData.length !== 1"
          >
            删除
          </el-button>
          <el-button
              class="filter-item"
              size="mini"
              type="warning"
              icon="el-icon-download"
          >
            导出
          </el-button>
          <!--右侧-->
          <slot name="right"/>
        </span>
        <el-button-group class="crud-opts-right">
          <el-button size="mini" plain type="info" icon="el-icon-search"/>
          <el-button size="mini" icon="el-icon-refresh"/>
          <el-popover placement="bottom-end" width="150" trigger="click">
            <el-button slot="reference" size="mini" icon="el-icon-s-grid">
              <i class="fa fa-caret-down" aria-hidden="true"/>
            </el-button>
            <el-checkbox> 全选</el-checkbox>
          </el-popover>
        </el-button-group>
      </div>
    </div>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column fixed prop="username" label="用户名" width="150"></el-table-column>
      <el-table-column prop="nickName" label="昵称" width="120"></el-table-column>
      <el-table-column prop="sex" label="性别" width="120"></el-table-column>
      <el-table-column prop="phone" label="电话" width="200"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="deptName" label="部门" width="120"></el-table-column>
      <el-table-column prop="enabled" label="状态" width="120">
        <template v-slot>
          <el-switch ref="enabled"></el-switch>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建日期" width="200"></el-table-column>
      <el-table-column prop="operation" label="操作" width="120">
        <template v-slot>
          <el-button type="text" size="small">编辑</el-button>
          <el-button type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <el-pagination
        :page-size.sync="page.pageSize"
        :total="page.total"
        :current-page.sync="page.pageNum"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="sizeChangeHandler"
        @current-change="pageChangeHandler"
    />

    <!-- 用户信息编辑弹框 -->
    <el-dialog append-to-body :title="dialogTitle" :visible.sync="dialogFormVisible" width="680px">
      <el-form :model="form" :inline="true" size="small" label-width="66px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="dept" placeholder="请选择部门" ref="deptSelect">
            <el-option v-model="dept" style="height: max-content;width: 100%;padding: 0">
              <el-tree
                  :props="props"
                  :load="loadDept"
                  lazy
                  style="width: 100%"
                  @node-click="setDept">
              </el-tree>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="jobs" multiple placeholder="请选择岗位" @change="setJob">
            <el-option v-for="item in jobList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex" style="width: 178px">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.enabled">
            <el-radio v-for="item in user_status" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="roles" multiple placeholder="请选择角色" @change="setRole">
            <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser(form)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ElementUI from "element-ui";

export default {
  name: "ProjectUser",
  created() {
    this.getUserList()
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
    this.page.pageNum = 1;
    this.page.pageSize = 10
  },
  data() {
    return {
      loading: false,
      page: {
        //页码
        pageNum: 1,
        //每页数据条数
        pageSize: 10,
        //总数
        total: 0
      },
      selectData: [],
      tableData: [],
      dialogFormVisible: false,
      dialogTitle: '',
      user_status: [{label: '激活', value: true}, {label: '禁用', value: false}],
      props: {
        label: 'name',
        children: 'zones',
        isLeaf: 'leaf',
      },
      deptList: [],
      dept: {},
      jobList: [],
      jobs: [],
      roleList: [],
      roles: [],
      form: {},
    }
  },
  methods: {
    getUserList() {
      let queryParams = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize
      }
      this.loading = true;
      this.$request.get('/user/queryPage', {params: queryParams}).then(res => {
        this.tableData = res.records;
        this.page.total = res.total;
        this.loading = false
      })
    },
    //每页条数改变
    sizeChangeHandler(size) {
      this.page.pageSize = size;
      this.page.pageNum = 1;
      this.getUserList()
    },
    //页数改变
    pageChangeHandler(num) {
      this.page.pageNum = num;
      this.getUserList()
    },
    delChangePage() {
      //删除最后一页的最后一条数据时，或多选删除第二页的数据时，预防页码错误导致请求无数据
      if (this.tableData.length === 1 && this.page.pageSize !== 1) {
        this.page.pageNum -= 1
      }
    },
    //选中行，解除处于disabled状态的按钮
    handleSelectionChange(rows) {
      this.selectData = rows
    },
    //修改时值映射
    mapForm(selectRow) {
      if (selectRow.deptName && selectRow.jobIds && selectRow.roleIds) {
        this.dept = selectRow.deptName
        this.jobs = selectRow.jobIds.split(',').map(item => Number(item));
        this.roles = selectRow.roleIds.split(',').map(item => Number(item));
        this.form = {...selectRow}
      }
    },
    //新增、修改、删除
    setOperation(operation) {
      //清空缓存
      this.dept = {};
      this.jobs = [];
      this.roles = [];
      this.form = {
        sex: '男',
        enabled: false
      };

      if (operation === 'put') {
        this.dialogTitle = '修改用户'
        this.mapForm(this.selectData[0])
      } else {
        this.dialogTitle = '新增用户'
      }
      //修改不打开编辑弹框
      this.dialogFormVisible = operation !== 'delete';
      this.$store.commit('SET_OPERATION', operation)
      if (operation !== 'delete') {
        this.getRoleAndJobInfo();
      } else {
        this.delChangePage();
        this.updateUser(this.selectData.map(item => item.id))
      }
    },
    getRoleAndJobInfo() {
      //角色列表
      this.$request.get('/role/queryList').then(res => {
        this.roleList = res
      });
      //岗位列表
      this.$request.get('/job/queryList').then(res => {
        this.jobList = res
      });
    },
    //部门列表（懒加载）
    loadDept(node, resolve) {
      let pid = node.level === 0 ? null : node.data.id;
      this.$request.get('/dept/queryChildListByPid', {params: {pid}}).then(res => {
        this.deptList = res.records
        resolve(this.deptList)
      })
    },
    setDept(node) {
      this.form.deptId = node.id;
      this.dept = node.name
      this.$refs.deptSelect.visible = false
    },
    setJob() {
      this.form.jobIds = this.jobs.join(',')
    },
    setRole() {
      this.form.roleIds = this.roles.join(',')
    },
    updateUser(data) {
      let operation = this.$store.state.operation;
      this.$request({
        url: '/user',
        method: operation,
        data
      }).then(() => {
        ElementUI.Message.success('操作成功');
        this.dialogFormVisible = false;
        this.getUserList()
      })
    }
  }
}
</script>

<style scoped>

</style>