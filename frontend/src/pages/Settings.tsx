import React from 'react'
import { Typography, Box, Card, CardContent, Switch, FormControlLabel, Button, Divider } from '@mui/material'
import { Save } from '@mui/icons-material'

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        Configure your scraper settings here.
      </Typography>

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable automatic retries"
          />
          <br />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Use rotating user agents"
          />
          <br />
          <FormControlLabel
            control={<Switch />}
            label="Enable JavaScript rendering"
          />
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Rate Limiting
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Current delay: 2 seconds between requests
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Max concurrent requests: 5
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<Save />}>
          Save Settings
        </Button>
      </Box>
    </Box>
  )
}

export default Settings
