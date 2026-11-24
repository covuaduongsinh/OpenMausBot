# Kế hoạch đồng bộ upstream lên v0.1.180

- **Ngày lập:** 24/11/2026
- **Trạng thái:** Hoàn tất
- **Upstream:** `https://github.com/milind-soni/OpenMausBot.git` (`upstream/main` = `4e9ecb275`, v0.1.180)
- **Fork:** `https://github.com/covuaduongsinh/OpenMausBot.git` (`origin/main` = `504cd9d9f`, v0.1.173)

## 1. Hiện trạng

- Mốc chung (merge-base): `9f7f7b1f3` (v0.1.173, lần đồng bộ ngày 20/11/2026).
- Upstream có thêm **1464 commit** (v0.1.173 → v0.1.180 bao gồm các bản release v0.1.174, v0.1.175, v0.1.176, v0.1.177, v0.1.178, v0.1.180):
  - Trang quản lý Thiết bị (Devices page) gom nhóm một trang, hỗ trợ flow trực tiếp và bản đồ thiết bị thu gọn.
  - Hỗ trợ nhiều tài khoản ChatGPT / Codex trên Cloud thông qua device code.
  - Tối ưu khởi động phiên làm việc, retry khi cloud engine chưa sẵn sàng, cải thiện bot greeting.
  - Hiển thị lý do engine không chạy và trạng thái kết nối (`list_models`).
  - Dọn dẹp idle dependency, memory cache và cải tiến hệ thống handoff cards.
- Fork có các commit tùy biến riêng:
  - Mở khóa Team files và các tính năng Enterprise cho phiên bản self-hosted (`OMB_TEAM_NAME`, `OMB_FULL_FEATURES`).
  - Hỗ trợ liệt kê toàn bộ hội thoại của team trên bản self-hosted.
  - Kế hoạch và script triển khai Dokploy / VPS.
- Xung đột duy nhất phát sinh tại: `server/index.ts` (import `type CloudTeam` vs `createSetupRecovery`, và route đăng ký `createRemoteTeammateRoutes`).

## 2. Lựa chọn phương án đồng bộ

- **Merge commit** (`git merge --no-ff upstream/main`): Tiếp tục giữ mô hình merge commit thay vì rebase để bảo toàn cây lịch sử commit trên fork, tránh phải force-push và đảm bảo tính tương thích với VPS tự động deploy qua git.

## 3. Các bước thực hiện

1. Giữ nguyên các file untracked chưa commit (`.omc/`, `scripts/dokploy-api.mjs`, `scripts/update-dokploy-mausbot.mjs`) để bảo mật thông tin môi trường.
2. Thực thi merge `upstream/main` vào nhánh `main` của fork.
3. Giải quyết xung đột trong `server/index.ts`:
   - Giữ nguyên import `CloudTeam` và bổ sung `createSetupRecovery` từ upstream.
   - Kết hợp cấu hình `createTeamFilesRoutes` tùy biến của fork với `createRemoteTeammateRoutes` mới từ upstream.
4. Cập nhật node_modules theo lockfile mới bằng `pnpm install --frozen-lockfile`.
5. Kiểm tra & xác minh:
   - Đối chiếu `git diff upstream/main HEAD`: đảm bảo tất cả tính năng tùy biến của fork (Team Files, Enterprise unlock, Team chats) được bảo toàn nguyên vẹn.
   - Chạy type-check và bộ test Vitest cho các tính năng tùy biến của fork (`server/config.test.ts`, `server/enterprise.test.ts`, `server/host/self-hosted-team-files.test.ts`, `src/state/team-chats.test.ts`).
6. Tạo commit tài liệu kế hoạch vào `docs/plans/2026-11-24-sync-upstream-v0.1.180.md`.
7. Đẩy commit merge và các tags mới lên GitHub fork: `git push origin main` và `git push origin --tags`.
8. Kiểm tra trạng thái Git đảm bảo repo local và remote `origin` đã đồng bộ hoàn toàn.

## 4. Ngoài phạm vi

- Deploy lên VPS `mausbot.dsc.edu.vn` (thực hiện theo quy trình riêng khi người dùng yêu cầu).

## 5. Kết quả thực hiện

- Merge commit `c7aa26182` "Merge upstream v0.1.180 into fork": giải quyết xung đột sạch sẽ tại `server/index.ts`, `package.json` lên phiên bản `0.1.180`.
- Đối chiếu `git diff upstream/main HEAD`: toàn bộ tính năng tùy biến cho self-hosted (Team files qua `OMB_TEAM_NAME`, Enterprise unlock, liệt kê hội thoại team) được bảo lưu đầy đủ và chính xác.
- `pnpm install --frozen-lockfile`: hoàn thành thành công trong 1m 37s.
- Bộ test Vitest 4 file tính năng của fork: 255 passed, 2 skipped (bỏ qua trên Windows).
- Đã commit kế hoạch và đồng bộ toàn bộ commits cùng release tags mới lên `origin` (GitHub).
