FROM php:8.4-fpm-alpine

# Install dependencies in a single layer with cleanup
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    git \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd zip \
    && apk del --purge autoconf g++ make

# Copy composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy dependency files first for better layer caching
COPY composer.json composer.lock ./

# Install dependencies with optimizations
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader --no-scripts \
    && composer clear-cache

# Copy application files
COPY . .

# Copy environment file
COPY .env.example .env

# Create directories and set permissions
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Run post-install scripts if needed
RUN composer run-script post-install-cmd --no-interaction || true

COPY supervisord.conf /etc/supervisord.conf

EXPOSE 9000

USER www-data

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]