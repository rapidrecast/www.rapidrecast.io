---
title: "Weekly Report - 2024/12/02"
description: "Weekly report of progress and prorities"
summary: "Have a look at my weekly report on where I am with progress and focus."
date: 2024-12-02T10:00:00+00:00
lastmod: 2024-12-02T10:10:00+00:00
draft: false
weight: 50
categories: []
tags: [standup]
contributors:
  - Hugh Kaznowski
pinned: false
homepage: false
seo:
  title: "Weekly Report - 2024/11/25" # custom title (optional)
  description: "Weekly report of progress and prorities" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

The theme of this week is to progress towards getting demo videos out.

# What I achieved

## Marketing

### 1. Created the Realtime Streaming API community, planning content for web/profile/community.

The purpose of the community is to find people who are interested in the same topics - customers, early adopters, other vendors.
While it is a good way to passively generate leads, I am adamant that it cannot become a branded community.
If it becomes to "sales-y" then nobody will want to join.

### 2. Greater focus on ICP and product offering

I am now racing towards product demos using videos.
There are several reasons for this.

1. Early customers are not ICP. I need to provide value and increase credibility before I can start building out more.
2. ICP will be enticed by what they see, not tangential content.

## Admin

### Ongoing branding effort

- Linkedin cover photos and company profile. It's small, but it will do at the moment.
- Ongoing effort to transform the website, starting with fonts and logo.

### Trademark in progress

There are 2 companies that hold the trademark to "rapid" - an IT consultancy providing cloud hosting, and a sports livestreaming platform.
Hopefully things go smoothly despite that.

## Sales

### Large financial company: streaming infra call

A friend gave me an "in" to this call with a massive company.
It's unlikely to progress much, but it is stil very important to have such calls.

The call itself was focused on the problem they are trying to solve, and the 2 or 3 approaches they are evaluating.

They wanted input on how this problem gets solved in the databases space.

I am always willing to share advice on such topics.
I think both sides benefit from the scenario.
You get free advice, I get a free use case to consider and potential product feedback.

This likely won't lead to a sale for the existing problem, since they are pressed for time and need a proven solution ("not production ready").

This does not exclude the product from being used on other projects internally though - hopefully, something can come from that.
Even if it is just network expansion.

### Large hardware company: integrations call

Another friend referral.

This one is about integrating several systems that the team has internally.

I am not thinking much will come of this - integrations projects can be extremly challenging.

However, by listening to the use case intently, I can better prepare and prioritise features to make such conversations more productive.

## Product

### Found root cause of tokio issues

Did you know Rust [std::net::TcpListener](https://doc.rust-lang.org/std/net/struct.TcpListener.html#method.set_nonblocking) is blocking by-default?
Did you know that putting it into a Tokio TcpListener will not set it to non-blocking?
I found out.

### Tower-like services in hyper and protocol-agnostic tests

One of the benefits of using Rust is that everything is being designed with some sensibility from the start.
You aren't tied to tech-debt as much as in other language ecosystems.

One place where this shines is with implementations of protocols that are ["Sans-I/O"](https://sans-io.readthedocs.io/how-to-sans-io.html).
That means you can interact with the protocols, without needing to use TCP or UDP bindings.

I have written up an example of [how to write such a service](https://github.com/hyperium/hyper/discussions/3803) and test it [here](https://github.com/rapidrecast/blog-post-snippets/tree/2b4a574401ea4f610c98b122cbcb489acdc401ba/blog-20241202-hyper-service/src).

### Admin API, Auth and RBAC

I have started work on the Admin API.
The Admin API will allow users to configure multitenancy and all configurations involved in the system.

### Cloud offering

To make the product as convenient to use as possible, I have made it available for free online.

You can interact with it on [cloud.rapidrecast.io](cloud.rapidrecast.io).

Access is anonymous and I take no responsibility for data sent to it or received from it.

# What I didn't achieve

- A sale :) This likely won't happen for quite a while.
- Website rebrand - this is proving a bit tricky, but I am making good progress.
- Admin API - I was hoping to have it up by now.

# What I am doing this week

## Marketing

- Less content for the time being to focus better on product.
- Working towards product demo videos.

## Admin

- Much less to do now, so largely backburner.
- Website rebrand in my downtime.
- Clearer separation of work hours.
  - By doing this, I can relax (and recover) better between work sessions.
  - Work sessions remain long though
  - Monday-Friday 9am-10pm, hard cutoff at 10.
  - Weekends are largely work-free, but may indulge in low-effort work like the website branding.

## Product

- Cloud offering this week, free and anonymous (no email or credit card).
- Configuration API that allows to set how APIs and queues behave.

## Sales

- Improve pitch and offering.
- Clarify language to make the product simple to understand.

Till next time folks!