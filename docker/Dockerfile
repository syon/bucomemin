FROM syon/puppeteer

USER root

RUN mkdir -p /home/pptruser/work \
    && chown -R pptruser:pptruser /home/pptruser/work

USER pptruser

WORKDIR /home/pptruser/work
COPY . /home/pptruser/work

RUN npm install --silent

EXPOSE 3444

CMD ["npm", "start"]
