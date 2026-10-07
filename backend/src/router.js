const { HttpError } = require('./utils/http');

/**
 * A tiny router: router.get('/devices/:id', handler)
 * A handler receives { params, query, body } and returns { status?, body? }.
 */
class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    // '/devices/:id' -> /^\/devices\/([^/]+)$/ with param names ['id']
    const names = [];
    const pattern = path.replace(/:([a-zA-Z]+)/g, (_, name) => {
      names.push(name);
      return '([^/]+)';
    });
    this.routes.push({ method, regex: new RegExp(`^${pattern}/?$`), names, handler });
    return this;
  }

  get(path, handler) { return this.add('GET', path, handler); }
  post(path, handler) { return this.add('POST', path, handler); }
  put(path, handler) { return this.add('PUT', path, handler); }
  patch(path, handler) { return this.add('PATCH', path, handler); }
  delete(path, handler) { return this.add('DELETE', path, handler); }

  /** Finds the first matching route. Throws 404 / 405 if there isn't one. */
  match(method, pathname) {
    let pathMatched = false;
    for (const route of this.routes) {
      const found = route.regex.exec(pathname);
      if (!found) continue;
      pathMatched = true;
      if (route.method !== method) continue;
      const params = {};
      route.names.forEach((name, i) => { params[name] = decodeURIComponent(found[i + 1]); });
      return { handler: route.handler, params };
    }
    if (pathMatched) throw new HttpError(405, `Method ${method} is not allowed on ${pathname}.`);
    throw new HttpError(404, `Route not found: ${method} ${pathname}`);
  }
}

module.exports = { Router };
