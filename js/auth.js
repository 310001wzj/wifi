/**
 * auth.js - 用戶認證模塊 (GUN.js)
 * 
 * 功能:
 * - 用戶註冊
 * - 用戶登錄
 * - 用戶登出
 * - 驗證用戶身份
 */

class AuthManager {
    constructor() {
        this.gun = GUN();
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    /**
     * 用戶註冊
     * @param {string} username - 用戶名
     * @param {string} password - 密碼
     * @returns {Promise<boolean>} 註冊成功返回true
     */
    async register(username, password) {
        try {
            if (!username || !password || username.length < 3 || password.length < 6) {
                console.error('用戶名或密碼不符合要求');
                return false;
            }

            // 使用 GUN.js 註冊
            return new Promise((resolve) => {
                this.gun.user().create(username, password, (ack) => {
                    if (ack.ok) {
                        console.log('註冊成功:', username);
                        this.login(username, password);
                        resolve(true);
                    } else {
                        console.error('註冊失敗:', ack);
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('註冊錯誤:', error);
            return false;
        }
    }

    /**
     * 用戶登錄
     * @param {string} username - 用戶名
     * @param {string} password - 密碼
     * @returns {Promise<boolean>} 登錄成功返回true
     */
    async login(username, password) {
        try {
            if (!username || !password) {
                return false;
            }

            // 使用 GUN.js 登錄
            return new Promise((resolve) => {
                this.gun.user().auth(username, password, (ack) => {
                    if (ack.ok) {
                        this.currentUser = {
                            username: username,
                            id: this.gun.user()._.get
                        };
                        this.isAuthenticated = true;
                        console.log('登錄成功:', username);
                        resolve(true);
                    } else {
                        console.error('登錄失敗:', ack);
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('登錄錯誤:', error);
            return false;
        }
    }

    /**
     * 用戶登出
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            this.gun.user().leave();
            this.currentUser = null;
            this.isAuthenticated = false;
            console.log('已登出');
        } catch (error) {
            console.error('登出錯誤:', error);
        }
    }

    /**
     * 獲取當前登錄用戶
     * @returns {object|null} 用戶對象或null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 檢查用戶是否已認證
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.isAuthenticated;
    }

    /**
     * 驗證用戶名是否已存在
     * @param {string} username
     * @returns {Promise<boolean>}
     */
    usernameExists(username) {
        // TODO: 實現用戶名檢查
        throw new Error('usernameExists() not implemented');
    }

    /**
     * 更新用戶資料
     * @param {string} userId
     * @param {object} userData
     * @returns {Promise<boolean>}
     */
    updateUserProfile(userId, userData) {
        // TODO: 實現更新資料邏輯
        throw new Error('updateUserProfile() not implemented');
    }
}

// 全局實例
const authManager = new AuthManager();
