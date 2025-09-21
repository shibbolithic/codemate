#!/usr/bin/env python3
"""
Test script to verify Railway deployment endpoints
"""
import requests
import json
import sys

def test_endpoint(base_url, endpoint, method="GET", data=None):
    """Test a specific endpoint"""
    url = f"{base_url}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        elif method == "OPTIONS":
            response = requests.options(url, timeout=10)
        
        print(f"✅ {method} {endpoint}: {response.status_code}")
        if response.status_code not in [200, 201, 204]:
            print(f"   Response: {response.text[:100]}...")
        return response.status_code in [200, 201, 204]
    except Exception as e:
        print(f"❌ {method} {endpoint}: Error - {e}")
        return False

def main():
    # Railway URL - update this with your actual Railway URL
    railway_url = "https://codemate-production.up.railway.app"
    
    print("🧪 Testing Railway Deployment")
    print(f"📍 URL: {railway_url}")
    print("=" * 50)
    
    # Test basic endpoints
    endpoints_to_test = [
        ("/", "GET"),
        ("/health", "GET"),
        ("/api/pull-requests", "GET"),
        ("/api/pull-requests", "OPTIONS"),
        ("/webhook", "OPTIONS"),
        ("/api/pull-requests/1", "GET"),
        ("/api/reviews/1", "GET"),
    ]
    
    success_count = 0
    total_count = len(endpoints_to_test)
    
    for endpoint, method in endpoints_to_test:
        if test_endpoint(railway_url, endpoint, method):
            success_count += 1
    
    print("=" * 50)
    print(f"📊 Results: {success_count}/{total_count} endpoints working")
    
    if success_count == total_count:
        print("🎉 All endpoints are working correctly!")
        return 0
    else:
        print("⚠️  Some endpoints are not working. Check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
