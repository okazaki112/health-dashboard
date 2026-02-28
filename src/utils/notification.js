/**
 * 浏览器通知工具
 */

/**
 * 检查通知权限
 */
export function checkPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

/**
 * 请求通知权限
 */
export async function requestPermission() {
  if (!('Notification' in window)) {
    return false
  }
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * 发送通知
 */
export function sendNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('浏览器不支持通知功能')
    return null
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('未获得通知权限')
    return null
  }
  
  const defaultOptions = {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    requireInteraction: false,
    ...options
  }
  
  const notification = new Notification(title, defaultOptions)
  
  if (options.onClick) {
    notification.onclick = options.onClick
  }
  
  if (options.onClose) {
    notification.onclose = options.onClose
  }
  
  return notification
}

/**
 * 发送健康提醒通知
 */
export function sendHealthReminder(type, message) {
  const titles = {
    water: '💧 喝水提醒',
    exercise: '🏃 运动提醒',
    medicine: '💊 服药提醒',
    sleep: '😴 睡眠提醒',
    measure: '📊 测量提醒',
    custom: '⏰ 提醒'
  }
  
  return sendNotification(titles[type] || titles.custom, {
    body: message,
    tag: `health-${type}`,
    renotify: true
  })
}

/**
 * 设置定时提醒
 */
export function setReminder(callback, delay) {
  return setTimeout(callback, delay)
}

/**
 * 设置重复提醒
 */
export function setRecurringReminder(callback, interval) {
  return setInterval(callback, interval)
}

/**
 * 清除提醒
 */
export function clearReminder(timerId) {
  clearTimeout(timerId)
}

/**
 * 清除重复提醒
 */
export function clearRecurringReminder(intervalId) {
  clearInterval(intervalId)
}
