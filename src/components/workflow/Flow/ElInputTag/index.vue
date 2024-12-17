<template>
  <div
    class="el-input-tag input-tag-wrapper"
    :class="[size ? 'el-input-tag--' + size : '']"
  >
    <el-tag
      v-for="(item, index) in innerTags"
      :key="index"
      :size="size"
      effect="dark"
      closable
      :disable-transitions="false"
      @close="remove(item.id)"
    >
      {{ item.name }}
    </el-tag>
  </div>
</template>

<script>

export default {
  name: 'WorkFlowElInputTag',
  props: {
    tagContent: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'small'
    }
  },
  data() {
    return {
      innerTags: [],
      readOnly: true
    }
  },
  /** 传值监听 */
  watch: {
    tagContent: {
      handler(newVal) {
        if (newVal) {
          this.innerTags = newVal
        }
      },
      immediate: true // 立即生效
    }
  },
  methods: {
    remove(id) {
      this.innerTags = this.innerTags.filter(item => {
        return id !== item.id
      })
      this.tagChange()
      this.$emit('handleInputValueChange', id)
    },
    tagChange() {
      this.$emit('input', this.innerTags)
    }
  }
}

</script>

<style scoped>
.el-form-item.is-error .el-input-tag {
  border-color: #f56c6c;
}
.input-tag-wrapper {
  position: relative;
  font-size: 14px;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  outline: none;
  padding: 0 10px 0 5px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 100%;
}
.el-tag {
  margin-right: 4px;
}
.el-input-tag {
  min-height: 42px;
}
.el-input-tag--small {
  min-height: 32px;
  line-height: 32px;
  font-size: 12px;
}

.el-input-tag--default {
  min-height: 34px;
  line-height: 34px;
}

.el-input-tag--large {
  min-height: 36px;
  line-height: 36px;
}

</style>
