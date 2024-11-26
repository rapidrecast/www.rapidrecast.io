---
title: "Rust Lifetimes Primer"
description: "Rust Lifetimes Explained Technically"
summary: "By the end of this article, you will know what Rust lifetimes are and how to organise your code to make lifetimes convenient to use."
date: 2024-11-26T12:15:00+00:00
lastmod: 2024-11-26T12:15:00+00:00
draft: false
weight: 50
categories: []
tags: [rust, java]
contributors:
  - Hugh Kaznowski
pinned: false
homepage: false
seo:
  title: "Rust Lifetimes Primer"
  description: "Rust Lifetimes Explained Technically"
  canonical: "" # custom canonical URL (optional)
  noindex: false # false (default) or true
---

# Rust's signature feature: Lifetimes

If you have heard of Rust, you have undoubtedly encountered Lifetimes.
Lifetimes are a way of handling pointers that are proven safe at compile time.

Many languages either do not enforce pointer correctness or enforce it at runtime by allocating memory to the heap and using reference counting.

When pointers are invalid, broken pointers can lead to security vulnerabilities in your program (by trying to modify the pointer address to benefit the hacker).

Other languages, particularly the most common runtime-evaluation languages, use reference counting instead. The language supports reference counting by allocating memory to the heap. The heap allocation prevents the operating system from removing the memory at the end of the function call. Heap allocation can be costly in some circumstances since it requires coordinating which parts of memory are available and reserving blocks so that these requests aren't too frequent.

An example demonstrating why heap allocation is necessary can be seen here in Java.

```java
import java.util.Arrays;

class Main {
    static void main() {
        int[] numbers = new int[1_000_000];
        moveLargeDataToAnotherFunction(numbers);
    }

    static void moveLargeDataToAnotherFunction(int[] array) {
        System.out.println("Array size: " + array.length);
    }
}
```

In the example above, even though we declare our 1 million numbers in the stack, the allocation goes to the heap.
So when we call another function, we are not moving 1 million numbers—we are moving a pointer to 1 million numbers.
This is much faster and, for what Java wants to achieve, safer.

Rust includes a language feature that allows for safely referencing memory so that you know the safety guarantees the references provide at any point. Hence, the term "fearless concurrency" is thrown around.

# Stack and heap memory

Before we discuss how Rust borrows should be handled, let's examine Stack and Heap memory.

The Stack memory is the memory allocated to run a particular function in your code. It has a known and fixed size (any invocation of the same function will always require the same amount of memory), but the size of the stack allocation can vary—this is called the stack frame.

We call this part of the memory the stack because calling a function causes the operating system to add the required memory to the existing allocation.
Growing the stack is incredibly simple, predictable, and very fast.
The additional benefit of allocating memory by growing the stack is that child functions effectively have access to the memory of all the parent functions and are perfect for handling pointers to data they do not own.

Heap memory differs because it belongs to a separate part of the program's memory.
There are many abstractions between what you see as a programmer and what is happening on the hardware, so predicting precisely how memory allocation behaves can be challenging.
Consequently, reducing uncontrollable memory access from the heap to more controlled areas like the stack can greatly improve performance.

# Rust borrows

Rust is designed to encourage using pointers that do not require reference counting.
As we mentioned earlier, functions that are invoked by other functions have access to the memory of all the functions before it.
Child functions are the perfect use case to reduce the amount of memory copied by using a single pointer instead.

Consider this example

```Rust
fn main() {
    let mut numbers: [u8; 1_000_000] = [1; 1_000_000];
    let total = modify_and_sum(&mut numbers);
    println!("Total sum: {}", total);
}

fn modify_and_sum(numbers: &mut [u8]) -> u64 {
    numbers[0] = 42;
    calculate_sum(numbers)
}

fn calculate_sum(numbers: &[u8]) -> u64 {
    numbers.iter().map(|&n| n as u64).sum()
}
```

In this example, we declare 1 million single-byte numbers.
Instead of passing the 1 million bytes down, we pass the reference to it, which will be a pointer.
The pointer size varies between computers, but on a 64-bit Linux system, it is 8 bytes.

After we have declared our numbers, we pass them as a mutable reference to the modify_and_sum function.
Your program can only have a single mutable reference in any part of the code.
This single mutable reference constraint exists to prevent other functions from modifying the reference under concurrent situations.

```java
import java.util.Arrays;

class DataCounter {
    private int[] data;
    private int sum;

    public DataCounter(int[] data) {
        this.data = data;
        this.sum = Arrays.stream(data).sum();
    }

    public int getSum() {
        return this.sum;
    }
}

public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        DataCounter counter = new DataCounter(numbers);

        System.out.println("Initial sum: " + counter.getSum());

        numbers[0] = 42;

        System.out.println("Sum after modification: " + counter.getSum());
    }
}
```

Handling mutable references can be quite gnarly when implementing helper structs, so it is not uncommon to have them passed as function parameters and not stored inside structs.

# Utilising lifetimes for convenience

Our first example used functions to handle our pointers.
While functions are nice, bundling collections of functions together is incredibly convenient.

Fortunately, you can create structs that hold pointers and provide convenient access methods in Rust.

```Rust
struct NumberProcessor<'a> {
    numbers: &'a mut [u8],
}

impl<'a> NumberProcessor<'a> {
    fn modify(&mut self) {
        self.numbers[0] = 42;
    }

    fn calculate_sum(&self) -> u64 {
        self.numbers.iter().map(|&n| n as u64).sum()
    }
}

fn main() {
    let mut numbers: [u8; 1_000_000] = [1; 1_000_000];
    let mut processor = NumberProcessor { numbers: &mut numbers };

    processor.modify();
    let total = processor.calculate_sum();

    println!("Total sum: {}", total);
}
```

In the above example, we have created a NumberProcessor that holds the borrowed reference to the underlying data.
It stores the reference as a mutable reference, so the code can no longer access it outside of this struct.
You can access the reference by anything that NumberProcessor calls since the NumberProcessor has "borrowed" the ownership of the pointer and controls how it is accessed.

If you would like to test your understanding of what you have learnt, why not try copying this snippet to [Rust Playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=aef3be0c80c9bc831019fc4578049520) and creating another struct that handles the calculate sum part?
It would have to be owned by NumberProcessor (easy) or borrow a reference from NumberProcessor to work (hard).

Let me know how you get on with the exercise!
