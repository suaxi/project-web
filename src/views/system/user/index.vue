<template>
  <div>
    <div class="head-container">
      <!--增删改查按钮-->
      <CrudOperation :permission="permission"></CrudOperation>
    </div>
    <el-table v-loading="crud.loading"
              :data="crud.tableData"
              style="width: 100%"
              highlight-current-row
              @current-change="handleCurrentChange"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column fixed prop="username" label="用户名" width="150"></el-table-column>
      <el-table-column prop="nickName" label="昵称" width="120"></el-table-column>
      <el-table-column prop="sex" label="性别" width="120"></el-table-column>
      <el-table-column prop="phone" label="电话" width="200"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="deptName" label="部门" width="120"></el-table-column>
      <el-table-column prop="enabled" label="状态" width="120">
        <template v-slot="scope">
          <el-switch ref="enabled" v-model="scope.row.enabled"></el-switch>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建日期" width="200"></el-table-column>
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
import CRUD, {presenter} from "@/components/Crud/crud";
import CrudOperation from "@/components/Crud/CRUD.operation";

export default {
  name: "ProjectUser",
  components: {
    CrudOperation
  },
  cruds() {
    return CRUD({title: '用户', url: '/user/queryPage'})
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
      dialogFormVisible: false,
      dialogTitle: '',
      permission: {
        add: ['user:add'],
        edit: ['user:edit'],
        del: ['user:del']
      },
      user_status: [{label: '激活', value: true}, {label: '禁用', value: false}],
      props: {children: 'children', label: 'label', isLeaf: 'leaf'},
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
    handleCurrentChange(selectRow) {
      if (!selectRow) {
        return
      }
      this.mapForm(selectRow);
      this.$request.put('/user', this.form).then(() => {
        this.crud.refresh()
      })
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
    //选中某一行时
    handleSelectionChange(rows) {
      this.crud.selectData = rows
    },
    //新增、修改、删除
    [CRUD.HOOK.setOperation](crud, operation) {
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
        this.mapForm(this.crud.selectData[0])
      } else {
        this.dialogTitle = '新增用户'
      }
      //修改不打开编辑弹框
      this.dialogFormVisible = operation !== 'delete';
      this.$store.commit('SET_OPERATION', operation)
      if (operation !== 'delete') {
        this.getRoleAndJobInfo();
      } else {
        this.crud.delChangePage();
        this.updateUser(this.crud.selectData.map(item => item.id))
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
        this.crud.refresh()
      })
    }
  }
}
</script>

<style scoped>

</style>