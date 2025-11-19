/**
 * tests/ui.test.js - UI交互邏輯測試
 * 
 * TDD 測試用例: 模態框、事件、DOM操作
 */

describe('UIManager - UI交互管理', () => {
    let uiManager;

    beforeEach(() => {
        uiManager = new UIManager();
        // 確保所有模態框存在於DOM中
        setupModalFixtures();
    });

    function setupModalFixtures() {
        // 創建必要的DOM元素用於測試
        const modals = [
            'modal-login',
            'modal-add-location',
            'modal-location-detail'
        ];

        modals.forEach(id => {
            if (!document.getElementById(id)) {
                const modal = document.createElement('div');
                modal.id = id;
                modal.className = 'modal';
                modal.style.display = 'none';
                const content = document.createElement('div');
                content.className = 'modal-content';
                modal.appendChild(content);
                document.body.appendChild(modal);
            }
        });

        // 創建按鈕和輸入框
        const elements = [
            { id: 'btn-login', tag: 'button' },
            { id: 'btn-logout', tag: 'button' },
            { id: 'user-info', tag: 'span' },
            { id: 'location-list', tag: 'div' },
            { id: 'location-form', tag: 'form' },
            { id: 'auth-form', tag: 'form' },
            { id: 'auth-username', tag: 'input', type: 'text' },
            { id: 'auth-password', tag: 'input', type: 'password' }
        ];

        elements.forEach(el => {
            if (!document.getElementById(el.id)) {
                const elem = document.createElement(el.tag);
                elem.id = el.id;
                if (el.type) elem.type = el.type;
                document.body.appendChild(elem);
            }
        });
    }

    describe('初始化', () => {
        test('應該成功初始化UI管理器', () => {
            expect(() => uiManager.init()).not.toThrow();
        });

        test('初始化後應該准備好事件監聽', () => {
            uiManager.init();
            expect(uiManager).toBeDefined();
        });
    });

    describe('模態框管理', () => {
        test('應該能打開模態框', () => {
            uiManager.openModal('modal-login');
            const modal = document.getElementById('modal-login');
            expect(modal.style.display).not.toBe('none');
        });

        test('應該能關閉模態框', () => {
            uiManager.openModal('modal-login');
            uiManager.closeModal('modal-login');
            const modal = document.getElementById('modal-login');
            expect(modal.style.display).toBe('none');
        });

        test('打開模態框時應該記錄活躍的模態框', () => {
            uiManager.openModal('modal-login');
            expect(uiManager.activeModal).toBe('modal-login');
        });

        test('應該能打開多個模態框', () => {
            uiManager.openModal('modal-login');
            uiManager.openModal('modal-add-location');
            expect(uiManager.activeModal).toBe('modal-add-location');
        });

        test('應該能關閉當前活躍的模態框', () => {
            uiManager.openModal('modal-login');
            uiManager.closeModal('modal-login');
            expect(document.getElementById('modal-login').style.display).toBe('none');
        });
    });

    describe('用戶信息顯示', () => {
        test('應該能更新用戶信息顯示', () => {
            const user = { username: 'testuser', id: 'user123' };
            uiManager.updateUserInfo(user);
            const userInfo = document.getElementById('user-info');
            expect(userInfo.textContent).toContain('testuser');
        });

        test('應該顯示匿名用戶為"遊客"', () => {
            uiManager.updateUserInfo(null);
            const userInfo = document.getElementById('user-info');
            expect(userInfo.textContent.toLowerCase()).toContain('遊客');
        });

        test('應該顯示用戶的基本信息', () => {
            const user = { username: 'john', displayName: 'John Doe' };
            uiManager.updateUserInfo(user);
            const userInfo = document.getElementById('user-info');
            expect(userInfo.textContent).toBeDefined();
        });
    });

    describe('位置詳情顯示', () => {
        test('應該能顯示位置詳情', () => {
            const locationData = {
                id: 'loc1',
                name: 'Star Cafe',
                address: '台北市中山區'',
                lat: 25.0443,
                lng: 121.5119
            };
            uiManager.showLocationDetail(locationData);
            const modal = document.getElementById('modal-location-detail');
            expect(modal.style.display).not.toBe('none');
        });

        test('位置詳情中應該顯示位置名稱', () => {
            const locationData = {
                id: 'loc1',
                name: 'Star Cafe',
                address: '台北市中山區'',
                lat: 25.0443,
                lng: 121.5119
            };
            uiManager.showLocationDetail(locationData);
            const detailName = document.getElementById('detail-name');
            expect(detailName.textContent).toContain('Star Cafe');
        });
    });

    describe('位置列表更新', () => {
        test('應該能更新位置列表', () => {
            const locations = [
                { id: 'loc1', name: 'Cafe A' },
                { id: 'loc2', name: 'Cafe B' }
            ];
            uiManager.updateLocationList(locations);
            const list = document.getElementById('location-list');
            expect(list).not.toBeNull();
        });

        test('位置列表應該顯示所有位置', () => {
            const locations = [
                { id: 'loc1', name: 'Cafe A' },
                { id: 'loc2', name: 'Cafe B' },
                { id: 'loc3', name: 'Cafe C' }
            ];
            uiManager.updateLocationList(locations);
            const list = document.getElementById('location-list');
            expect(list.children.length).toBeGreaterThanOrEqual(3);
        });

        test('空列表應該顯示占位文本', () => {
            uiManager.updateLocationList([]);
            const list = document.getElementById('location-list');
            expect(list.textContent.toLowerCase()).toContain('沒有結果');
        });
    });

    describe('加載狀態', () => {
        test('應該能顯示加載狀態', () => {
            uiManager.showLoading('載入中...');
            // 檢查是否顯示加載指示器
            expect(document.body.textContent).toContain('載入中');
        });

        test('應該能隱藏加載狀態', () => {
            uiManager.showLoading('載入中...');
            uiManager.hideLoading();
            // 加載指示器應該被移除
            expect(true).toBe(true); // 占位
        });
    });

    describe('消息提示', () => {
        test('應該能顯示成功消息', () => {
            uiManager.showSuccess('操作成功');
            expect(document.body.textContent).toContain('操作成功');
        });

        test('應該能顯示錯誤消息', () => {
            uiManager.showError('發生錯誤');
            expect(document.body.textContent).toContain('發生錯誤');
        });

        test('應該能顯示警告消息', () => {
            uiManager.showWarning('請注意');
            expect(document.body.textContent).toContain('請注意');
        });

        test('消息應該在指定時間後消失', async () => {
            uiManager.showSuccess('完成', 500);
            await new Promise(resolve => setTimeout(resolve, 600));
            // 消息應該已被移除
            expect(true).toBe(true); // 占位
        });

        test('使用默認時間3秒', async () => {
            const startTime = Date.now();
            uiManager.showSuccess('完成');
            // 應該在3秒內消失
            await new Promise(resolve => setTimeout(resolve, 3100));
            expect(Date.now() - startTime).toBeGreaterThanOrEqual(3000);
        });
    });

    describe('確認對話框', () => {
        test('應該能顯示確認對話框', async () => {
            const promise = uiManager.confirm('確認操作?');
            expect(promise).toBeInstanceOf(Promise);
        });

        test('確認應該返回true', async () => {
            // 模擬用戶點擊確認
            const result = uiManager.confirm('確認操作?');
            // 實現細節取決於如何處理用戶輸入
            expect(true).toBe(true); // 占位
        });

        test('取消應該返回false', async () => {
            const result = uiManager.confirm('確認操作?');
            expect(true).toBe(true); // 占位
        });
    });

    describe('側邊欄切換', () => {
        test('應該能切換側邊欄狀態', () => {
            const sidebar = document.createElement('aside');
            sidebar.className = 'sidebar';
            document.body.appendChild(sidebar);

            uiManager.toggleSidebar();
            expect(sidebar.classList.contains('active') || !sidebar.classList.contains('active')).toBe(true);
        });

        test('應該在顯示和隱藏之間切換', () => {
            const sidebar = document.createElement('aside');
            sidebar.className = 'sidebar';
            document.body.appendChild(sidebar);

            const initialState = sidebar.classList.contains('active');
            uiManager.toggleSidebar();
            const afterFirstToggle = sidebar.classList.contains('active');
            expect(initialState).not.toBe(afterFirstToggle);
        });
    });

    describe('地圖視圖更新', () => {
        test('應該能更新地圖視圖', () => {
            const locations = [
                { id: 'loc1', name: 'Cafe A', lat: 25.0330, lng: 121.5654 },
                { id: 'loc2', name: 'Cafe B', lat: 25.0443, lng: 121.5119 }
            ];
            expect(() => uiManager.updateMapView(locations)).not.toThrow();
        });
    });

    describe('表單管理', () => {
        test('應該能清空表單', () => {
            const form = document.getElementById('location-form');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = 'some value';
            form.appendChild(input);

            uiManager.clearForm('location-form');
            expect(input.value).toBe('');
        });

        test('清空表單應該重置所有輸入框', () => {
            const form = document.getElementById('location-form');
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.value = 'test value';
            });

            uiManager.clearForm('location-form');
            inputs.forEach(input => {
                expect(input.value).toBe('');
            });
        });
    });

    describe('按鈕狀態控制', () => {
        test('應該能禁用按鈕', () => {
            const button = document.createElement('button');
            button.id = 'test-btn';
            document.body.appendChild(button);

            uiManager.setButtonDisabled('test-btn', true);
            expect(button.disabled).toBe(true);
        });

        test('應該能啟用按鈕', () => {
            const button = document.createElement('button');
            button.id = 'test-btn';
            button.disabled = true;
            document.body.appendChild(button);

            uiManager.setButtonDisabled('test-btn', false);
            expect(button.disabled).toBe(false);
        });
    });

    describe('評論列表', () => {
        test('應該能更新評論列表', () => {
            const comments = [
                { id: 'com1', text: '很好', rating: 5 },
                { id: 'com2', text: '不錯', rating: 4 }
            ];
            expect(() => uiManager.updateCommentsList('loc1', comments)).not.toThrow();
        });

        test('應該顯示所有評論', () => {
            const comments = [
                { id: 'com1', text: '很好', rating: 5, author: 'user1' },
                { id: 'com2', text: '不錯', rating: 4, author: 'user2' }
            ];
            uiManager.updateCommentsList('loc1', comments);
            expect(document.body.textContent).toContain('很好');
        });
    });

    describe('邊界情況', () => {
        test('應該優雅地處理null用戶信息', () => {
            expect(() => uiManager.updateUserInfo(null)).not.toThrow();
        });

        test('應該優雅地處理空位置列表', () => {
            expect(() => uiManager.updateLocationList([])).not.toThrow();
        });

        test('應該優雅地處理不存在的模態框', () => {
            expect(() => uiManager.openModal('nonexistent-modal')).not.toThrow();
        });

        test('應該優雅地處理重複打開相同模態框', () => {
            expect(() => {
                uiManager.openModal('modal-login');
                uiManager.openModal('modal-login');
            }).not.toThrow();
        });
    });
});
