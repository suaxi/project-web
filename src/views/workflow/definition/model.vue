<template>
  <div>
    <bpmn-model
      v-if="dataExit"
      :xml="xml"
      :is-view="false"
      @save="save"
      @showXML="showXML"
    />
    <!--在线查看xml-->
    <el-drawer :title="xmlTitle" :modal="false" direction="rtl" :visible.sync="xmlOpen" size="60%">
      <!-- 设置对话框内容高度 -->
      <el-scrollbar>
        <pre v-highlight="xmlData"><code class="xml" /></pre>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>
<script>
import { list as userList } from '@/api/system/user'
import { list as roleList } from '@/api/system/role'
import { list as expList } from '@/api/workflow/expression'
import { readXml, saveXml } from '@/api/workflow/definition'
import BpmnModel from '@/components/workflow/Process'
import vkBeautify from 'vkbeautify'
import hljs from 'highlight.js'
import 'highlight.js/styles/atelier-savanna-dark.css'

export default {
  name: 'WorkFlowDesignerModel',
  components: {
    BpmnModel
  },
  // 自定义指令
  directives: {
    deep: true,
    highlight: {
      deep: true,
      bind: function bind(el, binding) {
        const targets = el.querySelectorAll('code')
        let target
        let i
        for (i = 0; i < targets.length; i += 1) {
          target = targets[i]
          if (typeof binding.value === 'string') {
            target.textContent = binding.value
          }
          hljs.highlightBlock(target)
        }
      },
      componentUpdated: function componentUpdated(el, binding) {
        const targets = el.querySelectorAll('code')
        let target
        let i
        for (i = 0; i < targets.length; i += 1) {
          target = targets[i]
          if (typeof binding.value === 'string') {
            target.textContent = binding.value
            hljs.highlightBlock(target)
          }
        }
      }
    }
  },
  data() {
    return {
      xml: '', // 后端查询到的xml
      modeler: '',
      dataExit: true,
      xmlOpen: false,
      xmlTitle: '',
      xmlData: ''
    }
  },
  created() {
    const deployId = this.$route.query && this.$route.query.deployId
    //  查询流程xml
    if (deployId) {
      this.getXmlData(deployId)
    }
    this.getDataList()
  },
  methods: {
    /** xml 文件 */
    getXmlData(deployId) {
      // 发送请求，获取xml
      readXml(deployId).then(res => {
        this.xml = res
        this.modeler = res
      })
    },
    /** 保存xml */
    save(data) {
      const params = {
        name: data.process.name,
        category: data.process.category,
        xml: data.xml
      }
      saveXml(params).then(() => {
        this.$message.success('保存成功！')
      })
    },
    /** 指定流程办理人员列表 */
    getDataList() {
      userList({}).then(res => {
        this.modelerStore.userList = res
      })
      roleList({}).then(res => {
        this.modelerStore.roleList = res
      })
      expList({}).then(res => {
        this.modelerStore.expList = res
        this.dataExit = true
      })
    },
    /** 展示xml */
    showXML(xmlData) {
      this.xmlTitle = 'xml查看'
      this.xmlOpen = true
      this.xmlData = vkBeautify.xml(xmlData)
    }
  }
}
</script>
<style lang="scss" scoped>
.content-box {
  line-height: 10px;
}

// 修改对话框高度
.showAll_dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  ::v-deep .el-dialog {
    margin: 0 auto !important;
    height: 80%;
    overflow: hidden;
    background-color: #ffffff;

    .el-dialog__body {
      position: absolute;
      left: 0;
      top: 54px;
      bottom: 0;
      right: 0;
      z-index: 1;
      overflow: hidden;
      overflow-y: auto;
      // 下边设置字体，我的需求是黑底白字
      color: #ffffff;
      padding: 0 15px;
    }
  }
}
</style>
