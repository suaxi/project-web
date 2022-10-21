<template>
  <div>
    <h2>主页</h2>
    <el-button @click.native.prevent="getUserInfo">获取用户信息</el-button>
    <el-button @click.native.prevent="logout">退出</el-button>
  </div>
</template>

<script>
import {removeToken} from "@/utils/auth";
import ElementUI from "element-ui";

export default {
  name: "MyHome",
  methods: {
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