/**
 * tests/location.test.js - WiFi位置管理測試
 * 
 * TDD 測試用例: 位置管理、搜索、評分評論
 */

describe('LocationManager - WiFi位置管理', () => {
    let locationManager;
    let mockLocationData;

    beforeEach(() => {
        locationManager = new LocationManager();
        mockLocationData = {
            name: 'Star Cafe',
            address: '台北市中山區'',
            lat: 25.0443,
            lng: 121.5119,
            ssid: 'StarWiFi',
            hasPassword: false,
            speed: 4,
            operational: true,
            hours: '09:00-22:00'
        };
    });

    describe('新增位置', () => {
        test('應該成功新增有效的WiFi位置', async () => {
            const id = await locationManager.addLocation(mockLocationData);
            expect(id).toBeDefined();
            expect(typeof id).toBe('string');
        });

        test('新增後應該能查詢到該位置', async () => {
            const id = await locationManager.addLocation(mockLocationData);
            const location = await locationManager.getLocationById(id);
            expect(location).not.toBeNull();
            expect(location.name).toBe('Star Cafe');
        });

        test('應該拒絕缺少必要字段的位置', async () => {
            const invalidData = { name: 'Test' }; // 缺少經緯度
            const result = await locationManager.addLocation(invalidData);
            expect(result).toBeFalsy();
        });

        test('應該拒絕無效的坐標', async () => {
            const invalidData = { ...mockLocationData, lat: 200 }; // 緯度超出範圍
            const result = await locationManager.addLocation(invalidData);
            expect(result).toBeFalsy();
        });

        test('應該拒絕空字符串的名稱', async () => {
            const invalidData = { ...mockLocationData, name: '' };
            const result = await locationManager.addLocation(invalidData);
            expect(result).toBeFalsy();
        });

        test('應該自動設定創建時間戳', async () => {
            const id = await locationManager.addLocation(mockLocationData);
            const location = await locationManager.getLocationById(id);
            expect(location.createdAt).toBeDefined();
        });

        test('應該自動記錄創建者ID', async () => {
            const id = await locationManager.addLocation(mockLocationData);
            const location = await locationManager.getLocationById(id);
            expect(location.createdBy).toBeDefined();
        });
    });

    describe('編輯位置', () => {
        let locationId;

        beforeEach(async () => {
            locationId = await locationManager.addLocation(mockLocationData);
        });

        test('應該成功編輯位置信息', async () => {
            const result = await locationManager.editLocation(locationId, { speed: 5 });
            expect(result).toBe(true);
            const location = await locationManager.getLocationById(locationId);
            expect(location.speed).toBe(5);
        });

        test('應該允許編輯多個字段', async () => {
            const updateData = {
                name: 'Star Cafe V2',
                hours: '09:00-23:00'
            };
            await locationManager.editLocation(locationId, updateData);
            const location = await locationManager.getLocationById(locationId);
            expect(location.name).toBe('Star Cafe V2');
            expect(location.hours).toBe('09:00-23:00');
        });

        test('應該拒絕編輯不存在的位置', async () => {
            const result = await locationManager.editLocation('nonexistent_id', { speed: 5 });
            expect(result).toBe(false);
        });

        test('編輯後應該更新修改時間戳', async () => {
            const originalLocation = await locationManager.getLocationById(locationId);
            await new Promise(resolve => setTimeout(resolve, 100));
            await locationManager.editLocation(locationId, { speed: 5 });
            const updatedLocation = await locationManager.getLocationById(locationId);
            expect(updatedLocation.updatedAt).toBeGreater(originalLocation.updatedAt || 0);
        });

        test('應該驗證編輯後的數據', async () => {
            const result = await locationManager.editLocation(locationId, { lat: 200 });
            expect(result).toBe(false); // 無效的緯度
        });
    });

    describe('刪除位置', () => {
        let locationId;

        beforeEach(async () => {
            locationId = await locationManager.addLocation(mockLocationData);
        });

        test('應該成功刪除位置', async () => {
            const result = await locationManager.deleteLocation(locationId);
            expect(result).toBe(true);
        });

        test('刪除後應該無法查詢到該位置', async () => {
            await locationManager.deleteLocation(locationId);
            const location = await locationManager.getLocationById(locationId);
            expect(location).toBeNull();
        });

        test('應該拒絕刪除不存在的位置', async () => {
            const result = await locationManager.deleteLocation('nonexistent_id');
            expect(result).toBe(false);
        });
    });

    describe('查詢位置', () => {
        beforeEach(async () => {
            await locationManager.addLocation({ ...mockLocationData, name: 'Star Cafe' });
            await locationManager.addLocation({ ...mockLocationData, name: 'Moon Coffee', lat: 25.0500, lng: 121.5200 });
            await locationManager.addLocation({ ...mockLocationData, name: 'Sun Bakery', lat: 25.0400, lng: 121.5100 });
        });

        test('應該獲取所有位置', async () => {
            const locations = await locationManager.getAllLocations();
            expect(locations).toBeInstanceOf(Array);
            expect(locations.length).toBeGreaterThanOrEqual(3);
        });

        test('應該按ID查詢特定位置', async () => {
            const locations = await locationManager.getAllLocations();
            const id = locations[0].id;
            const location = await locationManager.getLocationById(id);
            expect(location).not.toBeNull();
            expect(location.id).toBe(id);
        });

        test('按ID查詢不存在的位置應該返回null', async () => {
            const location = await locationManager.getLocationById('nonexistent_id');
            expect(location).toBeNull();
        });

        test('應該按名稱搜索位置 (精確匹配)', async () => {
            const results = await locationManager.searchByName('Star Cafe');
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].name).toBe('Star Cafe');
        });

        test('應該按名稱搜索位置 (模糊匹配)', async () => {
            const results = await locationManager.searchByName('Cafe');
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].name).toContain('Cafe');
        });

        test('搜索應該不區分大小寫', async () => {
            const results = await locationManager.searchByName('star cafe');
            expect(results.length).toBeGreaterThan(0);
        });

        test('搜索不存在的名稱應該返回空數組', async () => {
            const results = await locationManager.searchByName('NonexistentPlace');
            expect(results).toEqual([]);
        });
    });

    describe('附近位置查詢', () => {
        beforeEach(async () => {
            // 添加多個不同位置的WiFi
            await locationManager.addLocation({ ...mockLocationData, name: 'Cafe A', lat: 25.0330, lng: 121.5654 });
            await locationManager.addLocation({ ...mockLocationData, name: 'Cafe B', lat: 25.0340, lng: 121.5664 });
            await locationManager.addLocation({ ...mockLocationData, name: 'Cafe C', lat: 25.1330, lng: 121.6654 }); // 遠距離
        });

        test('應該返回指定距離內的位置', async () => {
            const nearby = await locationManager.getNearbyLocations(25.0330, 121.5654, 5);
            expect(nearby).toBeInstanceOf(Array);
            expect(nearby.length).toBeGreaterThan(0);
        });

        test('應該不包含超出距離範圍的位置', async () => {
            const nearby = await locationManager.getNearbyLocations(25.0330, 121.5654, 1);
            const farLocations = nearby.filter(loc => {
                const distance = locationManager._calculateDistance(
                    25.0330, 121.5654, loc.lat, loc.lng
                );
                return distance > 1;
            });
            expect(farLocations.length).toBe(0);
        });

        test('應該按距離排序結果', async () => {
            const nearby = await locationManager.getNearbyLocations(25.0330, 121.5654, 10);
            for (let i = 0; i < nearby.length - 1; i++) {
                const dist1 = locationManager._calculateDistance(
                    25.0330, 121.5654, nearby[i].lat, nearby[i].lng
                );
                const dist2 = locationManager._calculateDistance(
                    25.0330, 121.5654, nearby[i + 1].lat, nearby[i + 1].lng
                );
                expect(dist1).toBeLessThanOrEqual(dist2);
            }
        });

        test('默認搜索半徑應該是5公里', async () => {
            const nearby = await locationManager.getNearbyLocations(25.0330, 121.5654);
            expect(nearby).toBeInstanceOf(Array);
        });
    });

    describe('位置數據驗證', () => {
        test('有效數據應該通過驗證', () => {
            const validation = locationManager.validateLocationData(mockLocationData);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toEqual([]);
        });

        test('缺少必要字段應該返回錯誤', () => {
            const invalidData = { name: 'Test' };
            const validation = locationManager.validateLocationData(invalidData);
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        test('無效的坐標應該返回錯誤', () => {
            const invalidData = { ...mockLocationData, lat: 200 };
            const validation = locationManager.validateLocationData(invalidData);
            expect(validation.valid).toBe(false);
        });

        test('無效的速度評分應該返回錯誤', () => {
            const invalidData = { ...mockLocationData, speed: 10 };
            const validation = locationManager.validateLocationData(invalidData);
            expect(validation.valid).toBe(false);
        });
    });

    describe('評分系統', () => {
        let locationId;

        beforeEach(async () => {
            locationId = await locationManager.addLocation(mockLocationData);
        });

        test('應該成功添加評分', async () => {
            const result = await locationManager.addRating(locationId, 5);
            expect(result).toBe(true);
        });

        test('應該拒絕超出範圍的評分 (>5)', async () => {
            const result = await locationManager.addRating(locationId, 6);
            expect(result).toBe(false);
        });

        test('應該拒絕超出範圍的評分 (<1)', async () => {
            const result = await locationManager.addRating(locationId, 0);
            expect(result).toBe(false);
        });

        test('應該允許浮點評分', async () => {
            const result = await locationManager.addRating(locationId, 4.5);
            expect(result).toBe(true);
        });

        test('應該計算正確的平均評分', async () => {
            await locationManager.addRating(locationId, 5);
            await locationManager.addRating(locationId, 3);
            await locationManager.addRating(locationId, 4);
            const average = await locationManager.getAverageRating(locationId);
            expect(average).toBe(4);
        });

        test('沒有評分的位置應該返回0分', async () => {
            const newLocationId = await locationManager.addLocation(mockLocationData);
            const average = await locationManager.getAverageRating(newLocationId);
            expect(average).toBe(0);
        });
    });

    describe('評論系統', () => {
        let locationId;

        beforeEach(async () => {
            locationId = await locationManager.addLocation(mockLocationData);
        });

        test('應該成功添加評論', async () => {
            const commentId = await locationManager.addComment(locationId, {
                text: '不錯的WiFi',
                rating: 4,
                author: 'user123'
            });
            expect(commentId).toBeDefined();
        });

        test('應該能檢索位置的所有評論', async () => {
            await locationManager.addComment(locationId, {
                text: '很好',
                rating: 5,
                author: 'user1'
            });
            await locationManager.addComment(locationId, {
                text: '不錯',
                rating: 4,
                author: 'user2'
            });
            const comments = await locationManager.getComments(locationId);
            expect(comments.length).toBe(2);
        });

        test('評論應該包含時間戳', async () => {
            const commentId = await locationManager.addComment(locationId, {
                text: '很好',
                rating: 5,
                author: 'user1'
            });
            const comments = await locationManager.getComments(locationId);
            const comment = comments.find(c => c.id === commentId);
            expect(comment.timestamp).toBeDefined();
        });

        test('應該能點讚評論', async () => {
            const commentId = await locationManager.addComment(locationId, {
                text: '很好',
                rating: 5,
                author: 'user1'
            });
            const result = await locationManager.likeComment(commentId);
            expect(result).toBe(true);
        });

        test('沒有評論的位置應該返回空數組', async () => {
            const newLocationId = await locationManager.addLocation(mockLocationData);
            const comments = await locationManager.getComments(newLocationId);
            expect(comments).toEqual([]);
        });
    });

    describe('距離計算', () => {
        test('應該正確計算距離', () => {
            // 台北101和台北車站之間的距離約為2.5公里
            const distance = locationManager._calculateDistance(
                25.0330, 121.5654, // 台北車站
                25.0443, 121.5119  // 台北101
            );
            expect(distance).toBeGreaterThan(2);
            expect(distance).toBeLessThan(3);
        });

        test('相同位置的距離應該是0', () => {
            const distance = locationManager._calculateDistance(
                25.0330, 121.5654, 25.0330, 121.5654
            );
            expect(distance).toBe(0);
        });

        test('距離計算應該對稱', () => {
            const distance1 = locationManager._calculateDistance(
                25.0330, 121.5654, 25.0443, 121.5119
            );
            const distance2 = locationManager._calculateDistance(
                25.0443, 121.5119, 25.0330, 121.5654
            );
            expect(distance1).toBe(distance2);
        });
    });
});
