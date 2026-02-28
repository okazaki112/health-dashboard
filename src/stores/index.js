import { createPinia } from 'pinia'

export { useProfileStore } from './profile'
export { useHealthStore } from './health'
export { useGoalsStore, GOAL_TYPES } from './goals'
export { useRemindersStore, REMINDER_TYPES } from './reminders'

export const pinia = createPinia()
