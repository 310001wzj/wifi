/**
 * map.js - Leaflet地圖模塊
 * 
 * 功能:
 * - 地圖初始化
 * - 標記管理
 * - 彈出窗口
 */

class MapManager {
    constructor(mapElementId = 'map') {
        this.mapElementId = mapElementId;
        this.map = null;
        this.markers = {};
        this.userMarker = null;
        this.defaultZoom = 13;
        this.defaultCenter = { lat: 25.0330, lng: 121.5654 }; // 台北
    }

    /**
     * 初始化地圖
     * @param {object} options - {center, zoom}
     * @returns {void}
     */
    initMap(options = {}) {
        const center = options.center || this.defaultCenter;
        const zoom = options.zoom || this.defaultZoom;

        try {
            // 使用 Leaflet 初始化地圖
            this.map = L.map(this.mapElementId).setView(
                [center.lat, center.lng],
                zoom
            );

            // 添加 OpenStreetMap 圖層
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 2
            }).addTo(this.map);

            console.log('地圖初始化成功');
        } catch (error) {
            console.error('地圖初始化失敗:', error);
        }
    }

    /**
     * 設定地圖中心點
     * @param {number} lat
     * @param {number} lng
     * @param {number} zoom
     * @returns {void}
     */
    setCenter(lat, lng, zoom = this.defaultZoom) {
        if (this.map && this.isValidCoordinate(lat, lng)) {
            this.map.setView([lat, lng], zoom);
        }
    }

    /**
     * 驗證坐標有效性
     * @param {number} lat
     * @param {number} lng
     * @returns {boolean}
     */
    isValidCoordinate(lat, lng) {
        return typeof lat === 'number' && typeof lng === 'number' &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180;
    }

    /**
     * 添加標記到地圖
     * @param {string} id - 標記ID
     * @param {number} lat
     * @param {number} lng
     * @param {object} options - {title, popup, color, icon}
     * @returns {void}
     */
    addMarker(id, lat, lng, options = {}) {
        if (!this.map || !this.isValidCoordinate(lat, lng)) {
            return;
        }

        try {
            const color = options.color || 'blue';
            const colorMap = {
                'red': '#f44336',
                'green': '#4caf50',
                'blue': '#2196f3',
                'orange': '#ff9800',
                'yellow': '#ffeb3b'
            };

            const markerColor = colorMap[color] || colorMap.blue;

            // 創建帶顏色的圖標
            const markerIcon = L.icon({
                iconUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMCIvPjwvc3ZnPg==`,
                className: 'custom-marker',
                html: `<div style="width: 30px; height: 40px; background-color: ${markerColor}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;"><span style="transform: rotate(45deg); color: white; font-size: 16px;">📍</span></div>`,
                iconSize: [30, 40],
                iconAnchor: [15, 40],
                popupAnchor: [0, -40]
            });

            const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(this.map);
            
            if (options.popup) {
                marker.bindPopup(`<b>${options.popup}</b>`);
            }

            if (options.title) {
                marker.setTitle(options.title);
            }

            this.markers[id] = marker;
            console.log('添加標記:', id);
        } catch (error) {
            console.error('添加標記失敗:', error);
        }
    }

    /**
     * 移除標記
     * @param {string} id
     * @returns {void}
     */
    removeMarker(id) {
        if (this.markers[id] && this.map) {
            this.map.removeLayer(this.markers[id]);
            delete this.markers[id];
        }
    }

    /**
     * 更新標記位置
     * @param {string} id
     * @param {number} lat
     * @param {number} lng
     * @returns {void}
     */
    updateMarkerPosition(id, lat, lng) {
        if (this.markers[id] && this.isValidCoordinate(lat, lng)) {
            this.markers[id].setLatLng([lat, lng]);
        }
    }

    /**
     * 更新標記信息
     * @param {string} id
     * @param {object} data
     * @returns {void}
     */
    updateMarkerInfo(id, data) {
        if (this.markers[id]) {
            if (data.title) {
                this.markers[id].setTitle(data.title);
            }
            if (data.popup) {
                this.markers[id].setPopupContent(`<b>${data.popup}</b>`);
            }
        }
    }

    /**
     * 清空所有標記
     * @returns {void}
     */
    clearMarkers() {
        Object.keys(this.markers).forEach(id => {
            this.removeMarker(id);
        });
        this.markers = {};
    }

    /**
     * 設定用戶位置標記
     * @param {number} lat
     * @param {number} lng
     * @returns {void}
     */
    setUserMarker(lat, lng) {
        // TODO: 實現用戶位置標記
        throw new Error('setUserMarker() not implemented');
    }

    /**
     * 獲取用戶當前位置
     * @returns {Promise<{lat, lng}>}
     */
    async getUserLocation() {
        // TODO: 實現地理定位邏輯
        throw new Error('getUserLocation() not implemented');
    }

    /**
     * 顯示標記彈出窗口
     * @param {string} markerId
     * @returns {void}
     */
    openPopup(markerId) {
        // TODO: 實現彈出邏輯
        throw new Error('openPopup() not implemented');
    }

    /**
     * 關閉標記彈出窗口
     * @param {string} markerId
     * @returns {void}
     */
    closePopup(markerId) {
        // TODO: 實現關閉邏輯
        throw new Error('closePopup() not implemented');
    }

    /**
     * 獲取地圖邊界內的所有標記
     * @returns {array}
     */
    getMarkersInBounds() {
        // TODO: 實現邊界查詢
        throw new Error('getMarkersInBounds() not implemented');
    }

    /**
     * 縮放到包含所有標記
     * @returns {void}
     */
    fitBounds() {
        // TODO: 實現自動縮放邏輯
        throw new Error('fitBounds() not implemented');
    }

    /**
     * 繪製熱力圖 (可選)
     * @param {array} locations - 位置數組
     * @returns {void}
     */
    drawHeatmap(locations) {
        // TODO: 實現熱力圖繪製
        throw new Error('drawHeatmap() not implemented');
    }

    /**
     * 驗證坐標有效性
     * @param {number} lat
     * @param {number} lng
     * @returns {boolean}
     */
    isValidCoordinate(lat, lng) {
        // TODO: 實現驗證邏輯
        throw new Error('isValidCoordinate() not implemented');
    }
}

// 全局實例
const mapManager = new MapManager();
