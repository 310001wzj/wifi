# AGENTS.md - 項目管理與進度追蹤

> 本文檔為AI Agent協作文檔，包含項目目標、架構決策、進度狀態和開發指南。  
> **用途**：未來接手的AI Agent可快速理解項目狀態，無需重新討論需求。

---

## 📌 項目概述

**項目名稱**: Free WiFi Locator  
**目標**: 幫線上遊戲玩家找到附近免費WiFi的純前端應用  
**開發方法**: TDD (測試驅動開發)  
**技術棧**: 純前端 + GUN.js + Leaflet  
**狀態**: 需求確認完成 → 準備開發

---

## 🎯 項目目標

1. **用戶能快速定位周邊免費WiFi** → 地圖展示，支持搜索
2. **眾包模式貢獻** → 用戶可新增/編輯WiFi信息
3. **社群互動** → 評分、評論、點讚功能
4. **離線可用** → 本地緩存，網路恢復自動同步
5. **完全去中心化** → 使用GUN.js，無後端依賴

---

## 🏗️ 技術架構決策

### 前端框架選擇
- ✅ **純HTML/CSS/JS** (CDN引入，無打包工具)
- 原因: 快速啟動，低門檻，易於部署

### 地圖方案
- ✅ **Leaflet.js** + **OpenStreetMap**
- 原因: 開源、輕量、CDN可用、學習曲線平緩

### 數據庫方案
- ✅ **GUN.js** (分散式P2P實時數據庫)
- 架構: 用戶是peer節點，共享一個中繼relay
- 優點: 無後端、實時同步、支持離線

### 認證系統
- ✅ **GUN.js內置認證**
- 用戶帳號儲存在GUN，支持匿名或具名

### 離線存儲
- ✅ **LocalStorage** + **IndexedDB**
- 用於緩存WiFi點位和用戶數據

---

## 📋 核心功能清單

| 功能 | 優先級 | 狀態 | 備註 |
|-----|-------|------|------|
| 用戶認證 (GUN.js) | P0 | ❌ 未開始 | MVP必需 |
| 地圖展示 + 定位 | P0 | ❌ 未開始 | Leaflet集成 |
| WiFi點位查詢 | P0 | ❌ 未開始 | 搜索、篩選 |
| 新增/編輯點位 | P0 | ❌ 未開始 | 用戶提交表單 |
| 評分/評論系統 | P0 | ❌ 未開始 | 社群反饋 |
| 離線緩存 | P1 | ❌ 未開始 | LocalStorage同步 |
| 搜索/篩選優化 | P1 | ❌ 未開始 | UX增強 |
| 響應式設計 | P1 | ❌ 未開始 | 移動設備適配 |

---

## 📁 項目目錄結構

```
/wifi
├── README.md              # 項目說明
├── PRD.md                 # 產品需求文檔 ✅
├── AGENTS.md              # 本文件 (AI協作指南)
├── index.html             # 主頁面（等待開發）
├── styles/
│   ├── main.css           # 全局樣式
│   ├── map.css            # 地圖樣式
│   └── mobile.css         # 響應式樣式
├── js/
│   ├── app.js             # 應用主邏輯
│   ├── auth.js            # GUN.js認證模組
│   ├── map.js             # Leaflet地圖模組
│   ├── storage.js         # 本地存儲模組
│   ├── location.js        # WiFi位置管理
│   └── ui.js              # UI交互邏輯
├── tests/
│   ├── auth.test.js       # 認證測試
│   ├── map.test.js        # 地圖功能測試
│   ├── location.test.js   # 位置管理測試
│   ├── storage.test.js    # 存儲測試
│   └── ui.test.js         # UI交互測試
└── docs/
    ├── GUN_SETUP.md       # GUN.js設置指南
    ├── API.md             # 內部API文檔
    └── TESTING.md         # 測試指南
```

---

## 🔄 開發流程 (TDD)

### 對於每個功能模塊:

1. **寫測試** (RED phase)
   - 在 `tests/{module}.test.js` 寫失敗的測試
   - 測試應包含正常用例和邊界情況

2. **寫代碼** (GREEN phase)
   - 在 `js/{module}.js` 實現最簡代碼通過測試
   - 暫不考慮優化

3. **重構** (REFACTOR phase)
   - 改進代碼質量、可讀性、性能
   - 確保測試仍然通過

4. **整合** (INTEGRATION)
   - 與其他模塊整合
   - 運行全部測試確保無迴歸

---

## 🧪 測試框架與運行方式

### 選擇: Jest (CDN版本)
- 原因: 無需打包工具，CDN可用，語法清晰

### 測試類型:

#### 單元測試 (Unit Tests)
- 測試每個模塊的獨立功能
- 例: `auth.test.js` 測試登錄、註冊邏輯

#### 集成測試 (Integration Tests)
- 測試模塊間的協作
- 例: 用戶登錄後能否正確拉取WiFi列表

#### E2E測試 (End-to-End)
- 測試完整用戶流程
- 例: 登錄 → 查看地圖 → 新增點位 → 評分

### 運行測試
```bash
# 在HTML中引入jest，或使用Jest CLI
npm test  # 如果後續使用npm
```

---

## 🔧 GUN.js 使用指南

### 初始化
```javascript
const db = GUN();
```

### 數據結構設計
```
gun.get('locations').set({...})      // WiFi點位集合
gun.get('users').set({...})          // 用戶數據
gun.get('comments').set({...})       // 評論
```

### 實時同步特性
- 數據變化自動推送到所有連接的client
- 支持離線修改，連接後自動合併

### 重要考量
- GUN支持加密存儲
- 需要指定relay節點以提升連通性
- 可選: 自建GUN relay或使用免費公共relay

---

## 📊 開發進度跟蹤

### 當前進度: **項目結構和測試用例完成**

- [x] 與用戶討論需求
- [x] 編寫PRD.md
- [x] 編寫AGENTS.md (本文件)
- [x] 創建項目目錄結構
- [x] 編寫HTML框架 (index.html)
- [x] 編寫CSS樣式 (main.css, map.css, mobile.css)
- [x] 編寫JS模塊骨架 (5個模塊)
- [x] 編寫詳細TDD測試用例 (5個測試文件)
- [ ] **第1階段**: 基礎架構 + 認證
- [ ] **第2階段**: 地圖 + 查詢功能
- [ ] **第3階段**: 新增/編輯 + 評論
- [ ] **第4階段**: 離線支持 + 優化

---

## 🚀 快速啟動指南 (for New Agents)

### Step 1: 了解需求
> 閱讀 `PRD.md` 了解完整的產品需求和設計

### Step 2: 設置環境
```bash
# 克隆倉庫
git clone <repo-url>
cd wifi

# 創建開發分支
git checkout -b feature/<功能名>
```

### Step 3: 開發流程
1. 選擇一個功能模塊 (見上方的核心功能清單)
2. 先寫測試用例 (TDD)
3. 實現代碼直到測試通過
4. 提交PR，描述測試覆蓋率

### Step 4: 測試與驗證
- 確保單元測試通過
- 檢查與現有代碼的集成
- 驗證無console錯誤

---

## ⚠️ 重要注意事項

### 1. GUN.js Relay 設置
- 需要指定一個公共或自建的GUN relay
- 建議初期使用免費公共relay: `https://gun.echojs.com/gun`
- 生產環境考慮自建relay

### 2. CDN依賴版本
- Leaflet: 最新穩定版
- GUN.js: 最新版本
- Jest: CDN可用版本
- 所有外部庫都從CDN引入，不使用npm

### 3. 本地測試
- 由於涉及跨域和P2P，本地測試時需要小心CORS問題
- 可使用簡單HTTP server (如 `python -m http.server 8000`)

### 4. 數據隱私
- WiFi信息（如密碼）不應在GUN存儲
- 只存儲公開信息（位置、SSID、評分等）
- 用戶真實位置信息應在本地，不同步到GUN

---

## 📚 相關資源與文檔

- [GUN.js官方文檔](https://gun.eco)
- [Leaflet.js文檔](https://leafletjs.com)
- [Jest測試框架](https://jestjs.io)
- [OpenStreetMap](https://www.openstreetmap.org)

---

## 💬 協作建議

### 對未來AI Agent的建議:

1. **優先閱讀**: PRD.md 和本文件 (AGENTS.md)
2. **遵循TDD**: 每個功能先寫測試
3. **模塊化開發**: 一次完成一個功能模塊
4. **定期更新**: 完成階段後更新此文件進度
5. **保持文檔同步**: 有任何設計變更時同步到PRD和本文件

### 提問模板 (如有疑問):
```
【模塊】: <功能名>
【問題】: <具體問題>
【涉及文件】: <相關文件>
【建議方案】: <可選的解決思路>
```

---

**最後更新**: 2025-11-19 20:00 UTC  
**維護者**: Initial Setup by Copilot  
**下一步**: 開始Phase 1開發 (認證系統實現)

