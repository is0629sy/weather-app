import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;

let assetPrefix = "";
let basePath = "";

if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  // GITHUB_REPOSITORY は "username/repo-name" の形式なのでリポジトリ名だけを抽出します
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, "");
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Static Exportでは必須
  },
  assetPrefix,
  basePath,
};

export default nextConfig;
