<template>
  <div>
    <div v-if="crud.tableData.length === 0">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-else>
      <!-- 数据字典详细信息 -->
      <el-table ref="table" v-loading="crud.loading" :data="crud.tableData" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column label="所属字典">
          {{ dictName }}
        </el-table-column>
        <el-table-column prop="label" label="字典标签" />
        <el-table-column prop="value" label="字典值" />
        <el-table-column prop="sort" label="排序" />
        <el-table-column label="操作" width="130px" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="doEdit(row)" />&nbsp;
            <el-popover v-model="row.visible" placement="top" width="180" trigger="manual">
              <p>确定删除本条数据吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="row.visible = false">取消</el-button>
                <el-button type="primary" size="mini" @click="crud.setOperation('delete')">确定</el-button>
              </div>
              <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini" @click="doDelete(row)" />
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />

      <!-- 数据字典详细信息编辑框 -->
      <el-dialog append-to-body :close-on-click-modal="false" :visible="dialogFormVisible" :title="dialogTitle" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="字典标签" prop="label">
            <el-input v-model="form.label" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="字典值" prop="value">
            <el-input v-model="form.value" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model.number="form.sort" :min="0" :max="999" controls-position="right" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="updateDictDetail(form)">确认</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import CRUD, { presenter } from '@/components/Crud/crud'
import Pagination from '@/components/Crud/Pagination'
import { del } from '@/api/dictDetail'

export default {
  name: 'DictDetail',
  components: {
    Pagination
  },
  cruds() {
    return CRUD({ title: '数据字典详情', url: '/dictDetail/queryPage', queryOnPresenterCreated: false })
  },
  mixins: [presenter()],
  data() {
    return {
      dialogTitle: '',
      dialogFormVisible: false,
      dictName: '',
      rules: {
        label: [
          { required: true, message: '请输入字典标签', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入字典值', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      form: {},
      buttonLoading: false,
      visible: false
    }
  },
  methods: {
    [CRUD.HOOK.setOperation](crud, operation) {
      // 清空缓存
      this.form = {
        id: null,
        name: null,
        description: null
      }

      if (operation === 'post') {
        this.dialogTitle = '新增数据字典详情'
        this.$store.commit('SET_OPERATION', operation)
      } else if (operation === 'put') {
        this.dialogTitle = '编辑数据字典详情'
        this.$store.commit('SET_OPERATION', operation)
      } else if (operation === 'delete') {
        const ids = this.crud.selectData.map(item => item.id)
        del(ids).then(() => {
          this.$message.success('删除成功')
          this.crud.delChangePage()
          this.crud.refresh()
        })
      }
      if (operation !== 'delete') {
        this.dialogFormVisible = true
      }
    },
    updateDictDetail(data) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true
          const operation = this.$store.state.operation
          this.$request({
            url: '/dictDetail',
            method: operation,
            data: {
              dictId: this.crud.params.dictId,
              ...data
            }
          }).then(() => {
            this.buttonLoading = false
            this.$message.success('操作成功')
            this.dialogFormVisible = false
            this.crud.refresh()
          }).catch(() => {
            this.buttonLoading = false
          })
        } else {
          return false
        }
      })
    },
    doEdit(data) {
      this.crud.setOperation('put')
      this.form = { ...data }
    },
    doDelete(data) {
      data.visible = true
      this.crud.selectData.splice(0)
      this.crud.selectData.push(data)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>
