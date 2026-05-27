FROM public.ecr.aws/lambda/python:3.12

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

COPY pyproject.toml uv.lock ./

RUN uv pip install --system .

COPY src ./src

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN playwright install chromium

CMD ["src.handlers.aggregator_handler.handler"]