import { BaseAsyncPlugin, registerGlobalPlugin } from "./manager";
import type { SearchResult } from "../types/models";
import { ofetch } from "ofetch";

type ApiItem = {
  vod_id: number;
  vod_name: string;
  vod_actor?: string;
  vod_director?: string;
  vod_down_from?: string;
  vod_down_url?: string;
  vod_remarks?: string;
  vod_pubdate?: string;
  vod_area?: string;
  vod_year?: string;
};

type ApiResponse = { code: number; msg: string; list: ApiItem[] };

const PWD_RE = /\?pwd=([0-9a-zA-Z]+)/;

function determineType(apiType: string, url: string): string {
  const upper = (apiType || "").toUpperCase();
  const u = url.toLowerCase();
  const quick = (cond: boolean, t: string) => (cond ? t : "");
  switch (upper) {
    case "BD":
      return quick(u.includes("pan.baidu.com/s/"), "baidu");
    case "KG":
      return quick(u.includes("pan.quark.cn/s/"), "quark");
    case "UC":
      return quick(u.includes("drive.uc.cn/s/"), "uc");
    case "ALY":
      return quick(
        u.includes("aliyundrive.com/s/") || u.includes("alipan.com/s/"),
        "aliyun"
      );
    case "XL":
      return quick(u.includes("pan.xunlei.com/s/"), "xunlei");
    case "TY":
      return quick(u.includes("cloud.189.cn/t/"), "tianyi");
    case "115":
      return quick(u.includes("115.com/s/"), "115");
    case "MB":
      return quick(u.includes("feixin.10086.cn"), "mobile");
    case "WY":
      return quick(u.includes("share.weiyun.com"), "weiyun");
    case "LZ":
      return quick(u.includes("lanzou") || u.includes("lanzo"), "lanzou");
    case "JGY":
      return quick(u.includes("jianguoyun.com/p/"), "jianguoyun");
    case "123":
      return quick(u.includes("123pan.com/s/"), "123");
    case "PIKPAK":
      return quick(u.includes("mypikpak.com/s/"), "pikpak");
    default:
      if (u.startsWith("magnet:")) return "magnet";
      if (u.startsWith("ed2k://")) return "ed2k";
      if (u.includes("pan.quark.cn/s/")) return "quark";
      if (u.includes("drive.uc.cn/s/")) return "uc";
      if (u.includes("pan.baidu.com/s/")) return "baidu";
      if (u.includes("aliyundrive.com/s/") || u.includes("alipan.com/s/"))
        return "aliyun";
      if (u.includes("pan.xunlei.com/s/")) return "xunlei";
      if (u.includes("cloud.189.cn/t/")) return "tianyi";
      if (u.includes("115.com/s/")) return "115";
      return "";
  }
}

function parseLinks(fromStr: string, urlStr: string) {
  const fromParts = (fromStr || "").split("$$$");
  const urlParts = (urlStr || "").split("$$$");
  const min = Math.min(fromParts.length, urlParts.length);
  const links: SearchResult["links"] = [];
  for (let i = 0; i < min; i += 1) {
    const apiType = (fromParts[i] || "").trim();
    const u = (urlParts[i] || "").trim();
    if (!u) continue;
    const type = determineType(apiType, u);
    if (!type) continue;
    const m = u.match(PWD_RE);
    const password = m ? m[1] : "";
    links.push({ type, url: u, password });
  }
  return links;
}

const WANOU_BASES = [
  "https://woog.nxog.eu.org",
  "https://wanou.nxog.eu.org",
  "https://api.nxog.eu.org",
];

export class WanouPlugin extends BaseAsyncPlugin {
  constructor() {
    super("wanou", 1);
  }
  override async search(
    keyword: string,
    ext?: Record<string, any>
  ): Promise<SearchResult[]> {
    const timeout = Math.max(
      3000,
      Number((ext as any)?.__plugin_timeout_ms) || 8000
    );
    const queries = [(keyword || "").trim()].filter(Boolean);
    if (queries[0]?.length <= 1) queries.push("电影", "movie", "1080p");

    for (const kw of queries) {
      const tasks = WANOU_BASES.map((base) =>
        ofetch<ApiResponse>(
          `${base}/api.php/provide/vod?ac=detail&wd=${encodeURIComponent(
            kw
          )}` as string,
          {
            headers: {
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
              accept: "application/json, text/plain, */*",
              referer: `${base}/`,
            },
            timeout,
          }
        ).catch(() => ({ code: -1, msg: "error", list: [] }))
      );
      const resps = await Promise.all(tasks);
      const list: ApiItem[] = [];
      for (const r of resps)
        if (r && r.code === 1 && Array.isArray(r.list)) list.push(...r.list);
      if (!list.length) continue;
      const out: SearchResult[] = [];
      for (const item of list) {
        const links = parseLinks(
          item.vod_down_from || "",
          item.vod_down_url || ""
        );
        if (!links.length) continue;
        out.push({
          message_id: "",
          unique_id: `wanou-${item.vod_id}`,
          channel: "",
          datetime: new Date().toISOString(),
          title: (item.vod_name || "").trim(),
          content: [
            item.vod_actor && `主演: ${item.vod_actor}`,
            item.vod_director && `导演: ${item.vod_director}`,
            item.vod_area && `地区: ${item.vod_area}`,
            item.vod_year && `年份: ${item.vod_year}`,
          ]
            .filter(Boolean)
            .join(" | "),
          links,
          tags: [item.vod_year || "", item.vod_area || ""].filter(Boolean),
        });
      }
      if (out.length) return out;
    }
    return [];
  }
}

registerGlobalPlugin(new WanouPlugin());
