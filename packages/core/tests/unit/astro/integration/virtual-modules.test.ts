import { describe, expect, it } from "vitest";

import {
	generateContentEntrypointModule,
	generateDialectModule,
} from "../../../../src/astro/integration/virtual-modules.js";

describe("generateDialectModule", () => {
	it("emits undefined createDialect and null stub when no entrypoint is configured", () => {
		const out = generateDialectModule({ supportsRequestScope: false });
		expect(out).toContain("export const createDialect = undefined");
		expect(out).toContain("export const createRequestScopedDb = (_opts) => null");
	});

	it("emits a null stub for adapters that don't support request scoping", () => {
		const out = generateDialectModule({
			entrypoint: "some-adapter/dialect",
			type: "sqlite",
			supportsRequestScope: false,
		});
		expect(out).toContain(`import { createDialect as _createDialect } from "some-adapter/dialect"`);
		expect(out).toContain("export const createRequestScopedDb = (_opts) => null");
		expect(out).not.toContain(`export { createRequestScopedDb } from`);
	});

	it("re-exports createRequestScopedDb from the adapter when supportsRequestScope is true", () => {
		const out = generateDialectModule({
			entrypoint: "@emdash-cms/cloudflare/db/d1",
			type: "sqlite",
			supportsRequestScope: true,
		});
		expect(out).toContain(`export { createRequestScopedDb } from "@emdash-cms/cloudflare/db/d1"`);
		expect(out).not.toContain("= () => null");
		expect(out).not.toContain("= (_opts) => null");
	});

	it("threads the dialect type through", () => {
		const out = generateDialectModule({
			entrypoint: "emdash/db/postgres",
			type: "postgres",
			supportsRequestScope: false,
		});
		expect(out).toContain(`export const dialectType = "postgres"`);
	});
});

describe("generateContentEntrypointModule", () => {
	it("emits a null default export when contentRoutes is not configured", () => {
		const out = generateContentEntrypointModule(undefined);
		expect(out).toBe("export default null;");
	});

	it("re-exports an absolute filesystem path as the default", () => {
		const out = generateContentEntrypointModule("/abs/path/EmDashEntry.astro");
		expect(out).toContain(`import Entrypoint from "/abs/path/EmDashEntry.astro"`);
		expect(out).toContain("export default Entrypoint");
	});

	it("re-exports a package specifier as the default", () => {
		const out = generateContentEntrypointModule("@my-theme/emdash-entry");
		expect(out).toContain(`import Entrypoint from "@my-theme/emdash-entry"`);
		expect(out).toContain("export default Entrypoint");
	});

	it("escapes special characters in the entrypoint path", () => {
		// A path with a quote would otherwise break the generated import statement.
		const out = generateContentEntrypointModule(`/weird/"path"/Entry.astro`);
		expect(out).toContain(`"/weird/\\"path\\"/Entry.astro"`);
	});
});
