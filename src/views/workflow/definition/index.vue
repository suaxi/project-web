<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input
        v-model="queryParams.name"
        clearable
        size="small"
        placeholder="请输入名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="queryPage"
      />
      <span>
        <el-button class="filter-item" size="mini" type="primary" icon="el-icon-search" @click="queryPage">搜索</el-button>
        <el-button class="filter-item" size="mini" icon="el-icon-refresh-left" @click="resetQuery">重置</el-button>
      </span>
    </div>

    <div class="crud-opts">
      <span class="crud-opts-left">
        <el-button
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="handleLoadXml"
        >新增</el-button>
        <el-button
          class="filter-item"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleDelete"
        >删除</el-button>
      </span>
    </div>

    <div class="app-container-alert">
      <el-alert title="流程设计说明：" :center="false">
        <template #default>
          <div>1、XML文件中的流程定义id属性用作流程定义的key参数。</div>
          <div>2、XML文件中的流程定义name属性用作流程定义的name参数。如果未给定name属性，会使用id作为name。</div>
          <div>3、当每个唯一key的流程第一次部署时，指定版本为1。对其后所有使用相同key的流程定义，部署时版本会在该key当前已部署的最高版本号基础上加1。key参数用于区分流程定义。</div>
          <div>4、id参数设置为{processDefinitionKey}:{processDefinitionVersion}:{generated-id}，其中generated-id是一个唯一数字，用以保证在集群环境下，流程定义缓存中，流程id的唯一性。</div>
        </template>
      </el-alert>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="流程编号" align="center" prop="deploymentId" :show-overflow-tooltip="true" />
      <el-table-column label="流程标识" align="center" prop="flowKey" :show-overflow-tooltip="true" />
      <el-table-column label="流程分类" align="center" prop="category" />
      <el-table-column label="流程名称" align="center" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-button type="text" @click="handleReadImage(scope.row.deploymentId)">
            <span>{{ scope.row.name }}</span>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="业务表单" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-button v-if="scope.row.formId" type="text" @click="handleForm(scope.row.formId)">
            <span>{{ scope.row.formName }}</span>
          </el-button>
          <label v-else>暂无表单</label>
        </template>
      </el-table-column>
      <el-table-column label="流程版本" align="center">
        <template #default="scope">
          <el-tag size="medium">v{{ scope.row.version }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.suspensionState === 1" type="success">激活</el-tag>
          <el-tag v-if="scope.row.suspensionState === 2" type="warning">挂起</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="部署时间" align="center" prop="deploymentTime" width="180" />
      <el-table-column label="操作" width="250" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button icon="el-icon-edit-outline" type="text" size="small" @click="handleLoadXml(scope.row)">设计
          </el-button>
          <el-button
            v-if="scope.row.formId == null"
            icon="el-icon-edit-el-icon-s-promotion"
            type="text"
            size="small"
            @click="handleAddForm(scope.row)"
          >配置主表单
          </el-button>
          <el-button
            v-if="scope.row.suspensionState === 1"
            icon="el-icon-video-pause"
            type="text"
            size="small"
            @click="handleUpdateSuspensionState(scope.row)"
          >挂起
          </el-button>
          <el-button
            v-if="scope.row.suspensionState === 2"
            icon="el-icon-video-play"
            type="text"
            size="small"
            @click="handleUpdateSuspensionState(scope.row)"
          >激活
          </el-button>
          <el-button
            icon="el-icon-delete"
            type="text"
            size="small"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :page-num.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :total="total"
      @page="queryPage"
    />

    <!-- 添加或修改流程定义对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="看看" prop="name">
          <el-input v-model="form.name" placeholder="请输入看看" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- bpmn20.xml导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xml"
        :headers="upload.headers"
        :action="upload.url + '?name=' + upload.name+'&category='+ upload.category"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div slot="tip" class="el-upload__tip">
          流程名称：
          <el-input v-model="upload.name" />
          流程分类：
          <div>
            <!--          <el-input v-model="upload.category"/>-->
            <el-select v-model="upload.category" placeholder="请选择流程分类">
              <!--              <el-option-->
              <!--                v-for="dict in dict.type.sys_process_category"-->
              <!--                :key="dict.value"-->
              <!--                :label="dict.label"-->
              <!--                :value="dict.value"-->
              <!--              />-->
            </el-select>
          </div>
        </div>
        <div slot="tip" class="el-upload__tip" style="color:red">提示：仅允许导入“bpmn20.xml”格式文件！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 流程图 -->
    <el-dialog :title="readImage.title" :visible.sync="readImage.open" width="70%" append-to-body>
      <!-- <el-image :src="readImage.src"></el-image> -->
      <bpmn-viewer :flow-data="flowData" />
    </el-dialog>

    <!--表单配置详情-->
    <el-dialog :title="formTitle" :visible.sync="formConfOpen" width="50%" append-to-body>
      <v-form-render ref="vFormRef" :form-data="formData" />
    </el-dialog>

    <!--挂载表单-->
    <el-dialog :title="formDeployTitle" :visible.sync="formDeployOpen" width="85%" append-to-body>
      <el-row :gutter="24">
        <el-col :span="10" :xs="24">
          <el-table
            ref="singleTable"
            v-loading="formLoading"
            :data="formTableData"
            border
            highlight-current-row
            style="width: 100%"
            @current-change="handleCurrentChange"
          >
            <el-table-column label="表单编号" align="center" prop="formId" />
            <el-table-column label="表单名称" align="center" prop="formName" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button size="mini" type="text" @click="submitFormDeploy(scope.row)">确定</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <Pagination
            :page-num.sync="formQueryParams.pageNum"
            :page-size.sync="formQueryParams.pageSize"
            :total="formTotal"
            @page="queryFormPage"
          />
        </el-col>
        <el-col :span="14" :xs="24">
          <div class="test-form">
            <v-form-render ref="vFormCurrentRowRef" :form-data="formData" />
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <!--流程设计器-->
    <!--    <el-dialog-->
    <!--      title="流程配置"-->
    <!--      :visible.sync="dialogVisible"-->
    <!--      :close-on-press-escape="false"-->
    <!--      :fullscreen="true"-->
    <!--      :before-close="handleClose"-->
    <!--      append-to-body-->
    <!--    >-->
    <!--      <FlowDesignerModel :deploy-id="deployId" />-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
import {
  updateState,
  delDeployment,
  addDeployment,
  updateDeployment,
  exportDeployment,
  definitionStart,
  flowXmlAndNode,
  page as definitionPage
} from '@/api/workflow/definition'
import { getToken } from '@/utils/auth'
import { getForm, mountFlowForm, page as formPage } from '@/api/workflow/form'
import BpmnViewer from '@/components/workflow/Process/viewer'
import Pagination from '@/components/Crud/Pagination'

export default {
  name: 'WorkFlowDefinition',
  components: {
    Pagination,
    BpmnViewer
  },
  data() {
    return {
      loading: false,
      permission: {
        add: [],
        edit: [],
        del: []
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      total: 0,
      tableData: [],
      // 遮罩层
      dialogVisible: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      // total: 0,
      // 流程定义表格数据
      definitionList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      formQueryParams: {
        pageNum: 1,
        pageSize: 10
      },
      formLoading: false,
      formConfOpen: false,
      formTitle: '',
      formDeployOpen: false,
      formDeployTitle: '',
      formTableData: [],
      formTotal: 0,
      // 默认表单数据
      formData: {},
      // 挂载表单到流程实例
      formDeployParam: {
        formId: null,
        deployId: null
      },
      readImage: {
        open: false,
        src: ''
      },
      // bpmn.xml 导入
      upload: {
        // 是否显示弹出层（xml导入）
        open: false,
        // 弹出层标题（xml导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        name: null,
        category: null,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/workflow/definition/import'
      },
      deployId: '',
      currentRow: null,
      // xml
      flowData: {},
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },
  created() {
    this.queryPage()
  },
  methods: {
    queryPage() {
      this.loading = true
      definitionPage(this.queryParams).then(res => {
        this.tableData = res.records
        this.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      }
      this.queryPage()
    },
    handleClose(done) {
      this.$confirm('确定要关闭吗？关闭未保存的修改都会丢失？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.resetForm()
    },
    // 表单重置
    resetForm() {
      this.form = {
        id: undefined,
        name: undefined,
        category: undefined,
        key: undefined,
        tenantId: undefined,
        deployTime: undefined,
        derivedFrom: undefined,
        derivedFromRoot: undefined,
        parentDeploymentId: undefined,
        engineVersion: undefined
      }
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.deploymentId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.resetForm()
      this.open = true
      this.title = '添加流程定义'
    },
    /** 跳转到流程设计页面 */
    handleLoadXml(row) {
      this.$router.push({ path: '/workflow/definition/model', query: { deployId: row.deploymentId }})
    },
    /** 流程图查看 */
    handleReadImage(deployId) {
      this.readImage.title = '流程图'
      this.readImage.open = true
      // this.readImage.src = process.env.VUE_APP_BASE_API + "/flowable/definition/readImage/" + deploymentId;
      flowXmlAndNode(null, deployId).then(res => {
        this.flowData = res
      })
    },
    /** 表单查看 */
    handleForm(formId) {
      getForm(formId).then(res => {
        this.formTitle = res.formName
        this.formConfOpen = true
        this.$nextTick(() => {
          // 回显数据
          this.$refs.vFormRef.setFormJson(JSON.parse(res.formContent))
          this.$nextTick(() => {
            // 表单禁用
            this.$refs.vFormRef.disableForm()
          })
        })
      })
    },
    /** 启动流程 */
    handleDefinitionStart(row) {
      definitionStart(row.id).then(res => {
        this.$modal.msgSuccess(res.msg)
      })
    },
    /** 挂载表单弹框 */
    handleAddForm(row) {
      this.formDeployParam.deployId = row.deploymentId
      this.queryFormPage()
    },
    queryFormPage() {
      this.formLoading = true
      formPage({ ...this.formQueryParams }).then(res => {
        this.formTableData = res.records
        this.formTotal = res.total
        this.formDeployOpen = true
        this.formDeployTitle = '挂载表单'
        this.formLoading = false
      }).catch(() => {
        this.formLoading = false
      })
    },
    // /** 更改挂载表单弹框 */
    // handleEditForm(row){
    //   this.formDeployParam.deployId = row.deploymentId
    //   const queryParams = {
    //     pageNum: 1,
    //     pageSize: 10
    //   }
    //   listForm(queryParams).then(res =>{
    //     this.formList = res.rows;
    //     this.formDeployOpen = true;
    //     this.formDeployTitle = "挂载表单";
    //   })
    // },
    /** 挂载表单 */
    submitFormDeploy(row) {
      this.formDeployParam.formId = row.formId
      mountFlowForm(this.formDeployParam).then(() => {
        this.$message.success('挂载成功！')
        this.formDeployOpen = false
        this.queryPage()
      })
    },
    handleCurrentChange(data) {
      if (data) {
        this.$nextTick(() => {
          // 回显数据
          this.$refs.vFormCurrentRowRef.setFormJson(JSON.parse(data.formContent))
          this.$nextTick(() => {
            // 表单禁用
            this.$refs.vFormCurrentRowRef.disableForm()
          })
        })
      }
    },
    /** 挂起/激活流程 */
    handleUpdateSuspensionState(row) {
      updateState(row.suspensionState === 1 ? 2 : 1, row.deploymentId).then(() => {
        this.queryPage()
      })
    },
    /** 修改按钮操作 */
    // handleUpdate(row) {
    //   this.reset()
    //   const id = row.deploymentId || this.ids
    //   getDeployment(id).then(response => {
    //     this.form = response.data
    //     this.open = true
    //     this.title = '修改流程定义'
    //   })
    // },
    /** 提交按钮 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDeployment(this.form).then(() => {
              this.$message.success('修改成功')
              this.open = false
              this.queryPage()
            })
          } else {
            addDeployment(this.form).then(() => {
              this.$message.success('新增成功')
              this.open = false
              this.queryPage()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const deploymentIds = row.deploymentId || this.ids
      if (!deploymentIds || deploymentIds.length === 0) {
        this.$message.warning('请选择要删除的数据！')
        return
      }

      this.$confirm('是否确认删除流程定义编号为"' + deploymentIds + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delDeployment(deploymentIds)
      }).then(() => {
        this.$message.success('删除成功！')
        this.queryPage()
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有流程定义数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportDeployment(queryParams)
      }).then(response => {
        this.download(response.msg)
      })
    },
    /** 导入bpmn.xml文件 */
    handleImport() {
      this.upload.title = 'bpmn20.xml文件导入'
      this.upload.open = true
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$message(response.msg)
      this.crud.refresh()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container-alert {
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>
