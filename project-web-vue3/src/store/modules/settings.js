import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: '#409EFF',
    sideTheme: 'theme-dark',
    showSettings: false,
    tagsView: true,
    fixedHeader: false,
    sidebarLogo: true,
  }),

  actions: {
    changeSetting(payload) {
      const { key, value } = payload
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value
      }
    },
  },
})
