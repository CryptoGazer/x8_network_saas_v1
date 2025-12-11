from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models.user import User
from app.core.config import settings
import httpx
from typing import Optional

router = APIRouter(prefix="/api/v1/support", tags=["support"])


class AIFAQRequest(BaseModel):
    """Request model for AI FAQ chatbot"""
    question: str
    context: Optional[str] = None
    user_id: Optional[int] = None
    company_id: Optional[int] = None


class AIFAQResponse(BaseModel):
    """Response model from AI FAQ chatbot"""
    answer: str
    confidence: Optional[float] = None
    sources: Optional[list] = None


@router.post("/ai-faq/chat", response_model=AIFAQResponse)
async def chat_with_ai_faq(
    request: AIFAQRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Send a question to the n8n AI FAQ chatbot and get a response.

    The chatbot is deployed on AWS and handles frequently asked questions
    about the platform, features, and general support queries.
    """
    if not settings.N8N_AI_FAQ_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI FAQ chatbot is not configured"
        )

    try:
        # Prepare payload for n8n webhook
        payload = {
            "question": request.question,
            "context": request.context,
            "user_id": request.user_id or current_user.id,
            "company_id": request.company_id,
            "user_email": current_user.email
        }

        headers = {}
        if settings.N8N_AI_FAQ_API_KEY:
            headers["Authorization"] = f"Bearer {settings.N8N_AI_FAQ_API_KEY}"

        if settings.N8N_AI_FAQ_WEBHOOK_SECRET:
            headers["X-Webhook-Secret"] = settings.N8N_AI_FAQ_WEBHOOK_SECRET

        # Call n8n AI FAQ chatbot webhook
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.N8N_AI_FAQ_URL,
                json=payload,
                headers=headers,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()

        # Parse response from n8n
        return AIFAQResponse(
            answer=data.get("answer", "I'm sorry, I couldn't find an answer to your question."),
            confidence=data.get("confidence"),
            sources=data.get("sources", [])
        )

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to AI FAQ chatbot: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your request: {str(e)}"
        )


@router.get("/ai-faq/status")
async def get_ai_faq_status(current_user: User = Depends(get_current_user)):
    """
    Check if the AI FAQ chatbot is available and configured.
    """
    is_configured = bool(settings.N8N_AI_FAQ_URL)

    if not is_configured:
        return {
            "available": False,
            "message": "AI FAQ chatbot is not configured"
        }

    try:
        # Ping the n8n endpoint to check if it's responsive
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.N8N_AI_FAQ_URL}/health",
                timeout=5.0
            )
            is_online = response.status_code == 200
    except:
        is_online = False

    return {
        "available": is_configured,
        "online": is_online,
        "message": "AI FAQ chatbot is ready" if is_online else "AI FAQ chatbot is configured but not responding"
    }
