import React from "react";
import { Code, Lightbulb, MessageCircle, Users } from "lucide-react";

const HelloWorld = ({ darkMode }) => {
  const languages = [
    {
      name: "Python",
      code: `print("Hello World")`,
      contributor: "Mizari",
    },
    {
      name: "C#",
      code: `using System;

class Program{
  static void Main(string[] args){
    Console.Write("Hello World");
  }
}`,
      contributor: "Mizari",
    },
    {
      name: "JavaScript",
      code: `console.log("Hello World");`,
      contributor: "Mizari",
    },
    {
      name: "Java",
      code: `System.out.print("Hello World");`,
      contributor: "Mizari",
    },
    {
      name: "PHP",
      code: `<?php
  echo "Hello World";
?>`,
      contributor: "Mizari",
      note: "Displays on a web page (not in the console)",
    },
    {
      name: "HTML",
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>Hello World</title>
  </head>
  <body>
    <p>Hello World</p>
  </body>
</html>`,
      contributor: "Mizari",
      note: "Displays on a web page",
    },
    {
      name: "Bash",
      code: `echo 'Hello World'`,
      contributor: "Mizari",
    },
    {
      name: "GameMaker Language (GML)",
      code: `show_debug_message("Hello World");`,
      contributor: "Mizari",
    },
    {
      name: "Unity (C#)",
      code: `Debug.Log("Hello World");`,
      contributor: "Mizari",
      note: "Unity's own console",
    },
    {
      name: "Scratch",
      code: `// "say [Hello World]" block`,
      contributor: "Mizari",
      note: "Visual, block-based language",
    },
    {
      name: "Intel x86 Assembly",
      code: `section .data
    hello db 'Hello World!',0

section .text
    global _start

_start:
    mov eax, 4
    mov ebx, 1
    mov ecx, hello
    mov edx, 12
    int 0x80

    mov eax, 1
    xor ebx, ebx
    int 0x80`,
      contributor: "Osiris",
    },
    {
      name: "Brainfuck",
      code: `>+++++++++[<++++++++>-]<.>+++++++[<++++>-]<+.+++++++..+++.>>>++++++++[<++++>-]<.>>>++++++++++[<+++++++++>-]<---.<<<<.+++.------.--------.>>+.>++++++++++.`,
      contributor: "Osiris",
      note: "Esoteric language",
    },
    {
      name: "Golang (Go)",
      code: `package main

import "fmt"

func main() {
  fmt.Println("Hello World!")
}`,
      contributor: "Grim",
    },
    {
      name: "Q#",
      code: `namespace HelloWorld {
    open Microsoft.Quantum.Primitive;

    @EntryPoint()
    operation HelloQ() : Unit {
        Message("Hello, World!");
    }
}`,
      contributor: "Osiris",
      note: "Quantum programming language",
    },
    {
      name: "Chef",
      code: `Hello World Cake with Chocolate sauce.

Ingredients.
33 g chocolate chips
100 g butter
54 ml double cream
2 pinches baking powder
114 g sugar
111 ml beaten eggs
119 g flour
32 g cocoa powder

Method.
Put chocolate chips into the mixing bowl.
Put butter into the mixing bowl.
Put sugar into the mixing bowl.
Put beaten eggs into the mixing bowl.
Put flour into the mixing bowl.
Put baking powder into the mixing bowl.
Put cocoa powder into the mixing bowl.
Stir the mixing bowl for 1 minute.
Combine double cream into the mixing bowl.
Pour contents into the baking dish.
Serve with chocolate sauce.`,
      contributor: "Deleted User",
      note: "An esoteric language that looks like a cooking recipe!",
    },
    {
      name: "RISC-V32i Assembly (Linux)",
      code: `.data
hello:  .asciz "Hello world!"

.text
main:
  la a0, hello
  addi a7, zero, 4
  ecall

  addi a7, zero, 10
  ecall`,
      contributor: "Node",
    },
    {
      name: "Rust",
      code: `fn main() {
    println!("Hello World!");
}`,
      contributor: "Node",
    },
    {
      name: "Boo",
      code: `print "Hello, World!"
//    OR
print("Hello, World!")`,
      contributor: "Mizari",
      note: "Language inspired by Python",
    },
    {
      name: "Lua",
      code: `print("Hello World")`,
      contributor: "Mizari",
    },
    {
      name: "Unreal Engine (C++)",
      code: `UE_LOG(LogTemp, Warning, TEXT("Hello World"));`,
      contributor: "Mizari",
      note: "Unreal Engine's own console",
    },
    {
      name: "VBScript",
      code: `msgbox "Hello World"`,
      contributor: "x1",
    },
    {
      name: "Visual Basic .NET",
      code: `Imports System.Console

Class HelloWorld
    Public Shared Sub Main()
        WriteLine("Hello, world!")
    End Sub
End Class`,
      contributor: "x1",
    },
    {
      name: "LLVM IR",
      code: `target triple = "x86_64-unknown-linux-gnu"

@.hello = constant [13 x i8] c"Hello World\\0A\\00"

define i32 @main() #0 {
  %1 = call i32 (i8*, ...) @printf(i8* getelementptr ([13 x i8], [13 x i8]* @.hello))
  ret i32 0
}

declare i32 @printf(i8* noundef, ...) #1`,
      contributor: "Node",
    },
    {
      name: "COBOL",
      code: `IDENTIFICATION DIVISION.
   PROGRAM-ID. HelloWorld.
   PROCEDURE DIVISION.
   DISPLAY 'Hello, World!'.
   STOP RUN.`,
      contributor: "raiizer",
    },
    {
      name: "MALBOLGE",
      code: `('&%:9]!~}|z}z2Vxwvut`,
      contributor: "raiizer",
      note: "One of the hardest languages in the world!",
    },
    {
      name: "APL",
      code: `'Hello, World!'`,
      contributor: "raiizer",
    },
    {
      name: "Haskell",
      code: `main = putStrLn "Hello, World!"`,
      contributor: "raiizer",
    },
    {
      name: "ARMv7 Assembly (Arch Linux)",
      code: `.section .data
message:
    .asciz "Hello, World!\\n"

.section .text
.global _start

_start:
    mov r7, #4
    mov r0, #1
    ldr r1, =message
    mov r2, #13
    svc 0

    mov r7, #1
    mov r0, #0
    svc 0`,
      contributor: "raiizer",
    },
  ];

  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        A little thread showing how to print "Hello World" to the console in
        every language!
      </p>

      <div
        className={`mb-8 p-4 rounded border bg-surface border-line`}
      >
        <div className="flex items-start gap-3">
          <Users
            className={`h-5 w-5 mt-0.5 flex-shrink-0 text-accent`}
          />
          <div>
            <p
              className={`font-semibold mb-2 text-ink`}
            >
              Collaborative thread
            </p>
            <p
              className={`text-sm text-subtle`}
            >
              Contributors: Mizari, Osiris, Grim, Node, x1, raiizer and other
              members of the community!
            </p>
          </div>
        </div>
      </div>

      <div
        className={`mb-8 p-4 rounded bg-surface border-line`}
      >
        <div className="flex items-start gap-3">
          <MessageCircle
            className={`h-5 w-5 mt-0.5 flex-shrink-0 text-accent`}
          />
          <div>
            <p
              className={`font-semibold mb-2 text-ink`}
            >
              Want to contribute?
            </p>
            <p
              className={`text-sm text-subtle`}
            >
              Feel free to add the languages you know in the{" "}
              <a
                href="https://discord.gg/WUhvBf6vqw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-blue-600 underline font-semibold"
              >
                Discord thread
              </a>{" "}
              and let an admin know if you'd like your contribution to appear in
              this thread on the site!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {languages.map((lang, index) => (
          <div
            key={index}
            className={`rounded border overflow-hidden bg-surface border-line transition-colors`}
          >
            <div
              className={`px-5 py-3 flex items-center justify-between bg-surface`}
            >
              <div className="flex items-center gap-3">
                <Code
                  className={`h-5 w-5 text-accent`}
                />
                <h3
                  className={`text-lg font-bold text-ink`}
                >
                  {lang.name}
                </h3>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full bg-surface text-subtle`}
              >
                by {lang.contributor}
              </span>
            </div>

            {lang.note && (
              <div
                className={`px-5 py-2 text-sm italic bg-surface text-warning`}
              >
                <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> {lang.note}
              </div>
            )}

            <div className={`p-5`}>
              <pre
                className={`p-4 rounded overflow-x-auto text-sm bg-surface`}
              >
                <code className="text-positive font-mono">{lang.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-12 p-6 rounded text-center border-line`}
      >
        <h3
          className={`text-xl font-bold mb-3 text-ink`}
        >
          The full collection
        </h3>
        <p className={`mb-4 text-subtle`}>
          Want to see even more languages?
        </p>
        <a
          href="http://helloworldcollection.de/"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded font-medium transition-all bg-surface text-accent hover:bg-blue-500/30`}
        >
          The Hello World Collection
          <Code className="h-4 w-4" />
        </a>
        <p
          className={`mt-2 text-xs text-subtle`}
        >
          The largest collection of Hello World programs on the Internet!
        </p>
      </div>
    </div>
  );
};

export default HelloWorld;
