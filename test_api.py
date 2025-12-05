#!/usr/bin/env python3
"""
Quick API test script
Run: python test_api.py
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("🏥 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_register():
    print("👤 Testing user registration...")
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json={
            "email": "demo@example.com",
            "password": "demo123",
            "full_name": "Demo User"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"✅ User registered successfully!")
        print(f"Access Token: {data['access_token'][:50]}...")
        return data['access_token']
    else:
        print(f"Response: {response.json()}\n")
        return None

def test_login():
    print("\n🔐 Testing user login...")
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={
            "email": "demo@example.com",
            "password": "demo123"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful!")
        print(f"Access Token: {data['access_token'][:50]}...")
        return data['access_token']
    else:
        print(f"Response: {response.json()}\n")
        return None

def test_me(token):
    print("\n👥 Testing /auth/me endpoint...")
    response = requests.get(
        f"{BASE_URL}/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"✅ User data: {response.json()}\n")
    else:
        print(f"Response: {response.json()}\n")

def test_create_company(token):
    print("🏢 Testing company creation...")
    response = requests.post(
        f"{BASE_URL}/api/v1/companies",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Test Surf School",
            "product_type": "Service"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Company created: {data['name']} (ID: {data['company_id']})\n")
        return data['id']
    else:
        print(f"Response: {response.json()}\n")
        return None

def test_list_companies(token):
    print("📋 Testing company list...")
    response = requests.get(
        f"{BASE_URL}/api/v1/companies",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {len(data)} companies")
        for company in data:
            print(f"  - {company['name']} ({company['company_id']})")
        print()
    else:
        print(f"Response: {response.json()}\n")

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 X8 Network API Test Suite")
    print("=" * 50)
    print("\nMake sure the server is running on http://localhost:8000")
    print("Start server with: uvicorn app.main:app --reload\n")

    try:
        test_health()

        # Try to register (might fail if user exists)
        token = test_register()

        # If registration failed, try login
        if not token:
            token = test_login()

        if token:
            test_me(token)
            company_id = test_create_company(token)
            test_list_companies(token)

            print("=" * 50)
            print("✅ All tests completed!")
            print("=" * 50)
        else:
            print("❌ Could not authenticate. Check the server logs.")

    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the server.")
        print("Make sure the server is running on http://localhost:8000")
        print("Start with: uvicorn app.main:app --reload")
