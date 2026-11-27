import type { QuestionItem, TopicDefinition } from '../types/qa';

export const NEW_2026_TOPICS: TopicDefinition[] = [
  {
    slug: 'platform-engineering',
    name: 'Platform Engineering & GitOps',
    shortName: 'Platform & GitOps',
    blurb: 'Internal Developer Platforms, Backstage golden paths, Crossplane control planes, Argo CD & Flux v2.',
    icon: 'platform',
    accent: '#2558d9',
    isNew2026: true,
    followUps: [
      {
        keywords: ['argocd', 'flux', 'gitops', 'drift', 'sync'],
        question: 'How do you handle secrets cleanly inside a GitOps repository without committing plaintext?',
        answer: 'Store secrets in AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault, and sync them into Kubernetes at runtime using External Secrets Operator (ESO) with OIDC/Workload Identity. Keep only non-sensitive ExternalSecret manifests in Git, or use SOPS with KMS encryption for bootstrap secrets.'
      },
      {
        keywords: ['backstage', 'idp', 'golden', 'developer', 'platform'],
        question: 'How do you measure whether your Internal Developer Platform is actually succeeding?',
        answer: 'Track adoption of golden paths alongside DORA metrics (deployment frequency, lead time for changes, change failure rate, MTTR) and developer cognitive load via quarterly surveys. A platform fails if teams feel forced onto it and work around it.'
      },
      {
        keywords: ['crossplane', 'composition', 'xrd', 'terraform'],
        question: 'What happens if a Crossplane controller loses cloud credentials or stops reconciling?',
        answer: 'Existing cloud resources keep running undisturbed because Crossplane reconciles desired state asynchronously, unlike a runtime data-plane dependency. Alerts on provider health and Ready=False conditions notify platform engineers so reconciliation resumes without production downtime.'
      }
    ]
  },
  {
    slug: 'devsecops',
    name: 'DevSecOps & Supply Chain',
    shortName: 'DevSecOps',
    blurb: 'SBOM & Sigstore Cosign, SLSA provenance, Kyverno/OPA admission policies, Vault dynamic secrets, and Falco.',
    icon: 'security',
    accent: '#4f46e5',
    isNew2026: true,
    followUps: [
      {
        keywords: ['cosign', 'sigstore', 'sbom', 'slsa', 'signing', 'supply'],
        question: 'Why is keyless signing with Sigstore preferred over long-lived signing keys in CI?',
        answer: 'Keyless signing issues a short-lived Fulcio certificate tied to the CI runner OIDC identity and logs the signature in Rekor transparency log. There is no static private key to rotate, leak, or compromise in CI secrets.'
      },
      {
        keywords: ['kyverno', 'opa', 'policy', 'admission', 'pod'],
        question: 'How do you roll out strict admission policies to a shared cluster without breaking every team on day one?',
        answer: 'Deploy policies in Audit mode first for 2 to 4 weeks, surface PolicyReport violations in developer PRs and dashboards, fix existing workloads with owners, and switch to Enforce mode incrementally by namespace or only on newly created workloads.'
      },
      {
        keywords: ['trivy', 'cve', 'vulnerability', 'scan', 'grype'],
        question: 'Your container scanner reports 400 CVEs on a service. How do you avoid alert fatigue while staying secure?',
        answer: 'Gate CI only on Critical and High CVEs that have a known fix and are reachable or exploit-verified (using VEX or EPSS scores). Move services to minimal distroless or Chainguard base images, which typically cuts noise by over 90%.'
      }
    ]
  },
  {
    slug: 'ai-infra-finops',
    name: 'AI Infra, MLOps & FinOps',
    shortName: 'AI Infra & FinOps',
    blurb: 'GPU scheduling on Kubernetes, LLM inference autoscaling, OpenCost/FinOps unit economics, and AIOps guardrails.',
    icon: 'ai-finops',
    accent: '#b45309',
    isNew2026: true,
    followUps: [
      {
        keywords: ['gpu', 'mig', 'dra', 'vllm', 'inference', 'nvidia'],
        question: 'Why does standard CPU/RAM HPA fail for LLM inference services?',
        answer: 'LLM inference bottlenecks on GPU KV-cache utilization, token queue depth, and time-to-first-token (TTFT) rather than CPU percentage. Scale on custom metrics exported by vLLM or Triton via KEDA, such as pending requests and KV-cache occupancy.'
      },
      {
        keywords: ['finops', 'cost', 'spot', 'karpenter', 'right-sizing'],
        question: 'How do you prevent engineers from ignoring cloud cost recommendations?',
        answer: 'Tie costs to unit economics (cost per 1,000 requests or per tenant) using namespace/label showback via OpenCost, surface PR-level cost diffs with Infracost in CI, and automate non-disruptive savings like Karpenter consolidation and dev-environment sleep schedules.'
      }
    ]
  }
];

export const QUESTIONS_2026: QuestionItem[] = [
  // =========================================================================
  // KUBERNETES (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-k8s-1',
    topicSlug: 'kubernetes',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Pod Lifecycle & Probes',
    question: 'What is the practical difference between startupProbe, readinessProbe, and livenessProbe, and why do legacy apps crash-loop without a startupProbe?',
    answer: 'A readinessProbe controls whether a Pod receives Service traffic without restarting it, while a livenessProbe restarts the container if it deadlocks. Slow-starting Java or ML apps often fail livenessProbe before booting, causing endless restarts. Adding a startupProbe disables liveness and readiness checks until the app finishes initializing, letting you keep tight liveness intervals once healthy.'
  },
  {
    id: 'q2026-k8s-2',
    topicSlug: 'kubernetes',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'Resource Requests & OOMKilled',
    question: 'A container restarts with exit code 137 (OOMKilled) even though the node has plenty of free RAM. Explain why and how you diagnose it.',
    answer: 'Exit code 137 means the Linux kernel OOM killer terminated the process because it exceeded the container cgroup memory limit, not necessarily the host RAM. Run kubectl describe pod to confirm Last State: Terminated (Reason: OOMKilled) and check resources.limits.memory. Inspect memory usage trends via kubectl top pod or Prometheus container_memory_working_set_bytes, then either fix a memory leak or raise limits to match real peak working set.'
  },
  {
    id: 'q2026-k8s-3',
    topicSlug: 'kubernetes',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Gateway API vs Ingress',
    question: 'In 2026 many teams are migrating from Ingress-NGINX to Kubernetes Gateway API. What concrete problems does Gateway API solve?',
    answer: 'Ingress forced controllers to rely on fragile vendor-specific annotations for traffic splitting, header matching, and gRPC routing. Gateway API separates responsibilities cleanly into role-oriented resources: GatewayClass for infrastructure providers, Gateway for platform teams managing listeners and TLS, and HTTPRoute/GRPCRoute for app developers. It natively supports weighted canary splits, cross-namespace ReferenceGrants, and portable L4/L7 routing without annotation sprawl.'
  },
  {
    id: 'q2026-k8s-4',
    topicSlug: 'kubernetes',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Native Sidecar Containers',
    question: 'A Kubernetes CronJob never completes because its logging or proxy sidecar keeps running after the main job finishes. How do native Sidecar Containers solve this?',
    answer: 'Before native sidecars, a regular container could not know when the main Job container exited, leaving Jobs stuck in Running forever. Kubernetes native sidecars (GA in 1.29+) are defined under initContainers with restartPolicy: Always. They start before main app containers, pass their own probes before the app boots, stay alive during execution, and are automatically terminated by kubelet once all main Job containers exit.'
  },
  {
    id: 'q2026-k8s-5',
    topicSlug: 'kubernetes',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'Graceful Shutdown Race',
    question: 'During rolling deployments, users intermittently see HTTP 502 Bad Gateway errors for 2 to 3 seconds even though readinessProbe is configured. Walk through the race condition and fix.',
    answer: 'When Kubernetes terminates a Pod, removing the Pod IP from EndpointSlices (and updating kube-proxy/ingress rules) happens asynchronously in parallel with sending SIGTERM to the container. If the app stops listening immediately on SIGTERM, in-flight requests still routed to that Pod hit connection refused and return 502. Add a preStop lifecycle hook like sleep 5 to keep accepting connections while endpoints propagate, handle SIGTERM gracefully to drain in-flight requests, and set terminationGracePeriodSeconds high enough for draining.'
  },
  {
    id: 'q2026-k8s-6',
    topicSlug: 'kubernetes',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Karpenter & KEDA Autoscaling',
    question: 'Why are teams replacing Cluster Autoscaler with Karpenter, and how does Karpenter pair with KEDA for bursty workloads?',
    answer: 'Cluster Autoscaler scales rigid pre-defined cloud Auto Scaling Groups (ASGs) and takes minutes to provision mismatched nodes. Karpenter watches unschedulable Pending pods directly and calls cloud EC2/VM APIs to launch right-sized, instance-diverse nodes in under a minute, plus continuously consolidates underutilized nodes to cut waste. Pairing KEDA (which scales Deployments from 0 to N on SQS, Kafka, or Prometheus lag) with Karpenter gives fast event-driven pod and compute elasticity.'
  },
  {
    id: 'q2026-k8s-7',
    topicSlug: 'kubernetes',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'PDBs & Node Drains',
    question: 'A Karpenter consolidation or cluster upgrade hangs indefinitely while draining a node. You suspect a PodDisruptionBudget. How do you diagnose and fix it safely?',
    answer: 'Run kubectl get pdb -A to find any PDB with ALLOWED DISRUPTIONS equal to 0—common causes are a single-replica Deployment with minAvailable: 1 or maxUnavailable: 0, or a PDB whose selector matches unhealthy pods. Never blindly force-delete production pods without confirming redundancy. Fix the root cause by scaling critical workloads to at least 2 replicas with TopologySpreadConstraints, setting sensible PDBs (e.g., maxUnavailable: 1), and adding a Kyverno policy to block invalid PDBs in CI.'
  },
  {
    id: 'q2026-k8s-8',
    topicSlug: 'kubernetes',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'etcd Latency & Compaction',
    question: 'API server requests intermittently time out with etcdserver: mvcc: database space exceeded. What happened and how do you recover without losing cluster state?',
    answer: 'etcd hit its default 2GB–8GB storage quota because revision history grew faster than auto-compaction or a chatty controller flooded events/secrets, switching etcd into read-only alarm mode. Check status with etcdctl endpoint status --write-out=table and etcdctl alarm list. Compact to the current revision with etcdctl compact <rev>, defragment each member sequentially with etcdctl defrag (never all at once to avoid quorum loss), then disarm with etcdctl alarm disarm and investigate the noisy controller.'
  },
  {
    id: 'q2026-k8s-9',
    topicSlug: 'kubernetes',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Zero-Downtime Fleet Upgrades',
    question: 'How would you design a safe, zero-downtime Kubernetes minor-version upgrade strategy across 40 multi-tenant production clusters?',
    answer: 'Treat clusters as replaceable or ring-deployed infrastructure: first scan manifests with Pluto or kubent in CI to catch deprecated APIs before any upgrade. Organize clusters into progressive rings (sandbox -> staging -> canary prod -> regional prod waves) managed via GitOps. For high-risk upgrades or CNI changes, prefer blue-green cluster migration using weighted DNS/Gateway failover rather than in-place mutation; for in-place upgrades, snapshot etcd, upgrade control plane first, rotate node pools via Karpenter drift with PDB enforcement, and automate synthetic SLO gates between waves.'
  },
  {
    id: 'q2026-k8s-10',
    topicSlug: 'kubernetes',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Multi-Tenancy Isolation',
    question: 'A security team asks whether namespaces alone are sufficient to isolate untrusted customer workloads in Kubernetes. What architecture do you recommend?',
    answer: 'Namespaces provide logical RBAC and quota grouping, not a hard kernel security boundary—container escapes still share the host Linux kernel. For soft multi-tenancy (internal teams), combine namespaces, Pod Security Standards (Restricted), Cilium L3/L7 NetworkPolicies, ResourceQuotas, and dedicated node pools via taints. For hard multi-tenancy (untrusted code or regulated customers), use separate clusters per tenant (e.g., vCluster or hosted control planes) or sandboxed runtimes like gVisor or Kata Containers via RuntimeClass.'
  },

  // =========================================================================
  // DOCKER & CONTAINERS (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-dkr-1',
    topicSlug: 'docker',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Multi-Stage Builds & Caching',
    question: 'A Node.js or Go Docker build takes 7 minutes on every tiny code edit and produces a 1.1 GB image. How do you optimize both build speed and image size?',
    answer: 'Order Dockerfile layers from least frequently changed to most frequently changed: copy package.json and lockfile first, run npm ci or go mod download, and only copy application source code afterward so dependency layers stay cached. Use a multi-stage build where the builder stage compiles artifacts and the final stage copies only the compiled binary or production bundle onto a minimal distroless or Alpine base, paired with a clean .dockerignore excluding .git and node_modules.'
  },
  {
    id: 'q2026-dkr-2',
    topicSlug: 'docker',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Non-Root Security',
    question: 'Why is running a container as root (UID 0) dangerous, and how do you enforce non-root execution in a Dockerfile and Kubernetes?',
    answer: 'If an attacker exploits a kernel vulnerability and escapes a container running as UID 0, they may gain root privileges on the host node or write to mounted volumes. Create a dedicated non-root user in the Dockerfile (USER 10001:10001), bind the app to an unprivileged port above 1024 (like 8080), and enforce runAsNonRoot: true, allowPrivilegeEscalation: false, and readOnlyRootFilesystem: true in the Kubernetes securityContext.'
  },
  {
    id: 'q2026-dkr-3',
    topicSlug: 'docker',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Distroless & Chainguard Images',
    question: 'Why are teams replacing Ubuntu/Debian and even Alpine base images with Distroless or Wolfi/Chainguard images, and how do you debug a container with no shell?',
    answer: 'Distroless and Wolfi-based images strip out shells, package managers, and unused libraries, shrinking attack surface and eliminating 90%+ of OS CVE noise while avoiding Alpine musl-libc DNS/glibc edge bugs. Because you cannot docker exec /bin/sh into them, debug in Kubernetes using kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container> which attaches an ephemeral debug container sharing the process namespace.'
  },
  {
    id: 'q2026-dkr-4',
    topicSlug: 'docker',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'BuildKit Secrets & Multi-Arch',
    question: 'A developer passed an NPM_TOKEN via Docker ARG and ran npm install, and now security scanners flagged a leaked secret in the image history. How do you fix this properly with BuildKit?',
    answer: 'Never use ARG or ENV for credentials because they persist in image layers and docker history. Use BuildKit secret mounts instead: RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install, passing --secret id=npmrc,src=.npmrc during docker buildx build. The secret is mounted only in memory for that RUN instruction and never written to any layer; you can also add --mount=type=cache to speed up dependency builds across amd64 and arm64 (Graviton).'
  },
  {
    id: 'q2026-dkr-5',
    topicSlug: 'docker',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Container Runtimes & OCI Internals',
    question: 'Explain the exact execution chain when Kubernetes schedules a Pod today without Docker Engine: kubelet -> CRI -> containerd -> shim -> runc.',
    answer: 'kubelet calls the Container Runtime Interface (CRI) gRPC API on containerd to pull the OCI image and start a pod sandbox. containerd unpacks image layers into an OverlayFS snapshot and launches a lightweight containerd-shim-runc-v2 process per pod so containers keep running even if containerd restarts. The shim invokes runc, which creates Linux namespaces (PID, NET, MNT, UTS, IPC), applies cgroup v2 limits, pivots root, execs the container entrypoint, and exits.'
  },
  {
    id: 'q2026-dkr-6',
    topicSlug: 'docker',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'OCI Supply Chain & Lazy Pulling',
    question: 'Your AI/ML services use 12 GB container images that take 4 minutes to pull during autoscaling spikes. How would you architect fast image startup at scale?',
    answer: 'First separate immutable model weights from the container image—mount weights from high-throughput object storage/FSx or baked node NVMe caches instead of baking gigabytes into Docker layers. Second, optimize remaining image pulls using eStargz or AWS SOCI (Seekable OCI) lazy-pulling indexes so containerd starts the container immediately and streams only accessed chunks on demand, backed by regional pull-through registry mirrors or peer-to-peer Dragonfly/Spegel caches inside the cluster.'
  },

  // =========================================================================
  // CI/CD (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-cicd-1',
    topicSlug: 'ci-cd',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'CI Fundamentals & Pinning',
    question: 'What are the essential stages of a production CI pipeline for a microservice, and why should you pin third-party GitHub Actions to full commit SHAs?',
    answer: 'A solid CI pipeline runs fast feedback first: lint and format checks, unit tests, SAST/secret scanning, immutable container build tagged with the Git SHA (never latest), container vulnerability scan (Trivy), and push to a registry. Pinning third-party Actions to full 40-character commit SHAs instead of mutable tags like @v4 prevents supply-chain compromises where an attacker hijacks an upstream tag and exfiltrates your CI secrets.'
  },
  {
    id: 'q2026-cicd-2',
    topicSlug: 'ci-cd',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Keyless OIDC Cloud Auth',
    question: 'Your team stores long-lived AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in GitHub Actions secrets. How do you eliminate static cloud credentials in CI?',
    answer: 'Configure OpenID Connect (OIDC) federation between GitHub Actions and AWS IAM. Create an IAM OIDC Identity Provider for token.actions.githubusercontent.com and an IAM Role whose trust policy restricts sub claims to a specific repo and branch/environment (e.g., repo:org/app:environment:prod). In the workflow, grant id-token: write and use aws-actions/configure-aws-credentials with role-to-assume so every job receives short-lived STS tokens automatically.'
  },
  {
    id: 'q2026-cicd-3',
    topicSlug: 'ci-cd',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Progressive Delivery & Argo Rollouts',
    question: 'How does automated Canary deployment with Argo Rollouts work end-to-end, including automatic rollback on regressions?',
    answer: 'Instead of a standard Deployment, define an Argo Rollout that shifts traffic in steps (for example 5% -> 25% -> 50% -> 100%) using Gateway API, Istio, or AWS ALB traffic weights. At each pause step, Argo Rollouts executes an AnalysisTemplate that queries Prometheus or Datadog for error rate and p99 latency comparing canary vs stable pods. If any metric breaches its threshold, Argo automatically aborts the rollout and shifts 100% traffic back to the stable ReplicaSet within seconds.'
  },
  {
    id: 'q2026-cicd-4',
    topicSlug: 'ci-cd',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Ephemeral Runners & Build Performance',
    question: 'Self-hosted CI runners in your company suffer from state pollution across jobs, slow queues, and security concerns. How do you redesign CI runner infrastructure?',
    answer: 'Deploy ephemeral, single-use runners on Kubernetes using Actions Runner Controller (ARC) or GitLab Kubernetes Executor backed by Karpenter Spot/On-Demand nodes. Each job spins up an isolated pod that is destroyed immediately on completion—eliminating leftover credentials or disk bloat. Preserve fast builds by using remote BuildKit caches (registry/S3 cache backends) and shared read-through dependency proxies, and enforce network policies restricting runner egress.'
  },
  {
    id: 'q2026-cicd-5',
    topicSlug: 'ci-cd',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'SLSA Level 3 & Artifact Promotion',
    question: 'Explain the "build once, promote everywhere" pattern and how you enforce SLSA Level 3 provenance from commit to production Kubernetes clusters.',
    answer: 'Build the container image once on merge to main, reference it everywhere by immutable sha256 digest (not mutable tags), and promote the exact digest across dev, staging, and prod via GitOps PRs while injecting environment config separately. Generate signed SLSA provenance and SBOMs on isolated, ephemeral hosted/ephemeral CI runners using Sigstore Cosign OIDC, and enforce a Kyverno ClusterPolicy in production clusters that rejects any Pod whose image digest lacks a valid provenance attestation.'
  },

  // =========================================================================
  // TERRAFORM & IAC (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-tf-1',
    topicSlug: 'terraform',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Remote State & Locking',
    question: 'Two engineers ran terraform apply from their laptops against the same AWS account and corrupted infrastructure. How do you set up safe team state management?',
    answer: 'Move state out of local files into an encrypted, versioned remote backend such as S3 (with native S3 lockfile use_lockfile = true in modern Terraform/OpenTofu, or DynamoDB locking). Run plans and applies exclusively from CI/CD (like GitHub Actions or Atlantis/Spacelift) on pull requests so every change is peer-reviewed, locked against concurrent runs, and auditable.'
  },
  {
    id: 'q2026-tf-2',
    topicSlug: 'terraform',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Safe Refactoring with moved/import',
    question: 'You want to rename a Terraform resource and move an existing RDS database into a reusable module without destroying or recreating the live database. How do you do this cleanly?',
    answer: 'Use declarative moved blocks (moved { from = aws_db_instance.main to = module.db.aws_db_instance.this }) in code instead of manual terraform state mv CLI commands. When terraform plan runs, it validates that the existing state object maps directly to the new module address with zero destroy/create actions. Similarly, use declarative import blocks for bringing manually created cloud resources under IaC and removed blocks with lifecycle { destroy = false } to safely drop resources from state without deleting them.'
  },
  {
    id: 'q2026-tf-3',
    topicSlug: 'terraform',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'OpenTofu State Encryption & Ephemeral Secrets',
    question: 'One of Terraform\'s biggest historical weaknesses is storing plaintext database passwords inside terraform.tfstate. How do modern Terraform and OpenTofu solve this in 2026?',
    answer: 'Modern Terraform introduced ephemeral resources and write-only attributes (e.g., password_wo + password_wo_version) so secrets fetched from AWS Secrets Manager or Vault are used during API calls and completely omitted from plan and state files. OpenTofu additionally provides native client-side state and plan encryption using KMS or PBKDF2 keys directly in the backend config, ensuring even someone with S3 bucket read access cannot inspect state secrets.'
  },
  {
    id: 'q2026-tf-4',
    topicSlug: 'terraform',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Blast Radius & State Decomposition',
    question: 'Your organization has a single monolithic Terraform state with 1,800 resources taking 25 minutes to plan and locking every team. How do you decompose it safely?',
    answer: 'Split state along blast-radius, ownership, and lifecycle boundaries: foundational networking/VPC (rarely changes), shared platform clusters (EKS/RDS), and per-service app infrastructure. Wire cross-stack dependencies via explicit SSM Parameter Store values or read-only remote state outputs, orchestrate dependency graphs with Terragrunt or Terraform Stacks, and migrate resources piece-by-piece using removed + import blocks verified by zero-diff plans.'
  },
  {
    id: 'q2026-tf-5',
    topicSlug: 'terraform',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Terraform vs Crossplane & Drift Control',
    question: 'As a Staff DevOps Engineer, when would you choose Terraform/OpenTofu versus Crossplane for cloud infrastructure, and how do you handle continuous drift detection?',
    answer: 'Use Terraform or OpenTofu for foundational layers (AWS accounts, VPCs, IAM boundaries, bootstrap EKS clusters) where explicit plan/approve workflows and human blast-radius review shine. Use Crossplane when building self-service developer APIs inside Kubernetes (e.g., an app team requests a PostgreSQL claim and Crossplane continuously reconciles RDS + IAM + ExternalSecret). For Terraform layers, run scheduled daily read-only drift-detection plans in CI that open Slack/GitHub alerts rather than blind auto-applies.'
  },

  // =========================================================================
  // AWS & CLOUD (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-aws-1',
    topicSlug: 'aws',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'VPC Endpoints & NAT Cost',
    question: 'An application on private EC2/EKS subnets transfers 40 TB/month to S3 and DynamoDB, causing a huge NAT Gateway data processing bill. How do you fix this with zero app code changes?',
    answer: 'Create VPC Gateway Endpoints for S3 and DynamoDB and attach them to the private subnet route tables. Gateway Endpoints are completely free, route traffic privately over the AWS backbone without traversing the NAT Gateway, and eliminate both the $0.045/GB NAT processing charge and unnecessary public internet hops. For services like ECR, Secrets Manager, or SQS, evaluate Interface Endpoints (PrivateLink) when monthly NAT volume exceeds the hourly endpoint cost.'
  },
  {
    id: 'q2026-aws-2',
    topicSlug: 'aws',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'EKS Pod Identity vs IRSA',
    question: 'AWS introduced EKS Pod Identity alongside IRSA (IAM Roles for Service Accounts). What makes EKS Pod Identity simpler to operate across dozens of clusters?',
    answer: 'IRSA required creating a per-cluster OIDC provider and duplicating cluster-specific OIDC URLs inside every IAM Role trust policy, which became painful across multi-cluster fleets. EKS Pod Identity uses a unified trust principal (pods.eks.amazonaws.com) and maps ServiceAccounts to IAM Roles via a native EKS association API, letting one IAM Role be reused cleanly across clusters with built-in session tags for ABAC.'
  },
  {
    id: 'q2026-aws-3',
    topicSlug: 'aws',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Graviton ARM64 & Spot Resilience',
    question: 'Leadership asks you to cut AWS compute spend by 35% on EKS without sacrificing uptime. Walk through your technical execution plan.',
    answer: 'First build multi-arch (amd64 + arm64) container images in CI and shift stateless workloads to AWS Graviton4 instances via Karpenter NodePools, delivering roughly 20–30% better price-performance. Second, run fault-tolerant stateless pods across diverse Spot instance families (c7g, m7g, r7g across 3 AZs) with Karpenter native SQS interruption handling (2-minute graceful drain) while keeping a small On-Demand/Savings Plan baseline for critical control services and stateful workloads.'
  },
  {
    id: 'q2026-aws-4',
    topicSlug: 'aws',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Multi-Account Landing Zone & Guardrails',
    question: 'How do you design an enterprise AWS multi-account architecture to isolate blast radius and prevent accidental public S3 buckets or root credential misuse?',
    answer: 'Organize accounts under AWS Organizations into OUs (Security, Shared Services, Infrastructure, Workloads/Dev, Workloads/Prod) managed with Control Tower or Terraform. Enforce preventive guardrails via Service Control Policies (SCPs)—such as denying root user actions, restricting approved regions, blocking disabling CloudTrail/GuardDuty, and enforcing IMDSv2. Pair SCPs with AWS IAM Identity Center (SSO) for temporary human access and centralized Security Hub + CloudTrail aggregation into a locked Log Archive account.'
  },
  {
    id: 'q2026-aws-5',
    topicSlug: 'aws',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Multi-Region Active-Active & Cell Architecture',
    question: 'How would you architect a Tier-0 API on AWS to survive a full regional outage with RTO under 2 minutes and near-zero RPO without falling into distributed database split-brain?',
    answer: 'Adopt a cell-based multi-region architecture using Route 53 Application Recovery Controller (ARC) routing controls—not slow DNS health-check convergence alone—to drain traffic away from an unhealthy region cleanly. Keep compute stateless across active-active regions (EKS + Global Accelerator/CloudFront) and use Aurora Global Database or DynamoDB Global Tables depending on consistency needs, with explicit write-region fencing and automated chaos failover drills every quarter to verify the standby region can absorb 100% peak load.'
  },

  // =========================================================================
  // LINUX & OS INTERNALS (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-lnx-1',
    topicSlug: 'linux',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'Inodes & Deleted Open Files',
    question: 'An app fails with "No space left on device", yet df -h shows only 42% disk usage. What are the two classic Linux causes and how do you fix them?',
    answer: 'Cause 1 is inode exhaustion from millions of tiny files (like temp/cache files)—verify with df -i and clean up the offending directory. Cause 2 is deleted files still held open by a running process (their disk blocks are not freed until the file descriptor closes)—verify with lsof +L1 or lsof | grep deleted, then reload or restart that service gracefully (or truncate via : > /proc/<pid>/fd/<fd> in an emergency).'
  },
  {
    id: 'q2026-lnx-2',
    topicSlug: 'linux',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'systemd Sandboxing & OOM Score',
    question: 'A critical agent managed by systemd crashes repeatedly under memory pressure or hangs silently. How do you harden its systemd unit file?',
    answer: 'Configure Restart=on-failure with RestartSec=5 and StartLimitBurst to prevent tight crash loops, set MemoryHigh and MemoryMax for cgroup bounds, and adjust OOMScoreAdjust=-500 if it is a critical node daemon. Apply security hardening directives like DynamicUser=yes, ProtectSystem=strict, NoNewPrivileges=true, and inspect structured logs with journalctl -u <service> --since "10 min ago".'
  },
  {
    id: 'q2026-lnx-3',
    topicSlug: 'linux',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'cgroups v2 & PSI (Pressure Stall Info)',
    question: 'Why did Kubernetes and modern Linux distributions migrate to cgroups v2, and how does PSI (Pressure Stall Information) help diagnose performance degradation earlier?',
    answer: 'cgroups v2 provides a unified single hierarchy, proper memory accounting including page cache and writeback I/O, and rootless container support without cgroup v1 race bugs. PSI (/proc/pressure/cpu, memory, io) exposes the exact percentage of time tasks are stalled waiting on CPU, memory reclaim, or disk I/O—catching latency degradation from thrashing long before a hard OOMKill or 100% CPU saturation occurs.'
  },
  {
    id: 'q2026-lnx-4',
    topicSlug: 'linux',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'eBPF Observability & Kernel Profiling',
    question: 'A production Linux server has intermittent 300ms tail-latency spikes that never show up in standard top or application logs. How do you investigate using eBPF tools?',
    answer: 'Use BCC or bpftrace tools safely in production with negligible overhead: run runqlat to measure CPU scheduler run-queue latency (spotting noisy neighbors or CFS throttling), biolatency or ext4slower to catch storage I/O stalls, and tcpretrans / tcpconnect to catch network drops or slow handshakes. For continuous flame graphs across kernel and user space, deploy an eBPF profiler like Pyroscope or Parca.'
  },
  {
    id: 'q2026-lnx-5',
    topicSlug: 'linux',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'High-Concurrency Kernel Tuning',
    question: 'An API gateway node handling 80,000 concurrent connections begins dropping SYN packets and throwing "Cannot assign requested address" on outbound calls. What Linux kernel parameters do you inspect and tune?',
    answer: 'Check netstat -s / nstat for listen queue overflows (ListenOverflows, ListenDrops) and ss -s for socket state counts. Raise net.core.somaxconn and net.ipv4.tcp_max_syn_backlog alongside the app listen backlog and ulimit -n (nofile). For "Cannot assign requested address" (ephemeral port exhaustion in TIME_WAIT), enable HTTP keep-alive connection pooling upstream, expand net.ipv4.ip_local_port_range (e.g., 10240 65535), enable net.ipv4.tcp_tw_reuse=1, and increase nf_conntrack_max if conntrack is active.'
  },

  // =========================================================================
  // NETWORKING & SERVICE MESH (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-net-1',
    topicSlug: 'networking',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'DNS, TLS & HTTP Diagnostics',
    question: 'Users report an HTTPS endpoint is down. Walk through your exact command-line triage from DNS resolution to TLS handshake to HTTP status.',
    answer: 'Start at Layer 3/DNS with dig +short api.example.com to verify DNS resolution and TTLs. Check TCP reachability with nc -zv api.example.com 443. Inspect the TLS certificate chain, expiry, and SNI using openssl s_client -connect api.example.com:443 -servername api.example.com. Finally run curl -svo /dev/null -w "dns:%{time_namelookup} tcp:%{time_connect} tls:%{time_appconnect} ttfb:%{time_starttransfer} code:%{http_code}\\n" https://api.example.com to pinpoint which stage is slow or failing.'
  },
  {
    id: 'q2026-net-2',
    topicSlug: 'networking',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'CoreDNS ndots:5 Storm',
    question: 'High-traffic Kubernetes pods making external API calls suddenly experience 5-second DNS timeouts and CoreDNS CPU spikes to 100%. Explain the ndots:5 problem and how you fix it.',
    answer: 'By default, Kubernetes injects ndots:5 in /etc/resolv.conf, so any hostname with fewer than 5 dots (like api.stripe.com) is queried sequentially against every cluster search domain first (svc.cluster.local, cluster.local, etc.)—multiplying DNS traffic by 4–8x for both A and AAAA records and saturating conntrack UDP entries. Deploy NodeLocal DNSCache on nodes, use trailing dots or custom dnsConfig with ndots:2 for external-heavy workloads, and verify CoreDNS autoscaling.'
  },
  {
    id: 'q2026-net-3',
    topicSlug: 'networking',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Cilium eBPF & Kube-Proxy Replacement',
    question: 'Why are production Kubernetes clusters in 2026 moving to Cilium in kube-proxy-free mode instead of legacy iptables kube-proxy?',
    answer: 'iptables evaluates rules linearly O(N), so clusters with thousands of Services suffer CPU overhead, packet latency, and slow full-table reloads on churn. Cilium uses eBPF hash maps in the Linux kernel for O(1) service load balancing directly at the socket/TC layer, supports Direct Server Return (DSR), enforces L3/L4/L7 identity-based NetworkPolicies, and provides Hubble for real-time flow observability without injecting sidecars.'
  },
  {
    id: 'q2026-net-4',
    topicSlug: 'networking',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Istio Ambient Mesh vs Sidecars',
    question: 'Compare Sidecar Service Mesh (traditional Istio/Linkerd) with Sidecarless Ambient Mesh (Istio Ambient / Cilium mTLS). What trade-offs matter in production?',
    answer: 'Traditional sidecars inject an Envoy proxy into every Pod, adding memory overhead per pod, startup/shutdown ordering races, and restart disruption during mesh upgrades. Istio Ambient splits L4 mTLS into a lightweight node-level ztunnel daemon and moves optional L7 routing/telemetry to shared per-namespace Waypoint proxies—cutting RAM overhead dramatically and allowing mesh upgrades without restarting app pods, at the trade-off of slightly shared L7 blast radius if waypoints are not scoped carefully.'
  },
  {
    id: 'q2026-net-5',
    topicSlug: 'networking',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Zero-Trust Workload Identity (SPIFFE/SPIRE)',
    question: 'How do you enforce Zero-Trust service-to-service authentication across hybrid EKS clusters and bare-metal VMs without relying on static IP allowlists or long-lived API keys?',
    answer: 'Adopt SPIFFE/SPIRE to issue short-lived cryptographic workload identities (X.509 SVIDs or JWTs) attested against platform metadata (Kubernetes ServiceAccount + AWS instance identity documents). Workloads establish automatic mutual TLS (mTLS) where authorization policies verify the SPIFFE ID (spiffe://prod.corp/ns/payments/sa/checkout) rather than mutable pod IPs, rotating certificates automatically every hour with zero human secret handling.'
  },

  // =========================================================================
  // OBSERVABILITY & MONITORING (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-obs-1',
    topicSlug: 'monitoring',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'RED & USE Methods',
    question: 'What is the difference between the RED method and the USE method in monitoring, and when do you use each?',
    answer: 'Use the RED method (Rate, Errors, Duration/latency) for request-driven microservices and APIs because it measures what users actually experience. Use the USE method (Utilization, Saturation, Errors) for infrastructure resources like CPU, RAM, disks, and network queues to find hardware bottlenecks. Combine both on dashboards so you notice user-facing latency via RED and immediately isolate the underlying node saturation via USE.'
  },
  {
    id: 'q2026-obs-2',
    topicSlug: 'monitoring',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'OpenTelemetry Collector Architecture',
    question: 'Why is OpenTelemetry (OTel) the industry standard in 2026, and why should apps send telemetry to an OTel Collector instead of directly to Datadog or Grafana Cloud?',
    answer: 'OpenTelemetry standardizes metrics, logs, and traces under one vendor-neutral SDK and OTLP protocol so you avoid vendor lock-in. Routing telemetry through an OTel Collector decouples apps from backend outages via buffering/retries, handles batching and PII redaction centrally, enriches Kubernetes pod metadata automatically, and lets you swap or dual-ship observability backends without touching a single line of application code.'
  },
  {
    id: 'q2026-obs-3',
    topicSlug: 'monitoring',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'High-Cardinality Metric Explosion',
    question: 'Your Prometheus / Mimir storage bill tripled overnight and queries are timing out after a microservice deploy. You suspect high cardinality. How do you pinpoint and stop it?',
    answer: 'Inspect Prometheus TSDB status (/tsdb-status) or query topk(10, count by (__name__)({__name__!=""})) to find the exploding metric and offending label—almost always an unbounded value like user_id, request_id, or raw URL path with UUIDs placed in a Prometheus label. Drop the bad label immediately using metric_relabel_configs in Prometheus or an OTel transform processor as emergency mitigation, normalize HTTP route templates (e.g., /orders/:id), and enforce cardinality limits per tenant.'
  },
  {
    id: 'q2026-obs-4',
    topicSlug: 'monitoring',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Multi-Window Multi-Burn-Rate SLO Alerts',
    question: 'Why are static threshold alerts like "error rate > 1% for 5 minutes" considered noisy, and how do multi-window multi-burn-rate SLO alerts improve on-call quality?',
    answer: 'Static alerts either page on brief harmless blips or miss slow-burning outages that quietly drain your monthly error budget. Multi-window multi-burn-rate alerts tie paging directly to your SLO (e.g., 99.9% over 30 days): page immediately only if both a short window (5m) and longer window (1h) show a 14.4x burn rate (which would consume 2% of monthly budget in 1 hour), while sending low-priority tickets for slow 3x burns over 6h/30m—dramatically cutting alert fatigue while protecting SLOs.'
  },
  {
    id: 'q2026-obs-5',
    topicSlug: 'monitoring',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Tail-Based Sampling & Continuous Profiling',
    question: 'Your distributed tracing bill is unsustainable at 100% sampling, but 1% head-based sampling misses rare p99 errors. How do you architect cost-effective observability across 200 microservices?',
    answer: 'Deploy a two-tier OpenTelemetry Collector gateway using a loadbalancing exporter keyed by traceID so all spans of a trace land on the same gateway Collector instance. Apply tail-based sampling policies to retain 100% of error traces and traces exceeding p99 latency thresholds while sampling only 1–2% of healthy fast traces. Complement traces with Grafana LGTM+P (Loki structured logs with trace_id correlation + Pyroscope continuous eBPF profiling) so engineers jump directly from a slow span to exact offending CPU lines.'
  },

  // =========================================================================
  // INCIDENT RESPONSE & SRE (1 Yr -> 5+ Yrs, 2026 Trends)
  // =========================================================================
  {
    id: 'q2026-inc-1',
    topicSlug: 'incident-response',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'First 10 Minutes of a Sev-1',
    question: 'You are on call for the first time and a Sev-1 alert fires for checkout failures. What are your priorities in the first 10 minutes?',
    answer: 'Prioritize mitigation over deep root-cause debugging: acknowledge the page, verify user impact on dashboards, and declare an incident channel with a clear Incident Commander and Communications lead. Check the three most likely triggers immediately—recent deploys, feature flag flips, and upstream dependency status. If a recent release correlates with the spike, roll back or disable the feature flag first to restore service, then preserve logs/metrics for root-cause analysis afterward.'
  },
  {
    id: 'q2026-inc-2',
    topicSlug: 'incident-response',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Blameless Postmortems',
    question: 'A junior engineer accidentally deleted a staging database because a CLI command defaulted to the wrong context. How do you run a blameless postmortem so this never hits production?',
    answer: 'Focus the postmortem strictly on systemic gaps rather than blaming human error—if a single typo can wipe a database, the system is unsafe by design. Document the exact timeline, root contributing factors, and assign concrete, time-bound engineering action items: remove direct manual write access in favor of GitOps/Terraform, require interactive confirmation prompts on destructive scripts, enforce deletion protection on RDS, and test automated backups regularly.'
  },
  {
    id: 'q2026-inc-3',
    topicSlug: 'incident-response',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'Retry Storms & Cascading Failures',
    question: 'A downstream database hiccup lasted only 20 seconds, yet the entire microservices fleet stayed down for 15 minutes afterward. Explain how a retry storm caused this and how you prevent it.',
    answer: 'When requests time out, multiple layers of microservices synchronously retrying immediately multiply traffic exponentially (3 retries across 3 hops equals 27x load), keeping the recovering database pinned at 100% CPU—a metastable failure. Prevent retry storms by setting bounded end-to-end deadlines, using exponential backoff with full jitter, enforcing per-client retry budgets (e.g., max 10% retry ratio in Envoy/Istio), and adding circuit breakers with graceful degradation.'
  },
  {
    id: 'q2026-inc-4',
    topicSlug: 'incident-response',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Chaos Engineering & Game Days',
    question: 'Your team wants to start Chaos Engineering, but leadership fears breaking production. How do you introduce fault injection safely and prove business value?',
    answer: 'Start with a clear steady-state hypothesis measured by real SLIs, and begin in staging with tightly scoped blast radius (single pod kill, AZ blackhole, or injected 200ms dependency latency using LitmusChaos, Chaos Mesh, or AWS FIS). Always configure automated abort conditions tied to error-rate alarms so experiments halt immediately if SLIs degrade. Run structured Game Days with on-call engineers to validate runbooks, alert routing, and failover RTO before graduating low-risk experiments to production.'
  },
  {
    id: 'q2026-inc-5',
    topicSlug: 'incident-response',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Error Budgets & Organizational Reliability',
    question: 'A product team burned 100% of their quarterly 99.9% SLO error budget due to buggy releases, but a VP insists on shipping a major marketing launch tomorrow. How do you handle this as a Staff SRE?',
    answer: 'An error budget policy only works when leadership has pre-agreed to it, not as a surprise veto. Bring objective data showing user impact and remaining reliability risk, then propose pragmatic risk-mitigated options rather than a rigid "no": ship behind a dark launch/canary flag to 1% of traffic with automated rollback, or explicitly document a VP-signed exception while allocating dedicated reliability sprints immediately after launch to fix the underlying release testing and observability gaps.'
  },

  // =========================================================================
  // NEW 2026 TOPIC 10: PLATFORM ENGINEERING & GITOPS (1 Yr -> 5+ Yrs)
  // =========================================================================
  {
    id: 'q2026-plat-1',
    topicSlug: 'platform-engineering',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Push vs Pull GitOps',
    question: 'What is GitOps, and why is pull-based deployment (Argo CD / Flux) preferred over push-based kubectl apply from CI pipelines?',
    answer: 'GitOps uses Git as the single source of truth for declarative infrastructure and application state, with an in-cluster controller continuously reconciling live state to match Git. Unlike push-based CI (which requires giving CI admin cluster credentials and cannot detect manual kubectl drift after a pipeline finishes), pull-based Argo CD or Flux keeps credentials inside the cluster, continuously detects and self-heals configuration drift, and provides instant auditable git-revert rollbacks.'
  },
  {
    id: 'q2026-plat-2',
    topicSlug: 'platform-engineering',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Helm vs Kustomize',
    question: 'When should a team use Helm versus Kustomize for managing Kubernetes manifests across dev, staging, and production?',
    answer: 'Use Helm when packaging reusable third-party charts or complex applications that need versioned releases, templating logic, and lifecycle hooks. Use Kustomize when managing your own internal microservice manifests cleanly via base + environment overlays (patches) without messy Go template syntax. In GitOps repos, a very common 2026 pattern is rendering upstream Helm charts cleanly inside Kustomize or Argo CD multi-source applications.'
  },
  {
    id: 'q2026-plat-3',
    topicSlug: 'platform-engineering',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'External Secrets Operator & cert-manager',
    question: 'A developer asks how their Kubernetes Deployment should securely get an RDS password and an automated TLS certificate in a GitOps workflow. Walk through the standard setup.',
    answer: 'Never commit base64 Kubernetes Secrets to Git. Store the RDS credential in AWS Secrets Manager or Vault, and deploy an ExternalSecret manifest managed by External Secrets Operator (ESO), which uses EKS Pod Identity to fetch and refresh the Kubernetes Secret automatically. For TLS, install cert-manager with a ClusterIssuer (Let\'s Encrypt ACME or private PKI) so Certificates are requested, mounted, and renewed automatically before expiry.'
  },
  {
    id: 'q2026-plat-4',
    topicSlug: 'platform-engineering',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'Argo CD OutOfSync Loops',
    question: 'An Argo CD Application stays permanently OutOfSync even right after syncing, triggering noisy alerts. What are the most common causes and fixes?',
    answer: 'Usually another controller mutates fields that Git also declares—for example, an HPA or KEDA changing spec.replicas while Deployment YAML hardcodes replicas: 2, or a mutating webhook injecting default fields/annotations. Remove spec.replicas from the Git manifest when using HPA, or configure ignoreDifferences (and RespectIgnoreDifferences=true) in the Argo CD Application spec so Argo ignores controller-owned runtime fields.'
  },
  {
    id: 'q2026-plat-5',
    topicSlug: 'platform-engineering',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Internal Developer Platform & Golden Paths',
    question: 'What is an Internal Developer Platform (IDP), and how does a "Golden Path" differ from locking developers into a rigid cage?',
    answer: 'An IDP is a self-service product built by a platform team that combines paved workflows (Backstage templates, CI/CD, GitOps, observability, security guardrails) so product engineers can ship a production-ready service in minutes without filing Jira tickets. A Golden Path is the well-supported, opinionated default that solves 85% of use cases effortlessly, while still providing documented escape hatches for specialized workloads—making the secure, compliant path the easiest path.'
  },
  {
    id: 'q2026-plat-6',
    topicSlug: 'platform-engineering',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Argo CD ApplicationSets & Multi-Cluster',
    question: 'Managing 120 microservices across 6 clusters with individual Argo CD Application YAMLs has become unmaintainable. How do you scale GitOps cleanly?',
    answer: 'Replace manual Application manifests with Argo CD ApplicationSets using Git directory/file generators or Cluster generators paired with cluster labels (env=prod, region=us-east-1). Combine this with Progressive Syncs (rollingSync) so changes roll out to dev -> staging -> canary-prod -> remaining prod clusters automatically, and keep the repo structure clean using environment branches or explicit folder promotion rather than fragile branch merges.'
  },
  {
    id: 'q2026-plat-7',
    topicSlug: 'platform-engineering',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Crossplane XRDs & Control Planes',
    question: 'Explain how Crossplane turns Kubernetes into a universal cloud control plane using Managed Resources, Compositions, and Composite Resource Definitions (XRDs).',
    answer: 'Crossplane providers expose low-level cloud primitives as Kubernetes Managed Resources (like an AWS RDSInstance, SecurityGroup, and KMS Key). Platform engineers author an XRD defining a simple developer-facing API schema (for example, AppDatabase with size: small|medium and ha: true) and a Composition that maps that schema into compliant underlying cloud resources. Developers commit one 15-line Claim in GitOps and Crossplane continuously provisions and drift-corrects the entire cloud stack.'
  },
  {
    id: 'q2026-plat-8',
    topicSlug: 'platform-engineering',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Backstage Software Templates & Catalog Governance',
    question: 'Your company installed Backstage six months ago, but developers stopped using it because catalog data went stale and templates broke. How do you revive and govern an IDP?',
    answer: 'Treat the IDP as an internal product with developer interviews and ownership: auto-discover and validate catalog-info.yaml via CI checks instead of manual registration, keep software templates modular and tested in nightly CI pipelines, and focus first on the top 2 highest-friction pain points (like ephemeral PR preview environments or self-service DB provisioning) rather than dumping 30 unused plugins into Backstage.'
  },
  {
    id: 'q2026-plat-9',
    topicSlug: 'platform-engineering',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Ephemeral Preview Environments at Scale',
    question: 'How would you architect on-demand ephemeral preview environments for every Pull Request across 40 microservices without exploding AWS/Kubernetes costs?',
    answer: 'Avoid spinning up a full copy of all 40 services per PR. Use a shared baseline staging cluster with request-level traffic routing (via Gateway API / Istio header routing or Mirrord/Signadot sandboxes) so a PR only deploys the 1 changed microservice and routes matching PR-header requests to it while sharing unchanged dependencies. For isolated full-stack previews, use Argo CD Pull Request generators with vCluster + Karpenter Spot nodes and automatic TTL teardown when the PR closes.'
  },
  {
    id: 'q2026-plat-10',
    topicSlug: 'platform-engineering',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Platform ROI & Organizational Topology',
    question: 'Executives question why the company funds a 6-person Platform Engineering team instead of embedding DevOps engineers in every product squad. How do you justify and structure the platform org?',
    answer: 'Use Team Topologies framing: embedded DevOps engineers in silos reinvent CI/CD, Terraform modules, and K8s security inconsistently—creating duplicated toil and compliance gaps. A dedicated Platform team builds reusable self-service capabilities ("X-as-a-Service") with clear product metrics: onboarding time for a new service dropping from 2 weeks to 15 minutes, 90% golden-path adoption, faster DORA lead time, and consistent SOC2/ISO security controls by default.'
  },

  // =========================================================================
  // NEW 2026 TOPIC 11: DEVSECOPS & SUPPLY CHAIN (1 Yr -> 5+ Yrs)
  // =========================================================================
  {
    id: 'q2026-sec-1',
    topicSlug: 'devsecops',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Secrets Scanning & Leak Response',
    question: 'A developer accidentally pushed an AWS secret key to a public or internal Git repository 5 minutes ago. What are your immediate steps and long-term guardrails?',
    answer: 'Step 1 is assume the secret is already compromised—immediately revoke and rotate the credential in AWS IAM, then audit CloudTrail for unauthorized usage. Scrubbing Git history with git filter-repo alone is never sufficient once pushed. Long-term, enable GitHub Push Protection and pre-commit hooks with Gitleaks or TruffleHog, and eliminate static keys altogether via OIDC federation and IAM roles.'
  },
  {
    id: 'q2026-sec-2',
    topicSlug: 'devsecops',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'SAST, SCA, DAST & Container Scanning',
    question: 'Explain the difference between SAST, SCA, DAST, and container image scanning, and where each belongs in a CI/CD pipeline.',
    answer: 'SAST (e.g., Semgrep, SonarQube) analyzes your own source code for vulnerabilities like SQL injection on every PR. SCA (e.g., Dependabot, Snyk, Trivy fs) checks third-party open-source dependencies and lockfiles for known CVEs. Container scanning (Trivy/Grype) inspects OS packages and app layers right after docker build. DAST (e.g., OWASP ZAP) tests a running staging app from the outside for runtime misconfigurations and auth flaws—run asynchronously or nightly so it does not stall PR velocity.'
  },
  {
    id: 'q2026-sec-3',
    topicSlug: 'devsecops',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'IaC Security & Policy as Code',
    question: 'How do you prevent engineers from accidentally deploying public S3 buckets, 0.0.0.0/0 SSH security groups, or unencrypted RDS instances via Terraform?',
    answer: 'Layer preventive controls in three places: run Checkov, Trivy config, or tfsec directly on Pull Requests so developers get immediate line-level feedback before merge; enforce OPA/Conftest policies against the generated terraform plan JSON in CI; and maintain AWS SCPs and Config/Security Hub guardrails in the cloud account itself as a backstop against manual console changes.'
  },
  {
    id: 'q2026-sec-4',
    topicSlug: 'devsecops',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Kubernetes Pod Security & RBAC',
    question: 'A security audit flags that your Kubernetes pods run with default ServiceAccount tokens mounted and overly broad cluster-admin bindings. How do you harden cluster workloads?',
    answer: 'Enforce Kubernetes Pod Security Standards (Restricted profile) at the namespace level, set automountServiceAccountToken: false on pods that do not call the Kubernetes API, create dedicated least-privilege Roles/RoleBindings per namespace rather than ClusterRoleBindings, and audit RBAC permissions regularly using kubectl auth can-i --list or rbac-tool.'
  },
  {
    id: 'q2026-sec-5',
    topicSlug: 'devsecops',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Kyverno & OPA Gatekeeper Admission Control',
    question: 'How do Kubernetes admission controllers like Kyverno or OPA Gatekeeper work, and what are 4 must-have policies for a production cluster?',
    answer: 'Admission controllers intercept API server create/update requests via Validating or Mutating Admission Webhooks before objects persist to etcd. Four essential production policies: (1) disallow privileged containers and root UIDs, (2) require container images to come only from approved internal registries with immutable digests (no :latest), (3) require CPU/memory requests and limits, and (4) verify Cosign image signatures before scheduling.'
  },
  {
    id: 'q2026-sec-6',
    topicSlug: 'devsecops',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'HashiCorp Vault Dynamic Secrets',
    question: 'Why are HashiCorp Vault dynamic database secrets dramatically safer than static credentials stored in an encrypted secret store?',
    answer: 'With static secrets, all pods share one long-lived username and password that is painful to rotate and hard to attribute in audit logs. Vault dynamic secrets generate a unique, short-lived database user and password per pod lease (for example, 1-hour TTL), automatically renew while the pod is alive, and revoke the credential immediately when the lease expires or a suspected compromise occurs.'
  },
  {
    id: 'q2026-sec-7',
    topicSlug: 'devsecops',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'SBOM, Cosign & Admission Verification',
    question: 'A zero-day library vulnerability like Log4Shell or XZ Utils drops on Friday afternoon. How does an SBOM + Cosign supply-chain pipeline let you answer "are we impacted?" in 2 minutes?',
    answer: 'During CI builds, generate an SPDX or CycloneDX SBOM using Syft, attach it as an OCI artifact alongside the image, and sign both the image digest and SBOM attestation with Sigstore Cosign keyless OIDC. Index SBOMs centrally (e.g., Dependency-Track or registry metadata). When a zero-day hits, query the SBOM inventory across all deployed production digests to list every affected service immediately, while Kyverno blocks any unsigned or unpatched artifact from entering production.'
  },
  {
    id: 'q2026-sec-8',
    topicSlug: 'devsecops',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'Falco & Tetragon Runtime Security',
    question: 'An attacker exploits an application RCE bug inside a running container and tries to spawn /bin/sh, read /etc/shadow, or curl a crypto-miner. How do you detect and block this at runtime?',
    answer: 'Static image scanning cannot catch zero-day RCEs at runtime. Deploy an eBPF-based runtime security agent like Falco or Cilium Tetragon on every node to monitor kernel syscalls in real time. Alert (or actively kill the offending process with Tetragon TracingPolicy) on unexpected shell spawns inside distroless/app containers, sensitive file reads, unexpected outbound C2 connections, or privilege escalation—and route high-confidence alerts via Falcosidekick to PagerDuty and SIEM.'
  },
  {
    id: 'q2026-sec-9',
    topicSlug: 'devsecops',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Zero-Friction DevSecOps Governance',
    question: 'How do you design a DevSecOps program for 300 engineers that passes SOC2/PCI audits without turning security into a bottleneck that slows deployments?',
    answer: 'Embed security invisibly into the Golden Path: provide hardened, auto-rebuilt base images and Terraform modules that are compliant by default; automate evidence collection directly from GitOps commits, OIDC CI provenance, and admission audit logs instead of manual screenshots; gate builds strictly on high-signal exploitable issues (Critical/High fixable CVEs, leaked secrets) while tracking lower-severity debt with SLA dashboards; and run blameless security office hours.'
  },

  // =========================================================================
  // NEW 2026 TOPIC 12: AI INFRA, MLOPS & FINOPS (1 Yr -> 5+ Yrs)
  // =========================================================================
  {
    id: 'q2026-ai-1',
    topicSlug: 'ai-infra-finops',
    experienceYears: 1,
    difficulty: 'Beginner',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'FinOps Tagging & Quick Wins',
    question: 'Your manager asks you to find quick, low-risk AWS cloud cost savings this week without touching production architecture. Where do you look first?',
    answer: 'Run an immediate hygiene sweep for zero-risk waste: delete unattached EBS volumes and obsolete snapshots, release unused Elastic IPs, migrate gp2 volumes to cheaper/faster gp3, add S3 Intelligent-Tiering or lifecycle expiration policies on old logs/artifacts, schedule non-production dev/staging EC2/EKS clusters to scale down overnight and on weekends, and enforce mandatory Cost Allocation Tags (team, service, env) via Terraform.'
  },
  {
    id: 'q2026-ai-2',
    topicSlug: 'ai-infra-finops',
    experienceYears: 2,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'Kubernetes Cost Allocation & Right-Sizing',
    question: 'In a shared multi-tenant EKS cluster, finance asks which product team is driving 70% of the compute bill, and why cluster CPU utilization is only 18%. How do you investigate and fix it?',
    answer: 'Deploy OpenCost or Kubecost integrated with cloud billing CUR data to attribute pod CPU, memory, PV, and idle/unallocated overhead by namespace and team label. Low 18% actual utilization almost always means teams dramatically over-requested CPU/RAM in Deployments (allocating nodes based on requests, not usage). Use Vertical Pod Autoscaler (VPA) in recommendation mode (or Goldilocks) to right-size requests, and let Karpenter consolidation pack pods onto fewer, cheaper nodes.'
  },
  {
    id: 'q2026-ai-3',
    topicSlug: 'ai-infra-finops',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'Running GPU Workloads on Kubernetes',
    question: 'Your team is deploying its first self-hosted LLM/embedding service on Kubernetes with NVIDIA GPUs. What Kubernetes components and scheduling rules do you need?',
    answer: 'Install the NVIDIA GPU Operator (managing drivers, container toolkit, device plugin, and DCGM exporter for Prometheus GPU metrics). Isolate expensive GPU nodes using dedicated taints (nvidia.com/gpu=true:NoSchedule) and matching Pod tolerations + nodeAffinity so regular CPU pods never land on GPU nodes. Pre-cache large model weights on local NVMe/FSx or fast PVC snapshots so pod cold starts take seconds instead of downloading 40 GB from Hugging Face on every scale-out.'
  },
  {
    id: 'q2026-ai-4',
    topicSlug: 'ai-infra-finops',
    experienceYears: 3,
    difficulty: 'Intermediate',
    is2026Trend: true,
    kind: 'scenario',
    focusArea: 'AIOps & Safe LLM Automation',
    question: 'Leadership wants to plug an LLM agent into PagerDuty and Kubernetes to automatically fix production incidents. What guardrails would you insist on before deploying AIOps?',
    answer: 'Never give an autonomous AI agent unbounded write/delete access to production clusters. Start in read-only Copilot mode: let the agent gather correlated logs, recent Git commits, Prometheus anomalies, and past postmortems to post a ranked triage summary in Slack within 60 seconds. If enabling remediation actions later, restrict it strictly to idempotent, pre-approved runbooks (like pod restart or HPA floor bump) gated by human approval, full audit logging, and strict RBAC.'
  },
  {
    id: 'q2026-ai-5',
    topicSlug: 'ai-infra-finops',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'GPU Sharing (MIG, Time-Slicing & DRA)',
    question: 'An A100/H100 GPU node costs thousands per month, but small inference models only use 15% of a GPU each. How do you safely share GPUs across pods in Kubernetes?',
    answer: 'Compare three options by isolation requirement: (1) NVIDIA MIG (Multi-Instance GPU) physically partitions an A100/H100 into hardware-isolated slices with dedicated VRAM and fault isolation—best for production multi-tenant inference. (2) GPU Time-Slicing shares one GPU logically across pods with no memory isolation—great for dev/notebook clusters where cost matters more than noisy-neighbor isolation. (3) Kubernetes Dynamic Resource Allocation (DRA) enables rich structured GPU scheduling (model type, VRAM, NVLink topology) beyond simple integer nvidia.com/gpu counts.'
  },
  {
    id: 'q2026-ai-6',
    topicSlug: 'ai-infra-finops',
    experienceYears: 4,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'LLM Inference Autoscaling & Gateway Routing',
    question: 'Self-hosted vLLM pods suffer huge Time-To-First-Token (TTFT) latency spikes during bursts, and standard round-robin load balancing makes one pod OOM while another is idle. How do you fix this?',
    answer: 'Standard round-robin ignores variable prompt lengths and KV-cache prefix locality. Put an LLM-aware inference router (such as Kubernetes Gateway API Inference Extension or vLLM router) in front of pods to route requests based on live KV-cache utilization, active queue depth, and prefix-cache affinity. Scale replicas via KEDA on vllm:num_requests_waiting and vllm:gpu_cache_usage_perc rather than CPU, and keep a warm pool or fast model-streaming storage to cut cold-start latency.'
  },
  {
    id: 'q2026-ai-7',
    topicSlug: 'ai-infra-finops',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'architecture',
    focusArea: 'FinOps Unit Economics & Architectural Cost Governance',
    question: 'As a Principal DevOps/FinOps engineer, how do you build sustainable FinOps governance across 15 product teams instead of one-off panicked cost-cutting quarters?',
    answer: 'Shift from raw cloud bill shaming to unit economics—measure and publish cost per 1M API requests, per active tenant, or per 1M LLM tokens alongside reliability SLOs. Embed shift-left cost visibility with Infracost PR comments on Terraform changes, automate 70%+ of savings at the platform layer (Karpenter consolidation, Graviton defaults, Commitment/Savings Plan portfolio coverage, S3 lifecycle rules), and establish real-time anomaly alerts so runaway loops or misconfigured NAT/GPU pools are caught within hours, not at month-end.'
  },
  {
    id: 'q2026-ai-8',
    topicSlug: 'ai-infra-finops',
    experienceYears: 5,
    difficulty: 'Advanced',
    is2026Trend: true,
    kind: 'troubleshooting',
    focusArea: 'GPU Cluster Reliability & XID Failures',
    question: 'A distributed GPU training or high-throughput inference cluster experiences silent job hangs and sudden node failures. How do you automate GPU hardware health checks in Kubernetes?',
    answer: 'GPUs fail far more frequently than CPU nodes via ECC double-bit memory errors, NVLink degradation, or NVIDIA XID kernel errors. Run Node Problem Detector paired with NVIDIA DCGM active/passive health checks to watch XID error codes and thermal/memory faults. Automatically taint and cordon unhealthy GPU nodes, trigger graceful checkpointing/draining for running pods, and integrate with cloud node auto-repair (e.g., AWS EKS Node Health Monitoring / Karpenter replacement) so defective hardware is swapped without manual on-call intervention.'
  }
];
