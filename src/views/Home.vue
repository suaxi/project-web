<template>
  <div>
    <h2>主页</h2>
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
      this.$request.get('http://localhost:8088/auth/logout').then(res => {
        if (res.code === 200) {
          removeToken()
          this.$router.replace('/')
          ElementUI.Message.success(res.message)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>