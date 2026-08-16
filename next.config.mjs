/** @type {import('next').NextConfig} */
// GitHub Pages 项目站部署在子路径（/<repo>/）下。
// 通过 NEXT_PUBLIC_BASE_PATH 注入子路径前缀（如 /Anti-fraud.github.io），
// 本地开发不设置该变量时为空字符串，行为与根路径部署一致。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // 静态站点导出：npm run build 后生成 out/，适配 GitHub Pages
  output: "export",
  basePath,
};

export default nextConfig;
