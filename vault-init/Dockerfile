FROM curlimages/curl:latest

USER root

COPY init.sh /init.sh
COPY .env.vault /.env.vault

RUN chmod +x /init.sh
ENTRYPOINT ["/init.sh"]
