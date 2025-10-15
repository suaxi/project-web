import vue from '@vitejs/plugin-vue'

import createSvgIcon from './svg-icon.js'
import createCompression from './compression.js'

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue()]
  vitePlugins.push(createSvgIcon(isBuild))
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}
