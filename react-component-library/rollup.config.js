import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";
import packageJson from "./package.json" with { type: "json" };

export default [
  {
    input: "src/index.ts",
    external: [
      "react", 
      "react-dom", 
      "next", 
      "next/link", 
      "next/image", 
      "next/navigation",
      "lottie-web",
      "clsx",
      /@heroui\/.*/,
      /react\/.*/
    ],
    output: [
      {
        dir: "dist/cjs",
        format: "cjs",
        sourcemap: true,
        entryFileNames: "index.js",
      },
      {
        dir: "dist/esm", 
        format: "esm",
        sourcemap: true,
        entryFileNames: "index.js",
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({ 
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationDir: undefined,
        outDir: undefined
      }),
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];