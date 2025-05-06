import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { useToast } from '@/components/ui/use-toast'; // Import useToast

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast(); // Get toast function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { // Ensure backend URL is correct
        email,
        password,
      });
      login(response.data.token); // Store token using AuthContext
      toast({ // Show success toast
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate('/dashboard'); // Redirect to dashboard on successful login
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast({ // Show error toast
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {/* Optional: Add Forgot Password link */}
                {/* <Link to="/forgot-password" className="ml-auto inline-block text-sm underline"> */}
                {/*   Forgot your password? */}
                {/* </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
