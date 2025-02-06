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

If you have dabbled in Rust, you may have encountered Tower.
Tower is a framework that allows people to build protocol handling via Services.
It also allows for the building of middleware that intercepts requests via Layers.

The design of Tower is surprisingly simple.
It declares a few traits and leaves the rest to you.
This fantastic simplicity makes it easy to reason about (though the types can get a bit hairy).

However, one downside of Tower's design is that it expects messages to follow the request-response pattern.
Tower is great for services that are request-response-based but not so great for services that are more stream-based.
And sadly, nearly all protocols are stream-based - including HTTP 1.

## Patterns you can follow when designing Tower Services and Layers

I have uncovered and detailed the following patterns that I have found useful when working with Tower.
They are all implemented as Layers but can equally apply to Services.
You can follow the code from the [blog code repository](https://github.com/rapidrecast/blog-post-snippets/tree/main/blog-20250206-tower-patterns).

The patterns described are all applicable to client- and server-side implementations.

### Basic Messaging Pattern

The "Basic Messaging Pattern" is the synchronous pattern described earlier, which Tower is perfect for.
The idea is that you would call your Tower stack with an input and return the processed value.

{{< callout note >}}
You don't need to apply this pattern to protocol implementations.
You can equally apply this to any function you want to wrap in a middleware.

One example would be throttling requests to a channel that you send and receive from.
{{< /callout >}}


[Implementation of BasicPatternService](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/pattern_basic.rs#L27-L51)
```rust
impl<InnerService, InputType, OutputType, ReturnType> Service<InputType> for BasicPatternService<InnerService, InputType, OutputType, ReturnType>
where
    InnerService: Service<OutputType, Response=ReturnType> + Clone + Send + 'static,
    InnerService::Error: Send + 'static,
// We need to specify that the future of the service we are wrapping needs to also be send and 'static
    InnerService::Future: Future<Output=Result<ReturnType, InnerService::Error>> + Send + 'static,
    InputType: Into<OutputType> + Send + 'static,
    OutputType: Send + 'static,
    ReturnType: Send + 'static,
{
    type Response = ReturnType;
    type Error = InnerService::Error;
    type Future = Pin<Box<dyn Future<Output=Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, input: InputType) -> Self::Future {
        let mut inner = self.inner.clone();
        Box::pin(async move {
            inner.call(input.into()).await
        })
    }
}
```

We can see this pattern at work in the [example from the repository](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/main.rs#L28-L38).

```rust
async fn basic_example() {
    // Basic pattern of a layer accepting an input and giving an output
    // NOTE: this pattern is applied both to input and output.
    // In reality, it would be more likely to be applied to just one of them.
    // The other patterns would apply to the other side.
    let mut basic_service = ServiceBuilder::new().layer(BasicPatternLayer::<u8, u16, u32>::default()).service(service_fn(basic_service_fn));
    let input: u8 = 5;
    let output: u32 = basic_service.call(input).await.unwrap();
    assert_eq!(output, 5);
    println!("Basic pattern test passed");
}
```

### I/O Pattern

Most often, you are going to interact with a network socket.
Network sockets provide a read and a write interface.

If you are a server handling a protocol, you would accept a Read and Write pair as input in the I/O pattern.
The Read and Write pair would likely be sent downstream if you are a client handling a protocol.

Sending the Read and Write pair this way is a recommendation; you can structure your code however you like.

[Implementation of IO Pattern](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/pattern_io.rs#L20-L97)
```rust
impl<InnerService, Reader, Writer> Service<(Reader, Writer)> for IoPatternService<InnerService>
where
    InnerService: Service<(ReadHalf<SimplexStream>, WriteHalf<SimplexStream>), Response=()> + Clone + Send + 'static,
    InnerService::Future: Future<Output=Result<InnerService::Response, InnerService::Error>> + Send + 'static,
    InnerService::Error: Send + 'static,
// We need Unpin because otherwise we cannot access the methods of these traits
    Reader: AsyncReadExt + Send + Unpin + 'static,
    Writer: AsyncWriteExt + Send + Unpin + 'static,
{
    // Since all communication is done via the readers and writers, there isn't really a need for a return type
    type Response = ();
    type Error = LayerError<InnerService::Error>;
    type Future = Pin<Box<dyn Future<Output=Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx).map(|result| result.map_err(|err| err.into()))
    }

    fn call(&mut self, (mut input_reader, mut input_writer): (Reader, Writer)) -> Self::Future {
        let mut inner = self.inner.clone();
        Box::pin(async move {
            // We create the read/write pairs that we will use to communicate with the downstream service
            let (read_svc, mut write_this) = simplex(MAX_BUF_SIZE);
            let (mut read_this, write_svc) = simplex(MAX_BUF_SIZE);

            // Now we spawn the downstream inner service because otherwise we would need to poll it to make it progress
            // Calling await on it directly would block the current task, preventing us from relaying messages
            // Because we have so many generics, my IDE isn't prompting with types, so I declared them explicitly here.
            let task: JoinHandle<Result<InnerService::Response, InnerService::Error>> = tokio::spawn(inner.call((read_svc, write_svc)));

            // Ideally everything below would be a loop, but we won't bother with that
            // We would need to handle more conditions than we would like for the purpose of the example

            // Read from the layer input
            let mut input_read_buffer = [0u8; 1024];
            let result_sz = input_reader.read(&mut input_read_buffer).await;
            let sz = match result_sz {
                Ok(0) | Err(_) => {
                    // The other side has closed the connection
                    Err(LayerError::ServiceLayerError("Failed to read from input reader"))
                }
                Ok(sz) => {
                    Ok(sz)
                }
            }?;

            // Now we will reverse the input we received and send it down to the inner service
            let reversed: Vec<u8> = input_read_buffer[..sz].iter().rev().cloned().collect();
            write_this.write_all(&reversed).await.map_err(|_| LayerError::ServiceLayerError("Failed to write to inner service"))?;

            // Let's now read the response from the downstream service
            let sz = read_this.read(&mut input_read_buffer).await.map_err(|_| LayerError::ServiceLayerError("Failed to read from inner service"))?;
            if sz == 0 {
                // The other side has closed the connection
                return Err(LayerError::ServiceLayerError("Failed to read from inner service"));
            }
            // Let's reverse what the downstream service sent
            let reversed: Vec<u8> = input_read_buffer[..sz].iter().rev().cloned().collect();

            // Finally we will write this back to our input
            input_writer.write_all(&reversed).await.map_err(|_| LayerError::ServiceLayerError("Failed to write to input writer"))?;

            // Technically, we should properly handle the spawned task
            // Thankfully, because we aren't doing things in a loop, we can simplify.
            // By dropping all the handlers we own, the invoking function and the downstream service
            // will know to terminate
            drop(input_reader);
            drop(input_writer);
            drop(read_this);
            drop(write_this);

            // Let's politely wait for the task to complete in case it has errored
            let inner_service_result = task.await.map_err(|_| LayerError::ServiceLayerError("Task failed"))?;
            inner_service_result.map_err(|err| LayerError::InnerError(err))?;
            Ok(())
        })
    }
}
```

We can see this in action [here](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/main.rs#L40-L63):
```rust
async fn io_example() {
    // I/O pattern of a layer mediating protocol translation
    // It acts like a server layer would, accepting a read write pair,
    // and it acts like a client, sending a read write pair to the next layer
    let mut io_service = ServiceBuilder::new().layer(IoPatternLayer::default())
        .service(service_fn(io_service_fn));
        
    // We create a read/write pair that we can send into the tower layer, just like we have in the tower layer itself
    let (tower_read, mut this_write) = simplex(1024);
    let (mut this_read, tower_write) = simplex(1024);
    
    // We spawn the service, which will read from the read side and write to the write side
    let task = tokio::spawn(io_service.call((tower_read, tower_write)));
    
    // Lets send a string to the tower layer
    this_write.write_all(b"RapidRecast").await.unwrap();
    
    // And read the response
    let mut buffer = [0u8; 1024];
    let sz = this_read.read(&mut buffer).await.unwrap();
    let response = std::str::from_utf8(&buffer[..sz]).unwrap();
    assert_eq!(response, "!!!RapidRecast ,olleH");
    
    // We can now clean up (make sure everything terminates)
    drop(this_write);
    drop(this_read);
    task.await.unwrap().unwrap();
    println!("I/O pattern test passed");
}
```

### Channel Pattern

This pattern is very similar to the I/O Pattern, but instead of using a Read and Write pair, you use a Receiver and Sender pair.
The most common case is when you have known types (deserialized requests or responses) and need to translate them.

[Implementation of Channel Pattern](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/pattern_chan.rs#L19-L82)
```rust
impl<InnerService, InputType, OutputType> Service<(Receiver<InputType>, Sender<InputType>)> for ChannelPatternService<InnerService, OutputType>
where
// We force the response to be (), but it could be generic and handled in some way
    InnerService: Service<(Receiver<OutputType>, Sender<OutputType>), Response=()> + Clone + Send + 'static,
// We need to declare that the inner service's future is also Send and 'static
// This is because we are sending it to a tokio::spawn call, which requires it to be Send
// and 'static is because the future may outlive this layers lifetime
    InnerService::Future: Future<Output=Result<InnerService::Response, InnerService::Error>> + Send + 'static,
// We also need to make the Error type Send and static, for the same reason
    InnerService::Error: Send + 'static,
    InputType: Into<OutputType> + Send + 'static,
    OutputType: Into<InputType> + Send + 'static,
{
    // Since we are given (Receiver, Sender), we are constantly giving the return values, so we
    // don't have a need for a response type
    type Response = ();
    type Error = LayerError<InnerService::Error>;
    type Future = Pin<Box<dyn Future<Output=Result<Self::Response, Self::Error>> + Send + 'static>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx).map_err(|e| LayerError::InnerError(e))
    }

    fn call(&mut self, (mut input_receiver, mut input_sender): (Receiver<InputType>, Sender<InputType>)) -> Self::Future {
        // The implementation is similar to the IOPatternService
        // We are also doing the same translation of types as we have in the basic service
        let mut inner = self.inner.clone();
        Box::pin(async move {
            // First we will create the channel pairs to communicate with the inner service
            let (sx_svc, mut rx_this) = channel::<OutputType>(1);
            let (sx_this, rx_svc) = channel::<OutputType>(1);

            // Now we will spawn the inner service so it can process in parallel without blocking us
            // We don't need to declare the type explicitly, but it helps the IDE figure things out :)
            let task: JoinHandle<Result<InnerService::Response, InnerService::Error>> = tokio::spawn(inner.call((rx_svc, sx_svc)));

            // Ideally, what follows would be in a loop, but we will simplify it for the example

            // We ready from the input
            let input_message = input_receiver.recv().await;
            let input_message = input_message.ok_or(LayerError::ServiceLayerError("Failed to receive message from input receiver"))?;

            // Send the translated message downstream to the inner service
            sx_this.send(input_message.into()).await.map_err(|_| LayerError::ServiceLayerError("Failed to send message to inner service"))?;

            // Now we wait for the response from the downstream service
            let response = rx_this.recv().await.ok_or(LayerError::ServiceLayerError("Failed to receive response from inner service"))?;

            // And finally send it back to the caller
            input_sender.send(response.into()).await.map_err(|_| LayerError::ServiceLayerError("Failed to send response to caller"))?;

            // Here we do some cleanup to make sure everything shuts down correctly
            drop(input_sender);
            drop(input_receiver);
            drop(rx_this);
            drop(sx_this);
            task.await
                .map_err(|_join_error| LayerError::ServiceLayerError("Failed to join inner service task"))?
                .map_err(|e| LayerError::InnerError(e))?;

            Ok(())
        })
    }
}
```

The [Channel Pattern has a similar usage](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/main.rs#L65-L88) as the I/O Pattern, but with a Receiver and Sender pair.
```rust
async fn channel_example() {
    // The channel pattern behaves similarly to the IO pattern, but it sends types between the layers
    // instead of bytes. This would tend to be the interface that users of the layer would be
    // exposed to - so they can send commands and receive clear responses
    let mut chan_service = ServiceBuilder::new()
        .layer(ChannelPatternLayer::new())
        .service(service_fn(chan_service_fn));

    // We will create the channel pair that we will send to the service.
    let (svc_sender, mut receiver) = channel::<DataTypeA>(1);
    let (mut sender, svc_receiver) = channel::<DataTypeA>(1);
    let task = tokio::spawn(chan_service.call((svc_receiver, svc_sender)));

    // We send an input
    sender.send(DataTypeA(5)).await.unwrap();

    // Receive the output
    let output = receiver.recv().await.unwrap();
    assert_eq!(output.0, 10);

    // Close the task
    task.await.unwrap().unwrap();
    println!("Channel pattern test passed");
}
```

### Handler Pattern

This pattern is controversial, as it isn't quite the intended use of Tower.
In Tower, a Service is the implementation of the handler.
Even if you want a nice trait describing the interface available, you would still contain the trait within the Tower Service.

However, there may be cases where this pattern is better suited.
An example may be when you provide a client with the underlying Service, which provides a request handler.

The primary benefit of this approach (as opposed to the I/O Pattern and Channel Patterns) is that you do not need to spawn the inner Service.
Not spawning the inner Service is a nice choice for people working in embedded environments.

[Implementation of Handler Pattern](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/pattern_handler.rs#L27-L67)
```rust
impl<InnerService, InputHandler, OutputHandler, Message> Service<InputHandler> for HandlerPatternService<InnerService, OutputHandler, Message>
where
    InnerService: Service<(), Response=OutputHandler> + Clone + Send + 'static,
    InnerService::Future: Future<Output=Result<OutputHandler, InnerService::Error>> + Send,
    InputHandler: ServiceHandler<Message> + Send + 'static,
// We do not need to declare 'static because we are no longer spawning
    OutputHandler: ServiceHandler<Message> + Send,
    Message: AddAssign + Send,
{
    type Response = ();
    type Error = LayerError<InnerService::Error>;
    type Future = Pin<Box<dyn Future<Output=Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx).map_err(|e| LayerError::InnerError(e))
    }

    fn call(&mut self, mut input_handler: InputHandler) -> Self::Future {
        let mut inner = self.inner.clone();
        Box::pin(async move {
            // We get the handler from the downstream service
            // Normally, you wouldn't do this, as it could be implemented by a tower Service internally
            // but by having it as a layer, you can do transformations to the message before it is
            // received by the mediating layer
            let mut inner_handler = inner.call(()).await.map_err(|e| LayerError::InnerError(e))?;

            // Lets receive some input and send it to the downstream service
            let input = input_handler.receive_message().await;
            inner_handler.send_message(input).await;

            // Now lets get some output from the downstream service and modify it
            let mut first = inner_handler.receive_message().await;
            let second = inner_handler.receive_message().await;
            first += second;

            // Now we will send it back to the input handler
            input_handler.send_message(first).await;
            Ok(())
        })
    }
}
```

You can see how it is used [here](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/main.rs#L90-L100).
```rust
async fn handler_example() {
    let mut handler_service = ServiceBuilder::new()
        .layer(HandlerPatternLayer::new())
        .service(service_fn(handler_service_fn));

    let mut our_handler = IncrementingHandler::new(654);
    handler_service.call(our_handler.clone()).await.unwrap();

    assert_eq!(our_handler.receive_message().await, 654 + 655);
    println!("Handler pattern test passed");
}
```

### Injector Pattern

The Injector Pattern is a convenient way to solve two problems:
- Intermittent handling of a protocol (such as authentication or authorization)
- Protocol upgrades or any changes off the obvious path of protocol handling

It is worth highlighting that Tower is designed so that protocol upgrades are handled by a separate Layer that either catches and consumes input or forwards it onto the Service.
However, you may still want to use this pattern in certain situations, such as when Layers or Services don't allow such flexibility.

[Implementation of Injector Pattern](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/pattern_injected.rs#L24-L55)
```rust
impl<InnerService, Handler, Message> Service<Message> for InjectedPatternService<InnerService, Handler, Message>
where
    InnerService: Service<Message, Response=Message> + Clone + Send + 'static,
    InnerService::Error: Send + 'static,
    InnerService::Future: Send + 'static,
    Handler: ServiceHandler<Message> + Clone + Send + 'static,
    Message: Send + 'static,
{
    type Response = ();
    type Error = LayerError<InnerService::Error>;
    type Future = Pin<Box<dyn Future<Output=Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx).map_err(|e| LayerError::InnerError(e))
    }

    fn call(&mut self, req: Message) -> Self::Future {
        let mut inner = self.inner.clone();
        let mut handler = self.handler.clone();
        Box::pin(async move {
            // We send whatever input we have to the internal handler
            handler.send_message(req).await;
            // We receive the response from the internal handler
            let response = handler.receive_message().await;
            // We send the response to the inner service
            let response = inner.call(response).await.map_err(|e| LayerError::InnerError(e))?;
            // We send the final result back to the internal handler
            handler.send_message(response).await;
            Ok(())
        })
    }
}
```

The following gives an [overview of how it could be used](https://github.com/rapidrecast/blog-post-snippets/blob/dfe575568266f56da6dc39d0a26c84869efd0a5b/blog-20250206-tower-patterns/src/main.rs#L102-L118)
```rust
async fn injected_example() {
    // First we create our internal handler
    let mut internal_handler = IncrementingHandler::new(100);

    // Now we will create the tower stack, including our handler as part of the layer
    let mut injected_service = ServiceBuilder::new()
        .layer(InjectedPatternLayer::new(internal_handler.clone()))
        .service(service_fn(handle_injected_fn));

    // We invoke the tower call, which effectively would handle our entire protocol using the
    // internal handler
    injected_service.call(200).await.unwrap();

    let final_result = internal_handler.receive_message().await;
    assert_eq!(final_result, 200 * 2);
    println!("Injected pattern test passed");
}
```

## Conclusions

Lately, I’ve been diving deep into Tower while building RapidRecast, and it’s been an incredible journey.
I need precise control over the protocols I offer.
This led me to create [Proto-Tower](https://github.com/rapidrecast/proto-tower), where I explore how different protocols interact seamlessly.

While Tower is a powerful framework, it does come with its design challenges.
With the right approach, you can achieve just about anything.
Hopefully, the patterns I’ve shared will help you navigate Tower more effectively and build better, more scalable systems.
