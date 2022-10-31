<template>
  <div style="height: 100%">
    <el-container style="height: 100%">
      <el-aside width="205px">
        <el-menu text-color="#bfcbd9" class="sidebar-container" style="text-align: left">
          <el-submenu v-for="item in menuList" :index="item.name" :key="item.name">
            <template slot="title">
              <svg-icon slot="prefix" :icon-class="item.meta.icon"/>
              {{ item.meta.title }}
            </template>
            <el-menu-item v-for="child in item.children" :index="child.name" :key="child.name" @click="selectMenu(item.path, child.path)">
              <template slot="title">
                <svg-icon slot="prefix" :icon-class="child.meta.icon"/>
                {{ child.meta.title }}
              </template>
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
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import ElementUI from "element-ui";

export default {
  name: "ProjectHome",
  created() {
    this.getMenus()
  },
  data() {
    return {
      menuList: []
    }
  },
  methods: {
    selectMenu(path1, path2) {
      this.$router.replace(path1 + '/' + path2).catch(err => err)
    },
    getMenus() {
      this.$request.get('/api/menu/getUserRouters').then(res => {
        this.menuList = res.data;
      })
    },
    logout() {
      this.$store.dispatch('LogOut').then(res => {
        if (res.code === 200) {
          this.$router.replace('/login')
          ElementUI.Message.success(res.message)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>