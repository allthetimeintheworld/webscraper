#!/usr/bin/env python3
"""
Mock NewsAPI server for testing Trump news scraping
Run this to simulate NewsAPI responses without needing a real API key
"""

from fastapi import FastAPI
from datetime import datetime, timedelta
import uvicorn

app = FastAPI()

@app.get("/v2/everything")
async def mock_newsapi():
    """Mock NewsAPI response with Trump-related articles"""
    return {
        "status": "ok",
        "totalResults": 5,
        "articles": [
            {
                "source": {"id": "cnn", "name": "CNN"},
                "author": "John Reporter",
                "title": "Trump Announces New Policy Initiative",
                "description": "Former President Trump announced a new policy initiative focusing on economic recovery.",
                "url": "https://example.com/trump-policy-1",
                "urlToImage": "https://example.com/image1.jpg",
                "publishedAt": "2025-07-16T12:00:00Z",
                "content": "Former President Trump announced today a comprehensive policy initiative..."
            },
            {
                "source": {"id": "bbc-news", "name": "BBC News"},
                "author": "Jane Smith",
                "title": "Analysis: Trump's Impact on 2024 Election",
                "description": "Political analysts discuss Trump's influence on the upcoming election cycle.",
                "url": "https://example.com/trump-analysis-1",
                "urlToImage": "https://example.com/image2.jpg",
                "publishedAt": "2025-07-16T10:30:00Z",
                "content": "Political experts are analyzing the potential impact of Trump's candidacy..."
            },
            {
                "source": {"id": "reuters", "name": "Reuters"},
                "author": "Mike Johnson",
                "title": "Trump Rally Draws Large Crowd",
                "description": "Thousands attend Trump rally in key swing state.",
                "url": "https://example.com/trump-rally-1",
                "urlToImage": "https://example.com/image3.jpg",
                "publishedAt": "2025-07-16T08:15:00Z",
                "content": "A large crowd gathered yesterday for a Trump rally in Pennsylvania..."
            },
            {
                "source": {"id": "fox-news", "name": "Fox News"},
                "author": "Sarah Davis",
                "title": "Trump Comments on Economic Policy",
                "description": "Trump shares views on current economic policies and proposed changes.",
                "url": "https://example.com/trump-economy-1",
                "urlToImage": "https://example.com/image4.jpg",
                "publishedAt": "2025-07-15T16:45:00Z",
                "content": "Speaking at a press conference, Trump outlined his economic vision..."
            },
            {
                "source": {"id": "washington-post", "name": "Washington Post"},
                "author": "Robert Wilson",
                "title": "Legal Updates in Trump Case",
                "description": "Latest developments in ongoing legal proceedings involving Trump.",
                "url": "https://example.com/trump-legal-1",
                "urlToImage": "https://example.com/image5.jpg",
                "publishedAt": "2025-07-15T14:20:00Z",
                "content": "Court documents filed today reveal new details in the ongoing case..."
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
