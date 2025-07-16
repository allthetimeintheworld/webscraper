import React, { useState } from 'react'
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import { 
  Newspaper,
  Search
} from '@mui/icons-material'

const NewsAPIDemo: React.FC = () => {
  const [query, setQuery] = useState('trump')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchNews = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/newsapi?query=${encodeURIComponent(query)}&from_date=2025-07-15`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const jobData = await response.json()
      
      // Get the results
      const resultsResponse = await fetch(`http://localhost:8000/api/jobs/newsapi/results/${jobData.job_id}`)
      if (resultsResponse.ok) {
        const newsResults = await resultsResponse.json()
        setResults(newsResults)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Newspaper sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">
          NewsAPI - Live News Scraper
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          placeholder="e.g., trump, biden, election"
        />
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Search />}
          onClick={searchNews}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search News'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📰 Found {results.articles_count} articles ({results.total_results} total available)
          </Typography>
          
          <Grid container spacing={2}>
            {results.articles.slice(0, 6).map((article: any, index: number) => (
              <Grid item xs={12} md={6} key={index}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {article.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip
                        label={article.source.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={new Date(article.publishedAt).toLocaleDateString()}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  )
}

export default NewsAPIDemo
