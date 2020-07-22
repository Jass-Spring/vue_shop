import { reqCateList, reqAddCate, reqEditCate, reqDeleteCateById } from '../../api'
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      // 请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据
      catelist: [],
      // 表格头部
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列指定为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 商品分类总数
      total: 0,
      // 控制添加分类对话框的显示/隐藏
      addCateDialogVisible: false,
      // 添加的分类的表单数据对象
      addCateForm: {
        // 父级分类的名称
        cat_pid: 0,
        // 分类的名称
        cat_name: '',
        // 分类的等级，默认为1级分类
        cat_level: 0
      },
      // 添加分类表单的校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      },
      // 获取父级分类数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑分类对话框的显示/隐藏
      editCateDialogVisible: false,
      // 编辑分类的表单数据对象
      editCateForm: {
        // 父级分类的id
        cat_id: 0,
        // 分类的新名称
        cat_name: ''
      },
      // 编辑分类表单的校验规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      const { data: res } = await reqCateList(this.queryInfo)

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCateDialog() {
      this.getParentGateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据
    async getParentGateList() {
      const { data: res } = await reqCateList({ type: 2 })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      this.parentCateList = res.data
    },
    // 选择项发生变化触发
    parentCateChanged() {
      const len = this.selectedKeys.length

      if (len > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[len - 1]
        // 分类的等级
        this.addCateForm.cat_level = len
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return
        }

        const { data: res } = await reqAddCate(this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 显示编辑分类对话框
    showEdditCateDialog(row) {
      this.editCateForm.cat_id = row.cat_id
      this.editCateForm.cat_name = row.cat_name
      this.editCateDialogVisible = true
    },
    // 点击按钮编辑分类
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }

        const { data: res } = await reqEditCate(this.editCateForm)

        if (res.meta.status !== 200) {
          return this.$message.error('编辑分类失败！')
        }

        this.$message.success('编辑分类成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 删除对应id的分类
    async removeCateById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')

      const { data: res } = await reqDeleteCateById(id)

      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')

      this.$message.success('删除分类成功！')
      this.getCateList()
    }
  }
}
