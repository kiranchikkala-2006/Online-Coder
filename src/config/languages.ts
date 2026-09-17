import { LanguageConfig, SupportedLanguageId } from '../types/index.ts';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: 'python',
    name: 'Python',
    category: 'Interpreted',
    icon: '🐍',
    extension: '.py',
    filename: 'main.py',
    monacoLang: 'python',
    version: '3.11 (Alpine)',
    dockerImage: 'codeforge-python:latest',
    compileCmd: null,
    runCmd: 'python3 main.py',
    description: 'High-level, dynamically typed language prized for readable syntax, data science, and web scripting.',
    popular: true,
    defaultCode: `# Starter Program
print("Hello, World!")
`
  },
  {
    id: 'cpp',
    name: 'C++',
    category: 'Compiled',
    icon: '⚡',
    extension: '.cpp',
    filename: 'main.cpp',
    monacoLang: 'cpp',
    version: 'C++17 (GCC 13)',
    dockerImage: 'codeforge-cpp:latest',
    compileCmd: 'g++ -O2 -std=c++17 main.cpp -o program',
    runCmd: './program',
    description: 'High-performance compiled systems language widely used in game engines, competitive programming, and OS kernels.',
    popular: true,
    defaultCode: `// Starter Program
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`
  },
  {
    id: 'c',
    name: 'C',
    category: 'Compiled',
    icon: '⚙️',
    extension: '.c',
    filename: 'main.c',
    monacoLang: 'c',
    version: 'C11 (GCC 13)',
    dockerImage: 'codeforge-c:latest',
    compileCmd: 'gcc -O2 main.c -o program',
    runCmd: './program',
    description: 'Foundational procedural language providing direct memory manipulation and ultra-low overhead.',
    popular: false,
    defaultCode: `// Starter Program
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java',
    category: 'Enterprise',
    icon: '☕',
    extension: '.java',
    filename: 'Main.java',
    monacoLang: 'java',
    version: 'OpenJDK 17 LTS',
    dockerImage: 'codeforge-java:latest',
    compileCmd: 'javac Main.java',
    runCmd: 'java Main',
    description: 'Robust, object-oriented enterprise standard runtime with automatic garbage collection and rich standard libraries.',
    popular: true,
    defaultCode: `// Starter Program
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Web & Scripting',
    icon: '🟨',
    extension: '.js',
    filename: 'main.js',
    monacoLang: 'javascript',
    version: 'Node.js 20 LTS',
    dockerImage: 'codeforge-javascript:latest',
    compileCmd: null,
    runCmd: 'node main.js',
    description: 'The universal language of the modern web, powered by the V8 JavaScript runtime engine.',
    popular: true,
    defaultCode: `// Starter Program
console.log("Hello, World!");
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Web & Scripting',
    icon: '🔷',
    extension: '.ts',
    filename: 'main.ts',
    monacoLang: 'typescript',
    version: 'TypeScript 5.x',
    dockerImage: 'codeforge-typescript:latest',
    compileCmd: null,
    runCmd: 'tsx main.ts',
    description: 'Typed superset of JavaScript that compiles to clean JavaScript with static type checking.',
    popular: true,
    defaultCode: `// Starter Program
console.log("Hello, World!");
`
  },
  {
    id: 'go',
    name: 'Go',
    category: 'Systems',
    icon: '🐹',
    extension: '.go',
    filename: 'main.go',
    monacoLang: 'go',
    version: 'Go 1.22',
    dockerImage: 'codeforge-go:latest',
    compileCmd: 'go build -o program main.go',
    runCmd: './program',
    description: 'Google-developed compiled language known for exceptional concurrency, fast build times, and minimalism.',
    popular: false,
    defaultCode: `// Starter Program
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`
  },
  {
    id: 'rust',
    name: 'Rust',
    category: 'Systems',
    icon: '🦀',
    extension: '.rs',
    filename: 'main.rs',
    monacoLang: 'rust',
    version: 'Rust 1.77',
    dockerImage: 'codeforge-rust:latest',
    compileCmd: 'rustc main.rs -o program',
    runCmd: './program',
    description: 'Blazingly fast and memory-efficient systems language guaranteeing thread-safety and memory safety without a GC.',
    popular: true,
    defaultCode: `// Starter Program
fn main() {
    println!("Hello, World!");
}
`
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    category: 'Enterprise',
    icon: '🟣',
    extension: '.kt',
    filename: 'Main.kt',
    monacoLang: 'kotlin',
    version: 'Kotlin (JVM)',
    dockerImage: 'codeforge-kotlin:latest',
    compileCmd: 'kotlinc Main.kt -include-runtime -d Main.jar',
    runCmd: 'java -jar Main.jar',
    description: 'Modern, concise JVM language created by JetBrains, full interoperability with Java and standard for Android.',
    popular: false,
    defaultCode: `// Starter Program
fun main() {
    println("Hello, World!")
}
`
  },
  {
    id: 'php',
    name: 'PHP',
    category: 'Web & Scripting',
    icon: '🐘',
    extension: '.php',
    filename: 'index.php',
    monacoLang: 'php',
    version: 'PHP 8.3 CLI',
    dockerImage: 'codeforge-php:latest',
    compileCmd: null,
    runCmd: 'php index.php',
    description: 'Widely used open source server-side scripting language powering dynamic backends and web services worldwide.',
    popular: false,
    defaultCode: `<?php
// Starter Program
echo "Hello, World!\\n";
?>`
  }
];

export const LANGUAGE_MAP = new Map<SupportedLanguageId, LanguageConfig>(
  SUPPORTED_LANGUAGES.map(l => [l.id, l])
);

export function getLanguageConfig(id: SupportedLanguageId): LanguageConfig {
  return LANGUAGE_MAP.get(id) || SUPPORTED_LANGUAGES[0];
}

export function detectLanguageFromFilename(filename: string): SupportedLanguageId | null {
  const lower = filename.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lower.endsWith(lang.extension)) {
      return lang.id;
    }
  }
  return null;
}
