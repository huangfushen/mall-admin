<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片列表 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getRightList()">
            <el-button slot="append" icon="el-icon-search" @click="getRightList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加权限</el-button>
        </el-col>
      </el-row>
      <el-table :data="rightList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
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
              @click="delRight(scope.row.id)"
            ></el-button>
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
    <!-- 添加权限对话框 -->
    <el-dialog title="添加权限" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
      <!-- 内容主题区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="权限名称" prop="authName">
          <el-input v-model="addForm.authName"></el-input>
        </el-form-item>
        <el-form-item label="权限路径" prop="path">
          <el-input v-model="addForm.path"></el-input>
        </el-form-item>
        <el-form-item label="权限等级" prop="level">
          <el-select
            v-model="addForm.level"
            placeholder="请选择"
            size="medium"
            @change="addLevelChange(addForm.level)"
          >
            <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.level == 1 || addForm.level == 2" label="父权限" prop="father">
          <el-select v-model="addForm.father" placeholder="请选择" size="medium">
            <el-option
              v-for="item in fatherMenu"
              :key="item.id"
              :label="item.authName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权重值" prop="order">
          <el-input v-model="addForm.order"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRight()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑权限对话框 -->
    <el-dialog
      title="编辑权限"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <!-- 内容主题区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="权限名称" prop="authName">
          <el-input v-model="editForm.authName"></el-input>
        </el-form-item>
        <el-form-item label="权限路径" prop="path">
          <el-input v-model="editForm.path"></el-input>
        </el-form-item>
        <el-form-item label="权限等级" prop="level">
          <el-select
            v-model="editForm.level"
            placeholder="请选择"
            size="medium"
            @change="editLevelChange(editForm.level)"
          >
            <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.level == 1 || editForm.level == 2" label="父权限" prop="father">
          <el-select v-model="editForm.father" placeholder="请选择" size="medium">
            <el-option
              v-for="item in fatherMenu"
              :key="item.id"
              :label="item.authName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.level !=2" label="子权限" prop="children">
          <!-- <el-input v-model="editForm.children"></el-input> -->
          <el-select
            v-model="editForm.children"
            placeholder="请选择"
            size="medium"
            multiple
            collapse-tags
            filterable
          >
            <el-option
              v-for="item in childMenu"
              :key="item.id"
              :label="item.authName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权重值" prop="order">
          <el-input v-model="editForm.order"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRight()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightList: [],
      levelList: [
        {
          id: 0,
          name: '一级权限'
        },
        {
          id: 1,
          name: '二级权限'
        },
        {
          id: 2,
          name: '三级权限'
        }
      ],
      selectedFather: '',
      fatherMenu: [],
      childMenu: [],
      // 添加表单数据项
      addForm: {
        authName: '',
        path: '',
        level: '',
        father: '',
        order: ''
      },
      // 添加表单数据项
      editForm: {
        id: '',
        authName: '',
        path: '',
        level: '',
        father: '',
        children: '',
        order: ''
      },
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      // 添加表单的验证规则
      addFormRules: {
        authName: [
          { required: true, message: '请输入权限名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度为 3 到 10 个字符', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入路径', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择权限等级', trigger: 'blur' }
        ],
        order: [
          { required: true, message: '请输入权重值', trigger: 'blur' }
        ]
      },
      // 编辑表单的验证规则
      editFormRules: {
        authName: [
          { required: true, message: '请输入权限名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度为 3 到 10 个字符', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入路径', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择权限等级', trigger: 'blur' }
        ],
        order: [
          { required: true, message: '请输入权重值', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取所有权限
    this.getRightList()
  },
  components: {

  },
  methods: {
    // 展示添加权限对话框
    showAddDialog () {
      this.addDialogVisible = true
    },

    // 重置添加表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 重置编辑表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 监听pagesize值变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getRightList()
    },
    // 监听页码值发生变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getRightList()
    },
    // 获取权限列表
    async getRightList () {
      const { data: res } = await this.$http.post('Menu/getAllMenu', this.$qs.stringify(this.queryInfo))

      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      if (res.rcode !== 2001) return this.$message.error('权限信息获取失败，请重试!')
      this.rightList = res.data.menuList
      this.total = res.data.total
    },
    // 编辑父子权限获取
    editLevelChange (level) {
      this.getFatherMenu(level)
      this.getChildMenu(level)
      this.editForm.father = null
      this.editForm.children = null
    },
    addLevelChange (level) {
      this.getFatherMenu(level)
      this.addForm.father = null
    },
    // 获取父权限等级列表
    async getFatherMenu (level) {
      const { data: res } = await this.$http.get('Menu/getLevelMenu', {
        params: {
          level: level - 1
        }
      })
      if (res.rcode !== 2001) return this.$message.error('父权限信息获取失败，请重试!')
      this.fatherMenu = res.data.levelMenu
    },
    // 获取子权限等级列表
    async getChildMenu (level) {
      const { data: res } = await this.$http.get('Menu/getLevelMenu', {
        params: {
          level: level + 1
        }
      })
      if (res.rcode !== 2001) return this.$message.error('子权限信息获取失败，请重试!')
      this.childMenu = res.data.levelMenu
    },
    // 添加权限操作
    addRight () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('Menu/addMenu', this.$qs.stringify(this.addForm))
        if (res.rcode === 2002) {
          this.addDialogVisible = false
          this.getRightList()
          this.$message.success('权限添加成功!')
          this.$refs.addFormRef.resetFields()
        } else {
          this.$message.error('权限添加失败,请重试!')
        }
      })
    },
    // 展示修改用户对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('Menu/getMenuById', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2001) return this.$message.error('获取权限信息失败,请重试!')
      this.editForm = res.data

      this.getFatherMenu(this.editForm.level)
      this.getChildMenu(this.editForm.level)
      this.editDialogVisible = true
    },
    // 删除权限
    async delRight (id) {
      const promiseRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(promiseRes)
      if (promiseRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.get('Menu/delMenu', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2003) return this.$message.error('删除权限失败,请刷新重试!')
      this.$message.success('删除权限操作成功')
      this.getRightList()
    },
    // 修改权限操作
    editRight () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        if (this.editForm.children != null) {
          this.editForm.children = this.editForm.children.join(',')
        }
        const { data: res } = await this.$http.post('Menu/updateMenu', this.$qs.stringify(this.editForm))
        if (res.rcode === 2003) {
          this.editDialogVisible = false
          this.$message.success('权限信息修改成功!')
          this.getRightList()
        } else {
          return this.$message.error('权限信息修改失败,请重试!')
        }
      })
    }
  }
}
</script>

<style scoped >
</style>
