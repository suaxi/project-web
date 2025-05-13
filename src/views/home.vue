<template>
  <div style="height: 100%">
    <el-container style="height: 100%">
      <el-aside width="205px">
        <el-menu :default-active="$route.path" :unique-opened="true" text-color="#bfcbd9" class="sidebar-container" style="text-align: left">
          <el-submenu v-for="item in menuList" :key="item.name" :index="item.name">
            <template #title>
              <svg-icon v-slot="prefix" :icon-class="item.meta.icon" />
              {{ item.meta.title }}
            </template>
            <el-menu-item v-for="child in item.children" :key="child.name" :index="`${item.path}/${child.path}`" @click="selectMenu(item.path, child.path)">
              <template #title>
                <svg-icon v-slot="prefix" :icon-class="child.meta.icon" />
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
              {{ username }}
            </i>
            <el-dropdown-menu #default="dropdown">
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item @click.native.prevent="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

export default {
  name: 'ProjectHome',
  data() {
    return {
      username: this.$store.getters.user.username,
      menuList: []
    }
  },
  created() {
    this.getMenus()
  },
  methods: {
    selectMenu(path1, path2) {
      this.$router.replace(path1 + '/' + path2).catch(err => err)
    },
    getMenus() {
      this.menuList = this.$store.state.menus
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()
      })
    }
  }
}
</script>

<style scoped>

</style>
