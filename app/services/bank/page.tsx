import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "全球银行开户",
  description: "美国、香港、新加坡等主流银行账户开设服务，全程线上办理，专业指导。",
}

export default function BankPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-primary">全球银行开户服务</h1>
        <p className="mt-4 text-lg text-gray-600">
          覆盖美国、香港、新加坡等主流金融中心，协助您轻松开设海外银行账户。
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { country: "美国", banks: "Chase, BOA, Citi, Wells Fargo 等", desc: "无需赴美，远程视频开户", icon: "🇺🇸" },
          { country: "香港", banks: "汇丰、渣打、中银、恒生 等", desc: "门槛低，资料简单，最快3个工作日", icon: "🇭🇰" },
          { country: "新加坡", banks: "DBS, OCBC, UOB 等", desc: "亚洲金融中心，多币种账户", icon: "🇸🇬" },
        ].map((item) => (
          <div key={item.country} className="rounded-xl border border-gray-200 bg-white p-6">
            <span className="text-3xl">{item.icon}</span>
            <h3 className="mt-3 text-lg font-semibold text-primary">{item.country}</h3>
            <p className="mt-1 text-sm text-gray-500">{item.banks}</p>
            <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-primary/5 p-8">
        <h2 className="text-xl font-semibold text-primary">开户流程</h2>
        <ol className="mt-4 space-y-3 text-gray-600">
          <li className="flex gap-2"><span className="font-bold text-primary">1.</span> 咨询需求，确定开户国家和银行</li>
          <li className="flex gap-2"><span className="font-bold text-primary">2.</span> 准备所需资料（护照、地址证明等）</li>
          <li className="flex gap-2"><span className="font-bold text-primary">3.</span> 填写开户申请表并提交</li>
          <li className="flex gap-2"><span className="font-bold text-primary">4.</span> 银行审核，视频面签</li>
          <li className="flex gap-2"><span className="font-bold text-primary">5.</span> 账户开通，激活使用</li>
        </ol>
        <div className="mt-6 text-center">
          <Link href="/contact" className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-light">
            立即咨询开户
          </Link>
        </div>
      </section>
    </div>
  )
}
