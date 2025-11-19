/**
 * location.js - WiFi位置管理模塊
 * 
 * 功能:
 * - 新增/編輯/刪除WiFi位置
 * - 查詢位置列表
 * - 位置評分評論
 */

class LocationManager {
    constructor() {
        this.gun = GUN();
        this.locations = [
            {
                id: 'demo_1',
                name: '台北車站',
                address: '台北市中正區北平東路1號',
                lat: 25.0488,
                lng: 121.5154,
                hasPassword: false,
                password: '',
                hours: '全天開放',
                rating: 4.5,
                ratingCount: 10,
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo_2',
                name: '新光三越信義店',
                address: '台北市信義區松壽路8號',
                lat: 25.0337,
                lng: 121.5645,
                hasPassword: true,
                password: 'password123',
                hours: '10:00-22:00',
                rating: 4.2,
                ratingCount: 8,
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo_3',
                name: '東門咖啡館',
                address: '台北市中山區南京東路一段',
                lat: 25.0420,
                lng: 121.5315,
                hasPassword: false,
                password: '',
                hours: '08:00-20:00',
                rating: 4.8,
                ratingCount: 12,
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * 新增WiFi位置
     * @param {object} locationData - 位置數據
     * @returns {Promise<string>} 返回新位置ID
     */
    async addLocation(locationData) {
        try {
            // 驗證數據
            const validation = this.validateLocationData(locationData);
            if (!validation.valid) {
                console.error('位置數據驗證失敗:', validation.errors);
                return null;
            }

            // 生成ID
            const id = 'loc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const newLocation = {
                id,
                ...locationData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rating: 0,
                ratingCount: 0
            };

            this.locations.push(newLocation);
            
            // 保存到本地存儲
            await storageManager.setIndexedDB('locations', newLocation);

            console.log('位置已新增:', id);
            return id;
        } catch (error) {
            console.error('新增位置失敗:', error);
            return null;
        }
    }

    /**
     * 編輯WiFi位置信息
     * @param {string} locationId
     * @param {object} updateData
     * @returns {Promise<boolean>}
     */
    async editLocation(locationId, updateData) {
        try {
            const index = this.locations.findIndex(l => l.id === locationId);
            if (index === -1) return false;

            this.locations[index] = {
                ...this.locations[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            await storageManager.setIndexedDB('locations', this.locations[index]);
            return true;
        } catch (error) {
            console.error('編輯位置失敗:', error);
            return false;
        }
    }

    /**
     * 刪除WiFi位置
     * @param {string} locationId
     * @returns {Promise<boolean>}
     */
    async deleteLocation(locationId) {
        try {
            const index = this.locations.findIndex(l => l.id === locationId);
            if (index === -1) return false;

            this.locations.splice(index, 1);
            await storageManager.deleteIndexedDB('locations', locationId);
            return true;
        } catch (error) {
            console.error('刪除位置失敗:', error);
            return false;
        }
    }

    /**
     * 獲取所有位置
     * @returns {Promise<array>} 位置列表
     */
    async getLocations() {
        try {
            // 嘗試從IndexedDB讀取
            const cached = await storageManager.getAllIndexedDB('locations');
            if (cached && cached.length > 0) {
                this.locations = cached;
                return this.locations;
            }
            
            // 返回內存中的位置 (演示數據)
            return this.locations;
        } catch (error) {
            console.error('獲取位置失敗:', error);
            return [];
        }
    }

    /**
     * 按ID獲取位置
     * @param {string} locationId
     * @returns {Promise<object|null>}
     */
    async getLocationById(locationId) {
        try {
            return this.locations.find(l => l.id === locationId) || null;
        } catch (error) {
            console.error('獲取位置失敗:', error);
            return null;
        }
    }

    /**
     * 按名稱搜索位置
     * @param {string} searchTerm
     * @returns {Promise<array>}
     */
    async searchLocations(searchTerm) {
        try {
            const term = searchTerm.toLowerCase();
            return this.locations.filter(l => 
                l.name.toLowerCase().includes(term) ||
                l.address.toLowerCase().includes(term)
            );
        } catch (error) {
            console.error('搜索位置失敗:', error);
            return [];
        }
    }

    /**
     * 按距離查詢附近位置
     * @param {number} lat - 用戶緯度
     * @param {number} lng - 用戶經度
     * @param {number} radiusKm - 搜索半徑(公里)
     * @returns {Promise<array>}
     */
    async getNearbyLocations(lat, lng, radiusKm = 5) {
        try {
            const nearby = this.locations
                .map(location => ({
                    ...location,
                    distance: this._calculateDistance(lat, lng, location.lat, location.lng)
                }))
                .filter(location => location.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance);

            return nearby;
        } catch (error) {
            console.error('查詢附近位置失敗:', error);
            return [];
        }
    }

    /**
     * 驗證位置數據格式
     * @param {object} locationData
     * @returns {object} {valid: boolean, errors: array}
     */
    validateLocationData(locationData) {
        const errors = [];

        if (!locationData.name || locationData.name.trim().length === 0) {
            errors.push('WiFi名稱不能為空');
        }
        if (!locationData.address || locationData.address.trim().length === 0) {
            errors.push('地址不能為空');
        }
        if (typeof locationData.lat !== 'number' || locationData.lat < -90 || locationData.lat > 90) {
            errors.push('緯度無效');
        }
        if (typeof locationData.lng !== 'number' || locationData.lng < -180 || locationData.lng > 180) {
            errors.push('經度無效');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 計算兩點之間的距離 (Haversine公式)
     * @private
     * @param {number} lat1, lng1, lat2, lng2
     * @returns {number} 距離(公里)
     */
    _calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 地球半徑(公里)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * 添加評分
     * @param {string} locationId
     * @param {number} rating - 1-5星
     * @returns {Promise<boolean>}
     */
    async addRating(locationId, rating) {
        try {
            if (rating < 1 || rating > 5) return false;
            
            const location = await this.getLocationById(locationId);
            if (!location) return false;

            location.ratingCount = (location.ratingCount || 0) + 1;
            location.rating = ((location.rating || 0) * (location.ratingCount - 1) + rating) / location.ratingCount;

            return await this.editLocation(locationId, location);
        } catch (error) {
            console.error('添加評分失敗:', error);
            return false;
        }
    }

    /**
     * 獲取位置的平均評分
     * @param {string} locationId
     * @returns {Promise<number>}
     */
    async getAverageRating(locationId) {
        const location = await this.getLocationById(locationId);
        return location ? (location.rating || 0) : 0;
    }

    /**
     * 添加評論
     * @param {string} locationId
     * @param {object} commentData - {text, rating, author}
     * @returns {Promise<string>} 返回評論ID
     */
    async addComment(locationId, commentData) {
        // TODO: 實現評論邏輯 (涉及GUN.js)
        console.log('添加評論 (待實現):', locationId, commentData);
        return 'comment_' + Date.now();
    }

    /**
     * 獲取位置的評論
     * @param {string} locationId
     * @returns {Promise<array>}
     */
    async getComments(locationId) {
        // TODO: 實現查詢邏輯
        return [];
    }

    /**
     * 點讚評論
     * @param {string} commentId
     * @returns {Promise<boolean>}
     */
    async likeComment(commentId) {
        // TODO: 實現點讚邏輯
        return false;
    }
}

// 全局實例
const locationManager = new LocationManager();
