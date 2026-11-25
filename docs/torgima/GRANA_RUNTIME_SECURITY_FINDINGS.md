# Grana runtime security findings

## Confirmed from source, not from a live attack

1. The supervisor mounts the Docker socket (`infra/compose/docker-compose.yml`). That is host-level authority. The API and worker services do not mount it. Agent code must stay inside the computer container.
2. Team Computer sharing is documented as a shared OS user, files, and browser profile. Folder leases are not a client boundary. Untrusted clients need separate computers. This was not retested.
3. Restricted egress is a host script, not something Docker Desktop applies. This Windows machine has no Docker, so private-network denial was not tested.
4. Model keys are on the API and worker environment. They are not listed on the supervisor service. A running computer was not inspected to prove the key is absent from the container.
5. Customer-facing copy and image names still say Rakazo. That is a branding and supply-chain issue, not a proven data leak.

## Not claimed

No prompt-injection suite, no cross-workspace probe, and no Locksmith unseal attempt was run against this assistant server. Platform Locksmith tests on the integration branch remain a separate result. They do not certify this runtime.
