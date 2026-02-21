import React from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Mock Google Sign in
    login();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F5F7]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">TiewTrip.</h1>
          <p className="text-slate-500 text-lg">Plan your next adventure with precision.</p>
        </div>

        <Card className="p-10 shadow-xl shadow-slate-200/50">
          <div className="space-y-4">
            <Button 
              variant="secondary" 
              fullWidth 
              className="gap-3 py-4 text-base border-2 hover:border-slate-300 transition-all shadow-sm"
              onClick={handleGoogleLogin}
            >
              <Icons.Google className="w-6 h-6" />
              Continue with Google
            </Button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wider font-semibold">
              By continuing, you agree to our <br />
              <button className="text-slate-600 hover:underline">Terms of Service</button> and <button className="text-slate-600 hover:underline">Privacy Policy</button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};