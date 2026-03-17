
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Alert } from '../components';
import { MapPin, ArrowLeft, Mail } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Reset password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive reset instructions
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Check your email
              </h3>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to {email}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <Alert
                type="info"
                message="This is a demo. In production, this would send an actual email."
              />
              
              <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  size="lg"
                >
                  Send reset link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};