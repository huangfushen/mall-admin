<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 一级权限渲染 -->
            <el-row
              :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1,i1) in scope.row.childrens"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.childrens"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3) in item2.childrens"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
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
              @click="delRole(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button
                type="warning"
                @click="showSetRightDialog(scope.row)"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
      <!-- 内容主题区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色简介" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <!-- 内容主题区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色简介" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 角色权限分配对话框 -->
    <el-dialog
      title="角色权限分配"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed()"
    >
      <!-- 树形结构 -->
      <el-tree
        :data="rigthList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 内容主题区
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色简介" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>-->
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      rigthList: [],
      defKeys: [],
      roleId: '',
      addDialogVisible: false,
      editDialogVisible: false,
      setRightDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      editForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      treeProps: {
        label: 'authName',
        children: 'childrens'
      },
      // 添加表单的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名长度为 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色简介', trigger: 'blur' },
          { min: 3, max: 16, message: '简介长度在 3 到 16 个字符之间', trigger: 'blur' }
        ]
      },
      // 编辑表单的验证规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名长度为 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色简介', trigger: 'blur' },
          { min: 3, max: 16, message: '简介长度在 3 到 16 个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRoleList()
  },
  components: {

  },
  methods: {
    // 展示添加角色对话框
    showAddDialog () {
      this.addDialogVisible = true
    },
    // 展示角色权限分配对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('role/getRightList')
      if (res.rcode !== 2001) return this.$message.error('获取权限信息失败,请重试!')
      this.rigthList = res.data.rightList
      this.getLeaKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 递归获取三级权限id保存到defkeys中
    getLeaKeys (node, arr) {
      if (!node.childrens) {
        return arr.push(parseInt(node.id))
      }
      node.childrens.forEach(item => {
        this.getLeaKeys(item, arr)
      })
    },
    // 展示修改用户对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('role/getRoleRightById', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2001) return this.$message.error('获取用户信息失败,请重试!')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 重置添加表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 重置修改表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 重置分配权限defKeys
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 权限分配
    async setRight () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idstr = keys.join(',')
      const { data: res } = await this.$http.post('role/setRoleRight', this.$qs.stringify({ rid: this.roleId, pid: idstr }))
      if (res.rcode === 2003) {
        this.setRightDialogVisible = false
        this.$message.success('权限修改成功!')
        this.getRoleList()
      } else {
        this.$message.error('权限修改失败,请重试!')
      }
    },
    // 添加角色操作
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('role/addRole', this.$qs.stringify(this.addForm))
        if (res.rcode === 2002) {
          this.addDialogVisible = false
          this.getRoleList()
          this.$message.success('角色添加成功!')
        } else {
          this.$message.error('角色添加失败,请重试!')
        }
      })
    },
    // 修改角色操作
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('Role/updateRole', this.$qs.stringify(this.editForm))
        if (res.rcode === 2003) {
          this.editDialogVisible = false
          this.getRoleList()
          this.$message.success('角色信息修改成功!')
        } else {
          this.$message.error('角色信息修改失败,请重试!')
        }
      })
    },
    // 删除角色
    async delRole (id) {
      const promiseRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(promiseRes)
      if (promiseRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.get('Role/delRole', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2003) return this.$message.error('删除角色失败,请刷新重试!')
      this.$message.success('删除角色操作成功')
      this.getRoleList()
    },
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await this.$http.get('role/getRoleRightList')
      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      if (res.rcode !== 2001) return this.$message.error('权限信息获取失败，请重试!')
      this.roleList = res.data.roleList
    },
    // 根据id删除权限
    async removeRightById (role, rightId) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色的权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('取消本次删除！')
      }
      const { data: res } = await this.$http.get('role/delRoleRight', {
        params: {
          rid: role.id,
          pid: rightId
        }
      })
      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      // console.log(res)
      if (res.rcode !== 2003) return this.$message.error('删除权限操作失败，请重试!')
      role.childrens = res.data.roleAuth
    }
  }
}
</script>

<style lang="less" scoped >
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
