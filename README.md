# Planka

Elegant open source project tracking - an independent, modernized fork.

![License](https://img.shields.io/github/license/orneiavso/planka)

> A fork of [PLANKA](https://github.com/plankanban/planka) by Maksim Eltyshev,
> based on the last AGPL-3.0 release **v1.26.3** (commit `0c2ba9e3`).
> Maintained independently. Licensed under **AGPL-3.0**.
> Not affiliated with or endorsed by PLANKA.

## What this fork adds

- WYSIWYG rich-text editing for card descriptions and comments - markdown still supported
- Richer card previews - title first, then cover image and labels, with comment and attachment counts updated in real time
- Cleaner comment list and consistent typography across the board, card and editor
- Security hardening on the 1.26.3 base - path-traversal containment for static uploads and SSRF guards on outbound webhooks
- Reproducible container builds from source on an up-to-date Node 20 base
- Ongoing dependency and base-image maintenance

## Features

- Projects, boards, lists, cards, labels and tasks
- Card members, time tracking, due dates, attachments, comments
- Filter by members and labels
- Customizable project backgrounds
- Real-time updates and internal notifications
- Multiple interface languages
- Single sign-on via OpenID Connect

## Deployment

Build and run with the included `Dockerfile` / `docker-compose.yml`, or pull a
prebuilt image (see below). Configuration follows the standard PLANKA
environment variables.

## Container images

Prebuilt multi-architecture images (`linux/amd64` and `linux/arm64`) are
published to Docker Hub and track the latest fork release:

**https://hub.docker.com/r/orneiavso/planka**

```bash
# Always-latest tag
docker pull orneiavso/planka:latest

# Pin to a specific release (recommended for production)
docker pull orneiavso/planka:1.26.3_n.2.4.4
```

Every published image is built entirely from source via the included
`Dockerfile` on a Node 20 base (Alpine), with system packages upgraded at build
time. Each release's Git tag matches its image tag, so the source that produces
any image is fully reproducible (AGPL-3.0 corresponding source).

## Versioning

The current release is **`1.26.3+n.2.4.4`**.

Versions follow the scheme **`1.26.3+n.x.x.x`**: `1.26.3` is the upstream
AGPL-3.0 PLANKA base this fork is built on, and the `+n.x.x.x` suffix tracks
this fork's own independent releases (modernizations and security maintenance).

Because `+` is not a valid character in a Docker image tag, the equivalent image
tag replaces it with an underscore - version `1.26.3+n.2.4.4` is published as
image tag `1.26.3_n.2.4.4`.

## Tech stack

- React, Redux, Redux-Saga, Redux-ORM
- Sails.js, Knex.js
- PostgreSQL

## Credits

This project is a fork of **[PLANKA](https://github.com/plankanban/planka)**, created by
Maksim Eltyshev and built by its contributors. Huge thanks to everyone who shaped the original project.

[![PLANKA contributors](https://contrib.rocks/image?repo=plankanban/planka)](https://github.com/plankanban/planka/graphs/contributors)

## License

[AGPL-3.0](./LICENSE). Original work © Maksim Eltyshev and PLANKA contributors; modifications © Orne Iasson.
