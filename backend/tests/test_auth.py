from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API is running! 🚀"}

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register():
    response = client.post("/auth/register", json={
        "name": "Test User",
        "email": "testuser123@test.com",
        "password": "test1234",
        "role": "buyer"
    })
    assert response.status_code in [200, 400]

def test_login_invalid():
    response = client.post("/auth/login", json={
        "email": "wrong@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401