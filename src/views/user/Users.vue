<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card class="box-card">
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="handleClear">
            <el-button icon="el-icon-search" slot="append" @click="handleAppend"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table border stripe :data="userList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"></el-switch>
          </template>-->
          <!-- vue 2.6以上版本废弃slot-scope，改用v-slot，这里使用了结构赋值 -->
          <template v-slot="{ row }">
            <el-switch v-model="row.mg_state" @change="userStateChange(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="{ row }">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加用户表单 -->
      <el-form ref="addFormRef" label-width="70px" :model="addForm" :rules="addFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      width="50%"
      :visible.sync="editDialogVisible"
      @close="edditDialogClosed"
    >
      <!-- 修改用户表单 -->
      <el-form ref="editFormRef" label-width="70px" :model="editForm" :rules="editFormRules">
        <el-form-item label="用户名">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      width="50%"
      :visible.sync="setRoleDialogVisible"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { reqUsers, reqChangeUserState, reqAddUser, reqUserInfoById, reqEditUserInfo, reqDeleteUserById, reqRoles } from '../../api'

export default {
  created() {
    this.getUserList()
  },
  data() {
    // 邮箱校验规则
    const checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) return callback()

      return callback(new Error('请输入合法的邮箱'))
    }

    // 手机校验规则
    const checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) return callback()

      return callback(new Error('请输入合法的手机'))
    }

    return {
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页数据条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 隐藏/显示添加用户对话框
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户的表单数据验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 隐藏/显示修改用户对话框
      editDialogVisible: false,
      // 修改用户的表单数据
      editForm: {},
      // 修改用户的表单数据验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 隐藏/显示分配权限对话框
      setRoleDialogVisible: false,
      // 需要分配角色的用户信息
      userInfo: {},
      // 角色列表数据
      roleList: [],
      // 选中的角色id
      selectedRoleId: ''
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await reqUsers(this.queryInfo)
      if (res.meta.status !== 200) this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听 pagenum 改变事件
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 监听 pagesize 改变事件
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.queryInfo.pagenum = 1
      this.getUserList()
    },
    handleAppend() {
      this.queryInfo.pagenum = 1
      this.getUserList()
    },
    handleClear() {
      this.queryInfo.pagenum = 1
      this.getUserList()
    },
    async userStateChange(userInfo) {
      const { data: res } = await reqChangeUserState(userInfo)

      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await reqAddUser(this.addForm)

        if (res.meta.status !== 201) return this.$message.error('添加用户失败！')

        this.$message.success('添加用户成功！')
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 显示修改用户对话框
    async showEditDialog(id) {
      const { data: res } = await reqUserInfoById(id)

      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')

      this.editDialogVisible = true
      this.editForm = res.data
    },
    // 监听修改用户对话框的关闭事件
    edditDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await reqEditUserInfo(this.editForm.id)

        if (res.meta.status !== 200) return this.$message.error('修改用户失败！')

        this.$message.success('修改用户成功！')
        // 隐藏添加用户对话框
        this.editDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 删除对应id的用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')

      const { data: res } = await reqDeleteUserById(id)

      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')

      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    // 显示分配用户角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo

      const { data: res } = await reqRoles()

      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')

      this.roleList = res.data
      this.setRoleDialogVisible = true
    }
  }
}
</script>

<style lang="less" scope>
</style>
