# Plan: Unlock Team Files & Enable Team Mode for Self-Hosted OpenMausBot

**Target:** Enable "Team files" (Tệp của nhóm) and team identification for self-hosted instances on `mausbot.dsc.edu.vn` (VPS).
**Date:** 2026-11-18
**Author:** Antigravity Agent

---

## 1. Problem Statement & Motivation
By default, OpenMausBot restricts `team-files` (`/api/team-files` and the sidebar's "Tệp của nhóm" nav row) to deployments running with `CLOUD_HOME?.team` (MausBot Cloud SaaS managed via Fly.io).
Self-hosted single-user / multi-user instances do not set `CLOUD_HOME`, causing `state.config.team` to be `undefined`. Consequently:
1. The sidebar hides "Team files".
2. Routes at `/api/team-files` return 404 because `teamFilesHost.files` is null.
3. Bots do not receive `/team-files` prompt instructions.

The user requested unlocking Team Files for their self-hosted VPS while maintaining the existing multi-user self-hosted architecture (inviting members via Settings -> People, sharing bots, and creating room chats).

---

## 2. Proposed Architecture & Changes

### 2.1 Configuration Support
Support defining team identity via:
- Environment variable: `OMB_TEAM_NAME` (e.g. `"Dương Sinh Chess"`) and optional `OMB_TEAM_ID` (e.g. `"duong-sinh-chess"`).
- `config.json`: `team: { id: "duong-sinh-chess", name: "Dương Sinh Chess" }`.

### 2.2 Backend Changes (`server/index.ts` & `server/config.ts`)
1. In `server/config.ts`:
   - Add `team?: { id?: string; name?: string }` to `AppConfig`.
2. In `server/index.ts`:
   - Compute `SELF_HOSTED_TEAM` from `process.env.OMB_TEAM_NAME` or `cfg.team?.name`.
   - Compute `TEAM_FILES_TEAM = CLOUD_TEAM ?? SELF_HOSTED_TEAM`.
   - Pass `TEAM_FILES_TEAM` to `createTeamFilesHost`: initializes `teamFilesHost.files` (creates `<dataDir>/team-files` and `team-files-activity.json`).
   - In `/api/config`: return `team: { id: TEAM_FILES_TEAM.id, name: TEAM_FILES_TEAM.name }` when `TEAM_FILES_TEAM` is present (without `cloudPage` or `cloudHome`).
   - In `createTeamFilesRoutes`:
     - Allow `actor` resolution for session cookies (`auth.session`) and loopback requests.
     - Resolve `personName` using `sessions.list()` or `cfg.profile?.name`.
   - Ensure `CLOUD_HOME` remains `null` and `cfg.profile` is never wiped.

### 2.3 Verification Strategy
1. Isolated automated unit tests:
   - Run `server/host/team-files.test.ts` and `server/host/team-files-host.test.ts`.
   - Verify `createTeamFilesRoutes` responds with 200/201 on GET, PUT, POST when `team` is configured.
2. Build verification:
   - Run `pnpm build` (tsc and vite build) to verify no type or bundle errors.
3. VPS Deployment:
   - Build docker image or push git commit and pull on VPS.
   - Configure `OMB_TEAM_NAME="Dương Sinh Chess"` in VPS docker-compose.
   - Restart container and verify via `curl` on `https://mausbot.dsc.edu.vn/api/config` and `/api/team-files`.

---

## 3. Rollout Steps
1. Edit `server/config.ts` to add `team` to `AppConfig`.
2. Edit `server/index.ts` to implement `SELF_HOSTED_TEAM` and `TEAM_FILES_TEAM`.
3. Run vitest for team-files.
4. Run `pnpm build` to ensure typecheck passes.
5. Commit and push to GitHub.
6. SSH to VPS `mausbot.dsc.edu.vn`:
   - Add `OMB_TEAM_NAME="Dương Sinh Chess"` to `docker-compose.yml`.
   - Rebuild or update container.
   - Verify health and endpoint responses.
