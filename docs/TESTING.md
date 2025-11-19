# 測試運行指南 (TESTING.md)

## 快速開始

### 1. 安裝Jest（如果使用CLI運行）
```bash
npm install --save-dev jest
```

### 2. 在瀏覽器中運行測試

#### 方法A: 創建測試HTML文件
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jest/29.7.0/jest.css">
</head>
<body>
    <div id="root"></div>
    
    <!-- 加載Jest -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jest/29.7.0/jest.min.js"></script>
    
    <!-- 加載應用代碼 -->
    <script src="js/auth.js"></script>
    <script src="js/storage.js"></script>
    <script src="js/location.js"></script>
    <script src="js/map.js"></script>
    <script src="js/ui.js"></script>
    
    <!-- 加載測試文件 -->
    <script src="tests/auth.test.js"></script>
    <script src="tests/storage.test.js"></script>
    <script src="tests/location.test.js"></script>
    <script src="tests/map.test.js"></script>
    <script src="tests/ui.test.js"></script>
</body>
</html>
```

#### 方法B: 使用本地HTTP服務器
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

然後在瀏覽器打開 `http://localhost:8000/test.html`

### 3. 使用Jest CLI運行
```bash
npm test
```

或指定測試文件：
```bash
npm test tests/auth.test.js
npm test tests/location.test.js
```

## 測試結構說明

### auth.test.js (認證系統)
- **描述**: GUN.js用戶認證系統
- **主要測試**:
  - 用戶註冊和驗證
  - 用戶登錄/登出
  - 用戶名檢查
  - 用戶資料更新
  - 邊界情況和安全性

**預計測試數**: 30+個測試案例

### location.test.js (位置管理)
- **描述**: WiFi位置的CRUD操作和查詢
- **主要測試**:
  - 新增/編輯/刪除位置
  - 位置查詢（按ID、名稱、距離）
  - 評分系統
  - 評論系統
  - 距離計算

**預計測試數**: 40+個測試案例

### storage.test.js (存儲系統)
- **描述**: LocalStorage和IndexedDB操作
- **主要測試**:
  - LocalStorage CRUD
  - IndexedDB CRUD
  - 存儲可用性檢查
  - GUN同步機制
  - 邊界情況

**預計測試數**: 35+個測試案例

### map.test.js (地圖功能)
- **描述**: Leaflet地圖集成和標記管理
- **主要測試**:
  - 地圖初始化
  - 標記添加/移除/更新
  - 地圖中心和縮放
  - 用戶位置標記
  - 彈出窗口
  - 坐標驗證

**預計測試數**: 35+個測試案例

### ui.test.js (UI交互)
- **描述**: DOM操作和UI事件
- **主要測試**:
  - 模態框管理
  - 用戶信息更新
  - 位置列表更新
  - 消息提示
  - 表單管理
  - 按鈕狀態控制

**預計測試數**: 30+個測試案例

## 總測試覆蓋

| 模塊 | 測試文件 | 預計測試數 |
|-----|---------|---------|
| 認證 | auth.test.js | 30+ |
| 位置 | location.test.js | 40+ |
| 存儲 | storage.test.js | 35+ |
| 地圖 | map.test.js | 35+ |
| UI | ui.test.js | 30+ |
| **總計** | **5個文件** | **170+個測試** |

## TDD開發流程

### 對於每個功能模塊:

#### 1. RED 階段
```javascript
// 寫失敗的測試
test('應該...', () => {
    expect(functionResult()).toBe(expectedValue);
});
```

#### 2. GREEN 階段
```javascript
// 寫最簡代碼通過測試
function someFunction() {
    return expectedValue;
}
```

#### 3. REFACTOR 階段
```javascript
// 改進代碼，確保測試仍通過
function someFunction() {
    // 更好的實現
    return calculateExpectedValue();
}
```

## 測試命令

### 運行所有測試
```bash
npm test
```

### 運行特定測試文件
```bash
npm test tests/auth.test.js
```

### 運行特定測試套件
```bash
npm test -- --testNamePattern="用戶註冊"
```

### 觀察模式（監視文件變化）
```bash
npm test -- --watch
```

### 生成覆蓋率報告
```bash
npm test -- --coverage
```

### 詳細輸出
```bash
npm test -- --verbose
```

## 測試的最佳實踐

### 1. 使用描述性的測試名稱
❌ 不好:
```javascript
test('test auth', () => { ... });
```

✅ 好:
```javascript
test('應該成功註冊新用戶', () => { ... });
```

### 2. 使用 beforeEach 和 afterEach
```javascript
describe('位置管理', () => {
    let locationManager;

    beforeEach(() => {
        locationManager = new LocationManager();
    });

    afterEach(() => {
        // 清理
    });
});
```

### 3. 測試一件事情
❌ 不好:
```javascript
test('應該新增位置並查詢', () => {
    const id = locationManager.addLocation(data);
    const result = locationManager.getLocationById(id);
    expect(result).toBeDefined();
});
```

✅ 好:
```javascript
test('應該成功新增位置', () => {
    const id = locationManager.addLocation(data);
    expect(id).toBeDefined();
});

test('應該能查詢新增的位置', () => {
    const id = locationManager.addLocation(data);
    const result = locationManager.getLocationById(id);
    expect(result).toBeDefined();
});
```

### 4. 使用适当的Matcher
```javascript
// 數字
expect(value).toBe(5);
expect(value).toBeCloseTo(5.1, 1);

// 字符串
expect(text).toContain('substring');
expect(text).toMatch(/regex/);

// 陣列
expect(arr).toContain(item);
expect(arr).toHaveLength(3);

// 物件
expect(obj).toHaveProperty('key');
expect(obj).toEqual({ key: 'value' });

// 函數
expect(fn).toThrow();
expect(promise).resolves.toBe(value);
expect(promise).rejects.toThrow();
```

## 常見問題

### Q: 如何在測試中模擬GUN.js？
**A**: 可以使用Jest的mock功能:
```javascript
jest.mock('gun', () => ({
    get: jest.fn().mockReturnValue({
        set: jest.fn(),
        on: jest.fn()
    })
}));
```

### Q: 如何測試非同步代碼？
**A**: 使用async/await或返回Promise:
```javascript
test('應該異步加載數據', async () => {
    const data = await locationManager.getAllLocations();
    expect(data).toBeInstanceOf(Array);
});

// 或使用done回調
test('應該...', (done) => {
    asyncFunction().then(() => {
        expect(true).toBe(true);
        done();
    });
});
```

### Q: 如何跳過某些測試？
**A**: 使用 `test.skip`:
```javascript
test.skip('暫時跳過的測試', () => {
    // 這個測試不會執行
});
```

### Q: 如何只運行某個測試？
**A**: 使用 `test.only`:
```javascript
test.only('只運行這個測試', () => {
    expect(true).toBe(true);
});
```

## 持續集成 (CI)

### 使用GitHub Actions
創建 `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## 測試覆蓋率目標

- **行覆蓋率 (Line Coverage)**: > 80%
- **分支覆蓋率 (Branch Coverage)**: > 75%
- **函數覆蓋率 (Function Coverage)**: > 85%
- **語句覆蓋率 (Statement Coverage)**: > 80%

## 資源和參考

- [Jest官方文檔](https://jestjs.io)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Library文檔](https://testing-library.com)
- [GUN.js文檔](https://gun.eco)

---

**更新時間**: 2025-11-19  
**維護者**: Copilot Setup  
**版本**: 1.0
