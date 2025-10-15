import { defineStore } from 'pinia'

const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: true,
      withoutAnimation: false,
      hide: false
    },
    device: 'desktop',
    size: 'medium'
  }),
  actions: {
    toggleSideBar(withoutAnimation) {
      if (this.sidebar.hide) {
        return false
      }
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = withoutAnimation
    },
    closeSideBar({ withoutAnimation }) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device) {
      this.device = device
    },
    setSize(size) {
      this.size = size
    },
    toggleSideBarHide(status) {
      this.sidebar.hide = status
    }
  }
})

export default useAppStore
