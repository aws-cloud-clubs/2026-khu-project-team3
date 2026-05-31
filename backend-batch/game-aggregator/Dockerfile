FROM public.ecr.aws/lambda/python:3.12

# Build with backend-batch as the Docker context:
# docker build -f game-aggregator/Dockerfile .

RUN dnf install -y \
    atk \
    cups-libs \
    gtk3 \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    pango \
    alsa-lib \
    libXfixes \
    nss \
    mesa-libgbm \
    xorg-x11-fonts-Type1 \
    xorg-x11-fonts-misc

RUN pip install --no-cache-dir uv

WORKDIR ${LAMBDA_TASK_ROOT}

COPY common ./common
COPY game-aggregator ./game-aggregator

RUN uv pip install --system ./game-aggregator

COPY game-aggregator/src/game_aggregator ./game_aggregator
COPY common/src/common ./common

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN playwright install chromium

CMD ["game_aggregator.handlers.aggregator_handler.handler"]
