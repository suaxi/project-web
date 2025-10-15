import useUserStore from '@/store/modules/user'

const vPermission = {
  mounted(el, binding) {
    const value = binding.value
    const roles = useUserStore().roles

    if (Array.isArray(value)) {
      const permissionRoles = [...value, 'admin']
      const hasPermission = roles.some((role) => permissionRoles.includes(role))
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('使用方式：v-permission[\'admin\', \'user:add\']')
    }
  }
}

export default vPermission
