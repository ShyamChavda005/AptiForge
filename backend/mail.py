import os
import requests
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME")


def send_otp_email(to_email: str, otp: str):

    try :
        url = "https://api.brevo.com/v3/smtp/email"

        headers = {
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json"
        }

        data = {
            "sender": {
                "name": BREVO_SENDER_NAME,
                "email": BREVO_SENDER_EMAIL
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

        This OTP will expire in 2 minutes.

        If you did not request this OTP, please ignore this email.

        Regards,
        {BREVO_SENDER_NAME}
        """
        }

        response = requests.post(url,headers=headers,json=data)

        response.raise_for_status()

        # return response.json()
        return True
    
    except Exception as e :
        return False
