/**
 * storage.js - 本地存儲模塊
 * 
 * 功能:
 * - LocalStorage 數據保存/讀取
 * - IndexedDB 離線緩存
 * - 同步機制
 */

class StorageManager {
    constructor() {
        this.storagePrefix = 'wifi_';
        this.db = null;
        this.dbName = 'WiFiLocatorDB';
        this.dbVersion = 1;
    }

    /**
     * 初始化 IndexedDB
     * @returns {Promise<void>}
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB初始化失敗');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB初始化成功');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 創建對象存儲
                if (!db.objectStoreNames.contains('locations')) {
                    db.createObjectStore('locations', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('comments')) {
                    db.createObjectStore('comments', { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * 保存數據到 LocalStorage
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    setLocalStorage(key, value) {
        try {
            const fullKey = this.storagePrefix + key;
            localStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage保存失敗:', error);
            return false;
        }
    }

    /**
     * 從 LocalStorage 讀取數據
     * @param {string} key
     * @returns {*|null}
     */
    getLocalStorage(key) {
        try {
            const fullKey = this.storagePrefix + key;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('LocalStorage讀取失敗:', error);
            return null;
        }
    }

    /**
     * 刪除 LocalStorage 中的數據
     * @param {string} key
     * @returns {boolean}
     */
    removeLocalStorage(key) {
        try {
            const fullKey = this.storagePrefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('LocalStorage刪除失敗:', error);
            return false;
        }
    }

    /**
     * 清空所有 LocalStorage
     * @returns {void}
     */
    clearLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('LocalStorage清空失敗:', error);
        }
    }

    /**
     * 檢查 LocalStorage 是否可用
     * @returns {boolean}
     */
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 檢查 IndexedDB 是否可用
     * @returns {boolean}
     */
    isIndexedDBAvailable() {
        return !!window.indexedDB;
    }

    /**
     * 保存數據到 IndexedDB
     * @param {string} storeName - 倉庫名稱
     * @param {object} data
     * @returns {Promise<boolean>}
     */
    async setIndexedDB(storeName, data) {
        if (!this.db) return false;

        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(data);

                request.onsuccess = () => resolve(true);
                request.onerror = () => resolve(false);
            } catch (error) {
                console.error('IndexedDB保存失敗:', error);
                resolve(false);
            }
        });
    }

    /**
     * 從 IndexedDB 讀取數據
     * @param {string} storeName
     * @param {string} key
     * @returns {Promise<*|null>}
     */
    async getIndexedDB(storeName, key) {
        if (!this.db) return null;

        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => resolve(null);
            } catch (error) {
                console.error('IndexedDB讀取失敗:', error);
                resolve(null);
            }
        });
    }

    /**
     * 獲取 IndexedDB 中倉庫的所有數據
     * @param {string} storeName
     * @returns {Promise<array>}
     */
    async getAllIndexedDB(storeName) {
        if (!this.db) return [];

        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            } catch (error) {
                console.error('IndexedDB批量讀取失敗:', error);
                resolve([]);
            }
        });
    }

    /**
     * 刪除 IndexedDB 中的數據
     * @param {string} storeName
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    async deleteIndexedDB(storeName, key) {
        if (!this.db) return false;

        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(key);

                request.onsuccess = () => resolve(true);
                request.onerror = () => resolve(false);
            } catch (error) {
                console.error('IndexedDB刪除失敗:', error);
                resolve(false);
            }
        });
    }

    /**
     * 清空 IndexedDB 倉庫
     * @param {string} storeName
     * @returns {Promise<void>}
     */
    async clearIndexedDB(storeName) {
        if (!this.db) return;

        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => resolve();
            } catch (error) {
                console.error('IndexedDB清空失敗:', error);
                resolve();
            }
        });
    }

    /**
     * 獲取存儲容量信息
     * @returns {Promise<object>} {usage, quota}
     */
    async getStorageInfo() {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                percentage: (estimate.usage / estimate.quota) * 100
            };
        }
        return { usage: 0, quota: 0, percentage: 0 };
    }

    /**
     * 同步本地數據到GUN
     * @returns {Promise<boolean>}
     */
    async syncToGUN() {
        // TODO: 實現同步邏輯 (涉及GUN.js集成)
        console.log('同步本地數據到GUN (待實現)');
        return true;
    }

    /**
     * 從GUN同步數據到本地
     * @returns {Promise<boolean>}
     */
    async syncFromGUN() {
        // TODO: 實現同步邏輯 (涉及GUN.js集成)
        console.log('從GUN同步數據到本地 (待實現)');
        return true;
    }
}

// 全局實例
const storageManager = new StorageManager();
