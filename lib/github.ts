const GITHUB_OWNER = "davidvisa"
const GITHUB_REPO = "finance.vias.cn"
const GITHUB_BRANCH = "main"

function getHeaders() {
  const token = process.env.GITHUB_TOKEN
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "ViaFinance",
  }
}

export async function getFileSha(path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      { headers: getHeaders() }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.sha || null
  } catch {
    return null
  }
}

export async function commitFile(path: string, content: string, message: string) {
  const sha = await getFileSha(path)
  const body: any = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: GITHUB_BRANCH,
  }
  if (sha) body.sha = sha

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub API write failed: ${res.status} ${err}`)
  }
  return res.json()
}

export async function deleteFile(path: string, message: string) {
  const sha = await getFileSha(path)
  if (!sha) return

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: "DELETE",
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub API delete failed: ${res.status} ${err}`)
  }
}

export async function readFile(path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      { headers: getHeaders() }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.content) {
      return Buffer.from(data.content, "base64").toString("utf-8")
    }
    return null
  } catch {
    return null
  }
}
