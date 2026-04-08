from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=10000)
    system: str | None = Field(default=None, max_length=2000)


class ChatResponse(BaseModel):
    response: str
    model: str
    input_tokens: int
    output_tokens: int
