import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material'
import { Add, PlayArrow, Pause, Delete } from '@mui/icons-material'
import CreateJobDialog from '../components/CreateJobDialog'

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      name: "E-commerce Product Scraper",
      status: "running",
      progress: 68,
      urls: ["shop.example.com", "store.example.com"],
      lastRun: "2 hours ago"
    },
    {
      id: 2,
      name: "News Articles Collector",
      status: "completed",
      progress: 100,
      urls: ["news.example.com"],
      lastRun: "1 day ago"
    },
    {
      id: 3,
      name: "Social Media Monitor",
      status: "paused",
      progress: 23,
      urls: ["social.example.com"],
      lastRun: "3 days ago"
    }
  ])
  
  const [dialogOpen, setDialogOpen] = useState(false)

  // Function to handle job creation
  const handleCreateJob = async (jobData: any) => {
    console.log('Creating job with data:', jobData)
    try {
      const response = await fetch('http://localhost:8000/api/jobs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: jobData.name,
          description: jobData.description,
          urls: jobData.urls.filter((url: string) => url.trim() !== ''),
          scraping_rules: jobData.scrapingRules,
          settings: jobData.settings
        })
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const newJob = await response.json()
        console.log('New job created:', newJob)
        // Add the new job to the list
        setJobs(prevJobs => [...prevJobs, {
          id: newJob.id,
          name: newJob.name,
          status: newJob.status,
          progress: newJob.progress,
          urls: newJob.urls,
          lastRun: 'Never'
        }])
        setDialogOpen(false)
        alert('Job created successfully!')
      } else {
        const errorText = await response.text()
        console.error('Failed to create job:', response.status, errorText)
        alert('Failed to create job: ' + errorText)
      }
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Error creating job: ' + error)
    }
  }

  // Function to start a job
  const handleStartJob = async (jobId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Job started:', result)
        
        // Update job status in the list
        setJobs(prevJobs => prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: 'running', progress: 0 }
            : job
        ))
        
        alert(`Job started successfully!`)
        
        // Start polling for progress updates
        startProgressPolling(jobId)
      } else {
        const errorText = await response.text()
        console.error('Failed to start job:', response.status, errorText)
        alert('Failed to start job: ' + errorText)
      }
    } catch (error) {
      console.error('Error starting job:', error)
      alert('Error starting job: ' + error)
    }
  }

  // Function to stop a job
  const handleStopJob = async (jobId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Job stopped:', result)
        
        // Update job status in the list
        setJobs(prevJobs => prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: 'paused' }
            : job
        ))
        
        alert(`Job stopped successfully!`)
      } else {
        const errorText = await response.text()
        console.error('Failed to stop job:', response.status, errorText)
        alert('Failed to stop job: ' + errorText)
      }
    } catch (error) {
      console.error('Error stopping job:', error)
      alert('Error stopping job: ' + error)
    }
  }

  // Function to start polling for job progress
  const startProgressPolling = (jobId: number) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/status`)
        if (response.ok) {
          const statusData = await response.json()
          
          // Update job progress
          setJobs(prevJobs => prevJobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  status: statusData.status,
                  progress: statusData.progress?.progress_percentage || job.progress,
                  lastRun: statusData.status === 'completed' ? 'Just now' : job.lastRun
                }
              : job
          ))
          
          // Stop polling if job is completed or failed
          if (statusData.status === 'completed' || statusData.status === 'failed') {
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error)
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'primary'
      case 'completed': return 'success'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Scraping Jobs
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Create New Job
        </Button>
      </Box>
      
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Manage and monitor your web scraping jobs here.
      </Typography>

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                    {job.name}
                  </Typography>
                  <Chip 
                    label={job.status} 
                    color={getStatusColor(job.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Progress: {job.progress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={job.progress} 
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Target URLs: {job.urls.join(', ')}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  Last run: {job.lastRun}
                </Typography>
              </CardContent>
              
              <CardActions>
                {job.status === 'running' ? (
                  <Button 
                    size="small" 
                    startIcon={<Pause />} 
                    onClick={() => handleStopJob(job.id)}
                    color="warning"
                  >
                    Stop
                  </Button>
                ) : (
                  <Button 
                    size="small" 
                    startIcon={<PlayArrow />}
                    onClick={() => handleStartJob(job.id)}
                    color="primary"
                  >
                    Start
                  </Button>
                )}
                {(job.status === 'completed' || job.status === 'running') && (
                  <Button 
                    size="small" 
                    onClick={() => window.open(`http://localhost:8000/api/jobs/${job.id}/results`, '_blank')}
                    color="info"
                  >
                    View Results
                  </Button>
                )}
                <Button size="small" startIcon={<Delete />} color="error">
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <CreateJobDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateJob}
      />
    </Box>
  )
}

export default Jobs
