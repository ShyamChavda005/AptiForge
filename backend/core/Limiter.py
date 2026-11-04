from slowapi import Limiter
from slowapi.util import get_remote_address

def get_login_key(request):

    email = getattr(request.state, "login_email", None)

    if email:
        return email.lower().strip()

    return get_remote_address(request)


limiter = Limiter(
    key_func=get_login_key
)