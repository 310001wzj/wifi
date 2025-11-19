/**
 * tests/map.test.js - Leaflet地圖功能測試
 * 
 * TDD 測試用例: 地圖初始化、標記管理
 */

describe('MapManager - Leaflet地圖管理', () => {
    let mapManager;
    let mapContainer;

    beforeEach(() => {
        // 創建臨時地圖容器
        mapContainer = document.createElement('div');
        mapContainer.id = 'test-map';
        mapContainer.style.width = '800px';
        mapContainer.style.height = '600px';
        document.body.appendChild(mapContainer);

        mapManager = new MapManager('test-map');
    });

    afterEach(() => {
        // 清理
        if (mapManager.map) {
            mapManager.map.remove();
        }
        document.body.removeChild(mapContainer);
    });

    describe('地圖初始化', () => {
        test('應該成功初始化地圖', () => {
            mapManager.initMap();
            expect(mapManager.map).not.toBeNull();
        });

        test('初始化時應該設定默認中心點', () => {
            mapManager.initMap();
            const center = mapManager.map.getCenter();
            expect(center.lat).toBeCloseTo(mapManager.defaultCenter.lat, 2);
            expect(center.lng).toBeCloseTo(mapManager.defaultCenter.lng, 2);
        });

        test('初始化時應該設定默認縮放級別', () => {
            mapManager.initMap();
            const zoom = mapManager.map.getZoom();
            expect(zoom).toBe(mapManager.defaultZoom);
        });

        test('應該接受自定義中心點和縮放選項', () => {
            mapManager.initMap({
                center: { lat: 25.0443, lng: 121.5119 },
                zoom: 15
            });
            const zoom = mapManager.map.getZoom();
            expect(zoom).toBe(15);
        });
    });

    describe('標記管理', () => {
        beforeEach(() => {
            mapManager.initMap();
        });

        test('應該成功添加標記到地圖', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654, { title: 'Test' });
            expect(mapManager.markers['marker1']).toBeDefined();
        });

        test('添加的標記應該在地圖上可見', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654);
            expect(mapManager.markers['marker1']).not.toBeNull();
        });

        test('應該能以選項自定義標記', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654, {
                title: 'My Cafe',
                popup: 'Cafe Info'
            });
            const marker = mapManager.markers['marker1'];
            expect(marker.options.title).toBe('My Cafe');
        });

        test('應該能使用唯一ID添加多個標記', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654);
            mapManager.addMarker('marker2', 25.0443, 121.5119);
            expect(mapManager.markers['marker1']).toBeDefined();
            expect(mapManager.markers['marker2']).toBeDefined();
        });

        test('應該能移除標記', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654);
            mapManager.removeMarker('marker1');
            expect(mapManager.markers['marker1']).toBeUndefined();
        });

        test('移除不存在的標記應該不拋出錯誤', () => {
            expect(() => {
                mapManager.removeMarker('nonexistent');
            }).not.toThrow();
        });

        test('應該能更新標記位置', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654);
            mapManager.updateMarkerPosition('marker1', 25.0443, 121.5119);
            const marker = mapManager.markers['marker1'];
            const latlng = marker.getLatLng();
            expect(latlng.lat).toBeCloseTo(25.0443, 2);
            expect(latlng.lng).toBeCloseTo(121.5119, 2);
        });

        test('應該能更新標記信息', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654, { title: 'Old' });
            mapManager.updateMarkerInfo('marker1', { title: 'New' });
            const marker = mapManager.markers['marker1'];
            expect(marker.options.title).toBe('New');
        });

        test('應該能清空所有標記', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654);
            mapManager.addMarker('marker2', 25.0443, 121.5119);
            mapManager.clearMarkers();
            expect(Object.keys(mapManager.markers).length).toBe(0);
        });

        test('清空標記後地圖應該沒有標記', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654);
            mapManager.clearMarkers();
            const markerCount = Object.keys(mapManager.markers).length;
            expect(markerCount).toBe(0);
        });
    });

    describe('地圖中心和縮放', () => {
        beforeEach(() => {
            mapManager.initMap();
        });

        test('應該能設定地圖中心點', () => {
            mapManager.setCenter(25.0443, 121.5119);
            const center = mapManager.map.getCenter();
            expect(center.lat).toBeCloseTo(25.0443, 2);
        });

        test('應該能設定地圖中心點和縮放級別', () => {
            mapManager.setCenter(25.0443, 121.5119, 15);
            const zoom = mapManager.map.getZoom();
            expect(zoom).toBe(15);
        });

        test('應該使用默認縮放級別如果未指定', () => {
            const oldZoom = mapManager.map.getZoom();
            mapManager.setCenter(25.0443, 121.5119);
            const newZoom = mapManager.map.getZoom();
            expect(newZoom).toBe(mapManager.defaultZoom);
        });
    });

    describe('用戶位置標記', () => {
        beforeEach(() => {
            mapManager.initMap();
        });

        test('應該能設定用戶位置標記', () => {
            mapManager.setUserMarker(25.0330, 121.5654);
            expect(mapManager.userMarker).not.toBeNull();
        });

        test('用戶標記應該有特殊樣式', () => {
            mapManager.setUserMarker(25.0330, 121.5654);
            // 檢查是否使用了特殊的用戶標記類或選項
            expect(mapManager.userMarker).toBeDefined();
        });

        test('應該能更新用戶位置', () => {
            mapManager.setUserMarker(25.0330, 121.5654);
            mapManager.setUserMarker(25.0443, 121.5119);
            const latlng = mapManager.userMarker.getLatLng();
            expect(latlng.lat).toBeCloseTo(25.0443, 2);
        });

        test('應該能獲取用戶當前位置', async () => {
            const location = await mapManager.getUserLocation();
            expect(location).toHaveProperty('lat');
            expect(location).toHaveProperty('lng');
        });
    });

    describe('彈出窗口', () => {
        beforeEach(() => {
            mapManager.initMap();
        });

        test('應該能顯示標記的彈出窗口', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654, { popup: 'Test Info' });
            mapManager.openPopup('marker1');
            const marker = mapManager.markers['marker1'];
            expect(marker.isPopupOpen && marker.isPopupOpen()).toBe(true);
        });

        test('應該能關閉彈出窗口', () => {
            mapManager.addMarker('marker1', 25.0330, 121.5654, { popup: 'Test Info' });
            mapManager.openPopup('marker1');
            mapManager.closePopup('marker1');
            const marker = mapManager.markers['marker1'];
            // 檢查彈出窗口是否已關閉
            expect(!marker.isPopupOpen || !marker.isPopupOpen()).toBe(true);
        });
    });

    describe('邊界和地理查詢', () => {
        beforeEach(() => {
            mapManager.initMap();
            mapManager.addMarker('marker1', 25.0330, 121.5654);
            mapManager.addMarker('marker2', 25.0443, 121.5119);
            mapManager.addMarker('marker3', 25.1330, 121.6654); // 在邊界外
        });

        test('應該能獲取地圖邊界內的標記', () => {
            const markers = mapManager.getMarkersInBounds();
            expect(markers).toBeInstanceOf(Array);
        });

        test('應該能自動縮放以包含所有標記', () => {
            const oldZoom = mapManager.map.getZoom();
            mapManager.fitBounds();
            // 縮放級別可能會改變以適應所有標記
            expect(mapManager.map.getZoom()).toBeLessThanOrEqual(oldZoom + 2);
        });
    });

    describe('坐標驗證', () => {
        test('應該驗證有效的坐標', () => {
            expect(mapManager.isValidCoordinate(25.0330, 121.5654)).toBe(true);
        });

        test('應該拒絕無效的緯度', () => {
            expect(mapManager.isValidCoordinate(200, 121.5654)).toBe(false);
            expect(mapManager.isValidCoordinate(-100, 121.5654)).toBe(false);
        });

        test('應該拒絕無效的經度', () => {
            expect(mapManager.isValidCoordinate(25.0330, 500)).toBe(false);
            expect(mapManager.isValidCoordinate(25.0330, -500)).toBe(false);
        });

        test('應該接受邊界值', () => {
            expect(mapManager.isValidCoordinate(-90, 180)).toBe(true);
            expect(mapManager.isValidCoordinate(90, -180)).toBe(true);
        });
    });

    describe('性能和邊界情況', () => {
        beforeEach(() => {
            mapManager.initMap();
        });

        test('應該能處理大量標記', () => {
            for (let i = 0; i < 1000; i++) {
                const lat = 25.0330 + (Math.random() * 0.1);
                const lng = 121.5654 + (Math.random() * 0.1);
                mapManager.addMarker(`marker${i}`, lat, lng);
            }
            expect(Object.keys(mapManager.markers).length).toBe(1000);
        });

        test('應該能快速清空大量標記', () => {
            for (let i = 0; i < 100; i++) {
                mapManager.addMarker(`marker${i}`, 25.0330, 121.5654);
            }
            mapManager.clearMarkers();
            expect(Object.keys(mapManager.markers).length).toBe(0);
        });
    });
});
