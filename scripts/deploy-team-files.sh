#!/usr/bin/env bash
set -e

COMPOSE_FILE="/etc/dokploy/compose/compose-compress-online-card-zt8to4/code/docker-compose.yml"

POSTGRES_CONTAINER=$(docker ps -q --filter name=dokploy-postgres)
if [ -n "$POSTGRES_CONTAINER" ]; then
    python3 -c "
import subprocess
with open('$COMPOSE_FILE', 'r') as f:
    content = f.read()
tag = '\$BODY\$'
sql = f'''UPDATE compose SET \"composeFile\" = {tag}{content}{tag} WHERE \"composeId\" = 'LusdU0WfYoFx5Awg5_n_r';'''
p = subprocess.Popen(['docker', 'exec', '-i', '$POSTGRES_CONTAINER', 'psql', '-U', 'dokploy', '-d', 'dokploy'], stdin=subprocess.PIPE, text=True)
p.communicate(input=sql)
if p.returncode != 0:
    raise SystemExit(p.returncode)
"
    echo "=== Dokploy DB updated successfully ==="
fi

echo "=== RECREATING OMB CONTAINER ==="
docker compose -f "$COMPOSE_FILE" up -d --force-recreate omb
