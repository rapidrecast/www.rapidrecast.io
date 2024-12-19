---
title: "Release your Rust!"
description: "Release your Rust project on Github with this simple workflow"
summary: "In this post, you will learn how to release your Rust project while conveniently handling release versions."
date: 2024-11-25T10:00:00+00:00
lastmod: 2024-11-25T10:00:00+00:00
draft: false
weight: 50
categories: []
tags: [rust]
contributors:
  - Hugh Kaznowski
pinned: false
homepage: false
seo:
  title: "Github workflow for releasing in Rust" # custom title (optional)
  description: "Release your Rust project on Github with this one simple snippet" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

# What is a release workflow

A software release is useful to track which version of the code is being used by your users.
When a users says they are using "1.2.3" you know what features they have, and what bugs may exist (that have since been fixed).

A release workflow on the other hand is a way of repeating steps in such a way that you know the end result will give a consistently valid version of your software.

# Semantic Versioning

Rust any many other software vendors follow the semantic versioning format of version numbers.

Semantic versioning is an industry standard way of agreeing what users can expect when they change versions.

The version format of semantic versions follows the convention of using Major, Minor, and Patch numbers, separated with full-stops.

## Patch releases
Patch releases increment only the last number of the version.
They indicate that no new features were added, and only changes to existing functionality were made in order to fix a shortcoming in the software.

Often, clients should be able to upgrade their software to a patch without any testing or migration - even though it is still advised to do so.

## Minor releases
Minor releases are designed to add features to your software.
Incrementing the minor version number of your release number effectively resets the patch number.
For example, doing a minor release on top of version `11.22.33` will create a release with version `11.23.0`.

Clients upgrading to the next minor version should not see any issues, but should test the upgrade (on separate infrastructure before deploying, for example) in case new features have unexpectedly changed existing features.
If new features change existing behaviour, then that would be considered a regression and is conventionally agreed not the right practice for a release.

## Major releases
Major releases are the most significant change a software can make.
The major change indicates that users are likely to see breaking changes in their usage of the product.
If you are removing features or behaviours, this tends to be done in major releases.

When phasing out features, it is conventional to give a deprecation notice.
That way users can stop using the old way of doing things and move to the new way on their own terms while not disrupting their planned work.

Clients upgrading to the next major release should absolutely test their deployments and usage of the software and should plan that it breaks things - users should have a contingency that the upgrade will fail.

# Single click releases in Rust and GitHub Action Workflows

To simplify the release pipeline of RapidRecast, I have created the following workflow.

You can use this workflow as you wish - it is very versatile and practical for practically all Rust projects.

This project does not push to [crates.io](https://crates.io), since I only release a binary at the moment.
To change that, you can modify the `Update Cargo.toml version and push to GitHub` step during the Pre-release job.

```yaml
...
```

# Using the workflow

To use the workflow, add the file to your git repository under `.github/workflows/<any-file-name>.yml`.

Then, to perform a release, go to your Github project -> `Actions` -> `Release to Github` (left panel) -> `Run workflow` (right dropdown option).
