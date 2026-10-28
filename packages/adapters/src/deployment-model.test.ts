// Modified by LocalPitch, 2026
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveDeploymentModel } from "./deployment-model.js";
import { resolveRunModel } from "./run-model.js";

// Host credentials come from the process, so blank the ones a developer machine or CI
// host may carry; each case states its own.
const HOST_CREDENTIAL_ENV = [
  "AWS_PROFILE",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_BEARER_TOKEN_BEDROCK",
  "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI",
  "AWS_CONTAINER_CREDENTIALS_FULL_URI",
  "AWS_WEB_IDENTITY_TOKEN_FILE",
];

describe("resolveDeploymentModel", () => {
  beforeEach(() => {
    for (const name of HOST_CREDENTIAL_ENV) vi.stubEnv(name, "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("pairs the deployment model key with the provider it belongs to", () => {
    const both = { OPENROUTER_API_KEY: "or-key", ANTHROPIC_API_KEY: "sk-ant-key" };
    expect(resolveDeploymentModel(both)).toEqual({
      provider: "openrouter",
      model: "openai/gpt-6-luna",
      key: "or-key",
      configured: true,
      hostCredentials: false,
    });
    // Switching the provider switches the key with it.
    expect(resolveDeploymentModel({ ...both, PI_DEFAULT_PROVIDER: "anthropic" })).toEqual({
      provider: "anthropic",
      model: "claude-sonnet-5",
      key: "sk-ant-key",
      configured: true,
      hostCredentials: false,
    });
    // A provider with no key configured yields no key — never another vendor's.
    expect(
      resolveDeploymentModel({ OPENROUTER_API_KEY: "or-key", PI_DEFAULT_PROVIDER: "anthropic" }),
    ).toEqual({
      provider: "anthropic",
      model: "claude-sonnet-5",
      key: undefined,
      configured: false,
      hostCredentials: false,
    });
  });

  it("runs a provider that authenticates from the host without a key", () => {
    vi.stubEnv("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI", "/v2/credentials/example");
    const taskRole = {
      PI_DEFAULT_PROVIDER: "amazon-bedrock",
      PI_DEFAULT_MODEL: "eu.anthropic.claude-sonnet-5",
      PI_DEFAULT_CREDENTIALS: "host",
    };
    expect(resolveDeploymentModel(taskRole)).toEqual({
      provider: "amazon-bedrock",
      model: "eu.anthropic.claude-sonnet-5",
      key: undefined,
      configured: true,
      hostCredentials: true,
    });
  });

  it("leaves a deployment that did not opt in unchanged, even with host credentials", () => {
    vi.stubEnv("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI", "/v2/credentials/example");
    const withoutOptIn = {
      PI_DEFAULT_PROVIDER: "amazon-bedrock",
      PI_DEFAULT_MODEL: "eu.anthropic.claude-sonnet-5",
    };
    expect(resolveDeploymentModel(withoutOptIn).configured).toBe(false);
    expect(
      resolveDeploymentModel({ ...withoutOptIn, PI_DEFAULT_CREDENTIALS: "true" }).configured,
    ).toBe(false);
  });

  it("allows Bedrock instance roles without environment credentials, but requires an explicit model", () => {
    const provider = { PI_DEFAULT_PROVIDER: "amazon-bedrock", PI_DEFAULT_CREDENTIALS: "host" };
    expect(resolveDeploymentModel(provider).configured).toBe(false);
    expect(
      resolveDeploymentModel({ ...provider, PI_DEFAULT_MODEL: "eu.anthropic.claude-sonnet-5" }),
    ).toMatchObject({
      configured: true,
      hostCredentials: true,
      key: undefined,
    });
  });

  it("does not assume host authentication for other providers", () => {
    expect(
      resolveDeploymentModel({
        PI_DEFAULT_PROVIDER: "unknown",
        PI_DEFAULT_MODEL: "example-model",
        PI_DEFAULT_CREDENTIALS: "host",
      }).configured,
    ).toBe(false);
  });

  it("uses GEMINI_API_KEY for every bot when the deployment provider is google", () => {
    const env = {
      OPENROUTER_API_KEY: "or-key",
      ANTHROPIC_API_KEY: "sk-ant-key",
      GEMINI_API_KEY: "fake-gemini-key",
      PI_DEFAULT_PROVIDER: "google",
    };
    expect(resolveDeploymentModel(env)).toEqual({
      provider: "google",
      model: "gemini-3.8-flash",
      key: "fake-gemini-key",
      configured: true,
      hostCredentials: false,
    });
    expect(resolveDeploymentModel({ ...env, PI_DEFAULT_MODEL: "gemini-3.8-flash" }).model).toBe(
      "gemini-3.8-flash",
    );
    // Another vendor's key never fills in for Google.
    expect(
      resolveDeploymentModel({
        OPENROUTER_API_KEY: "or-key",
        ANTHROPIC_API_KEY: "sk-ant-key",
        PI_DEFAULT_PROVIDER: "google",
      }),
    ).toEqual({
      provider: "google",
      model: "gemini-3.8-flash",
      key: undefined,
      configured: false,
      hostCredentials: false,
    });
    // OpenRouter and Anthropic keep their own keys when Google is also set.
    expect(
      resolveDeploymentModel({
        ...env,
        PI_DEFAULT_PROVIDER: "openrouter",
      }),
    ).toMatchObject({ provider: "openrouter", key: "or-key", model: "openai/gpt-6-luna" });
    expect(
      resolveDeploymentModel({
        ...env,
        PI_DEFAULT_PROVIDER: "anthropic",
      }),
    ).toMatchObject({ provider: "anthropic", key: "sk-ant-key", model: "claude-sonnet-5" });
  });
});

describe("deployment Gemini key on a run with no user connection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves google/gemini-3.8-flash from GEMINI_API_KEY without a per-user key", async () => {
    vi.stubEnv("PI_DEFAULT_PROVIDER", "google");
    vi.stubEnv("PI_DEFAULT_MODEL", "gemini-3.8-flash");
    vi.stubEnv("GEMINI_API_KEY", "fake-gemini-key");
    vi.stubEnv("OPENROUTER_API_KEY", "fake-openrouter-key");
    const prisma = {
      spaceSettingOverride: { findMany: async () => [], findUnique: async () => null },
      userModelRoleChoice: { findMany: async () => [] },
      spaceModelRoleChoice: { findMany: async () => [] },
      deploymentSettings: { findUnique: async () => null },
    };
    const model = await resolveRunModel(
      {
        prisma,
        billingEnabled: false,
        deploymentModelConfigured: true,
        deploymentModelKey: "fake-gemini-key",
        secretStore: { load: async () => "", put: async () => ({ id: "", ciphertext: "" }) },
      } as never,
      { userId: "user-1", spaceId: "space-1" },
    );
    expect(model).toMatchObject({
      provider: "google",
      id: "gemini-3.8-flash",
      apiKey: "fake-gemini-key",
    });
  });
});
