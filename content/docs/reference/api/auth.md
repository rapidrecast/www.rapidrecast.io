---
title: "Auth"
description: "Auth endpoint handles"
summary: ""
date: 2023-09-07T16:12:37+02:00
lastmod: 2023-09-07T16:12:37+02:00
draft: false
weight: 900
toc: true
sidebar:
  collapsed: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

| Method | Path                | Description                                      | Body |
| --- |---------------------|--------------------------------------------------|------|
| `POST` | `/api/v1/auth` | Generate a JWT token from HTTP Basic Auth header | None |

{{< interactive/curl-auth interactive-id >}}
