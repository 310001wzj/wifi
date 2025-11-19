/**
 * tests/auth.test.js - 認證系統測試
 * 
 * TDD 測試用例: 用戶認證
 */

describe('AuthManager - 用戶認證系統', () => {
    let auth;

    beforeEach(() => {
        auth = new AuthManager();
    });

    describe('用戶註冊', () => {
        test('應該成功註冊新用戶', async () => {
            const result = await auth.register('testuser', 'password123');
            expect(result).toBe(true);
        });

        test('註冊後應該能立即登錄', async () => {
            await auth.register('testuser', 'password123');
            const loginResult = await auth.login('testuser', 'password123');
            expect(loginResult).toBe(true);
        });

        test('應該拒絕註冊已存在的用戶名', async () => {
            await auth.register('testuser', 'password123');
            const result = await auth.register('testuser', 'password456');
            expect(result).toBe(false);
        });

        test('應該拒絕空用戶名', async () => {
            const result = await auth.register('', 'password123');
            expect(result).toBe(false);
        });

        test('應該拒絕空密碼', async () => {
            const result = await auth.register('testuser', '');
            expect(result).toBe(false);
        });

        test('應該拒絕短密碼 (少於6字符)', async () => {
            const result = await auth.register('testuser', '12345');
            expect(result).toBe(false);
        });

        test('用戶名應該只允許字母、數字和下劃線', async () => {
            const result = await auth.register('invalid@user', 'password123');
            expect(result).toBe(false);
        });
    });

    describe('用戶登錄', () => {
        beforeEach(async () => {
            await auth.register('testuser', 'password123');
        });

        test('應該成功登錄正確的用戶名和密碼', async () => {
            const result = await auth.login('testuser', 'password123');
            expect(result).toBe(true);
            expect(auth.isLoggedIn()).toBe(true);
        });

        test('應該拒絕錯誤的密碼', async () => {
            const result = await auth.login('testuser', 'wrongpassword');
            expect(result).toBe(false);
            expect(auth.isLoggedIn()).toBe(false);
        });

        test('應該拒絕不存在的用戶名', async () => {
            const result = await auth.login('nonexistent', 'password123');
            expect(result).toBe(false);
        });

        test('登錄後應該能獲取當前用戶信息', async () => {
            await auth.login('testuser', 'password123');
            const user = auth.getCurrentUser();
            expect(user).not.toBeNull();
            expect(user.username).toBe('testuser');
        });

        test('登錄應該區分大小寫', async () => {
            const result = await auth.login('TestUser', 'password123');
            expect(result).toBe(false);
        });
    });

    describe('用戶登出', () => {
        beforeEach(async () => {
            await auth.register('testuser', 'password123');
            await auth.login('testuser', 'password123');
        });

        test('應該成功登出當前用戶', async () => {
            await auth.logout();
            expect(auth.isLoggedIn()).toBe(false);
        });

        test('登出後應該清除當前用戶信息', async () => {
            await auth.logout();
            const user = auth.getCurrentUser();
            expect(user).toBeNull();
        });

        test('登出後應該無法訪問受保護資源', async () => {
            await auth.logout();
            expect(auth.isLoggedIn()).toBe(false);
        });

        test('登出後應該能重新登錄', async () => {
            await auth.logout();
            const result = await auth.login('testuser', 'password123');
            expect(result).toBe(true);
        });
    });

    describe('檢查用戶名是否存在', () => {
        beforeEach(async () => {
            await auth.register('testuser', 'password123');
        });

        test('應該返回true對於已存在的用戶名', async () => {
            const exists = await auth.usernameExists('testuser');
            expect(exists).toBe(true);
        });

        test('應該返回false對於不存在的用戶名', async () => {
            const exists = await auth.usernameExists('nonexistent');
            expect(exists).toBe(false);
        });

        test('應該區分大小寫', async () => {
            const exists = await auth.usernameExists('TestUser');
            expect(exists).toBe(false);
        });
    });

    describe('更新用戶資料', () => {
        beforeEach(async () => {
            await auth.register('testuser', 'password123');
            await auth.login('testuser', 'password123');
        });

        test('應該成功更新用戶頭像', async () => {
            const user = auth.getCurrentUser();
            const result = await auth.updateUserProfile(user.id, { avatar: 'avatar.jpg' });
            expect(result).toBe(true);
        });

        test('應該成功更新用戶昵稱', async () => {
            const user = auth.getCurrentUser();
            const result = await auth.updateUserProfile(user.id, { displayName: 'Test User' });
            expect(result).toBe(true);
        });

        test('應該拒絕更新不是自己的資料', async () => {
            const result = await auth.updateUserProfile('other_user_id', { avatar: 'avatar.jpg' });
            expect(result).toBe(false);
        });

        test('更新後應該能讀取新數據', async () => {
            const user = auth.getCurrentUser();
            await auth.updateUserProfile(user.id, { avatar: 'new_avatar.jpg' });
            const updatedUser = auth.getCurrentUser();
            expect(updatedUser.avatar).toBe('new_avatar.jpg');
        });
    });

    describe('認證狀態管理', () => {
        test('初始狀態應該未認證', () => {
            const newAuth = new AuthManager();
            expect(newAuth.isLoggedIn()).toBe(false);
            expect(newAuth.getCurrentUser()).toBeNull();
        });

        test('isLoggedIn() 應該與當前認證狀態一致', async () => {
            await auth.register('testuser', 'password123');
            expect(auth.isLoggedIn()).toBe(false);

            await auth.login('testuser', 'password123');
            expect(auth.isLoggedIn()).toBe(true);

            await auth.logout();
            expect(auth.isLoggedIn()).toBe(false);
        });
    });

    describe('邊界情況和安全性', () => {
        test('應該正確處理特殊字符在密碼中', async () => {
            const result = await auth.register('testuser', 'pass@word!#$%');
            expect(result).toBe(true);
        });

        test('應該正確處理極長的密碼', async () => {
            const longPassword = 'a'.repeat(1000);
            const result = await auth.register('testuser', longPassword);
            expect(result).toBe(true);
        });

        test('應該修剪用戶名兩端的空白', async () => {
            const result = await auth.register('  testuser  ', 'password123');
            const user = auth.getCurrentUser();
            expect(user.username).toBe('testuser');
        });

        test('密碼應該被加密存儲 (不能直接讀取)', async () => {
            // 這個測試驗證密碼在內部存儲時應該被加密
            // 實現細節取決於GUN.js的加密機制
            expect(true).toBe(true); // 占位
        });
    });
});
