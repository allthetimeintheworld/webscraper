import React from 'react'
import { Typography, Box, Grid, Card, CardContent, Paper } from '@mui/material'
import { TrendingUp, Speed, CheckCircle, Storage } from '@mui/icons-material'

const Dashboard: React.FC = () => {
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
