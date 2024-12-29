---
title: "Role-Based Access Control in Rust"
description: "Role-Based Access Control in Rust"
summary: "How do you add RBAC to your Rust codebase?"
date: 2024-12-27T10:17:29Z
lastmod: 2024-12-27T10:17:29Z
draft: false
weight: 50
categories: []
tags: [rust]
contributors:
  - Hugh Kaznowski
pinned: false
homepage: false
seo:
  title: "Role-Based Access Control in Rust"
  description: "Role-Based Access Control in Rust"
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

# Briefly, what is RBAC?

Role-based Access Control is a system to establish who has access to what.
With an RBAC authorisation system, you are able to provision and revoke permission to users to different parts of your system.
In many systems, this is critical.
Administrators should have a lot of access (but perhaps not unlimited - even admins can break things).
Non-administrators should follow the law of least privilege.
Systems should have different access and credentials to users.
This should all be convenientntly managed and reasoned about.
It also needs to be correct.

# What are your options for RBAC

You can of course introduce systems that are not Role Based Access Control.
RBAC is a standard though.

## External systems

External systems may be useful or a hinderance in some cases.
They are useful if you are certian you need to target a sepcific authentication and authorisation service.

Examples are LDAP, AWS Security, Google, other.

If you do not know the above, this can be a hinderance - integrating ad-hoc such systems may be easier than long term support.
For RapidRecast, I have chosen not to tie myself to any particular vendor.

## Roll your own

It's often a point of warning that one should not roll ones own authn/authz system.
This not only goes for cryptography, but also permissions enforcement systems.

If you feel up to strength to do this yourself (you have the experience and have assessed the risks) and you have also assessed the benefits you would bring to the company and product by rolling your own, then go ahead.

In the case of RapidRecast, I needed control of how the permissions system is represented and handled in memory, but I did not need more control than that.
I absolutely needed a proven system that is demonstrably true, or could be easy to demonstrate to be correct.

I have chosen to NOT roll my own RBAC system, and instead rely on an existing library - [Casbin](https://casbin.org/).

## Casbin

[Casbin](https://casbin.org/) is a library that works for many languages.
The key premise behind the Casbin library is the rule evaluation system.

## Alternative frameworks

# Dive into Casbin

{{< callout >}}

TODO

{{< /callout >}}

The biggest "game-changer" of Casbin is that you get the highly performant search and evaluation engine that has proven research papers and industry application in use today.

## What are Models in Casbin?

Models in Casbin are a surprising element of the library.
Models allow you to program **HOW** Casbin behaves.

This means that you do not need to follow RBAC the way it is conventionally prescribed - you can have deviations that are custom to your system, and still have a predictable authorisation layer in your software.

For RapidRecast, I am currently hard-coding the model into a static string.
This is the default RBAC model (not 2-subject auth).

The benefit of this is that I know the system has not been tampered with in the KV store.
If it would ever need to change, I can be in total control of that.

Storing the model into KV would be pointless - I am coding the system to follow simple RBAC rules and I would not deviate so much that that would change.

## What are Policies in Casbin?

Policies are the files/input rules that define how the authz system should behave.
The format of the policies is determined based on the Models described - if you change the model you use, the Policies will change as well.

Policies therefore are ways of
- giving access to a resource
- denying access to a resource
- defining belonging of a subject to another subject (a user to a group/role).

Subjects have no differentiation in the Casbin system - they are simply treated as strings.
You have 2 options here - enforce string formats so that you enforce this.
Alternatively, do not enforce string formats and let things flow as you want.
You likely don't want that - users can find ways of predicting patterns and then you have no control over that.

## Casbin and Rust

Rust allows type enforcement.
With the string condition above, we can re-enforce the string formatting in a single location.
This has the benefit that in our codebase, we are clear about what type of subject/object/action we are using - errors would likely be because of confusion in the types, rather than a formatting error.
Then just before interacting with Casbin we can transform the enums to strings - effectively guaranteeing that we have the correct string formatting.


