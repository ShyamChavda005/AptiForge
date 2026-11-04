import os
import logging
import requests
from dotenv import load_dotenv
from pathlib import Path

logger = logging.getLogger(__name__)

# Load the local override after the shared defaults. Environment variables
# supplied by the hosting platform remain supported when no local override exists.
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv(backend_dir / ".env.local", override=True)


def send_otp_email(to_email: str, otp: str):

    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("BREVO_SENDER_EMAIL")
    sender_name = os.getenv("BREVO_SENDER_NAME")

    if not api_key or api_key == "your_brevo_api_key_here":
        logger.error("BREVO_API_KEY is missing or still has the placeholder value")
        return False

    if not sender_email or not sender_name:
        logger.error("Brevo sender configuration is incomplete")
        return False

    try:
        url = "https://api.brevo.com/v3/smtp/email"

        headers = {
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json"
        }

        data = {
            "sender": {
                "name": sender_name,
                "email": sender_email
            },
            "to": [
                {
                    "email": to_email
                }
            ],
            "subject": "AptiForge Login OTP",
            "textContent": f"""
        Hello,

        Your AptiForge login OTP is: {otp}

        This OTP will expire in 5 minutes.

        If you did not request this OTP, please ignore this email.

        Regards,
        {sender_name}
        """
        }

        response = requests.post(url, headers=headers, json=data, timeout=15)

        if not response.ok:
            logger.error(
                "Brevo rejected OTP email: status=%s response=%s",
                response.status_code,
                response.text[:500],
            )
            return False

        return True

    except requests.RequestException:
        logger.exception("Could not reach Brevo while sending OTP email")
        return False
