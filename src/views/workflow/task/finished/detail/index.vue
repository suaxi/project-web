<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="el-icon-document">已办任务</span>
        <el-button style="float: right;" size="mini" type="danger" @click="goBack">关闭</el-button>
      </div>
      <el-tabs v-model="activeName" tab-position="top" @tab-click="handleClick">
        <!--表单信息-->
        <el-tab-pane label="表单信息" name="1">
          <el-col :span="16" :offset="4">
            <v-form-render ref="vFormRef" />
          </el-col>
        </el-tab-pane>
        <!--流程流转记录-->
        <el-tab-pane label="流转记录" name="2">
          <el-col :span="16" :offset="4">
            <div class="block">
              <el-timeline>
                <el-timeline-item
                  v-for="(item,index ) in flowRecordList"
                  :key="index"
                  :icon="setIcon(item.completedTime)"
                  :color="setColor(item.completedTime)"
                >
                  <p style="font-weight: 700">{{ item.taskName }}</p>
                  <el-card :body-style="{ padding: '10px' }">
                    <el-descriptions class="margin-top" :column="1" size="small" border>
                      <el-descriptions-item v-if="item.assigneeName" label-class-name="my-label">
                        <template #default><i class="el-icon-user" />办理人</template>
                        {{ item.assigneeName }}
                        <el-tag type="info" size="mini">{{ item.deptName }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.candidate" label-class-name="my-label">
                        <template #default><i class="el-icon-user" />候选办理</template>
                        {{ item.candidate }}
                      </el-descriptions-item>
                      <el-descriptions-item label-class-name="my-label">
                        <template #default><i class="el-icon-date" />接收时间</template>
                        {{ item.createTime }}
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.finishTime" label-class-name="my-label">
                        <template #default><i class="el-icon-date" />处理时间</template>
                        {{ item.finishTime }}
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.duration" label-class-name="my-label">
                        <template #default><i class="el-icon-time" />耗时</template>
                        {{ item.duration }}
                      </el-descriptions-item>
                      <el-descriptions-item v-if="item.comment" label-class-name="my-label">
                        <template #default><i class="el-icon-tickets" />处理意见</template>
                        {{ item.comment.comment }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-col>
        </el-tab-pane>
        <el-tab-pane label="流程图" name="3">
          <Bpmn-viewer :flow-data="flowData" :proc-ins-id="taskForm.procInsId" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { flowRecord } from '@/api/workflow/finished'
import { getProcessVariables, flowXmlAndNode } from '@/api/workflow/definition'
import BpmnViewer from '@/components/workflow/Process/viewer'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'WorkFlowTaskFinishedDetail',
  components: {
    BpmnViewer
  },
  props: {},
  data() {
    return {
      // 模型xml数据
      flowData: {},
      activeName: '1',
      // 查询参数
      queryParams: {
        deptId: undefined
      },
      // 遮罩层
      loading: true,
      flowRecordList: [], // 流程流转数据
      taskForm: {
        multiple: false,
        comment: '', // 意见内容
        procInsId: '', // 流程实例编号
        instanceId: '', // 流程实例编号
        deployId: '', // 流程定义编号
        taskId: '', // 流程任务编号
        procDefId: '', // 流程编号
        vars: ''
      }
    }
  },
  created() {
    this.taskForm.deployId = this.$route.query && this.$route.query.deployId
    this.taskForm.taskId = this.$route.query && this.$route.query.taskId
    this.taskForm.procInsId = this.$route.query && this.$route.query.procInsId
    // 流程任务重获取变量表单
    if (this.taskForm.taskId) {
      this.processVariables(this.taskForm.taskId)
    }
    this.getFlowRecordList(this.taskForm.procInsId, this.taskForm.deployId)
  },
  methods: {
    handleClick(tab, event) {
      if (tab.name === '3') {
        flowXmlAndNode(this.taskForm.procInsId, this.taskForm.deployId).then(res => {
          this.flowData = res
        })
      }
    },
    setIcon(val) {
      if (val) {
        return 'el-icon-check'
      } else {
        return 'el-icon-time'
      }
    },
    setColor(val) {
      if (val) {
        return '#2bc418'
      } else {
        return '#b3bdbb'
      }
    },
    /** 流程流转记录 */
    getFlowRecordList(procInsId, deployId) {
      const that = this
      flowRecord(procInsId, deployId).then(res => {
        that.flowRecordList = res.flowList
      }).catch(() => {
        this.goBack()
      })
    },
    /** 获取流程变量内容 */
    processVariables(taskId) {
      if (taskId) {
        // 提交流程申请时填写的表单存入了流程变量中后续任务处理时需要展示
        getProcessVariables(taskId).then(res => {
          // 回显表单
          this.$nextTick(() => {
            this.$refs.vFormRef.setFormJson(res.formJson)
            this.$nextTick(() => {
              // 加载表单填写的数据
              this.$refs.vFormRef.setFormData(res)
              this.$nextTick(() => {
                // 表单禁用
                this.$refs.vFormRef.disableForm()
              })
            })
          })
        })
      }
    },
    /** 返回页面 */
    goBack() {
      // 关闭当前标签页并返回上个页面
      this.$router.push({ path: '/workflow/task/finished' })
    }
  }
}
</script>
<style lang="scss" scoped>
.test-form {
  margin: 15px auto;
  width: 800px;
  padding: 15px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  width: 100%;
  margin-bottom: 20px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.my-label {
  background: #E1F3D8;
}
</style>
