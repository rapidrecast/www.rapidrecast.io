---
title: "RapidRecast 0.2.0"
description: "First Console release of RapidRecast"
summary: ""
date: 2024-12-18T10:00:00+00:00
lastmod: 2024-12-18T10:00:00+00:00
draft: false
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

Release 0.2.0 is out!

The release is already available for free from [cloud.rapidrecast.io](http://cloud.rapidrecast.io).

The admin credentials are `admin` and password `admin-password`.

The cloud API protocol has moved from port 80 to port 81 to accommodate the new Admin Console.

This is quite a significant release as it sets the groundwork for the security and API.

The download links are at the bottom of the page.

# Features

## Admin API

The new release includes a new admin API.

The purpose of the admin API is to control and configure RapidRecast.

In this initial release, you have the following endpoints:

| Method                 | Endpoint       | Description                                                                                                                             | Example Body                                                                           |
|------------------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| POST (will become GET) | /api/v1/auth   | Using basic header authentication, you can get a Json Web Token (JWT) that can be used with other parts of the service.                 | N/A                                                                                    |
| POST                   | /api/v1/policy | Add a new RBAC policy into the system. Provisioning permissions to other users/roles is only possible if the JWT you provide allows it. | `{"subject": "anon", "object": "topic:some_namespace:some_topic", "action": "write"}`  |

Very rudimentary, and you cannot create new users from the Admin API yet.

For this release, it only matters that you can allow anonymous users to create topics.

## Admin Console

I have included a user interface, also available on the root path of the Admin API address.

This authenticates using the auth in headers and sets a cookie with the JWT.

It allows listing topics, while I work on adding more features.

## Authentication

Users can now authenticate with the Admin API using basic auth.

Credentials are stored with a random salt in the database using Argon 2 id algorithm.

While I do have the capabilities to create new users, this is not yet exposed.

## Authorisation (RBAC)

This release introduces an offline authorisation system, leveraged by [Casbin](https://casbin.org/).

The idea behind RBAC is that every action has a subject (who you are), an object (what you are doing it to), and an action (what you are doing).

Currently, the available roles are `anon` and `admin`.

The available objects are `topic-any`, and `topic:default-namespace:<your-topic>`.

The available actions are:
- `create`
- `read`
- `write`
- `update` (deliberately distinct from write)
- `delete`
- `list`
- `rename`

## API testing script

You can test out the API with the below script.

```python
#!/usr/bin/python3
import base64
import requests
import sys

def main(hostname, admin_port, proto_port, data):
    print(f"Using hostname {hostname}, admin-port {admin_port}, and proto-port {proto_port}\n")

    # Step 1: Log in to /api/v1/auth and retrieve the JWT
    print("Step 1: Authenticate as admin")
    basic_auth = base64.b64encode(b"admin:admin-password").decode("utf-8")
    auth_url = f"http://{hostname}:{admin_port}/api/v1/auth"
    print(f"Equivalent curl command:\n"
          f"curl -X POST -H \"Authorization: Basic {basic_auth}\" -H \"Content-Type: application/json\" {auth_url}\n")

    try:
        auth_response = requests.post(
            auth_url,
            headers={"Authorization": f"Basic {basic_auth}", "Content-Type": "application/json"}
        )
        auth_response.raise_for_status()
        jwt = auth_response.json().get("token")

        if not jwt:
            print("Error: Failed to retrieve JWT")
            sys.exit(1)

        print(f"Retrieved JWT: {jwt}\n")
    except requests.exceptions.RequestException as e:
        print(f"Error during login: {e}")
        sys.exit(1)

    # Step 2: POST to /api/v1/policy with the JWT
    print("Step 2: Allow anonymous users to create topics")
    policy_url = f"http://{hostname}:{admin_port}/api/v1/policy"
    policy_data = {"subject": "anon", "object": "topic-any", "action": "create"}
    print(f"Equivalent curl command:\n"
          f"curl -X POST -H \"Authorization: Bearer {jwt}\" -H \"Content-Type: application/json\" "
          f"-d '{policy_data}' {policy_url}\n")

    try:
        policy_response = requests.post(
            policy_url,
            headers={
                "Authorization": f"Bearer {jwt}",
                "Content-Type": "application/json"
            },
            json=policy_data
        )
        print(f"Policy POST response status: {policy_response.status_code}")
        print(policy_response.text + "\n")
    except requests.exceptions.RequestException as e:
        print(f"Error during policy POST: {e}")
        sys.exit(1)

    # Step 3: Send POST request to /test-topic
    print("Step 3: Post a message as an anonymous user, creating the topic")
    test_topic_post_url = f"http://{hostname}:{proto_port}/test-topic"
    print(f"Equivalent curl command:\n"
          f"curl -X POST -H \"Content-Type: application/json\" -d '{data}' {test_topic_post_url}\n")

    try:
        post_response = requests.post(
            test_topic_post_url,
            headers={"Content-Type": "application/json"},
            json=data
        )
        print(f"POST response status: {post_response.status_code}")
        print(post_response.text + "\n")
    except requests.exceptions.RequestException as e:
        print(f"Error during POST to /test-topic: {e}")
        sys.exit(1)

    # Step 4: Send GET request to /test-topic
    print("Step 4: Consume the message from the topic")
    test_topic_get_url = f"http://{hostname}:{proto_port}/test-topic"
    print(f"Equivalent curl command:\n"
          f"curl -X GET {test_topic_get_url}\n")

    try:
        get_response = requests.get(test_topic_get_url)
        print(f"GET response status: {get_response.status_code}")
        print(get_response.text + "\n")
    except requests.exceptions.RequestException as e:
        print(f"Error during GET from /test-topic: {e}")
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run API test script.")
    parser.add_argument("--hostname", type=str, default="cloud.rapidrecast.io", help="Hostname for the API")
    parser.add_argument("--admin-port", type=int, default=80, help="Port for admin API (default: 80)")
    parser.add_argument("--proto-port", type=int, default=81, help="Port for the main API (default: 81)")
    parser.add_argument("--data", type=str, required=True, help="JSON data for POST request to /test-topic")

    args = parser.parse_args()
    main(args.hostname, args.admin_port, args.proto_port, args.data)
```

Find the downloads below.

| Platform | Link                                                                                                                                                |
| -- |-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Windows x86_64 | [.tar.gz](/release/0.2.0/rapidrecast-v0.2.0-x86_64-pc-windows-msvc.tar.gz) [.zip](/release/0.2.0/rapidrecast-v0.2.0-x86_64-pc-windows-msvc.zip)     |
| Mac x86_64 (Intel) | [.tar.gz](/release/0.2.0/rapidrecast-v0.2.0-x86_64-apple-darwin.tar.gz) [.zip](/release/0.2.0/rapidrecast-v0.2.0-x86_64-apple-darwin.zip)           |
| Mac aarch64 (M1/M2/M3) | [.tar.gz](/release/0.2.0/rapidrecast-v0.2.0-aarch64-apple-darwin.tar.gz) [.zip](/release/0.2.0/rapidrecast-v0.2.0-aarch64-apple-darwin.zip)         |
| Linux x86_64 | [.tar.gz](/release/0.2.0/rapidrecast-v0.2.0-x86_64-unknown-linux-gnu.tar.gz) [.zip](/release/0.2.0/rapidrecast-v0.2.0-x86_64-unknown-linux-gnu.zip) |

