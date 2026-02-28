import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

/**
 * 日期格式化
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 时间格式化
 */
export function formatTime(date, format = 'HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 日期时间格式化
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 相对时间
 */
export function formatRelative(date) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 获取今天日期
 */
export function getToday(format = 'YYYY-MM-DD') {
  return dayjs().format(format)
}

/**
 * 获取本周开始和结束日期
 */
export function getWeekRange() {
  const start = dayjs().startOf('week').format('YYYY-MM-DD')
  const end = dayjs().endOf('week').format('YYYY-MM-DD')
  return { start, end }
}

/**
 * 获取本月开始和结束日期
 */
export function getMonthRange() {
  const start = dayjs().startOf('month').format('YYYY-MM-DD')
  const end = dayjs().endOf('month').format('YYYY-MM-DD')
  return { start, end }
}

/**
 * 获取最近N天日期
 */
export function getLastDays(n, format = 'YYYY-MM-DD') {
  const dates = []
  for (let i = n - 1; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'day').format(format))
  }
  return dates
}

/**
 * 获取年龄
 */
export function getAge(birthDate) {
  if (!birthDate) return 0
  return dayjs().diff(dayjs(birthDate), 'year')
}

/**
 * 判断是否是今天
 */
export function isToday(date) {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否是本周
 */
export function isThisWeek(date) {
  return dayjs(date).isSame(dayjs(), 'week')
}

/**
 * 获取星期几
 */
export function getWeekDay(date) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[dayjs(date).day()]
}

/**
 * 解析日期字符串
 */
export function parseDate(dateStr) {
  return dayjs(dateStr).toDate()
}

export { dayjs }
