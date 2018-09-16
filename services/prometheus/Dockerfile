FROM prom/prometheus:v2.2.0

COPY ./config.yml /etc/prometheus/prometheus.yml
CMD [ "--config.file=/etc/prometheus/prometheus.yml", \
        "--storage.tsdb.path=/prometheus", \
        "--storage.tsdb.retention=10d", \
        "--web.console.libraries=/usr/share/prometheus/console_libraries", \
        "--web.console.templates=/usr/share/prometheus/consoles" ]
