import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { useToast } from '@/components/ui/use-toast'; // Import useToast

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast(); // Get toast function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation (optional, backend handles more)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (!notificationEmail) {
        setNotificationEmail(email); // Default notification email to login email if empty
    }

    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', { // Ensure backend URL is correct
        name,
        email,
        password,
        notificationEmail: notificationEmail || email, // Send login email if notification email is empty
      });
      login(response.data.token); // Automatically log in user after registration
      toast({ // Show success toast
        title: "Registration Successful",
        description: "Your account has been created.",
      });
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast({ // Show error toast
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>Create your Warranty Vault account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                type="email"
                placeholder="notifications@example.com (defaults to login email)"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                disabled={loading}
              />
               <p className="text-xs text-muted-foreground">
                Enter the email address where you want to receive warranty expiry notifications. If left blank, it will default to your login email.
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
