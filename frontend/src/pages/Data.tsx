import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { Download, Refresh } from '@mui/icons-material'

interface ScrapedResult {
  url: string
  data: Record<string, any>
  success: boolean
  error?: string
  timestamp: number
}

interface JobData {
  job_id: number
  total_results: number
  results: ScrapedResult[]
}

const Data: React.FC = () => {
  const [jobResults, setJobResults] = useState<JobData[]>([])
  const [selectedJob, setSelectedJob] = useState<number | string>('')
  const [loading, setLoading] = useState(false)

  const loadJobResults = async (jobId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/results`)
      if (response.ok) {
        const data = await response.json()
        
        // Update or add job results
        setJobResults(prev => {
          const existingIndex = prev.findIndex(jr => jr.job_id === jobId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = data
            return updated
          } else {
            return [...prev, data]
          }
        })
        
        if (selectedJob === '') {
          setSelectedJob(jobId)
        }
      }
    } catch (error) {
      console.error('Error loading job results:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllResults = async () => {
    // Load results for jobs 1-10 (you can adjust this range)
    for (let jobId = 1; jobId <= 10; jobId++) {
      try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/results`)
        if (response.ok) {
          const data = await response.json()
          if (data.total_results > 0) {
            await loadJobResults(jobId)
          }
        }
      } catch (error) {
        // Job doesn't exist, continue
        continue
      }
    }
  }

  useEffect(() => {
    loadAllResults()
  }, [])

  const currentResults = jobResults.find(jr => jr.job_id === selectedJob)

  const exportToCSV = () => {
    if (!currentResults || currentResults.results.length === 0) return

    // Get all unique keys from all results
    const allKeys = new Set<string>()
    currentResults.results.forEach(result => {
      Object.keys(result.data).forEach(key => allKeys.add(key))
    })
    
    const headers = ['URL', 'Success', 'Timestamp', ...Array.from(allKeys)]
    const csvContent = [
      headers.join(','),
      ...currentResults.results.map(result => [
        `"${result.url}"`,
        result.success,
        new Date(result.timestamp * 1000).toLocaleString(),
        ...Array.from(allKeys).map(key => `"${result.data[key] || ''}"`)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `job_${selectedJob}_results.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Scraped Data
        </Typography>
        <Box>
          <Button startIcon={<Refresh />} onClick={loadAllResults} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={exportToCSV}
            disabled={!currentResults || currentResults.results.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>Select Job</InputLabel>
          <Select
            value={selectedJob}
            label="Select Job"
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            {jobResults.map(jr => (
              <MenuItem key={jr.job_id} value={jr.job_id}>
                Job {jr.job_id} ({jr.total_results} results)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {currentResults && (
          <Chip 
            label={`${currentResults.total_results} results found`} 
            color="primary" 
            variant="outlined"
          />
        )}
      </Box>

      {currentResults && currentResults.results.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentResults.results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      {result.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={result.success ? 'Success' : 'Failed'} 
                      color={result.success ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(result.timestamp * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 400 }}>
                      {Object.entries(result.data).map(([key, value]) => (
                        <Box key={key} sx={{ mb: 1 }}>
                          <strong>{key}:</strong> {String(value).substring(0, 100)}
                          {String(value).length > 100 && '...'}
                        </Box>
                      ))}
                      {result.error && (
                        <Box sx={{ color: 'error.main', mt: 1 }}>
                          <strong>Error:</strong> {result.error}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Data Available
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {jobResults.length === 0 
                ? "No completed jobs found. Create and run a job to see results here."
                : "Select a job from the dropdown to view its results."
              }
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Data
