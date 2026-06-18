import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "ViaFinance - 全球财经资讯平台", template: "%s | ViaFinance" },
  description: "提供全球银行开户、全球股市开户、香港储蓄保险等跨境金融服务，每日更新财经资讯与市场分析。",
  keywords: ["全球银行开户", "美股开户", "港股开户", "香港储蓄保险", "跨境金融", "财经资讯"],
  openGraph: { type: "website", locale: "zh_CN", siteName: "ViaFinance" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-bg-light text-gray-900 antialiased">
        <Header />
        <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-7xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <a href="/" className="text-xl font-bold text-primary">
          Via<span className="text-accent">Finance</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="/articles" className="text-sm font-medium text-gray-600 hover:text-primary">财经资讯</a>
          <a href="/services/bank" className="text-sm font-medium text-gray-600 hover:text-primary">全球银行开户</a>
          <a href="/services/stock" className="text-sm font-medium text-gray-600 hover:text-primary">全球股市开户</a>
          <a href="/services/insurance" className="text-sm font-medium text-gray-600 hover:text-primary">香港储蓄保险</a>
          <a href="/contact" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light">联系我们</a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} ViaFinance. All rights reserved.</p>
        <p className="mt-1">专业跨境金融服务平台</p>
      </div>
    </footer>
  )
}
