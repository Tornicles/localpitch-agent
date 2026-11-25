# Grana computer runtime evidence

No container was created.

Docker is not installed. `docker` is not on `PATH`, and Docker Desktop is not under `C:\Program Files\Docker`. `pnpm sandbox:build` was not run. There is no image digest, no container id, and no resource-limit observation.

The source that would be built is `infra/sandboxes/computer/Dockerfile` from Debian bookworm `sha256:3783cc01769c7b2b1b83a5c5ad96c815348e28ed7da68e2e3687004faa906251`. The supervisor service in `infra/compose/docker-compose.yml` sets memory `2g`, CPUs `2`, and pids `2048` unless overridden. Those limits were not applied to a running container.

A failed computer operation was not observed, because no operation was started. That is not a successful computer test.
