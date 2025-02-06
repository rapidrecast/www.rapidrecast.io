---
title: "Design Patterns in Rust Tower"
description: "Design Patterns in Rust Tower"
summary: "We examine patterns you can use when writing Rust Tower Layers and Services."
date: 2025-02-06T12:00:00Z
lastmod: 2025-02-06T12:00:00Z
draft: false
weight: 50
categories: []
tags: [rust]
contributors:
  - Hugh Kaznowski
pinned: false
homepage: false
toc: true
seo:
  title: "Design Patterns in Rust Tower"
  description: "Design Patterns in Rust Tower"
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

## Rust, Tower, and protocol implementations

If you have dabbled in Rust, you may have likely encountered Tower.
Tower is a framework that allows people to build protocol handling via Services.
It also allows for building middleware that intercepts requests via Layers.

The design of Tower is surprisingly simple.
It declares a few traits and leaves the rest to you.
This simplicity is fantastic as it makes it quite easy to reason about (though the types can get a bit hairy).

One downside of Tower's design, however, is that it expects messages to follow the request-response pattern.
This is great for services that are request-response based, but not so great for services that are more stream-based.
And sadly, nearly all protocols are stream-based - including HTTP 1.

## Patterns you can follow when designing Tower Services and Layers

I have uncovered and detailed the following patterns that I have found useful when working with Tower.
They are all implemented as Layers, but can equally apply to Services.
You can follow the code from the [blog code repository](https://github.com/rapidrecast/blog-post-snippets/tree/main/blog-20250206-tower-patterns).

The patterns described are all applicable to client- and server-side implementations.

### Basic Messaging Pattern

The "Basic Messaging Pattern" is the synchronous pattern described earlier, which Tower is absolutely perfect for.
The idea is that you would call your Tower stack with an input, and return the processed value back.

NOTE: You don't even need to apply this pattern to protocol implementations.
You can equally apply this to any function that you want to wrap in a middleware.
One example would be throttling requests to a channel that you send and receive from.

### I/O Pattern

Most often, you are going to interact with a network socket.
Network sockets provide a read and a write interface.

In the I/O Pattern, you would accept a Read and Write pair as input if you are a server handling a protocol.
If you are a client handling a protocol, then the Read and Write pair would likely be sent downstream.

This is a recommendation, you can of course structure your code however you like.

### Channel Pattern

This pattern is very similar to the I/O Pattern, but instead of using a Read and Write pair, you use a Receiver and Sender pair.
The most common case for this is when you have known types (deserialized requests or responses) and you need to translate them.

### Handler Pattern

This pattern is a bit controversial, as it isn't quite the intended use of Tower.
In Tower, a handler is implemented within a Service.
Even if you want a nice trait describing the interface available, that would still be contained within the Tower Service.

However, there may be cases, where this pattern is better suited.
An example may be when you provide a client to the underlying Service, which in turn provides a request handler back.

The major benefit of this approach (as opposed to the I/O Pattern and Channel Patterns) is that you do not need to spawn the inner Service.
This is a nice choice for people working in embedded environments.

### Injector Pattern

The Injector Pattern is a convenient way to solve 2 problems:
- Intermittent handling of a protocol (such as authentication or authorization)
- Protocol upgrades or any changes off the obvious path of protocol handling

It is worth highlighting that Tower is designed in such a way, that protocol upgrades would be handled by a separate Layer that either catches and consumes input or forwards it onto the service.
However, you may still want to use this pattern in certain situations, such as when Layers or Services don't allow such flexibility.

## Conclusions

Tower is absolutely fantastic however has some drawbacks by it's design.
For the most part, you can achieve practically anything you want and hopefully the above patterns I have described will help you in your journey.
