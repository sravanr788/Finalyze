import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const GoogleLoginButton: React.FC = () => {
  const { signIn, loading } = useAuth();

  return (
    <Button
      variant="contained"
      onClick={signIn}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
      sx={{
        backgroundColor: '#4285F4',
        '&:hover': {
          backgroundColor: '#357ae8',
        },
        color: 'white',
        textTransform: 'none',
        padding: '10px 24px',
        fontSize: '16px',
        fontWeight: 500,
      }}
    >
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
};

export default GoogleLoginButton;
