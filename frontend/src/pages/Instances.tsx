import React from 'react'
import { Typography, Box, Card, CardContent, Chip, Grid, Button } from '@mui/material'
import { Add, CloudCircle } from '@mui/icons-material'

const Instances: React.FC = () => {
  const instances = [
    { id: 1, name: 'Scraper-US-East-1', status: 'running', region: 'us-east-1', load: '68%' },
    { id: 2, name: 'Scraper-EU-West-1', status: 'running', region: 'eu-west-1', load: '42%' },
    { id: 3, name: 'Scraper-Asia-1', status: 'stopped', region: 'ap-southeast-1', load: '0%' },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Scraper Instances
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Deploy Instance
        </Button>
      </Box>
      
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Manage your distributed scraper instances here.
      </Typography>

      <Grid container spacing={3}>
        {instances.map((instance) => (
          <Grid item xs={12} md={4} key={instance.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CloudCircle sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6">
                    {instance.name}
                  </Typography>
                </Box>
                <Chip 
                  label={instance.status} 
                  color={instance.status === 'running' ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Region: {instance.region}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Load: {instance.load}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Instances
