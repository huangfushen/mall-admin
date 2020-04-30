<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户数据表格 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="手机号码" prop="telphone"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-value="true"
              inactive-value="false"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
      <!-- 内容主题区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="telphone">
          <el-input v-model="addForm.telphone"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <!-- 内容主题区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="telphone">
          <el-input v-model="editForm.telphone"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 添加表单数据项
      addForm: {
        username: '',
        password: '',
        email: '',
        telphone: ''
      },
      // 修改表单数据项
      editForm: {
        id: '',
        username: '',
        email: '',
        telphone: ''
      },
      userList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度为 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度在 6 到 16 个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        telphone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { min: 11, max: 11, message: '手机号码格式不正确', trigger: 'blur' }
        ]
      },
      // 添加表单的验证规则
      editFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度为 3 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        telphone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { min: 11, max: 11, message: '手机号码格式不正确', trigger: 'blur' }
        ]
      }

    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 展示添加用户对话框
    showAddDialog () {
      this.addDialogVisible = true
    },
    // 重置添加表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 监听pagesize值变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值发生变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 重置修改表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 监听switch状态改变
    async userStateChanged (userInfo) {
      const updateInfo = { mg_state: userInfo.mg_state, id: userInfo.id }
      const { data: res } = await this.$http.post('user/updateUser', this.$qs.stringify(updateInfo))
      if (res.rcode !== 2003) {
        // 状态取反,更新失败前端data值改变
        this.$message.error('修改用户状态失败,请重试!')
        this.userList[userInfo.id].mg_state = !this.userList[userInfo.id].mg_state
      } else {
        this.$message.success('修改用户状态成功!')
      }
    },
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.post('user/getUserList', this.$qs.stringify(this.queryInfo))
      console.log(res)
      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      if (res.rcode !== 2001) return this.$message.error('用户信息获取失败，请重试!')
      this.userList = res.data.userList
      // console.log(this.userList)
      this.total = res.data.total
    },

    // 添加用户操作
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(this)
        if (!valid) return
        const { data: res } = await this.$http.post('User/addUser', this.$qs.stringify(this.addForm))
        if (res.rcode === 2002) {
          this.addDialogVisible = false
          this.getUserList()
          this.$message.success('用户添加成功!')
        } else if (res.rcode === 3001) {
          this.$message.error('用户名重复,换一个试试!')
        } else {
          this.$message.error('用户添加失败,请重试!')
        }
      })
    },
    // 展示修改用户对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('user/getUserById', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2001) return this.$message.error('获取用户信息失败,请重试!')
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(this)
        if (!valid) return
        const { data: res } = await this.$http.post('User/updateUser', this.$qs.stringify(this.editForm))
        if (res.rcode === 2003) {
          this.editDialogVisible = false
          this.getUserList()
          this.$message.success('用户信息修改成功!')
        } else {
          this.$message.error('用户信息修改失败,请重试!')
        }
      })
    },
    // 删除用户
    async delUser (id) {
      const promiseRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(promiseRes)
      if (promiseRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.get('user/deleteUser', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2003) return this.$message.error('删除用户失败,请刷新重试!')
      this.$message.success('删除用户操作成功')
      this.getUserList()
    }
  },
  components: {

  }
}
</script>

<style scoped >
</style>
