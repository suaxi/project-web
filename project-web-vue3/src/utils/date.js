/**
 * 日期时间转字符串 yyyy-MM-dd HH:mm:ss
 * @param datetime
 * @returns {string}
 */
export function datetimeToStr(datetime) {
  if (!datetime) return ''
  const date = new Date(datetime)
  if (isNaN(date.getTime())) return ''

  const pad2 = (n) => String(n).padStart(2, '0')

  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hour = pad2(date.getHours())
  const minute = pad2(date.getMinutes())
  const second = pad2(date.getSeconds())

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
