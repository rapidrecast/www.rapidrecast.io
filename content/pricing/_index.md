---
title: "Pricing"
description: "Pricing plan for RapidRecast"
summary: "RapidRecast can be used in 3 pricing plans: community, professional, and enterprise."
date: 2023-09-07T16:21:44+02:00
lastmod: 2023-09-07T16:21:44+02:00
type: "pricing"
draft: true
weight: 50
categories: []
tags: []
contributors: []
pinned: false
homepage: false
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

RapidRecast pricing comes in 3 tiers.

**Community** tier is for anyone who wants to try out the product.

**Professional** tier is for people who want to use the service in production, but don't have extreme needs.

**Enterprise** tier is for organisations who need fault tolerance, scalability, and all features that would be expected of a paid product.

{{<table>}}
|  | Community | Professional | Enterprise | Description |
|--| --------- | ------------ | ---------- | ----------- |
| **Monthly Cost** | Free | 100 GBP | 1000 GBP | Support costs are negotiated separately, on a case-by-case basis. Critical issues such as security are handled for free on all tiers including community. |
| **HTTP 1.1** | ✅ | ✅ | ✅ | Basic web requests, both inbound (client connects to RapidRecast) and outbound (RapidRecast connects to a service). |
| **HTTPS 1.1** | ❌ | ✅ | ✅ | Basic web requests, that are encrypted using TLS. |
| **H2C (HTTP2 without TLS)** | ✅ | ✅ | ✅ | The HTTP 2 protocol without TLS. |
| **HTTP 2** | ❌ | ✅ | ✅ | The web protocol, that is served on a single TCP connection, for performance. Since this requires TLS, it is not available on the community release. |
| **Cron Expressions** | ✅ | ✅ | ✅ | String expressions that dictate how often an event happens, such as RapidRecast making polling requests, or generating traffic. |
| **Kafka** | ✅ | ✅ | ✅ | One of the main message brokers. |
| **Spark** | ✅ | ✅ | ✅ | One of the main stream processing engines. |
| **WebRTC** | ✅ | ✅ | ✅ | A protocol designed for video/audio streaming, which can be used for other things as well. |
| **TLS** | ❌ | ✅ | ✅ | Encryption of web traffic. This applies to all protocols. |
| **Authentication and Authorisation** | ❌ | ✅ | ✅ | Using role based access control and login/password to control access to granular parts of the system. |
| **Clustering** | ❌ | ❌ | ✅ | Having multiple instances of RapidRecast communicate with each other, for the purpose of fault tolerance and scalability. |
| **OpenTelemetry** | ❌ | ❌ | ✅ | Metrics that can be displayed in a dashboard. |
{{</table>}}
