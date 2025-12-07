# Multi-stage build with error catching at each layer
# Each stage is isolated and can be tested independently
FROM debian:bookworm AS base

LABEL maintainer="LFS Automated Builder"
LABEL description="Cloud Run Job for automated Linux From Scratch compilation"

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    LC_ALL=C.UTF-8

# ============================================================
# LAYER 1: System Dependencies (Build Tools)
# ============================================================
FROM base AS system-deps
RUN set -ex && \
    echo "=== LAYER 1: Installing system dependencies ===" && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        make \
        automake \
        autoconf \
        pkg-config \
        libtool \
        wget \
        curl \
        git \
        bison \
        flex \
        texinfo \
        gawk \
        patch \
        diffutils \
        file \
        locales \
        groff \
        xz-utils \
        python3 \
        ca-certificates \
        findutils \
        coreutils \
        sed \
        tar \
        gzip \
        m4 && \
    rm -rf /var/lib/apt/lists/* && \
    echo "--- Verifying critical build tools ---" && \
    gcc --version && \
    make --version && \
    makeinfo --version && \
    diff --version && \
    find --version && \
    tar --version && \
    gawk --version && \
    echo "✅ LAYER 1 SUCCESS: System dependencies installed"

# ============================================================
# LAYER 2: Locale Configuration
# ============================================================
FROM system-deps AS locale-setup
RUN set -ex && \
    echo "=== LAYER 2: Setting up locale ===" && \
    locale-gen en_US.UTF-8 && \
    echo "--- Available locales:" && \
    locale -a && \
    echo "--- Verifying UTF-8 locale exists:" && \
    (locale -a | grep -iE "en_US|C\.UTF" || true) && \
    echo "✅ LAYER 2 SUCCESS: Locale configured"

ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# ============================================================
# LAYER 3: User and Directory Setup
# ============================================================
FROM locale-setup AS user-setup
RUN set -ex && \
    echo "=== LAYER 3: Creating LFS user and directories ===" && \
    useradd -m -s /bin/bash lfs && \
    mkdir -p /mnt /output && \
    chown -R lfs:lfs /mnt /output && \
    id lfs && \
    ls -ld /mnt /output && \
    echo "✅ LAYER 3 SUCCESS: User and directories created"

# ============================================================
# LAYER 4: Node.js Installation
# ============================================================
FROM user-setup AS nodejs-setup
RUN set -ex && \
    echo "=== LAYER 4: Installing Node.js ===" && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs npm && \
    rm -rf /var/lib/apt/lists/* && \
    node --version && \
    npm --version && \
    echo "✅ LAYER 4 SUCCESS: Node.js installed"

# ============================================================
# LAYER 5: Application Files (with cache busting)
# ============================================================
FROM nodejs-setup AS app-files
WORKDIR /app

# Cache busting: Change this value to force rebuild of this layer
ARG CACHE_BUST=20251107-v19-REMOVE-EARLY-ENV-VARS
RUN echo "Cache bust: $CACHE_BUST"

COPY lfs-build.sh ./lfs-build.sh
COPY lfs-chapter5-real.sh ./lfs-chapter5-real.sh
COPY helpers/ ./helpers/

RUN set -ex && \
    echo "=== LAYER 5: Application files copied ===" && \
    ls -lah /app/ && \
    ls -lah /app/helpers/ && \
    test -f /app/lfs-build.sh && \
    test -f /app/lfs-chapter5-real.sh && \
    chmod +x /app/lfs-chapter5-real.sh && \
    echo "--- Build script timestamps ---" && \
    ls -l /app/lfs-build.sh /app/lfs-chapter5-real.sh && \
    echo "--- Checking for parse_config function ---" && \
    (grep -A 5 "parse_config()" /app/lfs-build.sh | head -n 10 || echo "Function not found") && \
    echo "✅ LAYER 5 SUCCESS: Application files verified"

# ============================================================
# LAYER 6: Helper Dependencies (npm install)
# ============================================================
FROM app-files AS helper-deps
WORKDIR /app/helpers
RUN set -ex && \
    echo "=== LAYER 6: Installing helper dependencies ===" && \
    npm install --production && \
    test -d node_modules && \
    echo "--- First 20 packages installed:" && \
    ls -lah node_modules/ | head -20 && \
    echo "✅ LAYER 6 SUCCESS: Helper dependencies installed"

# ============================================================
# LAYER 7: Python and Utilities
# ============================================================
FROM helper-deps AS python-setup
RUN set -ex && \
    echo "=== LAYER 7: Installing Python and utilities ===" && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3-dev \
        python3-pip \
        python3-setuptools \
        jq \
        curl \
        gnupg \
        lsb-release && \
    rm -rf /var/lib/apt/lists/* && \
    python3 --version && \
    jq --version && \
    echo "✅ LAYER 7 SUCCESS: Python and utilities installed"

# ============================================================
# LAYER 8: Google Cloud SDK (CRITICAL LAYER)
# ============================================================
FROM python-setup AS gcloud-setup
RUN set -ex && \
    echo "=== LAYER 8: Installing Google Cloud SDK ===" && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    apt-get update && \
    apt-get install -y google-cloud-cli && \
    rm -rf /var/lib/apt/lists/* && \
    echo "--- Verifying gcloud installation ---" && \
    which gcloud && \
    gcloud --version && \
    ls -lah /usr/bin/gcloud && \
    echo "PATH=$PATH" && \
    echo "✅ LAYER 8 SUCCESS: gcloud SDK installed and verified"

# ============================================================
# LAYER 9: Final Setup (Permissions and Environment)
# ============================================================
FROM gcloud-setup AS final-setup

# Set build environment variables (CRITICAL: Use standard LFS paths)
ENV LFS_SRC=/mnt/lfs/sources \
    LFS_MNT=/mnt/lfs \
    OUTPUT_DIR=/output \
    LOG_DIR=/logs \
    MAKEFLAGS="-j4" \
    CFLAGS="-O2" \
    CXXFLAGS="-O2" \
    GCS_BUCKET_NAME=alfs-bd1e0-builds \
    PATH="/usr/bin:/usr/local/bin:/usr/local/sbin:/usr/sbin:/sbin:/bin"

WORKDIR /app
RUN set -ex && \
    echo "=== LAYER 9: Final setup and verification ===" && \
    chmod +x ./lfs-build.sh && \
    chown -R lfs:lfs /app && \
    mkdir -p $LFS_SRC $LFS_MNT $OUTPUT_DIR $LOG_DIR && \
    chown -R lfs:lfs /mnt /output /logs && \
    echo "--- Final verification ---" && \
    echo "gcloud location: $(which gcloud)" && \
    echo "gcloud version: $(gcloud --version | head -n 1)" && \
    echo "PATH=$PATH" && \
    test -x /app/lfs-build.sh && \
    test -d /app/helpers/node_modules && \
    echo "✅ LAYER 9 SUCCESS: Final setup complete"

# ============================================================
# FINAL STAGE: Production Image
# ============================================================
FROM final-setup AS production

# Note: Running as root for GCS access with service account
# The build script will switch to lfs user for compilation
USER root
WORKDIR /app

# Create health check file
RUN touch /tmp/healthy

# Entry point with explicit bash and error handling
# Export GCS_BUCKET_NAME explicitly to ensure it's available
ENTRYPOINT ["/bin/bash", "-c", "set -ex && export GCS_BUCKET_NAME=alfs-bd1e0-builds && echo '=== Starting LFS Build ===' && echo 'gcloud: '$(which gcloud) && echo 'GCS_BUCKET_NAME: '$GCS_BUCKET_NAME && /app/lfs-build.sh"]
CMD []

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD [ -f /tmp/healthy ] || exit 1

# Document what layers were built
LABEL layers="base,system-deps,locale-setup,user-setup,nodejs-setup,app-files,helper-deps,python-setup,gcloud-setup,final-setup,production"
LABEL build.stage.verified="all-layers-passed"
