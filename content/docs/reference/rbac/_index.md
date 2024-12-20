---
title: "RBAC Reference"
description: "Role-Based Access Control (RBAC) covers all the concepts related to permissions within RapidRecast."
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

See the [RBAC Guide]({{< ref "/docs/guides/rbac.md" >}}) for a more detailed explanation of RBAC in RapidRecast.

# Subjects

# Objects

The following Objects can be used in Policies:

| Object                                 | Description                                     |
|----------------------------------------|-------------------------------------------------|
| `topic-any:default-namespace`          | Any topic that can be pushed and consumed from. |
| `topic:default-namespace:<topic-name>` | A specific topic by name.                       |

# Actions

The following Actions can be used in Policies:
- `Create`, whenever a resource is being created
- `Update`, whenever a resource is being updated
- `Delete`, whenever a resource is being deleted
- `List`, whenever metadata about a resource is being listed
- `Read`, whenever a resource is being read from
- `Write`, whenever a resource is being written to
