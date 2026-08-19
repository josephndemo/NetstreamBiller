from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)
) -> User:
    try:
        token = firebase_auth.verify_id_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc

    user = db.get(User, token["uid"])
    if not user:
        user = User(
            id=token["uid"],
            email=token.get("email", ""),
            display_name=token.get("name", ""),
            photo_url=token.get("picture", ""),
        )
        db.add(user)
    else:
        user.email = token.get("email", user.email)
        user.display_name = token.get("name", user.display_name)
        user.photo_url = token.get("picture", user.photo_url)
    db.commit()
    db.refresh(user)
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access is required")
    return current_user
