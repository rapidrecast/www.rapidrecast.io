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

As you develop software, you need to share a common understanding with the user of which point in time of development you are talking about.
We call these points in time *versions*, and they can take on many forms, from names and single numbers to more structured formats, including dates.

As you develop software, you will want a convenient way to increase the version number during a release so that you don't make a mistake anywhere.

That is what a release pipeline is for - you indicate the version change you want to make to the software, and the pipeline takes care of the rest.

I am sharing with you a release workflow I have created and used across several projects, including RapidRecast.

You should be able to copy it as-is, include a Personal Access Token under the project secrets as `RELEASE_TOKEN` and benefit from a convenient release cycle.

# Pre-release workflow

The pre-release workflow must be run manually from Github Actions and bumps the local version of your Cargo project.

You can modify this step slightly so it pushes to [crates.io](https://crates.io).

Running this workflow will result in a new tag in your repository with the new bumped version.

```yaml
name: Pre-release to trigger before github release

on:
  workflow_dispatch:
    inputs:
      type:
        description: 'Type of release (major/minor/patch)'
        required: true
        default: 'minor'
      dry_run:
        description: 'Dry run (true/false)'
        required: true
        default: true

env:
  CARGO_TERM_COLOR: always

jobs:
  prepare-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          token: ${{ secrets.RELEASE_TOKEN }}

      - name: Set up Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Install cargo-release
        run: cargo install cargo-release

      - name: Configure Git
        run: |
          git config --global user.name "GitHub Action"
          git config --global user.email "action@github.com"

      - name: Update Cargo.toml version and push to Github
        run: |
          REL_TYPE=${{ github.event.inputs.type }}
          DRY_RUN=${{ github.event.inputs.dry_run }}

          # Execute version update
          if [ "$DRY_RUN" = "false" ]; then
            echo "Updating version in Cargo.toml"
            cargo release --verbose --execute --no-confirm $REL_TYPE --no-publish --no-verify
          else
            echo "Dry run: showing changes without executing"
            cargo release --verbose $REL_TYPE --no-publish --no-verify
          fi
```

# Release workflow

After completing the Pre-Release workflow, you can start a release from your Github project page.
When you have created the release against the new version tag, the Release workflow will trigger and attach all platform artifacts you want to include.

```yaml
name: Release that is triggered from github releases

on:
  release:
    types:
      - published # Trigger only when a release is published

env:
  CARGO_TERM_COLOR: always

jobs:
  build-macos-13-intel:
    runs-on: macos-13
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Build
        run: cargo build --release --verbose

  build-macos-14-arm64:
    runs-on: macos-14
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Build
        run: cargo build --release --verbose

  build-windows:
    runs-on: windows-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Build
        run: cargo build --release --verbose

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Set up Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: Build
        run: cargo build --release --verbose

  upload-assets:
    strategy:
      matrix:
        os:
          - ubuntu-latest
          - macos-13
          - macos-14
          - windows-latest
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: taiki-e/upload-rust-binary-action@v1
        with:
          # (required) Comma-separated list of binary names (non-extension portion of filename) to build and upload.
          # Note that glob pattern is not supported yet.
          bin: rapidrecast
          archive: $bin-$tag-$target
          include: README.md,LICENSE
          # (optional) On which platform to distribute the `.tar.gz` file.
          # [default value: unix]
          # [possible values: all, unix, windows, none]
          tar: all
          # (optional) On which platform to distribute the `.zip` file.
          # [default value: windows]
          # [possible values: all, unix, windows, none]
          zip: all
          # (required) GitHub token for uploading assets to GitHub Releases.
          # Not using GITHUB_TOKEN because that didn't have enough permissions?
          token: ${{ secrets.RELEASE_TOKEN }}
```

# Using the workflow

The two workflows assume you are using Cargo and semantic versioning and building a binary.

If you are making multiple binaries, open-source, or dynamic libraries, you can modify the same workflows to your needs.

Now that you have this workflow, you can add it to any Rust project for effortless releases at the click of a button.
