---
title: "Role-Based Access Control (RBAC)"
description: "Defining security policies"
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

# Role-Based Access Control (RBAC)


Role-Based Access Control (RBAC) is a method of restricting what users can do on your system.

The general idea is that every time you do something, you are acting as a Subject (User or Role).
When you are acting as a Subject, you are acting on some resource; this is the Object.
Finally, there is a definition of what you are trying to do with the Object. This is the Action.

## What are Policies and Subject-Object-Action?

RBAC is a system of handling permissions where you define Policies.
A Policy is a 3-tuple of Subject, Object, and Action.

As a _hypothetical_ example, this is how you would allow Hugh to Write to Topic1:

```
Hugh, Topic1, Write
```

The above is completely incorrect syntax, but it highlights the idea of the RBAC system in place.

To revoke permission, you would remove the Policy.
A user is given permission if any single policy affecting them (or their roles) allows it.

## What are Roles?

A Role is a Subject, just like a User.

In the existing implementation of RapidRecast, there is no difference between Roles and Users.
That means Users can belong to other Users and inherit the same permissions.
Under such circumstances, if Users remain in the system after the parent User is deleted, the parent User effectively becomes a Role.
The Role can be renamed.

### Pre-defined Roles in RapidRecast

There are 2 Users that are pre-defined in RapidRecast:
- `admin`
- `anon`

The password for `admin` is `admin-password`.

The `anon` account is not allowed to have a password.

### Existing Objects

The following Objects can be used in Policies:

| Object                                 | Description                                     |
|----------------------------------------|-------------------------------------------------|
| `topic-any:default-namespace`          | Any topic that can be pushed and consumed from. |
| `topic:default-namespace:<topic-name>` | A specific topic by name.                       |

### Defining a Policy

You can define a policy using the policy API.


