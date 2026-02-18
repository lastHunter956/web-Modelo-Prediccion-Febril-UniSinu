/**
 * Proxy server-side: reenvía /api/* al backend FastAPI.
 *
 * Ventajas:
 * - Elimina CORS (browser → same-origin → backend interno)
 * - Reenvía Authorization header de forma confiable
 * - Usa red interna de Docker (http://backend:8000)
 */

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

async function proxy(request, { params }) {
  const pathSegments = params.path;
  const path = pathSegments.join('/');
  const url = new URL(request.url);
  const target = `${BACKEND}/api/${path}${url.search}`;

  // Construir headers a reenviar
  const headers = {};
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers['Content-Type'] = contentType;

  const auth = request.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  // Construir opciones del fetch
  const init = { method: request.method, headers };

  // Solo leer body en métodos que lo permiten
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    try {
      init.body = await request.text();
    } catch {
      // body vacío
    }
  }

  try {
    const res = await fetch(target, init);
    const resContentType = res.headers.get('Content-Type') || '';

    if (resContentType.includes('application/json')) {
      const data = await res.json();
      return Response.json(data, { status: res.status });
    }

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': resContentType || 'text/plain' },
    });
  } catch (err) {
    console.error('[proxy] Error conectando al backend:', err.message);
    return Response.json(
      { detail: 'No se pudo conectar con el servidor backend' },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
