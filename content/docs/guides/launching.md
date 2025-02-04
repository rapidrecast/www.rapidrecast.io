---
title: "Launching RapidRecast"
description: "How you can launch RapidRecast and the options available."
summary: ""
date: 2023-09-07T16:04:48+02:00
lastmod: 2023-09-07T16:04:48+02:00
draft: false
weight: 810
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

# Downloading RapidRecast

Pick up the latest release from the [Releases Page]({{< ref "/releases/" >}}).

Download for the appropriate platform from the table at the bottom of the release page.

Unpack wherever is convenient for you, for example `~/local/bin`.

# Starting RapidRecast

Once you have downloaded and unpacked RapidRecast, you should be able to run it immediately with this command.

```bash
# (Optional) configure logging
export RUST_LOG=rapidrecast=trace,info
# Start RapidRecast
rapidrecast -p 0.0.0.0:0 -a 127.0.0.1:0
```

The above command creates an HTTP protocol and an Admin API on any available port.
The `0.0.0.0` binding means that it is accessible on any network interface (such as the internet, if the firewall allows it).
We do not want the Admin API accessible from anyone outside our computer though - so we have set the bind to be `127.0.0.1`.
Only you can access it from your computer that way.

Exposing the Admin API to the internet is considered safe, assuming the login credentials are secure.

# Protocols available

RapidRecast exposes protocols on CLI provided ports.

## Admin Protocol

RapidRecast provides a way to remotely configure its behaviour and state.

To make the Admin Protocol available, you provide the CLI with the `-a` or `--admin-bind` parameter.

For example `rapidrecast -a 127.0.0.1:8080` will make the admin protocol available on port 8080 on your computer only, but not to outside networks.

## Service Protocols

**Service Protocols** are the protocols that users of the service interact with.
They are entirely programmable from the admin API and console.

In the current latest release the available protocols are:

| Protocol | CLI args                             | Example          |
|----------|--------------------------------------|------------------|
| HTTP 1.1 | `-p <bind>` and `--http-bind <bind>` | `-p 127.0.0.1:0` |


# Admin credentials

To access the admin API, you need to use admin credentials.

In the early days of RapidRecast, the admin credentials are hardcoded to `admin` and `admin-password`.

Once logged in as an admin, you can create users and roles fitting the permissions you would like to use.

To read more about Policies and Roles, see the [RBAC Guide]({{< ref "/docs/guides/rbac.md" >}}).
