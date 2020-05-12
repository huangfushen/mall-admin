<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert show-icon :closable="false" title="注意:只允许为二级分类设置相关参数！！" type="warning"></el-alert>
      <!-- 选择商品分类区 -->
      <el-row class="cate_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange()"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tag页标签 -->
      <el-tabs v-model="activeName" @tab-click="handleClick()">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attrVals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="参数名称" prop="attrName"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attrVals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="属性名称" prop="attrName"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attrName">
          <el-input v-model="addForm.attrName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attrName">
          <el-input v-model="editForm.attrName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      // 级联选择框参数
      cateProps: {
        expandTrigger: 'hover',
        value: 'id',
        label: 'cateName',
        children: 'childrens'
      },
      // 当前激活标签页的名称
      activeName: 'many',
      selectedCateKeys: [],
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attrName: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attrName: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改的表单数据对象
      editForm: {
        id: '',
        attrName: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        attrName: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList () {
      const { data: res } = await this.$http.post('Category/getPaginationRes')
      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      if (res.rcode !== 2001) return this.$message.error('分类信息获取失败，请重试!')
      this.cateList = res.data.list
    },
    // 获取分类列表
    async getParamList () {
      // 证明选中的不是二级分类
      if (this.selectedCateKeys.length !== 2) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      const { data: res } = await this.$http.get('CateParams/obtain', {
        params: {
          cateId: this.cateId,
          attrSel: this.activeName
        }
      })
      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      if (res.rcode !== 2001) return this.$message.error('分类参数获取失败，请重试!')
      res.data.list.forEach(item => {
        item.attrVals = item.attrVals ? item.attrVals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data.list
      } else {
        this.onlyTableData = res.data.list
      }
    },
    // 添加分类参数操作
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('CateParams/addParam', this.$qs.stringify({
          attrName: this.addForm.attrName,
          cateId: this.cateId,
          attrSel: this.activeName
        }))
        if (res.rcode === 2002) {
          this.addDialogVisible = false
          this.getParamList()
          this.$message.success('分类参数添加成功!')
          this.$refs.addFormRef.resetFields()
        } else {
          this.$message.error('分类参数添加失败,请重试!')
        }
      })
    },
    // 对attrVals进行操作
    async saveAttrVals (row) {
      // 空字符串传递到后端无法获取,定义一个^作为空
      let attrVals = []
      if (row.attrVals.length === 0) {
        attrVals = '^'
      } else {
        attrVals = row.attrVals.join(' ')
      }
      const { data: res } = await this.$http.post('CateParams/updateParam', this.$qs.stringify({
        id: row.id,
        attrVals: attrVals
      }))
      if (res.rcode === 2003) {
        this.$message.success('参数项修改成功!')
      } else {
        return this.$message.error('参数项修改失败,请重试!')
      }
    },
    // 级联选择框变化触发该方法
    handleChange () {
      this.getParamList()
      console.log(this.selectedCateKeys)
    },
    // 切换标签页触发该方法
    handleClick () {
      this.getParamList()
    },
    // 点击按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框失去焦点，或摁下了 Enter 都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attrVals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 删除对应的参数可选项
    handleClose (i, row) {
      row.attrVals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 监听添加对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，展示修改的对话框
    async showEditDialog (id) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get('CateParams/obtain', {
        params: {
          id: id
        }
      })
      if (res.rcode === 5007) {
        this.$message.error('token已过期，请重新登录')
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
      if (res.rcode !== 2001) return this.$message.error('分类参数获取失败，请重试!')
      this.editForm.id = res.data.list[0].id
      this.editForm.attrName = res.data.list[0].attrName
      this.editDialogVisible = true
    },
    // 重置修改的表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('CateParams/updateParam', this.$qs.stringify({
          id: this.editForm.id,
          attrName: this.editForm.attrName
        }))
        if (res.rcode === 2003) {
          this.editDialogVisible = false
          this.getParamList()
          this.$message.success('参数项修改成功!')
        } else {
          return this.$message.error('参数项修改失败,请重试!')
        }
      })
    }

  },
  computed: {
    // 如果按钮需要被禁用返回true，否则返回false
    isBtnDisable () {
      if (this.selectedCateKeys.length !== 2) {
        return true
      }
      return false
    },
    // 当前选中的二级分类的Id
    cateId () {
      if (this.selectedCateKeys.length === 2) {
        return this.selectedCateKeys[1]
      }
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped >
.cate_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
