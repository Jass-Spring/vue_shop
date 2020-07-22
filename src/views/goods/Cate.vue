<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="tree-table" index-text="#" show-index border :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" :show-row-hover="false">
        <!-- 是否有效 -->
        <template v-slot:isok="{ row }">
          <i v-if="row.cat_deleted === false" class="el-icon-success" style="color: lightgreen;"></i>
          <i v-else class="el-icon-error" style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="{ row }">
          <el-tag v-if="row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="{ row }">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEdditCateDialog(row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      width="50%"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form label-width="100px" ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      width="50%"
      :visible.sync="editCateDialogVisible"
      @close="editCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form label-width="100px" ref="editCateFormRef" :model="editCateForm" :rules="editCateFormRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cate from './cate.js'
export default cate
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
