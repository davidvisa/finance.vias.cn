interface WeChatConfig {
  appid: string
  appsecret: string
}

async function getAccessToken(config: WeChatConfig): Promise<string> {
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.appsecret}`
  )
  const data = await res.json()
  if (data.errcode) throw new Error(`微信token获取失败: ${data.errmsg}`)
  return data.access_token
}

export async function publishToWeChat(
  config: WeChatConfig,
  article: { title: string; content: string; summary?: string }
): Promise<{ ok: boolean; msg?: string }> {
  try {
    const token = await getAccessToken(config)

    const body = {
      articles: [
        {
          title: article.title,
          content: article.content.replace(/\n/g, "<br>"),
          digest: article.summary || "",
          need_open_comment: 0,
          only_fans_can_comment: 0,
        },
      ],
    }

    const draftRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${token}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    )
    const draftData = await draftRes.json()
    if (draftData.errcode) {
      if (draftData.errcode === 48001) {
        return { ok: false, msg: "公众号未获得API发布权限，请先在公众号后台设置" }
      }
      throw new Error(`微信草稿创建失败: ${draftData.errmsg}`)
    }

    const draftId = draftData.media_id
    const publishRes = await fetch(
      `https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=${token}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draft_id: draftId }) }
    )
    const publishData = await publishRes.json()
    if (publishData.errcode) {
      throw new Error(`微信发布失败: ${publishData.errmsg}`)
    }

    return { ok: true, msg: `发布成功，发布ID: ${publishData.publish_id}` }
  } catch (e: any) {
    return { ok: false, msg: e.message }
  }
}
