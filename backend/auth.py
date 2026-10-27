"""
Authentication and security module for Smart Crop Monitoring System.
Implements PBKDF2 password hashing and secure token generation without external bloat.
"""

import hashlib
import hmac
import os
import time
import secrets
from database import get_db_connection

SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "smart_crop_iot_secure_salt_key_2026_xyz")

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return f"{salt}${pw_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, pw_hash = stored_hash.split('$')
        new_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        return hmac.compare_digest(new_hash, pw_hash)
    except Exception:
        return False

def generate_token(user_id: int) -> str:
    timestamp = str(int(time.time()))
    payload = f"{user_id}:{timestamp}"
    signature = hmac.new(SECRET_KEY.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

def verify_token(token: str):
    try:
        parts = token.split(':')
        if len(parts) != 3:
            return None
        user_id_str, timestamp_str, signature = parts
        payload = f"{user_id_str}:{timestamp_str}"
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            return None
            
        # Token valid for 7 days
        token_age = int(time.time()) - int(timestamp_str)
        if token_age > 7 * 86400:
            return None
            
        return int(user_id_str)
    except Exception:
        return None

def register_user(email, password, full_name, farm_name="Kisan Agro Farm", location="Coimbatore, Tamil Nadu", phone="+91 98421 00000"):
    email = email.strip().lower()
    if not email or '@' not in email:
        return None, "A valid email address is required."
    if not password or len(password) < 6:
        return None, "Password must be at least 6 characters long."
    if not full_name:
        return None, "Full name is required."

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return None, "An account with this email already exists."

    pw_hash = hash_password(password)
    cursor.execute("""
    INSERT INTO users (email, password_hash, full_name, farm_name, location, phone)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (email, pw_hash, full_name, farm_name, location, phone))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = generate_token(user_id)
    return {
        "user_id": user_id,
        "email": email,
        "full_name": full_name,
        "farm_name": farm_name,
        "location": location,
        "token": token
    }, None

def login_user(email, password):
    email = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password_hash, full_name, farm_name, location, phone FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return None, "Invalid email or password."

    if not verify_password(password, user["password_hash"]):
        return None, "Invalid email or password."

    token = generate_token(user["id"])
    return {
        "user_id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "farm_name": user["farm_name"],
        "location": user["location"],
        "phone": user["phone"],
        "token": token
    }, None

def get_user_profile(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, farm_name, location, phone, created_at FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return None
    return dict(user)

def reset_password(email, new_password):
    email = email.strip().lower()
    if not new_password or len(new_password) < 6:
        return False, "New password must be at least 6 characters."

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return False, "User not found with this email."

    pw_hash = hash_password(new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE email = ?", (pw_hash, email))
    conn.commit()
    conn.close()
    return True, "Password reset successfully. You can now log in with your new password."
