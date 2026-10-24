export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.endsWith('.mp4') || !['GET','HEAD'].includes(request.method)) return env.ASSETS.fetch(request);
    const range = request.headers.get('Range');
    const headers = new Headers(request.headers);
    headers.delete('Range');headers.delete('If-Range');
    const response = await env.ASSETS.fetch(new Request(request, {headers}));
    if (response.status !== 200) return response;
    const out = new Headers(response.headers);
    out.set('Accept-Ranges','bytes');
    const ifRange=request.headers.get('If-Range');
    if (!range || request.method==='HEAD' || (ifRange && ifRange!==out.get('ETag') && ifRange!==out.get('Last-Modified'))) return new Response(response.body,{status:200,headers:out});
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(response.body,{status:200,headers:out});
    const bytes = await response.arrayBuffer();
    const size = bytes.byteLength;
    const start = match[1] ? Number(match[1]) : Math.max(0,size-Number(match[2]));
    const end = match[1] && match[2] ? Math.min(Number(match[2]),size-1) : size-1;
    out.delete('Content-Encoding');
    if (!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size) {
      out.set('Content-Range',`bytes */${size}`);out.set('Content-Length','0');
      return new Response(null,{status:416,headers:out});
    }
    out.set('Content-Range',`bytes ${start}-${end}/${size}`);
    out.set('Content-Length',String(end-start+1));
    return new Response(bytes.slice(start,end+1),{status:206,headers:out});
  }
};
