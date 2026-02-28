import { openDB } from 'idb'

const DB_NAME = 'HealthDashboardDB'
const DB_VERSION = 1

let dbInstance = null

/**
 * 初始化 IndexedDB
 */
async function initDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 健康记录存储
      if (!db.objectStoreNames.contains('records')) {
        const recordsStore = db.createObjectStore('records', { keyPath: 'id' })
        recordsStore.createIndex('date', 'date', { unique: false })
        recordsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // 成就存储
      if (!db.objectStoreNames.contains('achievements')) {
        const achievementsStore = db.createObjectStore('achievements', { keyPath: 'id' })
        achievementsStore.createIndex('date', 'date', { unique: false })
        achievementsStore.createIndex('type', 'type', { unique: false })
      }
    }
  })

  return dbInstance
}

/**
 * IndexedDB 操作类
 */
export const idb = {
  /**
   * 初始化数据库
   */
  async init() {
    return await initDB()
  },

  /**
   * 添加记录
   */
  async add(storeName, data) {
    const db = await initDB()
    return await db.add(storeName, data)
  },

  /**
   * 批量添加
   */
  async addBatch(storeName, dataList) {
    const db = await initDB()
    const tx = db.transaction(storeName, 'readwrite')
    await Promise.all([
      ...dataList.map(data => tx.store.add(data)),
      tx.done
    ])
  },

  /**
   * 更新记录
   */
  async update(storeName, data) {
    const db = await initDB()
    return await db.put(storeName, data)
  },

  /**
   * 删除记录
   */
  async delete(storeName, id) {
    const db = await initDB()
    return await db.delete(storeName, id)
  },

  /**
   * 查询单条
   */
  async get(storeName, id) {
    const db = await initDB()
    return await db.get(storeName, id)
  },

  /**
   * 查询所有
   */
  async getAll(storeName) {
    const db = await initDB()
    return await db.getAll(storeName)
  },

  /**
   * 按索引查询
   */
  async getByIndex(storeName, indexName, value) {
    const db = await initDB()
    return await db.getAllFromIndex(storeName, indexName, value)
  },

  /**
   * 按范围查询
   */
  async getByRange(storeName, indexName, start, end) {
    const db = await initDB()
    const range = IDBKeyRange.bound(start, end)
    return await db.getAllFromIndex(storeName, indexName, range)
  },

  /**
   * 清空存储
   */
  async clear(storeName) {
    const db = await initDB()
    return await db.clear(storeName)
  },

  /**
   * 获取记录数量
   */
  async count(storeName) {
    const db = await initDB()
    return await db.count(storeName)
  }
}

export default idb
