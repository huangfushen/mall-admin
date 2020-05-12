<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20" class="margin_bottom">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getCateList()">
            <el-button slot="append" icon="el-icon-search" @click="getCateList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类数据表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        :tree-type="true"
        children-prop="childrens"
        border
        :show-row-hover="false"
      >
        <template slot="isok" slot-scope="scope">
          <i
            v-if="scope.row.cateDelete == 'true'"
            style="color: lightgreen"
            class="el-icon-success"
          ></i>
          <i v-if="scope.row.cateDelete == 'false'" class="el-icon-error" style="color: red"></i>
        </template>
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.level == 1">一级菜单</el-tag>
          <el-tag v-if="scope.row.level == 2  " type="success">二级菜单</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delCate(scope.row.id)"
          >删除</el-button>
        </template>
      </tree-table>
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
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
      <!-- 内容主题区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cateName">
          <el-input v-model="addForm.cateName"></el-input>
        </el-form-item>
        <el-form-item label="分类等级" prop="level">
          <el-select
            v-model="addForm.level"
            placeholder="请选择"
            size="medium"
            @change="addLevelChange(addForm.level)"
          >
            <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.level=='2'" label="父级分类" prop="level">
          <el-select v-model="addForm.father" placeholder="请选择" size="medium">
            <el-option
              v-for="item in fatherMenu"
              :key="item.id"
              :label="item.cateName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <!-- 内容主题区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cateName">
          <el-input v-model="editForm.cateName"></el-input>
        </el-form-item>
        <el-form-item label="分类等级" prop="level">
          <el-select
            v-model="editForm.level"
            placeholder="请选择"
            size="medium"
            @change="addLevelChange(editForm.level)"
          >
            <el-option v-for="item in levelList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="editForm.level=='2'" label="父级分类" prop="level">
          <el-select v-model="editForm.father" placeholder="请选择" size="medium">
            <el-option
              v-for="item in fatherMenu"
              :key="item.id"
              :label="item.cateName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="editForm.level=='1'" label="子级分类" prop="level">
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
              :label="item.cateName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        queryRow: 'cateName',
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: null,
      columns: [
        {
          label: '分类名称',
          prop: 'cateName'
        },
        {
          label: '是否有效',
          prop: 'cateDelete',
          type: 'template',
          template: 'isok'
        }, {
          label: '分类等级',
          prop: 'level',
          type: 'template',
          template: 'level'
        }, {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addDialogVisible: false,
      editDialogVisible: false,
      fatherMenu: '',
      childMenu: '',
      // 添加表单数据项
      addForm: {
        cateName: '',
        level: '',
        father: ''
      },
      editForm: {
        id: '',
        cateName: '',
        level: '',
        father: '',
        children: ''
      },
      levelList: [
        {
          id: 1,
          name: '一级分类'
        },
        {
          id: 2,
          name: '二级分类'
        }
      ],
      // 添加表单的验证规则
      addFormRules: {
        cateName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '分类名称长度为 2 到 10 个字符', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择权限等级', trigger: 'blur' }
        ]
      },
      // 添加表单的验证规则
      editFormRules: {
        cateName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '分类名称长度为 2 到 10 个字符', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择权限等级', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 监听pagesize值变化
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 重置编辑表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
      this.editForm.children = null
    },
    addLevelChange (level) {
      this.getFatherMenu(level)
      this.addForm.father = null
    },
    // 展示修改用户对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('Category/obtain', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2001) return this.$message.error('获取分类信息失败,请重试!')
      this.editForm.id = res.data.list[0].id
      this.editForm.cateName = res.data.list[0].cateName
      this.editForm.level = parseInt(res.data.list[0].level)
      this.editForm.father = res.data.list[0].father
      if (res.data.list[0].children != null) {
        this.editForm.children = res.data.list[0].children.split(',')
      }
      // console.log(this.editForm)
      this.getFatherMenu(this.editForm.level)
      this.getChildMenu(this.editForm.level)
      this.editDialogVisible = true
    },
    // 添加分类操作
    addCate () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('Category/addCate', this.$qs.stringify(this.addForm))
        if (res.rcode === 2002) {
          this.addDialogVisible = false
          this.getCateList()
          this.$message.success('分类添加成功!')
          this.$refs.addFormRef.resetFields()
        } else {
          this.$message.error('分类添加失败,请重试!')
        }
      })
    },
    // 修改分类操作
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        if (this.editForm.children != null) {
          this.editForm.children = this.editForm.children.join(',')
        }
        const { data: res } = await this.$http.post('Category/updateCate', this.$qs.stringify(this.editForm))
        if (res.rcode === 2003) {
          this.editDialogVisible = false
          this.$message.success('分类信息修改成功!')
          this.getCateList()
        } else {
          return this.$message.error('分类信息修改失败,请重试!')
        }
      })
    },
    // 获取父权限等级列表
    async getFatherMenu (level) {
      const { data: res } = await this.$http.get('Category/obtain', {
        params: {
          level: 1
        }
      })
      if (res.rcode !== 2001) return this.$message.error('父分类信息获取失败，请重试!')
      this.fatherMenu = res.data.list
    },
    // 获取子权限等级列表
    async getChildMenu (level) {
      const { data: res } = await this.$http.get('Category/obtain', {
        params: {
          level: 2
        }
      })
      if (res.rcode !== 2001) return this.$message.error('子分类信息获取失败，请重试!')
      this.childMenu = res.data.list
    },
    // 监听页码值发生变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 获取分类列表
    async getCateList () {
      const { data: res } = await this.$http.post('Category/getPaginationRes', this.$qs.stringify(this.queryInfo))
      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      if (res.rcode !== 2001) return this.$message.error('分类信息获取失败，请重试!')
      this.cateList = res.data.list
      this.total = res.data.total
    },
    // 删除分类
    async delCate (id) {
      const promiseRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (promiseRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.get('Category/remove', {
        params: {
          id: id
        }
      })
      if (res.rcode !== 2003) return this.$message.error('删除分类失败,请刷新重试!')
      this.$message.success('删除分类操作成功')
      this.getCateList()
    },
    showAddDialog () {
      this.addDialogVisible = true
    },
    // 重置添加表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped >
.margin_bottom {
  margin-bottom: 15px;
}
</style>
