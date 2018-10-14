FROM fluent/fluentd:v1.2-debian
COPY ./services/fluentd/conf /fluentd/etc

RUN ["gem", "install", "fluent-plugin-elasticsearch", "--no-rdoc", "--no-ri", "--version", "1.9.5"]
