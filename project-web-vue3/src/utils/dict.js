import { ref, toRefs } from 'vue'
import useDictStore from '@/store/modules/dict'
import { detailList } from '@/api/system/dict'

export function useDict(...args) {
  const dict = ref({})
  return (() => {
    const queryDictName = []
    args?.forEach((dictName) => {
      const currentDict = useDictStore().getDict(dictName)
      if (currentDict && currentDict.length > 0) {
        dict.value[dictName] = currentDict
      } else {
        queryDictName.push(dictName)
      }
    })

    if (queryDictName.length > 0) {
      detailList(queryDictName).then((res) => {
        res?.forEach((item) => {
          dict.value[item.name] = item.dictDetailList
          useDictStore().setDict(item.name, item.dictDetailList)
        })
      })
    }
    return toRefs(dict.value)
  })()
}
