<template>
  <div class="crud-opts">
    <span class="crud-opts-left">
      <!--左侧插槽-->
      <slot name="left" />
      <el-button
        v-if="crud.optShow.add"
        v-permission="permission.add"
        class="filter-item"
        size="mini"
        type="primary"
        icon="el-icon-plus"
        @click="crud.setOperation('post')"
      >新增</el-button>
      <el-button
        v-if="crud.optShow.edit"
        v-permission="permission.edit"
        class="filter-item"
        size="mini"
        type="success"
        icon="el-icon-edit"
        :disabled="crud.selectData.length !== 1"
        @click="crud.setOperation('put')"
      >修改</el-button>
      <el-button
        v-if="crud.optShow.delete"
        slot="reference"
        v-permission="permission.del"
        class="filter-item"
        type="danger"
        icon="el-icon-delete"
        size="mini"
        :disabled="crud.selectData.length === 0"
        @click="crud.setOperation('delete')"
      >删除</el-button>
      <el-button
        v-if="crud.optShow.download"
        class="filter-item"
        size="mini"
        type="warning"
        icon="el-icon-download"
      >导出</el-button>
      <!--右侧-->
      <slot name="right" />
    </span>
  </div>
</template>

<script>
import { crud } from '@/components/Crud/crud'

export default {
  name: 'CrudOperation',
  mixins: [crud()],
  props: {
    permission: {
      type: Object,
      default: () => {
        return {}
      }
    }
  }
}
</script>

<style scoped>

</style>
