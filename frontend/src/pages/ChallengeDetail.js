import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/challenges/${id}`);
        setChallenge(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching challenge:', error);
        setError('Failed to load challenge details');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to submit a solution');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await axios.post(`/api/challenges/${id}/submit`, {
        query
      });

      setResult(response.data);
      
      if (response.data.success) {
        // Clear the query input on success
        setQuery('');
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      if (error.response?.status === 401) {
        setError('Please log in to submit a solution');
        navigate('/login');
      } else if (error.response?.status === 400) {
        setError(error.response.data.error || 'Invalid submission data');
      } else {
        setError('Error submitting solution. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {challenge.title}
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <Chip
            label={challenge.difficulty}
            color={
              challenge.difficulty === 'EASY'
                ? 'success'
                : challenge.difficulty === 'MEDIUM'
                ? 'warning'
                : 'error'
            }
          />
          <Chip label={`${challenge.points} points`} color="primary" />
        </Box>
        <Typography variant="body1" paragraph>
          {challenge.description}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your SQL Query
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              variant="outlined"
              placeholder="Enter your SQL query here..."
              sx={{ mb: 2 }}
              disabled={!user}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!user || submitting}
            >
              {!user ? 'Please Log In' : submitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </form>
        </Box>
        {error && (
          <Box sx={{ mt: 4 }}>
            <Alert severity="error">
              {error}
            </Alert>
          </Box>
        )}
        {result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Result
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <div className={`p-4 rounded-md ${
                result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <p>{result.message}</p>
                {result.executionTime && (
                  <p className="mt-2">Execution time: {result.executionTime}ms</p>
                )}
                {result.pointsEarned && (
                  <p className="mt-2">Points earned: {result.pointsEarned}</p>
                )}
              </div>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ChallengeDetail; 