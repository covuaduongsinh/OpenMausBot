# Kế hoạch đồng bộ upstream lên v0.1.173

- **Ngày lập:** 20/11/2026
- **Trạng thái:** Hoàn tất
- **Upstream:** `https://github.com/milind-soni/OpenMausBot.git` (`upstream/main` = `9f7f7b1f3`, v0.1.173)
- **Fork:** `https://github.com/covuaduongsinh/OpenMausBot.git` (`origin/main` = `ad1e22610`, v0.1.167)

## 1. Hiện trạng

- Mốc chung (merge-base): `9f054751f` (v0.1.167, lần đồng bộ ngày 17/11).
- Upstream có thêm **379 commit** (v0.1.170 → v0.1.173): hiệu năng chat/transcript,
  CLI `openmausbot login`, Inbox, routine thử lại khi cloud computer chưa thức, Claude/Codex
  tự compact session dài, biểu đồ chi tiêu, OpenCode 2.3.2…
- Fork có **5 commit riêng** (mở khoá Team files và tính năng enterprise cho bản self-hosted,
  liệt kê mọi hội thoại của team), chạm 16 file.
- File chạm ở cả hai phía: `server/config.ts`, `server/enterprise.ts`, `server/index.ts`,
  `src/state/config-status.ts`.
- `git merge-tree --write-tree main upstream/main` → **không có xung đột**.

## 2. Chọn cách đồng bộ

**Merge commit** (không rebase): `origin/main` đã public và đã có 5 commit riêng; rebase sẽ
buộc force-push và đổi hash commit đang được VPS `/opt/omb-build` kéo về. Fast-forward không
được vì hai nhánh đã rẽ.

## 3. Các bước

1. Giữ nguyên file chưa track (`.omc/`, `scripts/dokploy-api.mjs`,
   `scripts/update-dokploy-mausbot.mjs`) — không commit, có thể chứa thông tin máy chủ.
2. `git merge --no-ff upstream/main` với message `Merge upstream v0.1.173 into fork`.
3. `pnpm install` để cập nhật dependencies theo lockfile mới.
4. Kiểm tra:
   - Type-check toàn bộ (`pnpm exec tsc --noEmit` hoặc script check của repo).
   - Chạy test của các file fork đã sửa: `server/config.test.ts`, `server/enterprise.test.ts`,
     `server/host/self-hosted-team-files.test.ts`, `src/state/team-chats.test.ts`.
   - Đọc lại 4 file chạm hai phía để chắc phần mở khoá vẫn còn sau merge.
5. `git push origin main` và `git push origin --tags` (tag mới v0.1.170, v0.1.171, v0.1.173…).
6. Xác nhận `main`, `origin/main` cùng hash; `upstream/main` là tổ tiên của `main`.

## 4. Ngoài phạm vi

Deploy lên VPS `mausbot.dsc.edu.vn` — làm riêng theo quy trình build `Dockerfile.custom`
khi chủ dự án yêu cầu.

## 5. Kết quả

- Merge commit `8f3b92e00` "Merge upstream v0.1.173 into fork": không xung đột,
  `package.json` lên `0.1.173`.
- Đối chiếu `git diff upstream/main HEAD`: toàn bộ phần mở khoá (config `team`/`OMB_TEAM_NAME`,
  `OMB_FULL_FEATURES`, license mặc định, `TEAM_FILES_TEAM`, `selfHosted`) còn nguyên.
- `pnpm install --frozen-lockfile`: thành công (19 phút; lần chạy đầu treo ở 1000 gói phải
  dừng và chạy lại với `CI=true --reporter=append-only`).
- `tsc -p tsconfig.server.json` và `tsc -b`: không lỗi.
- Vitest 4 file của fork: 253 pass, 2 skip (test upstream chỉ bỏ qua trên Windows).
- Đã push `main` và tags lên `origin`.
