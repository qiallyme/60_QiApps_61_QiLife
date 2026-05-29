from __future__ import annotations

import secrets
import time

CROCKFORD32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def _encode_base32(value: int, length: int) -> str:
    encoded = ["0"] * length
    for index in range(length - 1, -1, -1):
        encoded[index] = CROCKFORD32[value & 0x1F]
        value >>= 5
    return "".join(encoded)


def generate_ulid() -> str:
    timestamp_ms = int(time.time() * 1000) & ((1 << 48) - 1)
    randomness = secrets.randbits(80)
    return f"{_encode_base32(timestamp_ms, 10)}{_encode_base32(randomness, 16)}"
