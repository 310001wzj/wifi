/**
 * ui.js - UI交互邏輯模塊
 * 
 * 功能:
 * - 模態框管理
 * - 事件監聽
 * - DOM操作
 */

class UIManager {
    constructor() {
        this.modals = {};
        this.activeModal = null;
    }

    /**
     * 初始化UI事件監聽
     * @returns {void}
     */
    init() {
        this.initializeModals();
        this.attachEventListeners();
        console.log('UI初始化完成');
    }

    /**
     * 初始化模態框容器
     * @private
     * @returns {void}
     */
    initializeModals() {
        this.modals = {
            login: document.getElementById('modal-login'),
            addLocation: document.getElementById('modal-add-location'),
            locationDetail: document.getElementById('modal-location-detail')
        };
    }

    /**
     * 綁定所有事件監聽器
     * @private
     * @returns {void}
     */
    attachEventListeners() {
        // 登錄/登出按鈕
        document.getElementById('btn-login').addEventListener('click', () => this.openModal('login'));
        document.getElementById('btn-logout').addEventListener('click', () => {
            app.handleUserLogout();
        });

        // 新增位置按鈕
        document.getElementById('btn-add-location').addEventListener('click', () => {
            this.openModal('addLocation');
        });

        // 模態框關閉按鈕
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModalByElement(modal);
            });
        });

        // 點擊模態框背景關閉
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModalByElement(modal);
                }
            });
        });

        // 認證表單提交
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('auth-username').value.trim();
            const password = document.getElementById('auth-password').value.trim();
            if (username && password) {
                app.handleAuthSubmit(username, password);
            }
        });

        // 切換登錄/註冊
        document.getElementById('btn-toggle-signup').addEventListener('click', () => {
            console.log('切換登錄/註冊模式 (待實現)');
        });

        // 位置表單提交
        document.getElementById('location-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const locationData = {
                name: document.getElementById('location-name').value.trim(),
                address: document.getElementById('location-address').value.trim(),
                lat: parseFloat(document.getElementById('location-lat').value),
                lng: parseFloat(document.getElementById('location-lng').value),
                hasPassword: document.getElementById('location-has-password').checked,
                password: document.getElementById('location-password').value.trim(),
                hours: document.getElementById('location-hours').value.trim()
            };
            if (locationData.name && locationData.address && locationData.lat && locationData.lng) {
                app.handleAddLocation(locationData);
            }
        });

        // 搜索功能
        document.getElementById('search-input').addEventListener('input', (e) => {
            const query = e.target.value.trim();
            app.handleSearch(query);
        });

        // 篩選功能
        document.getElementById('filter-open-only').addEventListener('change', () => {
            app.handleFilterChange();
        });
        document.getElementById('filter-no-password').addEventListener('change', () => {
            app.handleFilterChange();
        });
    }

    /**
     * 打開模態框
     * @param {string} modalId
     * @returns {void}
     */
    openModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].style.display = 'flex';
            this.activeModal = modalId;
            console.log('打開模態框:', modalId);
        }
    }

    /**
     * 關閉模態框
     * @param {string} modalId
     * @returns {void}
     */
    closeModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].style.display = 'none';
            if (this.activeModal === modalId) {
                this.activeModal = null;
            }
            console.log('關閉模態框:', modalId);
        }
    }

    /**
     * 通過模態框元素關閉
     * @private
     * @param {HTMLElement} modal
     * @returns {void}
     */
    closeModalByElement(modal) {
        modal.style.display = 'none';
        this.activeModal = null;
    }

    /**
     * 更新用戶信息顯示
     * @param {object} user
     * @returns {void}
     */
    updateUserInfo(user) {
        const userInfoElement = document.getElementById('user-info');
        const btnLogin = document.getElementById('btn-login');
        const btnLogout = document.getElementById('btn-logout');

        if (user) {
            userInfoElement.textContent = `歡迎, ${user.username}`;
            btnLogin.style.display = 'none';
            btnLogout.style.display = 'inline-block';
        } else {
            userInfoElement.textContent = '';
            btnLogin.style.display = 'inline-block';
            btnLogout.style.display = 'none';
        }
    }

    /**
     * 更新位置列表
     * @param {array} locations
     * @returns {void}
     */
    updateLocationList(locations) {
        const locationList = document.getElementById('location-list');
        
        if (!locations || locations.length === 0) {
            locationList.innerHTML = '<p class="placeholder">未找到WiFi位置</p>';
            return;
        }

        locationList.innerHTML = locations.map(loc => `
            <div class="location-item" data-id="${loc.id || Math.random()}">
                <div class="location-name">${loc.name || 'Unknown'}</div>
                <div class="location-info">
                    <span class="location-distance">${loc.distance ? loc.distance.toFixed(1) + 'km' : 'N/A'}</span>
                    <span class="location-address">${loc.address || ''}</span>
                </div>
                <div class="location-rating">
                    ${'⭐'.repeat(Math.floor(loc.rating || 0))}
                </div>
            </div>
        `).join('');

        // 綁定點擊事件
        document.querySelectorAll('.location-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const location = locations.find(l => (l.id || Math.random()) === id);
                if (location) {
                    this.showLocationDetail(location);
                }
            });
        });
    }

    /**
     * 顯示位置詳情
     * @param {object} locationData
     * @returns {void}
     */
    showLocationDetail(locationData) {
        const detailName = document.getElementById('detail-name');
        const detailContent = document.getElementById('detail-content');

        detailName.textContent = locationData.name || 'WiFi 位置';
        detailContent.innerHTML = `
            <div class="detail-item">
                <strong>地址:</strong> ${locationData.address || 'N/A'}
            </div>
            <div class="detail-item">
                <strong>座標:</strong> ${locationData.lat?.toFixed(4)}, ${locationData.lng?.toFixed(4)}
            </div>
            <div class="detail-item">
                <strong>需要密碼:</strong> ${locationData.hasPassword ? '是' : '否'}
            </div>
            ${locationData.hours ? `
                <div class="detail-item">
                    <strong>營業時間:</strong> ${locationData.hours}
                </div>
            ` : ''}
            <div class="detail-item">
                <strong>評分:</strong> ${locationData.rating || 'N/A'} / 5
            </div>
        `;

        this.openModal('locationDetail');
    }

    /**
     * 顯示加載狀態
     * @param {string} message
     * @returns {void}
     */
    showLoading(message = '載入中...') {
        const locationList = document.getElementById('location-list');
        locationList.innerHTML = `<p class="placeholder">${message}</p>`;
    }

    /**
     * 隱藏加載狀態
     * @returns {void}
     */
    hideLoading() {
        // 通常由其他方法覆蓋，不需要特殊操作
    }

    /**
     * 顯示成功消息
     * @param {string} message
     * @param {number} duration - 毫秒
     * @returns {void}
     */
    showSuccess(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }

    /**
     * 顯示錯誤消息
     * @param {string} message
     * @param {number} duration
     * @returns {void}
     */
    showError(message, duration = 3000) {
        this.showToast(message, 'error', duration);
    }

    /**
     * 顯示警告消息
     * @param {string} message
     * @param {number} duration
     * @returns {void}
     */
    showWarning(message, duration = 3000) {
        this.showToast(message, 'warning', duration);
    }

    /**
     * 顯示提示消息 (私有方法)
     * @private
     * @param {string} message
     * @param {string} type - 'success' | 'error' | 'warning'
     * @param {number} duration
     * @returns {void}
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    /**
     * 確認對話框
     * @param {string} message
     * @returns {Promise<boolean>}
     */
    confirm(message) {
        return new Promise((resolve) => {
            const confirmed = window.confirm(message);
            resolve(confirmed);
        });
    }

    /**
     * 切換側邊欄 (移動版)
     * @returns {void}
     */
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    /**
     * 更新地圖視圖
     * @param {array} locations
     * @returns {void}
     */
    updateMapView(locations) {
        // 通常由 mapManager 直接處理
        if (mapManager && mapManager.clearMarkers) {
            mapManager.clearMarkers();
            locations.forEach(loc => {
                if (mapManager.addMarker) {
                    mapManager.addMarker(
                        loc.id || 'loc-' + Math.random(),
                        loc.lat,
                        loc.lng,
                        {
                            title: loc.name,
                            popup: loc.name,
                            color: loc.hasPassword ? 'red' : 'green'
                        }
                    );
                }
            });
        }
    }

    /**
     * 清空表單
     * @param {string} formId
     * @returns {void}
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    /**
     * 設置按鈕為禁用狀態
     * @param {string} buttonId
     * @param {boolean} disabled
     * @returns {void}
     */
    setButtonDisabled(buttonId, disabled = true) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = disabled;
            button.style.opacity = disabled ? '0.5' : '1';
        }
    }

    /**
     * 更新評論列表
     * @param {string} locationId
     * @param {array} comments
     * @returns {void}
     */
    updateCommentsList(locationId, comments) {
        // 待實現: 評論功能
        console.log('updateCommentsList:', locationId, comments);
    }
}

// 全局實例
const uiManager = new UIManager();
