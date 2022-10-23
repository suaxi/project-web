<template>
  <div style="height: 100%">
    <el-container style="height: 100%">
      <el-aside width="205px">
        <el-menu text-color="#bfcbd9" class="sidebar-container">
          <el-submenu v-for="item in menuList" :index="item.name" :key="item.name">
            <template slot="title">{{ item.meta.title }}</template>
            <el-menu-item v-for="child in item.children" :index="child.name" :key="child.name"
                          style="padding-left: 5px">
              <template slot="title">{{ child.meta.title }}</template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header style="text-align: right">
          <el-dropdown>
            <i class="el-icon-setting" style="margin: 15px">
              孙笑川
            </i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item @click.native.prevent="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-header>
        <el-main>
          <el-table
              ref="singleTable"
              :data="tableData"
              highlight-current-row
              style="width: 100%">
            <el-table-column
                type="index"
                width="50">
            </el-table-column>
            <el-table-column
                property="date"
                label="日期"
                width="120">
            </el-table-column>
            <el-table-column
                property="name"
                label="姓名"
                width="120">
            </el-table-column>
            <el-table-column
                property="address"
                label="地址">
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import {removeToken} from "@/utils/auth";
import ElementUI from "element-ui";

export default {
  name: "MyHome",
  created() {
    this.getMenus()
  },
  data() {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      menuList: []
    }
  },
  methods: {
    getMenus() {
      this.$request.get('/api/menu/getUserRouters').then(res => {
        this.menuList = res.data;
      })
    },
    logout() {
      this.$request.get('/api/auth/logout').then(res => {
        if (res.code === 200) {
          removeToken()
          this.$router.replace('/')
          ElementUI.Message.success(res.message)
        }
      })
    },
    getUserInfo() {
      this.$request.get('/api/user/getUserInfo').then(res => {
        console.log('用户信息', res.data)
      })
    }
  }
}
</script>

<style scoped>

</style>