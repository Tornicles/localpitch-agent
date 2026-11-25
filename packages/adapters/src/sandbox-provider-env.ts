import type { SandboxProviderOptions } from "./sandbox-factory.js";

import { spawnSync } from "node:child_process";

/** True when a Docker CLI responds to `docker info` (daemon reachable). */
export function isDockerDaemonReachable(): boolean {
  try {
    const result = spawnSync("docker", ["info"], {
      encoding: "utf8",
      timeout: 8_000,
      windowsHide: true,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Empty or remote provider without a key becomes none so services can boot for signup.
 * Unset SANDBOX_PROVIDER no longer forces Docker: if the daemon is absent, boot as `none`
 * so API/worker/signup work without a computer backend. Explicit `SANDBOX_PROVIDER=docker`
 * still requests Docker (and may fail later at provision time).
 */
export function resolveSandboxProvider(
  source: NodeJS.ProcessEnv = process.env,
  opts?: { dockerReachable?: boolean },
): string {
  const configured = source.SANDBOX_PROVIDER;
  if (configured !== undefined && !configured.trim()) return "none";
  const explicit = Boolean(configured?.trim());
  const requested = configured?.trim() || "docker";
  if (requested === "none") return "none";
  if (requested === "e2b" && !optional(source.E2B_API_KEY)) return "none";
  if (requested === "novita" && !optional(source.NOVITA_API_KEY)) return "none";
  if (requested === "daytona" && !optional(source.DAYTONA_API_KEY)) return "none";
  if (requested === "createos" && !optional(source.CREATEOS_SANDBOX_API_KEY)) return "none";
  if (requested === "boat" && !boatApiKeyFromEnv(source)) return "none";
  if (
    requested === "railway" &&
    (!optional(source.RAILWAY_API_TOKEN) || !optional(source.RAILWAY_ENVIRONMENT_ID))
  )
    return "none";
  // Production without a supervisor token cannot run Docker computers; boot as none instead of exiting.
  if (
    requested === "docker" &&
    source.NODE_ENV === "production" &&
    !optional(source.SANDBOX_SUPERVISOR_TOKEN)
  ) {
    return "none";
  }
  // Default (implicit) docker preference: if Docker is not installed, do not pretend it is mandatory.
  const dockerOk = opts?.dockerReachable ?? isDockerDaemonReachable();
  if (requested === "docker" && !explicit && !dockerOk) {
    return "none";
  }
  return requested;
}

export function sandboxProviderOptionsFromEnv(
  source: NodeJS.ProcessEnv = process.env,
): Pick<
  SandboxProviderOptions,
  | "hostComputerUrl"
  | "hostComputerToken"
  | "e2bApiKey"
  | "novitaApiKey"
  | "sandboxTemplate"
  | "daytonaApiKey"
  | "daytonaApiUrl"
  | "daytonaTarget"
  | "createosApiKey"
  | "createosBaseUrl"
  | "createosShape"
  | "createosRootfs"
  | "railwayApiToken"
  | "railwayEnvironmentId"
  | "railwayMaxWorkspaceFileBytes"
  | "railwaySandboxRegion"
  | "boatApiKey"
  | "boatApiUrl"
  | "kubernetesNamespace"
  | "kubernetesRuntimeClassName"
  | "kubernetesComputerImage"
  | "kubernetesCpuLimit"
  | "kubernetesMemoryLimit"
  | "kubernetesPodAnnotations"
  | "kubernetesPodLabels"
  | "kubernetesReadyTimeoutMs"
  | "kubernetesHomeClaim"
  | "kubernetesHomeColocateNamespace"
  | "kubernetesHomeColocateLabels"
> {
  return {
    hostComputerUrl: source.SANDBOX_HOST_URL,
    hostComputerToken: source.SANDBOX_HOST_TOKEN,
    e2bApiKey: source.E2B_API_KEY,
    novitaApiKey: optional(source.NOVITA_API_KEY),
    sandboxTemplate: optional(source.SANDBOX_TEMPLATE),
    daytonaApiKey: source.DAYTONA_API_KEY,
    daytonaApiUrl: source.DAYTONA_API_URL,
    daytonaTarget: source.DAYTONA_TARGET,
    createosApiKey: source.CREATEOS_SANDBOX_API_KEY,
    createosBaseUrl: source.CREATEOS_SANDBOX_BASE_URL,
    createosShape: source.CREATEOS_SANDBOX_SHAPE,
    createosRootfs: source.CREATEOS_SANDBOX_ROOTFS,
    railwayApiToken: source.RAILWAY_API_TOKEN,
    railwayEnvironmentId: source.RAILWAY_ENVIRONMENT_ID,
    railwayMaxWorkspaceFileBytes: source.RAILWAY_MAX_WORKSPACE_FILE_BYTES,
    railwaySandboxRegion: optional(source.RAILWAY_SANDBOX_REGION),
    boatApiKey: boatApiKeyFromEnv(source),
    boatApiUrl: boatApiUrlFromEnv(source),
    kubernetesNamespace: optional(source.KUBERNETES_SANDBOX_NAMESPACE),
    kubernetesRuntimeClassName: optional(source.KUBERNETES_SANDBOX_RUNTIME_CLASS_NAME),
    kubernetesComputerImage: optional(source.KUBERNETES_SANDBOX_COMPUTER_IMAGE),
    kubernetesCpuLimit: optional(source.KUBERNETES_SANDBOX_CPU_LIMIT),
    kubernetesMemoryLimit: optional(source.KUBERNETES_SANDBOX_MEMORY_LIMIT),
    kubernetesPodAnnotations: stringMap(
      source.KUBERNETES_SANDBOX_POD_ANNOTATIONS,
      "KUBERNETES_SANDBOX_POD_ANNOTATIONS",
    ),
    kubernetesPodLabels: stringMap(
      source.KUBERNETES_SANDBOX_POD_LABELS,
      "KUBERNETES_SANDBOX_POD_LABELS",
    ),
    kubernetesReadyTimeoutMs: positiveInteger(
      source.KUBERNETES_SANDBOX_READY_TIMEOUT_MS,
      "KUBERNETES_SANDBOX_READY_TIMEOUT_MS",
    ),
    kubernetesHomeClaim: optional(source.OBJECT_STORAGE_BUCKET)
      ? undefined
      : optional(source.KUBERNETES_SANDBOX_HOME_CLAIM),
    kubernetesHomeColocateNamespace: optional(source.KUBERNETES_SANDBOX_HOME_COLOCATE_NAMESPACE),
    kubernetesHomeColocateLabels: stringMap(
      source.KUBERNETES_SANDBOX_HOME_COLOCATE_LABELS,
      "KUBERNETES_SANDBOX_HOME_COLOCATE_LABELS",
    ),
  };
}

function stringMap(value: string | undefined, name: string): Record<string, string> | undefined {
  const configured = optional(value);
  if (!configured) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(configured);
  } catch (error) {
    throw new Error(`${name} must be a JSON object of string values`, { cause: error });
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    Object.values(parsed).some((entry) => typeof entry !== "string")
  ) {
    throw new Error(`${name} must be a JSON object of string values`);
  }
  return parsed as Record<string, string>;
}

function positiveInteger(value: string | undefined, name: string): number | undefined {
  const configured = optional(value);
  if (!configured) return undefined;
  const parsed = Number(configured);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function boatApiKeyFromEnv(source: NodeJS.ProcessEnv): string | undefined {
  return optional(source.BOAT_API_KEY);
}

export function boatApiUrlFromEnv(source: NodeJS.ProcessEnv): string | undefined {
  return optional(source.BOAT_API_URL);
}
