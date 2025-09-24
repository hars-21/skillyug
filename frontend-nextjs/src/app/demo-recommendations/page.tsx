'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Star, TrendingUp, Zap, DollarSign } from 'lucide-react'

interface Course {
  id: string
  title: string
  level: string
  price: number
  currency: string
  features: string[]
  refund_policy?: string
  tokens?: number
  bootcamps?: string
  certificate?: boolean
  description?: string
}

interface Recommendation {
  course: Course
  confidence_score: number
  reasoning: string
  match_type: 'exact' | 'similar' | 'fallback'
}

interface RecommendationResponse {
  query: string
  intent: {
    intent: string
    keywords: string[]
    level?: string
    price_range?: { min?: number; max?: number }
    features?: string[]
  }
  recommendations: Recommendation[]
  message: string
  total_results: number
}

const UI_CHIPS = [
  'certification', 'affordable', 'beginner', 'intermediate', 'advanced',
  'bootcamp', 'refund', 'tokens', 'python', 'javascript', 'web development',
  'data science', 'machine learning'
]

export default function DemoRecommendations() {
  const [query, setQuery] = useState('')
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [maxResults, setMaxResults] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleChip = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) 
        ? prev.filter(c => c !== chip)
        : [...prev, chip]
    )
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_query: query.trim(),
          ui_chips: selectedChips,
          max_results: maxResults
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Failed to get recommendations')
      }
    } catch (err) {
      console.error('Recommendation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to recommendation engine')
    } finally {
      setLoading(false)
    }
  }

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'exact': return <Star className="h-4 w-4 text-green-500" />
      case 'similar': return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'fallback': return <Zap className="h-4 w-4 text-orange-500" />
      default: return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'exact': return 'bg-green-100 text-green-800'
      case 'similar': return 'bg-blue-100 text-blue-800'
      case 'fallback': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Course Recommendation Engine</h1>
        <p className="text-muted-foreground text-lg">
          Test our AI-powered course recommendations with natural language queries
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Query Input
          </CardTitle>
          <CardDescription>
            Describe what course you&apos;re looking for in natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="query">Your Query</Label>
            <Input
              id="query"
              placeholder="e.g., I want to learn Python for beginners under 1500 rupees with certification"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
              className="mt-1"
            />
          </div>

          <div>
            <Label>UI Chips (Optional)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {UI_CHIPS.map((chip) => (
                <Badge
                  key={chip}
                  variant={selectedChips.includes(chip) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => toggleChip(chip)}
                >
                  {chip}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="maxResults">Max Results</Label>
              <Input
                id="maxResults"
                type="number"
                min={1}
                max={10}
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 5)}
                className="w-20 mt-1"
              />
            </div>
            
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <div className="text-sm font-medium">Error: {error}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Intent Parsing Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Parsed Intent
              </CardTitle>
              <CardDescription>How our AI understood your query</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Intent</Label>
                  <p className="text-sm text-muted-foreground">{result.intent.intent}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.intent.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                {result.intent.level && (
                  <div>
                    <Label className="text-sm font-medium">Level</Label>
                    <p className="text-sm text-muted-foreground">{result.intent.level}</p>
                  </div>
                )}
                {result.intent.price_range && (
                  <div>
                    <Label className="text-sm font-medium">Price Range</Label>
                    <p className="text-sm text-muted-foreground">
                      {result.intent.price_range.min && `Min: ₹${result.intent.price_range.min}`}
                      {result.intent.price_range.max && `Max: ₹${result.intent.price_range.max}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Recommendations ({result.total_results})
              </h2>
              <p className="text-muted-foreground">{result.message}</p>
            </div>

            <div className="grid gap-4">
              {result.recommendations.map((rec) => (
                <Card key={rec.course.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {rec.course.title}
                          <Badge className={getMatchTypeColor(rec.match_type)}>
                            {getMatchTypeIcon(rec.match_type)}
                            {rec.match_type}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ₹{rec.course.price}
                          </span>
                          <Badge variant="outline">{rec.course.level}</Badge>
                          <span className="text-sm">
                            {Math.round(rec.confidence_score * 100)}% match
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {rec.course.description && (
                      <p className="text-sm text-muted-foreground">
                        {rec.course.description}
                      </p>
                    )}

                    <div>
                      <Label className="text-sm font-medium">Features</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rec.course.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <Label className="text-sm font-medium">Why this recommendation?</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rec.reasoning}
                      </p>
                    </div>

                    {(rec.course.refund_policy || rec.course.tokens || rec.course.certificate) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {rec.course.certificate && (
                          <Badge variant="secondary">🏆 Certificate</Badge>
                        )}
                        {rec.course.tokens && (
                          <Badge variant="secondary">🎟️ {rec.course.tokens} tokens</Badge>
                        )}
                        {rec.course.refund_policy && (
                          <Badge variant="secondary">💰 {rec.course.refund_policy}</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Example Queries */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Example Queries to Try</CardTitle>
          <CardDescription>Click on any example to test it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'I want to learn Python for beginners',
              'Show me affordable programming courses under 1500',
              'Python course with certification and refund policy',
              'Intermediate level programming bootcamp',
              'Course for beginners with missed class buyback',
              'Python Bounder course with certificate'
            ].map((example) => (
              <Button
                key={example}
                variant="outline"
                className="text-left justify-start h-auto p-3"
                onClick={() => setQuery(example)}
              >
                <div className="text-sm">{example}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}