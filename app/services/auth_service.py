import random
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from app.repositories.data_repo import DataRepository
from app.models.schemas import (
    FarmerRegister,
    FarmerResponse,
    OTPVerify,
)

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication service for TriNetra.
    Handles farmer registration and OTP-based login.
    """
    
    # Security configuration
    OTP_LENGTH = 6
    OTP_EXPIRY_SECONDS = 300  # 5 minutes
    MAX_OTP_ATTEMPTS = 3
    OTP_COOLDOWN_SECONDS = 60  # Rate limit: 1 OTP per minute
    
    def __init__(self):
        self.repo = DataRepository()
        self._otp_store: Dict[str, Dict] = {}  # In-memory OTP cache
        self._otp_cooldown: Dict[str, float] = {}  # Track OTP request rate limiting
    
    # -------------------------
    # REGISTRATION
    # -------------------------
    def register_farmer(self, farmer: FarmerRegister) -> FarmerResponse:
        """
        Register a new farmer with phone-based identity.
        Raises ValueError if phone already registered.
        """
        try:
            # Check if farmer already exists
            existing = self.repo.get_farmer_by_phone(farmer.phone)
            if existing:
                raise ValueError(f"Farmer with phone {farmer.phone} already registered")
            
            # Generate farmer ID (phone-based)
            farmer_id = f"FARM_{farmer.phone}_{datetime.utcnow().timestamp():.0f}"
            
            # Create farmer record
            farmer_data = {
                "farmer_id": farmer_id,
                "name": farmer.name,
                "state": farmer.state,
                "district": farmer.district,
                "phone": farmer.phone,
                "language": farmer.language,
                "created_at": datetime.utcnow().isoformat(),
                "verified": False,  # Requires OTP verification
            }
            
            # Save to repository
            self.repo.add_farmer(farmer_data)
            
            logger.info(f"Farmer registered: {farmer_id} ({farmer.phone})")
            
            return FarmerResponse(**farmer_data)
        
        except Exception as e:
            logger.error(f"Registration failed for {farmer.phone}: {str(e)}")
            raise
    
    # -------------------------
    # OTP GENERATION
    # -------------------------
    def send_otp(self, phone: str) -> Dict[str, str]:
        """
        Generate and store OTP for phone number.
        Implements rate limiting (1 OTP per minute).
        
        Returns: {"status": "success", "message": "OTP sent"}
        """
        try:
            # Validate phone format
            if not self._is_valid_phone(phone):
                raise ValueError("Invalid phone number format")
            
            # Check if farmer exists
            farmer = self.repo.get_farmer_by_phone(phone)
            if not farmer:
                raise ValueError("Farmer not registered. Please register first.")
            
            # Rate limiting: prevent OTP spam
            last_otp_time = self._otp_cooldown.get(phone, 0)
            time_since_last = datetime.utcnow().timestamp() - last_otp_time
            
            if time_since_last < self.OTP_COOLDOWN_SECONDS:
                wait_time = self.OTP_COOLDOWN_SECONDS - int(time_since_last)
                raise ValueError(f"Please wait {wait_time}s before requesting another OTP")
            
            # Generate 6-digit OTP
            otp = str(random.randint(10**5, 10**6 - 1))
            
            # Store OTP with metadata
            self._otp_store[phone] = {
                "otp": otp,
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(seconds=self.OTP_EXPIRY_SECONDS),
                "attempts": 0,
                "verified": False,
            }
            
            # Update cooldown
            self._otp_cooldown[phone] = datetime.utcnow().timestamp()
            
            # Log OTP (in production, send via SMS/email)
            self._log_otp_for_development(phone, otp)
            
            logger.info(f"OTP generated for {phone}")
            
            return {
                "status": "success",
                "message": f"OTP sent to {phone}",
                "expires_in_seconds": self.OTP_EXPIRY_SECONDS
            }
        
        except Exception as e:
            logger.error(f"OTP generation failed for {phone}: {str(e)}")
            raise
    
    # -------------------------
    # OTP VERIFICATION
    # -------------------------
    def verify_otp(self, phone: str, input_otp: str) -> Tuple[bool, str]:
        """
        Verify OTP for login.
        
        Returns: (success: bool, message: str)
        """
        try:
            # Validate phone format
            if not self._is_valid_phone(phone):
                return False, "Invalid phone number format"
            
            # Check if OTP was requested
            otp_record = self._otp_store.get(phone)
            if not otp_record:
                return False, "OTP not requested. Please request OTP first."
            
            # Check if OTP expired
            if datetime.utcnow() > otp_record["expires_at"]:
                del self._otp_store[phone]
                logger.warning(f"Expired OTP verification attempt for {phone}")
                return False, "OTP expired. Please request a new OTP."
            
            # Check attempt limit
            if otp_record["attempts"] >= self.MAX_OTP_ATTEMPTS:
                del self._otp_store[phone]
                logger.warning(f"Max OTP attempts exceeded for {phone}")
                return False, "Maximum attempts exceeded. Please request a new OTP."
            
            # Verify OTP (case-sensitive string match)
            if otp_record["otp"] != input_otp.strip():
                otp_record["attempts"] += 1
                remaining = self.MAX_OTP_ATTEMPTS - otp_record["attempts"]
                logger.warning(f"Invalid OTP attempt for {phone} (attempt {otp_record['attempts']})")
                return False, f"Invalid OTP. {remaining} attempts remaining."
            
            # OTP verified successfully
            otp_record["verified"] = True
            farmer = self.repo.get_farmer_by_phone(phone)
            
            if farmer:
                # Mark farmer as verified in database
                farmer["verified"] = True
                farmer["last_login"] = datetime.utcnow().isoformat()
                self.repo.add_farmer(farmer)
            
            # Clean up OTP record after successful verification
            del self._otp_store[phone]
            
            logger.info(f"Farmer verified: {phone}")
            
            return True, "OTP verified successfully"
        
        except Exception as e:
            logger.error(f"OTP verification failed for {phone}: {str(e)}")
            return False, "Verification failed. Please try again."
    
    # -------------------------
    # HELPER METHODS
    # -------------------------
    def _is_valid_phone(self, phone: str) -> bool:
        """Validate Indian 10-digit phone number."""
        phone = phone.strip()
        return len(phone) == 10 and phone.isdigit() and phone[0] in "6789"
    
    def _log_otp_for_development(self, phone: str, otp: str) -> None:
        """
        Log OTP for development/testing.
        In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
        """
        # Console output for hackathon/development
        print(f"\n{'='*50}")
        print(f"🔐 OTP for {phone}: {otp}")
        print(f"⏱️  Valid for {self.OTP_EXPIRY_SECONDS // 60} minutes")
        print(f"{'='*50}\n")
        
        # Also log to application logger
        logger.info(f"[DEV] OTP: {otp} for {phone}")
    
    def get_farmer_by_phone(self, phone: str) -> Optional[Dict]:
        """Get farmer details by phone number."""
        try:
            return self.repo.get_farmer_by_phone(phone)
        except Exception as e:
            logger.error(f"Error retrieving farmer: {str(e)}")
            return None
    
    def cleanup_expired_otps(self) -> None:
        """
        Remove expired OTP records (call periodically).
        Useful for long-running servers.
        """
        expired_phones = [
            phone for phone, record in self._otp_store.items()
            if datetime.utcnow() > record["expires_at"]
        ]
        
        for phone in expired_phones:
            del self._otp_store[phone]
        
        if expired_phones:
            logger.info(f"Cleaned up {len(expired_phones)} expired OTP records")