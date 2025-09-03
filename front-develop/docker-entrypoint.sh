#!/bin/sh

cat <<EOF > /usr/share/nginx/html/env.js
window.ENV = {
  VITE_APP_API_URL: "${VITE_APP_API_URL}"
};
EOF

exec nginx -g "daemon off;"