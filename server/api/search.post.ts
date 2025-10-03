import { defineEventHandler, readBody, sendError, createError } from "h3";
import { getOrCreateSearchService } from "../core/services";
import type { GenericResponse, SearchRequest } from "../core/types/models";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const service = getOrCreateSearchService(config);
  const body = (await readBody<SearchRequest>(event)) || ({} as SearchRequest);

  const kw = (body.kw || "").trim();
  if (!kw) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "kw is required" })
    );
  }

  // 规范化入参：支持字符串与数组两种形式
  const parseList = (val: any): string[] | undefined => {
    if (Array.isArray(val))
      return val.filter((s) => typeof s === "string" && s.trim());
    if (typeof val === "string")
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return undefined;
  };

  body.channels = parseList((body as any).channels);
  body.plugins = parseList((body as any).plugins);
  body.cloud_types = parseList((body as any).cloud_types);

  if (!body.res || body.res === "merge") body.res = "merged_by_type";
  if (!body.src) body.src = "all";
  if (body.src === "tg") body.plugins = undefined;
  else if (body.src === "plugin") body.channels = undefined;

  const result = await service.search(
    kw,
    body.channels,
    body.conc,
    !!body.refresh,
    body.res,
    body.src,
    body.plugins,
    body.cloud_types,
    body.ext || {}
  );

  const resp: GenericResponse<typeof result> = {
    code: 0,
    message: "success",
    data: result,
  };
  return resp;
});
