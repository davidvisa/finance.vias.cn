import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const name = form.get("name")
    const contact = form.get("contact")
    const service = form.get("service")
    const message = form.get("message")

    const payload = {
      msgtype: "markdown",
      markdown: {
        content: `# 新的咨询提交
**姓名**: ${name || "未填写"}
**联系方式**: ${contact || "未填写"}
**需求类型**: ${service || "未填写"}
**备注**: ${message || "无"}`,
      },
    }

    const webhookUrl = process.env.WECOM_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }

    return NextResponse.redirect(new URL("/contact?success=1", request.url))
  } catch {
    return NextResponse.redirect(new URL("/contact?error=1", request.url))
  }
}
