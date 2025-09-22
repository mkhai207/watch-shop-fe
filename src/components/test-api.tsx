import React, { useState } from 'react'
import { Button, Box, Typography, Paper } from '@mui/material'
import { reviewService } from 'src/services/review'

const TestAPI: React.FC = () => {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const testAPI = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      console.log('🧪 Testing API call...')
      const response = await reviewService.getReviews({
        page: 1,
        limit: 10
      })
      
      console.log('✅ API test successful:', response)
      setResult(response)
    } catch (err: any) {
      console.error('❌ API test failed:', err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        API Test Component
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testAPI} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test API Call'}
      </Button>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      )}

      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>API Response:</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  )
}

export default TestAPI 