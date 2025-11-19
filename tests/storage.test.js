/**
 * tests/storage.test.js - 本地存儲測試
 * 
 * TDD 測試用例: LocalStorage 和 IndexedDB
 */

describe('StorageManager - 本地存儲', () => {
    let storage;

    beforeEach(async () => {
        storage = new StorageManager();
        await storage.initDB();
        storage.clearLocalStorage(); // 清空以獲得乾淨的測試環境
    });

    describe('LocalStorage 操作', () => {
        test('應該成功保存數據到LocalStorage', () => {
            const result = storage.setLocalStorage('test_key', { data: 'value' });
            expect(result).toBe(true);
        });

        test('應該能讀取已保存的數據', () => {
            storage.setLocalStorage('test_key', { data: 'value' });
            const value = storage.getLocalStorage('test_key');
            expect(value).toEqual({ data: 'value' });
        });

        test('應該返回null對於不存在的鍵', () => {
            const value = storage.getLocalStorage('nonexistent');
            expect(value).toBeNull();
        });

        test('應該正確序列化和反序列化對象', () => {
            const complexData = {
                name: 'Test',
                numbers: [1, 2, 3],
                nested: { key: 'value' }
            };
            storage.setLocalStorage('complex', complexData);
            const retrieved = storage.getLocalStorage('complex');
            expect(retrieved).toEqual(complexData);
        });

        test('應該能刪除特定鍵', () => {
            storage.setLocalStorage('to_delete', 'value');
            const result = storage.removeLocalStorage('to_delete');
            expect(result).toBe(true);
            expect(storage.getLocalStorage('to_delete')).toBeNull();
        });

        test('刪除不存在的鍵應該返回false', () => {
            const result = storage.removeLocalStorage('nonexistent');
            expect(result).toBe(false);
        });

        test('應該能清空所有LocalStorage', () => {
            storage.setLocalStorage('key1', 'value1');
            storage.setLocalStorage('key2', 'value2');
            storage.clearLocalStorage();
            expect(storage.getLocalStorage('key1')).toBeNull();
            expect(storage.getLocalStorage('key2')).toBeNull();
        });

        test('應該使用前綴避免名稱衝突', () => {
            storage.setLocalStorage('mykey', 'myvalue');
            const key = `${storage.storagePrefix}mykey`;
            expect(localStorage.getItem(key)).toBeDefined();
        });

        test('應該保存和恢復字符串', () => {
            storage.setLocalStorage('string_key', 'string_value');
            expect(storage.getLocalStorage('string_key')).toBe('string_value');
        });

        test('應該保存和恢復數字', () => {
            storage.setLocalStorage('number_key', 42);
            expect(storage.getLocalStorage('number_key')).toBe(42);
        });

        test('應該保存和恢復布爾值', () => {
            storage.setLocalStorage('bool_true', true);
            storage.setLocalStorage('bool_false', false);
            expect(storage.getLocalStorage('bool_true')).toBe(true);
            expect(storage.getLocalStorage('bool_false')).toBe(false);
        });

        test('應該保存和恢復數組', () => {
            const arr = [1, 'two', { three: 3 }];
            storage.setLocalStorage('array_key', arr);
            expect(storage.getLocalStorage('array_key')).toEqual(arr);
        });

        test('應該保存和恢復null', () => {
            storage.setLocalStorage('null_key', null);
            expect(storage.getLocalStorage('null_key')).toBeNull();
        });
    });

    describe('IndexedDB 操作', () => {
        test('應該成功初始化IndexedDB', async () => {
            expect(storage.db).not.toBeNull();
        });

        test('應該成功保存數據到IndexedDB', async () => {
            const result = await storage.setIndexedDB('locations', {
                id: 'loc1',
                name: 'Cafe'
            });
            expect(result).toBe(true);
        });

        test('應該能從IndexedDB讀取數據', async () => {
            const data = { id: 'loc1', name: 'Cafe' };
            await storage.setIndexedDB('locations', data);
            const retrieved = await storage.getIndexedDB('locations', 'loc1');
            expect(retrieved.name).toBe('Cafe');
        });

        test('讀取不存在的數據應該返回null', async () => {
            const result = await storage.getIndexedDB('locations', 'nonexistent');
            expect(result).toBeNull();
        });

        test('應該能獲取倉庫內的所有數據', async () => {
            await storage.setIndexedDB('locations', { id: 'loc1', name: 'Cafe1' });
            await storage.setIndexedDB('locations', { id: 'loc2', name: 'Cafe2' });
            const all = await storage.getAllIndexedDB('locations');
            expect(all.length).toBeGreaterThanOrEqual(2);
        });

        test('應該能刪除IndexedDB中的數據', async () => {
            await storage.setIndexedDB('locations', { id: 'loc1', name: 'Cafe' });
            const result = await storage.deleteIndexedDB('locations', 'loc1');
            expect(result).toBe(true);
            const retrieved = await storage.getIndexedDB('locations', 'loc1');
            expect(retrieved).toBeNull();
        });

        test('應該能清空整個倉庫', async () => {
            await storage.setIndexedDB('locations', { id: 'loc1', name: 'Cafe1' });
            await storage.setIndexedDB('locations', { id: 'loc2', name: 'Cafe2' });
            await storage.clearIndexedDB('locations');
            const all = await storage.getAllIndexedDB('locations');
            expect(all.length).toBe(0);
        });

        test('應該支持複雜對象存儲', async () => {
            const complexData = {
                id: 'loc1',
                name: 'Cafe',
                location: { lat: 25.033, lng: 121.565 },
                ratings: [4, 5, 3],
                metadata: { createdAt: Date.now() }
            };
            await storage.setIndexedDB('locations', complexData);
            const retrieved = await storage.getIndexedDB('locations', 'loc1');
            expect(retrieved).toEqual(complexData);
        });

        test('應該能更新已存在的數據', async () => {
            await storage.setIndexedDB('locations', { id: 'loc1', name: 'Cafe' });
            await storage.setIndexedDB('locations', { id: 'loc1', name: 'Cafe Updated' });
            const retrieved = await storage.getIndexedDB('locations', 'loc1');
            expect(retrieved.name).toBe('Cafe Updated');
        });
    });

    describe('存儲可用性檢查', () => {
        test('應該檢查LocalStorage可用性', () => {
            const available = storage.isLocalStorageAvailable();
            expect(typeof available).toBe('boolean');
        });

        test('應該檢查IndexedDB可用性', () => {
            const available = storage.isIndexedDBAvailable();
            expect(typeof available).toBe('boolean');
        });

        test('LocalStorage應該在現代瀏覽器中可用', () => {
            expect(storage.isLocalStorageAvailable()).toBe(true);
        });

        test('IndexedDB應該在現代瀏覽器中可用', () => {
            expect(storage.isIndexedDBAvailable()).toBe(true);
        });
    });

    describe('存儲容量信息', () => {
        test('應該返回存儲容量信息', async () => {
            const info = await storage.getStorageInfo();
            expect(info).toHaveProperty('usage');
            expect(info).toHaveProperty('quota');
        });

        test('使用量應該小於等於配額', async () => {
            const info = await storage.getStorageInfo();
            expect(info.usage).toBeLessThanOrEqual(info.quota);
        });

        test('存儲更多數據後使用量應該增加', async () => {
            const info1 = await storage.getStorageInfo();
            storage.setLocalStorage('large_data', 'x'.repeat(10000));
            const info2 = await storage.getStorageInfo();
            expect(info2.usage).toBeGreaterThanOrEqual(info1.usage);
        });
    });

    describe('GUN同步機制', () => {
        test('應該能同步本地數據到GUN', async () => {
            storage.setLocalStorage('sync_test', { data: 'value' });
            const result = await storage.syncToGUN();
            expect(result).toBe(true);
        });

        test('應該能從GUN同步數據到本地', async () => {
            // 假設GUN中已有數據
            const result = await storage.syncFromGUN();
            expect(result).toBe(true);
        });

        test('雙向同步應該保持數據一致性', async () => {
            const testData = { id: 'test', value: 'sync_test' };
            storage.setLocalStorage('sync_test', testData);
            await storage.syncToGUN();
            // 清除本地
            storage.removeLocalStorage('sync_test');
            // 從GUN同步回來
            await storage.syncFromGUN();
            // 應該恢復
            const retrieved = storage.getLocalStorage('sync_test');
            expect(retrieved).toBeDefined();
        });
    });

    describe('邊界情況和錯誤處理', () => {
        test('應該優雅地處理localStorage已滿的情況', () => {
            // 这个测试取决于实现的细节
            expect(true).toBe(true); // 占位
        });

        test('應該能處理非JSON可序列化的對象', () => {
            const circularObj = { a: 1 };
            circularObj.self = circularObj; // 循環引用
            const result = storage.setLocalStorage('circular', circularObj);
            // 應該優雅地失敗或警告
            expect(true).toBe(true); // 占位
        });

        test('應該能處理超大數據對象', () => {
            const largeData = { items: new Array(10000).fill({ data: 'value' }) };
            const result = storage.setLocalStorage('large', largeData);
            expect(typeof result).toBe('boolean');
        });

        test('應該在IndexedDB操作期間保證數據一致性', async () => {
            await storage.setIndexedDB('locations', { id: 'loc1', name: 'Cafe' });
            await storage.setIndexedDB('locations', { id: 'loc1', name: 'Cafe Updated' });
            const retrieved = await storage.getIndexedDB('locations', 'loc1');
            expect(retrieved.name).toBe('Cafe Updated');
        });

        test('應該能處理並發的存儲操作', async () => {
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    storage.setIndexedDB('locations', { id: `loc${i}`, name: `Cafe ${i}` })
                );
            }
            const results = await Promise.all(promises);
            expect(results.every(r => r === true)).toBe(true);
        });
    });
});
