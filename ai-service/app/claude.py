import logging

import anthropic
from fastapi import HTTPException

from .config import settings

logger = logging.getLogger(__name__)

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

MODEL = "claude-opus-4-6"
DEFAULT_SYSTEM = (
    "You are Astrolis, an AI assistant specializing in astrology and space. "
    "Provide insightful, accurate information about zodiac signs, birth charts, "
    "celestial events, and space science."
)


async def chat(prompt: str, system: str | None = None) -> dict:
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=16000,
            system=system or DEFAULT_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.AuthenticationError:
        logger.error("Invalid Anthropic API key")
        raise HTTPException(status_code=401, detail="AI service authentication failed")
    except anthropic.RateLimitError:
        logger.warning("Anthropic rate limit hit")
        raise HTTPException(status_code=429, detail="AI service rate limited, try again shortly")
    except anthropic.APIStatusError as e:
        logger.error("Anthropic API error: %s", e.message)
        raise HTTPException(status_code=502, detail="AI service unavailable")
    except anthropic.APIConnectionError:
        logger.error("Cannot reach Anthropic API")
        raise HTTPException(status_code=502, detail="AI service unreachable")

    text = next(
        (block.text for block in response.content if block.type == "text"), ""
    )

    return {
        "response": text,
        "model": response.model,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
    }
