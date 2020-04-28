<template>
  <div>
    <el-button type="info" @click="loginout()">退出登录</el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    loginout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  },
  components: {}
}
</script>

<style scoped></style>
