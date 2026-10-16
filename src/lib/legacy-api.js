export async function invokeLegacyHandler(handler, request) {
  let body = {};
  if (request.method === "POST") {
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
  }

  const headers = new Headers();
  const responseState = { statusCode: 200, body: undefined };
  const response = {
    setHeader(name, value) {
      headers.set(name, String(value));
      return this;
    },
    status(code) {
      responseState.statusCode = code;
      return this;
    },
    json(value) {
      headers.set("Content-Type", "application/json");
      responseState.body = JSON.stringify(value);
      return this;
    },
    end(value) {
      responseState.body = value;
      return this;
    },
  };

  await handler({ method: request.method, body }, response);
  const bodyBytes =
    Buffer.isBuffer(responseState.body) &&
    request.method !== "HEAD"
      ? new Uint8Array(responseState.body)
      : responseState.body;
  return new Response(request.method === "HEAD" ? null : bodyBytes, {
    status: responseState.statusCode,
    headers,
  });
}
