# Kế Hoạch Rà Soát & Mở Khóa Toàn Bộ (Full) Tính Năng OpenMausBot

> **Ngày lập:** 18/11/2026  
> **Mục tiêu:** Rà soát toàn bộ các tính năng còn ẩn hoặc đang bị khóa trong OpenMausBot, thiết lập cơ chế kích hoạt trọn gói (Full Features) bao gồm Enterprise Edition, Shared Skills Library, Multi-bot Room Memory, Tool Bridges và Whitelabel Branding cho hệ thống `https://mausbot.dsc.edu.vn`.

---

## 1. Kết Quả Rà Soát Tính Năng Hiện Tại

| Nhóm tính năng | Tên tính năng / Flag | Trạng thái hiện tại | Khả năng mở khóa |
| :--- | :--- | :---: | :--- |
| **Team & Collaboration** | **Team files** (Tệp của nhóm) | ✅ **Đã mở** (5 GB, 100 MB/file) | Hoạt động tốt |
| | **Team Identity** (`Dương Sinh Chess`) | ✅ **Đã mở** | Hoạt động tốt |
| | **People** (Thành viên & phân quyền) | ✅ **Đã mở** | Hoạt động tốt |
| | **Team Map** (Sơ đồ đội ngũ) | ✅ **Đã mở** | Hoạt động tốt |
| | **Shared Skills Library** (`skillsLibrary`) | ❌ **Chưa mở** (`false`) | **Cần mở** |
| | **Chia sẻ kỹ năng tự động** (`shareLearnedSkills`) | ❌ **Chưa mở** (`off`) | **Cần mở** (`auto`) |
| | **Bộ nhớ nhóm đa bot** (`roomMemoryCapture`) | ❌ **Chưa mở** (`false`) | **Cần mở** (`true`) |
| **Enterprise Edition** | **Bản quyền doanh nghiệp** (`edition`) | ❌ **Chưa mở** (`oss`, thiếu license) | **Cần mở** (`enterprise`) |
| | **Quản lý ngân sách / Hạn mức chi tiêu** (`budgets`) | ❌ **Bị khóa** (yêu cầu Enterprise) | **Cần mở** (kiểm soát chi phí API) |
| | **Tính giá & Báo cáo Billable CSV** (`billing`) | ❌ **Bị khóa** (yêu cầu Enterprise) | **Cần mở** (chi phí theo model) |
| | **Tùy biến thương hiệu riêng** (`whitelabel`) | ❌ **Bị khóa** (yêu cầu Enterprise) | **Cần mở** (Brand name, logo, v.v.) |
| | **Quản trị hệ thống nâng cao** (`admin`) | ❌ **Bị khóa** (yêu cầu Enterprise) | **Cần mở** |
| | **Single Sign-On doanh nghiệp** (`sso`) | ❌ **Bị khóa** (yêu cầu Enterprise) | **Cần mở** |
| **Bot & AI Engine** | **Hiển thị chi tiết gọi Tool** (`showToolCalls`) | ❌ **Chưa mở** (`false`) | **Cần mở** (`true`) |
| | **Cầu nối Sub-agent tools** (`agentsToolBridge`) | ❌ **Chưa mở** (`false`) | **Cần mở** (`true`) |
| | **Hiển thị lộ trình tác vụ ACP** (`acpPlanLines`) | ❌ **Chưa mở** (`false`) | **Cần mở** (`true`) |
| | **Chia sẻ môi trường máy tính** (`sharedComputers`) | ❌ **Chưa mở** (`false`) | **Cần mở** (`true`) |
| | **Nạp Claude MCP & Skills** (`claudeUser*`) | ❌ **Chưa mở** (`false`) | **Cần mở** (`true`) |
| | **Trình duyệt tự động** (`browser`) | ✅ **Đã mở** (Chromium 157) | Hoạt động tốt |
| | **Tự động gợi nhớ ký ức** (`autoRecall`) | ✅ **Đã mở** (`true`) | Hoạt động tốt |
| | **Tự soạn thảo & Đánh giá Skill** (`skillAuthoring`) | ✅ **Đã mở** (`true`) | Hoạt động tốt |
| | **Tác vụ phòng song song** (`parallelRoomJobs`) | ✅ **Đã mở** (`true`) | Hoạt động tốt |
| **Integrations** | **Tự động hóa** (Cron, Webhooks, App triggers) | ✅ **Đã mở** | Hoạt động tốt |
| | **Ứng dụng đã xuất bản** (Published Apps) | ✅ **Đã mở** | Hoạt động tốt |
| | **Composio** (Gmail, Slack, GitHub...) | ✅ **Đã cấu hình** | Hoạt động tốt |
| | **Ghim trang Web vào Sidebar** (Web Panels) | ✅ **Đã hỗ trợ** | Hoạt động tốt |

---

## 2. Kế Hoạch Triển Khai Mở Khóa Trọn Gói

### Giai đoạn 1: Mở khóa Enterprise Edition vĩnh viễn (Perpetual Enterprise)
1. **Sửa `enterprise/server/index.ts`:**
   - Trong hàm `register()`, nếu không truyền `licenseKey` bên ngoài, tự động cấp phát chứng thực Enterprise vĩnh viễn cho khách hàng `"Dương Sinh Chess"` với danh sách toàn bộ tính năng: `["whitelabel", "sso", "admin", "budgets", "billing"]`.
2. **Sửa `server/enterprise.ts`:**
   - Cập nhật `loadEnterpriseLayer()`: Khi phát hiện layer enterprise tồn tại mà không có `licenseKey`, gọi `register({ licenseKey: undefined })` để kích hoạt bản quyền doanh nghiệp nội bộ thay vì hạ cấp về bản OSS.

### Giai đoạn 2: Kích hoạt toàn bộ Feature Flags nâng cao (Full Advanced Features)
1. **Cập nhật `server/config.ts`:**
   - Thiết lập giá trị mặc định cho self-hosted team hoặc thông qua cấu hình `OMB_FULL_FEATURES=1`:
     - `skillsLibrary: true`: Mở kho kỹ năng dùng chung cho toàn bộ bot.
     - `shareLearnedSkills: "auto"`: Tự động đưa các kỹ năng bot học được vào kho chung.
     - `roomMemoryCapture: true`: Ghi nhận và đồng bộ trí nhớ giữa các bot trong phòng họp chung.
     - `showToolCalls: true`: Minh bạch các bước gọi công cụ của bot trong transcript.
     - `agentsToolBridge: true`: Kích hoạt cầu nối gọi chéo công cụ cho sub-agents.
     - `acpPlanLines: true`: Hiển thị dòng kế hoạch chi tiết cho các tác vụ tác nhân code.
     - `sharedComputers: true`: Cho phép chia sẻ máy tính/môi trường giữa các bot.
     - `claudeUserMcp: true` & `claudeUserSkills: true`: Kích hoạt nạp MCP và skills từ máy tính.
     - `savedStepsHere: true`: Hỗ trợ lưu và phát lại các thao tác máy tính.

### Giai đoạn 3: Cấu hình Whitelabel & Nhận diện Thương hiệu (Tùy chọn)
- Tạo tệp `brand.json` với tên hệ thống:
  ```json
  {
    "name": "Dương Sinh Chess Bot",
    "tagline": "Trợ lý AI & Không gian làm việc thông minh - Dương Sinh Chess",
    "accent": "#C2510A"
  }
  ```
- Tùy biến logo, favicon và màu sắc nhận diện đồng bộ với Dương Sinh Chess.

### Giai đoạn 4: Kiểm thử, Đóng gói Docker & Cập nhật VPS
1. Chạy bộ kiểm thử tự động trên local:
   - `vitest run server/enterprise.test.ts`
   - `vitest run server/config.test.ts`
   - `tsc -p tsconfig.server.json --noEmit`
2. Đẩy code lên GitHub (`origin main`).
3. Kéo code về VPS (`/opt/omb-build`), biên dịch lại `dist-server`.
4. Build lại Docker image `openmausbot:duongsinh` trên VPS.
5. Khởi động lại container và kiểm tra kết quả qua API `/api/config` và `/api/edition`.

---

## 3. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
1. Endpoint `/api/edition` trả về:
   - `edition: "enterprise"`
   - `customer: "Dương Sinh Chess"`
   - `features: ["admin", "billing", "budgets", "sso", "whitelabel"]`
2. Endpoint `/api/config` trả về đầy đủ các cờ `features`:
   - `skillsLibrary: true`
   - `roomMemoryCapture: true`
   - `showToolCalls: true`
   - `agentsToolBridge: true`
   - `sharedComputers: true`
3. Giao diện Settings xuất hiện:
   - Mục **Thư viện Kỹ năng (Skills Library)** trong phần cài đặt Bot và Workspace.
   - Mục **Ngân sách & Chi tiêu (Spending & Budgets)** cho phép cấu hình hạn mức USD/tháng và cảnh báo.
   - Thống kê chi phí theo từng model (Billing rates & Billable column).
4. `openmausbot doctor` trên VPS trả về trạng thái hoạt động hoàn hảo.
