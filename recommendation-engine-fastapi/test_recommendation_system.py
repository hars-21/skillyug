#!/usr/bin/env python3
"""
Test script for the recommendation engine system.
Tests the complete flow from user query to recommendation response.
"""

import asyncio
import json
import os
import sys
import time
import httpx
from typing import Dict, Any

# Test scenarios based on the user requirements
TEST_SCENARIOS = [
    {
        "name": "Node.js Backend Engineer (Exact Match Case)",
        "query": "I want to be a backend engineer and I'm interested in Node.js",
        "chips": ["backend", "nodejs"],
        "expected_match": "exact"
    },
    {
        "name": "Node.js Backend Engineer (Fallback Case)",
        "query": "I want to learn Node.js for backend development",
        "chips": ["backend", "nodejs"],
        "expected_match": "similar"  # or "fallback" if no exact Node.js course
    },
    {
        "name": "Python Backend Development",
        "query": "How to become a Python backend developer",
        "chips": ["python", "backend"],
        "expected_match": "exact"
    },
    {
        "name": "General Backend Learning",
        "query": "I want to learn backend development",
        "chips": ["backend"],
        "expected_match": "similar"
    },
    {
        "name": "Beginner Programming",
        "query": "I'm new to programming and want to start learning",
        "chips": ["beginner", "programming"],
        "expected_match": "similar"
    }
]

class RecommendationTester:
    def __init__(self, base_url: str = "http://localhost:8003"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def test_health(self) -> bool:
        """Test if the recommendation engine is healthy."""
        try:
            response = await self.client.get(f"{self.base_url}/health")
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ Health Check: {health_data.get('status', 'unknown')}")
                print(f"   Services: {health_data.get('services', {})}")
                return health_data.get('status') == 'healthy'
            else:
                print(f"❌ Health Check Failed: HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health Check Error: {e}")
            return False
    
    async def test_vector_store_status(self) -> bool:
        """Test vector store status."""
        try:
            response = await self.client.get(f"{self.base_url}/api/vector-store/status")
            if response.status_code == 200:
                status_data = response.json()
                print(f"✅ Vector Store: {status_data.get('document_count', 0)} documents")
                return status_data.get('initialized', False)
            else:
                print(f"❌ Vector Store Status Failed: HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Vector Store Error: {e}")
            return False
    
    async def test_recommendation_scenario(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """Test a specific recommendation scenario."""
        print(f"\n🧪 Testing: {scenario['name']}")
        print(f"   Query: {scenario['query']}")
        print(f"   Chips: {scenario['chips']}")
        
        start_time = time.time()
        
        try:
            # Test both endpoints
            results = {}
            
            # Test main recommendation endpoint
            main_payload = {
                "user_query": scenario["query"],
                "ui_chips": scenario["chips"],
                "max_results": 3,
                "min_confidence": 0.3
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/recommendations",
                json=main_payload
            )
            
            if response.status_code == 200:
                main_data = response.json()
                results["main_endpoint"] = {
                    "success": True,
                    "recommendations_count": len(main_data.get("recommendations", [])),
                    "match_type": main_data.get("match_type", "unknown"),
                    "data": main_data
                }
                print(f"   ✅ Main Endpoint: {results['main_endpoint']['recommendations_count']} recommendations ({results['main_endpoint']['match_type']})")
            else:
                results["main_endpoint"] = {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "data": response.text
                }
                print(f"   ❌ Main Endpoint Failed: HTTP {response.status_code}")
            
            # Test backend-compatible endpoint
            backend_payload = {
                "query": scenario["query"],
                "chips": scenario["chips"],
                "max_results": 3
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/recommendations/backend",
                json=backend_payload
            )
            
            if response.status_code == 200:
                backend_data = response.json()
                results["backend_endpoint"] = {
                    "success": backend_data.get("success", False),
                    "recommendations_count": len(backend_data.get("data", {}).get("recommendations", [])),
                    "match_type": backend_data.get("data", {}).get("match_summary", "unknown"),
                    "data": backend_data
                }
                print(f"   ✅ Backend Endpoint: {results['backend_endpoint']['recommendations_count']} recommendations ({results['backend_endpoint']['match_type']})")
            else:
                results["backend_endpoint"] = {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "data": response.text
                }
                print(f"   ❌ Backend Endpoint Failed: HTTP {response.status_code}")
            
            elapsed_time = time.time() - start_time
            results["response_time"] = elapsed_time
            results["scenario"] = scenario
            
            print(f"   ⏱️  Response Time: {elapsed_time:.2f}s")
            
            # Print first recommendation if available
            if results.get("main_endpoint", {}).get("success"):
                recs = results["main_endpoint"]["data"].get("recommendations", [])
                if recs:
                    first_rec = recs[0]
                    course = first_rec.get("course", {})
                    print(f"   🎯 Top Recommendation: {course.get('title', 'N/A')}")
                    print(f"      Confidence: {first_rec.get('confidence_score', 0):.2f}")
                    print(f"      Reasoning: {first_rec.get('reasoning', 'N/A')}")
            
            return results
            
        except Exception as e:
            print(f"   ❌ Test Error: {e}")
            return {
                "scenario": scenario,
                "success": False,
                "error": str(e),
                "response_time": time.time() - start_time
            }
    
    async def run_all_tests(self):
        """Run all test scenarios."""
        print("🚀 Starting Recommendation Engine Tests")
        print("=" * 50)
        
        # Test system health first
        if not await self.test_health():
            print("❌ System not healthy, aborting tests")
            return
        
        if not await self.test_vector_store_status():
            print("⚠️  Vector store not properly initialized, tests may fail")
        
        # Run test scenarios
        results = []
        for scenario in TEST_SCENARIOS:
            result = await self.test_recommendation_scenario(scenario)
            results.append(result)
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        successful_tests = 0
        total_response_time = 0
        
        for result in results:
            scenario_name = result.get("scenario", {}).get("name", "Unknown")
            
            main_success = result.get("main_endpoint", {}).get("success", False)
            backend_success = result.get("backend_endpoint", {}).get("success", False)
            
            if main_success and backend_success:
                status = "✅ PASS"
                successful_tests += 1
            elif main_success or backend_success:
                status = "⚠️  PARTIAL"
            else:
                status = "❌ FAIL"
            
            response_time = result.get("response_time", 0)
            total_response_time += response_time
            
            print(f"{status} {scenario_name} ({response_time:.2f}s)")
        
        avg_response_time = total_response_time / len(results) if results else 0
        success_rate = (successful_tests / len(results)) * 100 if results else 0
        
        print(f"\nSuccess Rate: {success_rate:.1f}% ({successful_tests}/{len(results)})")
        print(f"Average Response Time: {avg_response_time:.2f}s")
        
        # Save detailed results
        with open("test_results.json", "w") as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\n📄 Detailed results saved to test_results.json")
        
        return results
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

async def main():
    """Main test function."""
    # Check if custom URL provided
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8003"
    
    print(f"Testing recommendation engine at: {base_url}")
    
    tester = RecommendationTester(base_url)
    
    try:
        await tester.run_all_tests()
    finally:
        await tester.close()

if __name__ == "__main__":
    asyncio.run(main())