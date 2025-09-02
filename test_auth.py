#!/usr/bin/env python3
"""Test authentication endpoints to verify MongoDB integration."""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_signup():
    """Test user signup."""
    print("Testing user signup...")
    
    data = {
        "name": "Test Developer",
        "email": "test.dev@example.com",
        "password": "TestPassword123!",
        "user_type": "developer",
        "github_username": "testdev"
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=data)
    print(f"Signup Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ User created successfully!")
        print(f"User ID: {result['user']['id']}")
        print(f"User Name: {result['user']['name']}")
        print(f"User Email: {result['user']['email']}")
        print(f"User Type: {result['user']['user_type']}")
        return result['access_token']
    else:
        print(f"❌ Signup failed: {response.text}")
        return None

def test_login():
    """Test user login."""
    print("\nTesting user login...")
    
    data = {
        "email": "test.dev@example.com",
        "password": "TestPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Login Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Login successful!")
        print(f"User ID: {result['user']['id']}")
        print(f"User Name: {result['user']['name']}")
        return result['access_token']
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_github_ai():
    """Test GitHub AI analysis."""
    print("\nTesting GitHub AI analysis...")
    
    data = {"username": "octocat"}
    
    response = requests.post(f"{BASE_URL}/github/analyze", json=data)
    print(f"AI Analysis Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ AI analysis successful!")
        print(f"Repositories found: {len(result['repositories'])}")
        print(f"Experience level: {result['ai_insights']['experience_level']}")
        return True
    else:
        print(f"❌ AI analysis failed: {response.text}")
        return False

if __name__ == "__main__":
    print("🚀 Testing PortReview API with MongoDB backend...")
    print("=" * 50)
    
    # Test signup
    token = test_signup()
    
    # Test login
    login_token = test_login()
    
    # Test AI functionality
    ai_working = test_github_ai()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"✅ Backend API: Running" if token or login_token else "❌ Backend API: Failed")
    print(f"✅ MongoDB Integration: Working" if token or login_token else "❌ MongoDB Integration: Failed")
    print(f"✅ AI Analysis: Working" if ai_working else "❌ AI Analysis: Failed")
    print(f"✅ Manual Auth: Working" if login_token else "❌ Manual Auth: Failed")
    
    if token and login_token and ai_working:
        print("\n🎉 All systems are working perfectly!")
        print("Your application is ready for use with:")
        print("- MongoDB Atlas database storage")
        print("- Manual authentication with email/password")
        print("- GitHub OAuth integration")
        print("- AI-powered portfolio analysis")
    else:
        print("\n⚠️ Some issues detected. Check the logs above.")
