export default function fetchAPI(path, method, body) {
  const options = {method};
  if(body !== undefined) {
    options.body = JSON.stringify(body);
    options.headers = {'Content-Type': 'application/json'};
  }
  return fetch(`/api/${path}`, options);
}

export function fetchJSON(path) {
  return fetchAPI(path, 'GET').then((r) => r.json());
}
