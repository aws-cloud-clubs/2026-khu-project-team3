#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMMON_DIR="$(cd "${PROJECT_DIR}/../common" && pwd)"
BUILD_DIR="${PROJECT_DIR}/.lambda_build/worker"
DIST_DIR="${PROJECT_DIR}/dist"
ZIP_PATH="${DIST_DIR}/worker-handler.zip"

PYTHON_VERSION="${PYTHON_VERSION:-3.12}"
LAMBDA_PLATFORM="${LAMBDA_PLATFORM:-x86_64-manylinux_2_40}"

DEPS=(
  "openai>=2.38.0"
  "psycopg2-binary>=2.9.12"
  "pydantic>=2.13.4"
  "python-dotenv>=1.2.1"
  "sajupy>=0.2.0"
)

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}" "${DIST_DIR}"

uv pip install \
  --upgrade \
  --target "${BUILD_DIR}" \
  --python-version "${PYTHON_VERSION}" \
  --python-platform "${LAMBDA_PLATFORM}" \
  --only-binary=:all: \
  "${DEPS[@]}"

cp -R "${COMMON_DIR}/src/common" "${BUILD_DIR}/common"
cp -R "${PROJECT_DIR}/src/worker" "${BUILD_DIR}/worker"

find "${BUILD_DIR}" \
  \( -name "__pycache__" -o -name "*.pyc" -o -name "*.pyo" \) \
  -prune -exec rm -rf {} +

rm -f "${ZIP_PATH}"
(
  cd "${BUILD_DIR}"
  zip -r "${ZIP_PATH}" . -x "*.DS_Store"
)

echo "Created ${ZIP_PATH}"
echo "Lambda handler: worker.handlers.worker_handler.handler"
