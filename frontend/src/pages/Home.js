import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: 'SQL Challenges',
      description: 'Test your SQL skills with various challenges ranging from basic queries to complex optimizations.',
    },
    {
      title: 'Real-time Feedback',
      description: 'Get immediate feedback on your queries and learn from your mistakes.',
    },
    {
      title: 'Leaderboard',
      description: 'Compete with other users and climb the ranks on our global leaderboard.',
    },
    {
      title: 'Progress Tracking',
      description: 'Track your progress, earn points, and improve your SQL expertise.',
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Welcome to SQL Arena
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Test your SQL skills, compete with others, and become a SQL master!
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {!user ? (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/challenges')}
              >
                Start Coding
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 