# -*- coding: utf-8 -*-
"""
app/core/rate_limiter.py - Control de Frecuencia de Peticiones en Memoria
Protege la base de datos contra exceso de lecturas y escrituras por IP.
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

_rate_limit_store = defaultdict(list)
_last_cleanup = time.time()

def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get('x-forwarded-for')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    cf_ip = request.headers.get('cf-connecting-ip')
    if cf_ip:
        return cf_ip.strip()
    real_ip = request.headers.get('x-real-ip')
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else '127.0.0.1'

def check_rate_limit(key: str, limit: int, window_seconds: int = 60):
    global _last_cleanup
    now = time.time()

    if now - _last_cleanup > 300:
        for k in list(_rate_limit_store.keys()):
            _rate_limit_store[k] = [t for t in _rate_limit_store[k] if now - t < 300]
            if not _rate_limit_store[k]:
                del _rate_limit_store[k]
        _last_cleanup = now

    timestamps = [t for t in _rate_limit_store[key] if now - t < window_seconds]
    _rate_limit_store[key] = timestamps

    if len(timestamps) >= limit:
        oldest = timestamps[0]
        retry_after = max(1, int(window_seconds - (now - oldest)))
        return False, retry_after, 0

    timestamps.append(now)
    _rate_limit_store[key] = timestamps
    remaining = limit - len(timestamps)
    return True, 0, remaining

async def rate_limit_writes(request: Request):
    ip = get_client_ip(request)
    key = f'write:{ip}'
    allowed, retry_after, remaining = check_rate_limit(key, limit=10, window_seconds=60)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f'Demasiadas operaciones de escritura. Por favor espera {retry_after} segundos antes de reintentar.',
            headers={'Retry-After': str(retry_after)}
        )

async def rate_limit_reads(request: Request):
    ip = get_client_ip(request)
    key = f'read:{ip}'
    allowed, retry_after, remaining = check_rate_limit(key, limit=60, window_seconds=60)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f'Limite de consultas excedido. Por favor espera {retry_after} segundos.',
            headers={'Retry-After': str(retry_after)}
        )

