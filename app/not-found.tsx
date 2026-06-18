import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-lg text-gray-600">页面未找到</p>
      <Link href="/" className="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light">
        返回首页
      </Link>
    </div>
  )
}
