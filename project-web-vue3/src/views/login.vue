<template>
  <div class="login" :style="'background-image:url(' + Background + ');'">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-position="left"
      label-width="0px"
      class="login-form"
    >
      <h3 class="title">Project Web Vue3</h3>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          show-password
          @keyup.enter="handleLogin"
        >
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" />
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin: 0 0 25px 0"> 记住我 </el-checkbox>
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="default"
          type="primary"
          style="width: 100%"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import Background from '@/assets/images/background.jpg'
import { encrypt } from '@/utils/rsaEncrypt'
import Cookies from 'js-cookie'
import Config from '@/settings'
import { captcha } from '@/api/login'
import { onMounted, reactive, ref } from 'vue'
import useUserStore from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { Base64 } from 'js-base64'

const userStore = useUserStore()
const router = useRouter()
const loginFormRef = ref(null)

const loginForm = reactive({
  username: 'admin',
  password: Base64.encode('123456'),
  code: '',
  rememberMe: false,
  uuid: ''
})

const loginRules = reactive({
  username: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
  password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
  code: [{ required: true, trigger: 'blur', message: '验证码不能为空' }]
})

const codeUrl = ref('')

const loading = ref(false)

const cookiePass = ref('')

const getCookie = () => {
  const username = Cookies.get('username')
  let password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  // 保存cookie里面的加密后的密码
  cookiePass.value = password === undefined ? '' : password
  password = password === undefined ? loginForm.password : password
  loginForm.username = username === undefined ? loginForm.username : username
  loginForm.password = Base64.decode(password)
  loginForm.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe)
  loginForm.code = ''
}

const getCode = () => {
  captcha().then((res) => {
    codeUrl.value = res.img
    loginForm.uuid = res.uuid
  })
}

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      // 校验通过执行登录
      const user = {
        username: loginForm.username,
        password: loginForm.password,
        rememberMe: loginForm.rememberMe,
        code: loginForm.code,
        uuid: loginForm.uuid
      }
      if (user.password !== Cookies.get()) {
        user.password = loginForm.password
      }

      if (loginForm.rememberMe) {
        Cookies.set('username', user.username, { expires: Config.passwordExpires })
        Cookies.set('password', Base64.encode(user.password), { expires: Config.passwordExpires })
        Cookies.set('rememberMe', user.rememberMe, { expires: Config.passwordExpires })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      loading.value = true
      userStore
        .login({
          ...user,
          password: encrypt(user.password)
        })
        .then(() => {
          loading.value = false
          router.push('/')
        })
        .catch(() => {
          loading.value = false
          getCode()
        })
    } else {
      return false
    }
  })
}

onMounted(() => {
  getCode()
  getCookie()
})
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}

.title {
  margin: 0 auto 30px auto;
  text-align: center;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 385px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 38px;

    input {
      height: 38px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  display: inline-block;
  height: 38px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
</style>
