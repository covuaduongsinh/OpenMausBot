import { PassThrough } from "node:stream";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createTeamFilesHost } from "./team-files-host.ts";
import { createTeamFilesRoutes } from "../routes/team-files.ts";
import type { RouteContext } from "../routes/table.ts";

const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });

describe("Self-hosted team files route handling", () => {
  it("allows loopback and session actors on self-hosted team setups", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "omb-sh-team-files-"));
    dirs.push(dataDir);
    const host = createTeamFilesHost({
      team: { name: "Dương Sinh Chess" },
      dataDir,
      bots: () => [],
      boxOn: () => false,
      askerOf: () => null,
    });
    expect(host.files).not.toBeNull();

    const handler = createTeamFilesRoutes({
      files: host.files,
      actor: (auth) => {
        if (auth.kind === "session") {
          return { person: auth.session.email ?? auth.session.id, admin: auth.scopes.includes("admin") };
        }
        if (auth.kind === "loopback") return { person: "owner", admin: true };
        return null;
      },
      personName: (person) => (person === "owner" ? "Admin" : person),
      botName: () => undefined,
    });

    let jsonCode = 0;
    let jsonBody: unknown = null;
    const jsonHelper = (_res: unknown, code: number, body: unknown) => {
      jsonCode = code;
      jsonBody = body;
    };

    // GET /api/team-files as loopback
    const req = new PassThrough();
    const res = new PassThrough();
    const ctx: RouteContext = {
      req: req as never,
      res: res as never,
      url: new URL("http://localhost/api/team-files"),
      path: "/api/team-files",
      method: "GET",
      auth: { kind: "loopback" } as never,
      json: jsonHelper as never,
      readBody: async () => null,
    };

    await handler(ctx);
    expect(jsonCode).toBe(200);
    expect(jsonBody).toMatchObject({ path: "", entries: [], used: 0, admin: true });

    // PUT upload as session member
    const uploadStream = new PassThrough();
    uploadStream.end(Buffer.from("Hello Chess"));
    const uploadReq = Object.assign(uploadStream, { headers: { "content-length": "11" } });
    const uploadCtx: RouteContext = {
      req: uploadReq as never,
      res: res as never,
      url: new URL("http://localhost/api/team-files/file?path=&name=welcome.txt"),
      path: "/api/team-files/file",
      method: "PUT",
      auth: { kind: "session", session: { id: "s-1", email: "teacher@dsc.edu.vn" }, scopes: ["client"] } as never,
      json: jsonHelper as never,
      readBody: async () => null,
    };

    await handler(uploadCtx);
    expect(jsonCode).toBe(201);
    expect(existsSync(join(dataDir, "team-files", "welcome.txt"))).toBe(true);
  });
});
