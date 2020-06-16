<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['vcenter', 'border-bottom', i1 === 0 ? 'border-top' : '']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row, item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="['vcenter', i2 === 0 ? '' : 'border-top']"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                      closable
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                      type="warning"
                      closable
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="{ row }">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              @click="showSetRightDialog(row)"
              size="mini"
              type="warning"
              icon="el-icon-setting"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限弹出框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree :data="rightList" :props="treeProps" :default-checked-keys="defKeys" ref="treeRef" node-key="id" default-expand-all show-checkbox></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button @click="allotRights" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { reqRoles, reqDeletRight, reqRights, reqSetRights } from '../../api'

export default {
  created() {
    this.getRoleList()
  },
  data() {
    return {
      // 角色列表数据
      roleList: [],
      // 控制分配权限弹出框的显示/隐藏
      setRightDialogVisible: false,
      // 权限列表数据
      rightList: [],
      // 树形控件属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的选项
      defKeys: [],
      roleId: ''
    }
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await reqRoles()

      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')

      this.roleList = res.data
    },
    // 根据Id删除角色的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除权限，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('取消了删除！')

      const { data: res } = await reqDeletRight(role.id, rightId)

      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')

      role.children = res.data
    },
    // 显示分配权限弹出框
    async showSetRightDialog(role) {
      this.roleId = role.id

      const { data: res } = await reqRights('tree')

      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')

      this.rightList = res.data

      this.defKeys = []
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    getLeafKeys(node, arr) {
      if (!node.children) return arr.push(node.id)

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')

      const { data: res } = await reqSetRights(this.roleId, { rids: idStr })

      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')

      this.$message.success('分配权限成功！')
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scope>
.el-tag {
  margin: 7px;
}

.border-top {
  border-top: 1px solid #eee;
}

.border-bottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
