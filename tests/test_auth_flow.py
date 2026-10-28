from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app, auth_service

NEW, OLD = "9123456780", "9234567801"


class FakeRepo:
    def __init__(self):
        self.farmers = {}

    def get_farmer_by_phone(self, phone):
        return self.farmers.get(phone)

    def add_farmer(self, farmer):
        self.farmers[farmer["phone"]] = farmer


@pytest.fixture()
def api(monkeypatch):
    monkeypatch.setattr(auth_service, "repo", FakeRepo())
    monkeypatch.setattr(auth_service, "_otp_store", {})
    monkeypatch.setattr(auth_service, "_otp_cooldown", {})
    monkeypatch.setattr(auth_service, "_verified_phones", {})
    return TestClient(app)


def post(api, path, **body):
    return api.post(f"/api/auth/{path}", json=body)


def otp_for(phone):
    return auth_service._otp_store[phone]["otp"]


REG = {"name": "Test Farmer", "state": "Punjab", "district": "Ludhiana", "language": "en"}


def test_new_user_registers_only_after_verifying_the_otp(api):
    assert post(api, "send-otp", phone=NEW).status_code == 200
    assert len(otp_for(NEW)) == 6 and otp_for(NEW).isdigit()

    # registering before verifying is refused
    assert post(api, "register", phone=NEW, **REG).status_code == 400
    # a wrong code is refused and does not unlock registration
    assert post(api, "verify-otp", phone=NEW, otp="000000" if otp_for(NEW) != "000000" else "111111").status_code == 400
    assert post(api, "register", phone=NEW, **REG).status_code == 400

    ok = post(api, "verify-otp", phone=NEW, otp=otp_for(NEW))
    assert ok.status_code == 200 and ok.json() == {"verified": True, "registered": False}

    reg = post(api, "register", phone=NEW, **REG)
    assert reg.status_code == 200
    assert auth_service.repo.get_farmer_by_phone(NEW)["verified"] is True
    # the verification is single-use and the number can no longer be registered again
    assert post(api, "register", phone=NEW, **REG).status_code == 400


def test_registration_otp_is_refused_for_an_already_registered_phone(api):
    auth_service.repo.add_farmer({"farmer_id": "F1", "phone": OLD, "name": "Old", "state": "P", "district": "L",
                                  "language": "en", "created_at": "x", "verified": True})
    r = post(api, "send-otp", phone=OLD)
    assert r.status_code == 400 and "already registered" in r.json()["detail"]


def test_a_stale_verification_cannot_be_used_to_register(api, monkeypatch):
    post(api, "send-otp", phone=NEW)
    post(api, "verify-otp", phone=NEW, otp=otp_for(NEW))
    auth_service._verified_phones[NEW] = datetime.utcnow() - timedelta(seconds=1)
    assert post(api, "register", phone=NEW, **REG).status_code == 400


def test_verifying_one_phone_does_not_unlock_another(api):
    post(api, "send-otp", phone=NEW)
    post(api, "verify-otp", phone=NEW, otp=otp_for(NEW))
    assert post(api, "register", phone="9345678012", **REG).status_code == 400


def test_login_returns_the_profile_and_locks_after_three_wrong_codes(api):
    auth_service.repo.add_farmer({"farmer_id": "F1", "phone": OLD, "name": "Old", "state": "P", "district": "L",
                                  "language": "en", "created_at": "x", "verified": False})
    assert post(api, "login-otp", phone=OLD).status_code == 200
    for _ in range(3):
        assert post(api, "verify-otp", phone=OLD, otp="123456" if otp_for(OLD) != "123456" else "654321").status_code == 400
    assert post(api, "verify-otp", phone=OLD, otp=otp_for(OLD)).status_code == 400  # locked, needs a new code


def test_login_with_the_correct_code_returns_the_profile(api):
    auth_service.repo.add_farmer({"farmer_id": "F1", "phone": OLD, "name": "Old", "state": "P", "district": "L",
                                  "language": "en", "created_at": "x", "verified": False})
    post(api, "login-otp", phone=OLD)
    r = post(api, "verify-otp", phone=OLD, otp=otp_for(OLD))
    assert r.status_code == 200 and r.json()["phone"] == OLD and r.json()["verified"] is True


def test_login_otp_for_an_unknown_phone_is_refused(api):
    assert post(api, "login-otp", phone="9000000001").status_code == 400
