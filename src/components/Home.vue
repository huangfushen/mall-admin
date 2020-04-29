<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/star.png" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="loginout()">退出登录</el-button>
    </el-header>
    <el-container>
      <!-- 侧边区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse()">|||</div>
        <el-menu
          unique-opened
          background-color="#6badf5"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState(subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[subItem.id]"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuList: '',
      iconsObj: {
        1: 'iconfont icon-user',
        2: 'iconfont icon-users',
        3: 'iconfont icon-baobiao',
        4: 'iconfont icon-check-circle',
        5: 'iconfont icon-lock-fill'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    async loginout () {
      const { data: res } = await this.$http.get('user/loginout')
      if (res.rcode === 5007 || res.rcode === 2003) {
        this.$message.success('退出登录成功')
        window.sessionStorage.clear()
        this.$router.push('/login')
      } else {
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menu/getMenulist')
      if (res.rcode === 2001) {
        this.menuList = res.data.menuList
      } else if (res.rcode === 5007 || res.rcode === 5001) {
        this.$message.error('token已过期,请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      } else {
        this.$message.error('获取菜单列表失败,请重试')
      }
    },
    // 点击按钮切换菜单折叠
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接激活状态
    saveNavState (activePath) {
      this.activePath = activePath
      window.sessionStorage.setItem('activePath', activePath)
    }
  },
  components: {}
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #71b2f8;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: #1296db;
  font-size: 20px;
  > div {
    display: flex;
    align-content: center;
    span {
      margin-left: 10px;
      margin-top: 10px;
    }
  }
}
.el-aside {
  background-color: #6badf5;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eee;
}
.home-container {
  height: 100%;
}
.iconfont {
  margin-right: 7px;
}
.toggle-button {
  background-color: #6bacd0;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
