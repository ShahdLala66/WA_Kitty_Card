FROM eclipse-temurin:21-jdk AS builder

RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN curl -L -o sbt-1.9.7.deb https://repo.scala-sbt.org/scalasbt/debian/sbt-1.9.7.deb && \
    dpkg -i sbt-1.9.7.deb && \
    rm sbt-1.9.7.deb

WORKDIR /app

COPY build.sbt ./ 
COPY project/ ./project/
COPY se_kitty_card/ ./se_kitty_card/
COPY wa_kitty_card/ ./wa_kitty_card/

RUN sbt -Dsbt.rootdir=true -Dfile.encoding=UTF8 wa_kitty_card/stage

FROM eclipse-temurin:21-jre

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN groupadd -r -g 1001 playuser && useradd -r -u 1001 -g playuser playuser

WORKDIR /app

COPY --from=builder /app/wa_kitty_card/target/universal/stage/ ./

RUN chown -R 1001:1001 /app
USER 1001

EXPOSE 9000
ENV JAVA_OPTS="-Xmx512m -Xms256m"

CMD ["./bin/wa_kitty_card", "-Dhttp.port=9000"]
