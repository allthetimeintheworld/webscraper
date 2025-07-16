import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Button, 
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress
} from '@mui/material'
import { 
  TrendingUp, 
  Speed, 
  CheckCircle, 
  Storage, 
  Newspaper,
  Search,
  ExpandMore,
  OpenInNew
} from '@mui/icons-material'

const Dashboard: React.FC = () => {
  const [newsQuery, setNewsQuery] = useState('trump')
  const [newsResults, setNewsResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stats = [
    {
      title: 'Active Jobs',
      value: '3',
      icon: <Speed color="primary" />,
      color: '#1976d2'
    },
    {
      title: 'Total Scraped',
      value: '1,247',
      icon: <Storage color="secondary" />,
      color: '#dc004e'
    },
    {
      title: 'Success Rate',
      value: '98.2%',
      icon: <CheckCircle color="success" />,
      color: '#2e7d32'
    },
    {
      title: 'Data Growth',
      value: '+12%',
      icon: <TrendingUp color="warning" />,
      color: '#ed6c02'
    }
  ]

  const createNewsJob = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/newsapi?query=${encodeURIComponent(newsQuery)}&from_date=2025-07-15`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const jobData = await response.json()
      
      // Get the results
      const resultsResponse = await fetch(`http://localhost:8000/api/jobs/newsapi/results/${jobData.job_id}`)
      if (resultsResponse.ok) {
        const results = await resultsResponse.json()
        setNewsResults(results)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Welcome to your web scraping platform! Monitor your scraping operations here.
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ fontSize: 40 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* NewsAPI Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Newspaper sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  NewsAPI - Live News Scraping
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Search Query"
                  value={newsQuery}
                  onChange={(e) => setNewsQuery(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1 }}
                  placeholder="e.g., trump, biden, election"
                />
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                  onClick={createNewsJob}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search News'}
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {newsResults && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">
                      📰 Found {newsResults.articles_count} articles ({newsResults.total_results} total available)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {newsResults.articles.slice(0, 5).map((article: any, index: number) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {article.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  {article.description}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                                  {article.author && (
                                    <Chip
                                      label={article.author}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => window.open(article.url, '_blank')}
                            >
                              <OpenInNew />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Job "E-commerce Scraper" completed successfully - 245 items scraped
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Job "News Articles" is running - 67% complete
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • New scraper instance deployed in region us-east-1
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Backend API: ✅ Running
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Database: ✅ Connected
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Queue System: ✅ Operational
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Dashboard
