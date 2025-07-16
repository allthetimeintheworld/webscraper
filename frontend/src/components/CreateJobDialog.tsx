import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material'
import { Add, Delete, ExpandMore, Help } from '@mui/icons-material'

interface CreateJobDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (jobData: any) => void
}

const CreateJobDialog: React.FC<CreateJobDialogProps> = ({ open, onClose, onSubmit }) => {
  const [jobData, setJobData] = useState({
    name: '',
    description: '',
    urls: [''],
    scrapingRules: {
      title: { selector: '', attribute: 'text' },
      description: { selector: '', attribute: 'text' },
      price: { selector: '', attribute: 'text' },
      image: { selector: '', attribute: 'src' },
      link: { selector: '', attribute: 'href' },
      custom: []
    },
    settings: {
      delay: 2,
      useJavaScript: false,
      followPagination: false,
      maxPages: 10,
      userAgent: 'default'
    },
    schedule: ''
  })

  const addUrl = () => {
    setJobData(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }))
  }

  const removeUrl = (index: number) => {
    setJobData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }))
  }

  const updateUrl = (index: number, value: string) => {
    setJobData(prev => ({
      ...prev,
      urls: prev.urls.map((url, i) => i === index ? value : url)
    }))
  }

  const addCustomField = () => {
    setJobData(prev => ({
      ...prev,
      scrapingRules: {
        ...prev.scrapingRules,
        custom: [...prev.scrapingRules.custom, { name: '', selector: '', attribute: 'text' }]
      }
    }))
  }

  const updateCustomField = (index: number, field: string, value: string) => {
    setJobData(prev => ({
      ...prev,
      scrapingRules: {
        ...prev.scrapingRules,
        custom: prev.scrapingRules.custom.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  const removeCustomField = (index: number) => {
    setJobData(prev => ({
      ...prev,
      scrapingRules: {
        ...prev.scrapingRules,
        custom: prev.scrapingRules.custom.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSubmit = () => {
    onSubmit(jobData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Scraping Job</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Job Name"
            value={jobData.name}
            onChange={(e) => setJobData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={jobData.description}
            onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 3 }}
          />

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Target URLs</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Specify the websites you want to scrape. You can add multiple URLs.
              </Typography>
              {jobData.urls.map((url, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`URL ${index + 1}`}
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://example.com/products"
                  />
                  {jobData.urls.length > 1 && (
                    <IconButton onClick={() => removeUrl(index)}>
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button startIcon={<Add />} onClick={addUrl} variant="outlined" size="small">
                Add URL
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Data Extraction Rules</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Define CSS selectors to extract specific data from the web pages.
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Title Selector"
                    value={jobData.scrapingRules.title.selector}
                    onChange={(e) => setJobData(prev => ({
                      ...prev,
                      scrapingRules: {
                        ...prev.scrapingRules,
                        title: { ...prev.scrapingRules.title, selector: e.target.value }
                      }
                    }))}
                    placeholder="h1.product-title"
                    helperText="CSS selector for the title"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Description Selector"
                    value={jobData.scrapingRules.description.selector}
                    onChange={(e) => setJobData(prev => ({
                      ...prev,
                      scrapingRules: {
                        ...prev.scrapingRules,
                        description: { ...prev.scrapingRules.description, selector: e.target.value }
                      }
                    }))}
                    placeholder=".product-description"
                    helperText="CSS selector for description"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Price Selector"
                    value={jobData.scrapingRules.price.selector}
                    onChange={(e) => setJobData(prev => ({
                      ...prev,
                      scrapingRules: {
                        ...prev.scrapingRules,
                        price: { ...prev.scrapingRules.price, selector: e.target.value }
                      }
                    }))}
                    placeholder=".price"
                    helperText="CSS selector for price"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Image Selector"
                    value={jobData.scrapingRules.image.selector}
                    onChange={(e) => setJobData(prev => ({
                      ...prev,
                      scrapingRules: {
                        ...prev.scrapingRules,
                        image: { ...prev.scrapingRules.image, selector: e.target.value }
                      }
                    }))}
                    placeholder="img.product-image"
                    helperText="CSS selector for image"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Custom Fields</Typography>
              {jobData.scrapingRules.custom.map((field, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    label="Field Name"
                    value={field.name}
                    onChange={(e) => updateCustomField(index, 'name', e.target.value)}
                    placeholder="rating"
                    size="small"
                  />
                  <TextField
                    label="CSS Selector"
                    value={field.selector}
                    onChange={(e) => updateCustomField(index, 'selector', e.target.value)}
                    placeholder=".rating-stars"
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Attribute</InputLabel>
                    <Select
                      value={field.attribute}
                      onChange={(e) => updateCustomField(index, 'attribute', e.target.value)}
                    >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="href">Link (href)</MenuItem>
                      <MenuItem value="src">Image (src)</MenuItem>
                      <MenuItem value="value">Value</MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton onClick={() => removeCustomField(index)}>
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<Add />} onClick={addCustomField} variant="outlined" size="small">
                Add Custom Field
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Scraping Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Delay Between Requests (seconds)"
                    type="number"
                    value={jobData.settings.delay}
                    onChange={(e) => setJobData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, delay: Number(e.target.value) }
                    }))}
                    helperText="Recommended: 1-5 seconds"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Pages to Scrape"
                    type="number"
                    value={jobData.settings.maxPages}
                    onChange={(e) => setJobData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, maxPages: Number(e.target.value) }
                    }))}
                    helperText="0 for unlimited"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={jobData.settings.useJavaScript}
                        onChange={(e) => setJobData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, useJavaScript: e.target.checked }
                        }))}
                      />
                    }
                    label="Enable JavaScript rendering (for dynamic content)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={jobData.settings.followPagination}
                        onChange={(e) => setJobData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, followPagination: e.target.checked }
                        }))}
                      />
                    }
                    label="Follow pagination links automatically"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Schedule (Optional)"
              value={jobData.schedule}
              onChange={(e) => setJobData(prev => ({ ...prev, schedule: e.target.value }))}
              placeholder="0 */6 * * * (every 6 hours)"
              helperText="Cron expression for automatic scheduling"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Job
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateJobDialog
