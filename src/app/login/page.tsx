'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Zap } from 'lucide-react';
import { AuthError } from 'firebase/auth';
import { PrismFluxLoader } from '@/components/ui/prism-loader';
import { AnimatedLoginPage } from '@/components/ui/animated-characters-login-page';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailLink, setShowEmailLink] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [emailLinkEmail, setEmailLinkEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [emailLinkMessage, setEmailLinkMessage] = useState('');
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendSignInLink, completeSignInWithEmailLink, resetPassword, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const getErrorMessage = (error: AuthError) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      // Redirect will happen automatically via useEffect
    } catch (error: any) {
      console.error('Email sign in error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await signInWithGoogle();
      // Redirect will happen automatically via useEffect
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(resetEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(emailLinkEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Sending email link to:', emailLinkEmail);
      await sendSignInLink(emailLinkEmail);
      setEmailLinkMessage('Sign-in link sent! Check your email and click the link to sign in.');
      setShowEmailLink(false);
      setEmailLinkEmail('');
      console.log('Email link sent successfully');
    } catch (error: any) {
      console.error('Email link error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <PrismFluxLoader size={60} className="mx-auto mb-4" />
          <p className="text-muted-foreground">Welcome back! Redirecting...</p>
        </div>
      </div>
    );
  }

  if (showEmailLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Passwordless Sign In
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive a secure sign-in link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleEmailLinkSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-link">Email</Label>
                <Input
                  id="email-link"
                  type="email"
                  value={emailLinkEmail}
                  onChange={(e) => setEmailLinkEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  'Send Sign-In Link'
                )}
              </Button>
            </form>
            
            <Button
              variant="ghost"
              onClick={() => setShowEmailLink(false)}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Reset Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
            </form>
            
            <Button
              variant="ghost"
              onClick={() => setShowForgotPassword(false)}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <AnimatedLoginPage
        email={email}
        password={password}
        showPassword={showPassword}
        error={error}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        isSignUp={isSignUp}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onShowPasswordToggle={() => setShowPassword(!showPassword)}
        onSubmit={handleEmailSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onForgotPassword={() => setShowForgotPassword(true)}
        onSignUp={() => {
          setIsSignUp(!isSignUp);
          setError(null);
          setResetMessage('');
          setEmailLinkMessage('');
        }}
        onEmailLinkSignIn={() => setShowEmailLink(true)}
        brandName="CodeCrafters"
      />
      
      {/* Additional links for email link sign-in and sign up toggle - shown as a small overlay or modal */}
      {emailLinkMessage && (
        <div className="fixed bottom-4 right-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md shadow-lg z-50 max-w-sm">
          {emailLinkMessage}
        </div>
      )}
    </>
  );
}