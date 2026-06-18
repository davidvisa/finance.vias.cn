import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "联系我们",
  description: "对全球银行开户、全球股市开户、香港储蓄保险感兴趣？联系我们获取专业咨询。",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-primary">联系我们</h1>
        <p className="mt-4 text-gray-600">
          填写以下信息，我们的专业顾问将在 24 小时内与您联系。
        </p>
      </section>

      <form
        action="/api/contact"
        method="POST"
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-8"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">姓名</label>
          <input id="name" name="name" required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">微信 / 电话</label>
          <input id="contact" name="contact" required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">需求类型</label>
          <select id="service" name="service" required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">请选择</option>
            <option value="bank">全球银行开户</option>
            <option value="stock">全球股市开户</option>
            <option value="insurance">香港储蓄保险</option>
            <option value="other">其他咨询</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">备注</label>
          <textarea id="message" name="message" rows={4} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <button type="submit" className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light">
          提交咨询
        </button>
      </form>
    </div>
  )
}
