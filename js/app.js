/**
 * app.js - 應用主邏輯和初始化
 * 
 * 功能:
 * - 應用啟動初始化
 * - 模塊協調
 * - 全局事件處理
 */

class Application {
    constructor() {
        this.authManager = authManager;
        this.locationManager = locationManager;
        this.storageManager = storageManager;
        this.mapManager = mapManager;
        this.uiManager = uiManager;
        this.isInitialized = false;
    }

    /**
     * 初始化應用
     * @returns {Promise<void>}
     */
    async init() {
        try {
            console.log('應用初始化中...');

            // 1. 初始化UI (優先初始化，確保交互可用)
            this.uiManager.init();
            console.log('UI初始化完成');

            // 2. 初始化存儲系統 (允許失敗)
            try {
                await this.storageManager.initDB();
                console.log('存儲系統初始化完成');
            } catch (dbError) {
                console.error('存儲系統初始化失敗，將使用無緩存模式:', dbError);
                this.uiManager.showWarning('本地存儲初始化失敗，部分功能可能受限');
            }

            // 3. 初始化地圖
            this.mapManager.initMap();
            console.log('地圖初始化完成');

            // 4. 檢查已登錄用戶
            const savedUser = this.storageManager.getLocalStorage('currentUser');
            if (savedUser) {
                this.handleUserLogin(savedUser);
            }

            // 5. 加載位置數據
            await this.loadLocations();

            this.isInitialized = true;
            console.log('應用初始化完成');
        } catch (error) {
            console.error('應用初始化失敗:', error);
            this.uiManager.showError('應用初始化失敗');
        }
    }

    /**
     * 加載位置數據
     * @private
     * @returns {Promise<void>}
     */
    async loadLocations() {
        try {
            this.uiManager.showLoading('載入WiFi位置中...');
            
            // 模擬加載數據（實際使用GUN.js）
            const locations = await this.locationManager.getLocations();
            
            this.uiManager.updateLocationList(locations);
            this.uiManager.updateMapView(locations);
            
            this.uiManager.hideLoading();
            console.log('已加載', locations.length, '個位置');
        } catch (error) {
            console.error('加載位置失敗:', error);
            this.uiManager.showError('加載位置失敗');
        }
    }

    /**
     * 處理用戶登錄
     * @private
     * @param {object} user
     * @returns {void}
     */
    handleUserLogin(user) {
        console.log('用戶登錄:', user.username);
        this.uiManager.updateUserInfo(user);
        this.uiManager.closeModal('login');
        this.uiManager.showSuccess(`歡迎回來, ${user.username}!`);
    }

    /**
     * 處理用戶登出
     * @private
     * @returns {void}
     */
    handleUserLogout() {
        console.log('用戶登出');
        this.authManager.logout();
        this.uiManager.updateUserInfo(null);
        this.storageManager.removeLocalStorage('currentUser');
        this.uiManager.showSuccess('已登出');
    }

    /**
     * 處理認證表單提交
     * @param {string} username
     * @param {string} password
     * @returns {Promise<void>}
     */
    async handleAuthSubmit(username, password) {
        try {
            this.uiManager.showLoading('登錄中...');
            
            const success = await this.authManager.login(username, password);
            
            if (success) {
                const user = this.authManager.getCurrentUser();
                this.handleUserLogin(user);
                this.storageManager.setLocalStorage('currentUser', user);
            } else {
                this.uiManager.showError('登錄失敗: 用戶名或密碼錯誤');
            }
            
            this.uiManager.hideLoading();
        } catch (error) {
            console.error('登錄錯誤:', error);
            this.uiManager.showError('登錄發生錯誤');
            this.uiManager.hideLoading();
        }
    }

    /**
     * 處理新增位置
     * @param {object} locationData
     * @returns {Promise<void>}
     */
    async handleAddLocation(locationData) {
        try {
            if (!this.authManager.isLoggedIn()) {
                this.uiManager.showError('請先登錄');
                return;
            }

            this.uiManager.showLoading('新增位置中...');
            
            const success = await this.locationManager.addLocation(locationData);
            
            if (success) {
                this.uiManager.showSuccess('位置新增成功!');
                this.uiManager.clearForm('location-form');
                this.uiManager.closeModal('addLocation');
                await this.loadLocations();
            } else {
                this.uiManager.showError('位置新增失敗');
            }
            
            this.uiManager.hideLoading();
        } catch (error) {
            console.error('新增位置錯誤:', error);
            this.uiManager.showError('新增位置發生錯誤');
            this.uiManager.hideLoading();
        }
    }

    /**
     * 處理搜索
     * @param {string} query
     * @returns {Promise<void>}
     */
    async handleSearch(query) {
        try {
            if (!query.trim()) {
                await this.loadLocations();
                return;
            }

            const locations = await this.locationManager.searchLocations(query);
            this.uiManager.updateLocationList(locations);
            this.uiManager.updateMapView(locations);
        } catch (error) {
            console.error('搜索錯誤:', error);
            this.uiManager.showError('搜索失敗');
        }
    }

    /**
     * 處理篩選變更
     * @returns {Promise<void>}
     */
    async handleFilterChange() {
        try {
            const openOnly = document.getElementById('filter-open-only').checked;
            const noPassword = document.getElementById('filter-no-password').checked;
            
            const locations = await this.locationManager.getLocations();
            
            const filtered = locations.filter(loc => {
                if (openOnly && !loc.isOpen) return false;
                if (noPassword && loc.hasPassword) return false;
                return true;
            });
            
            this.uiManager.updateLocationList(filtered);
            this.uiManager.updateMapView(filtered);
        } catch (error) {
            console.error('篩選錯誤:', error);
        }
    }

    /**
     * 獲取應用狀態
     * @returns {object}
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentUser: this.authManager.getCurrentUser(),
            isAuthenticated: this.authManager.isLoggedIn(),
        };
    }
}

// 全局應用實例
const app = new Application();

// 應用啟動
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(error => {
        console.error('應用啟動失敗:', error);
    });
});
