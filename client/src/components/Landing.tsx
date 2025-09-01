import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart3, Brain, Shield, TrendingUp, Moon, Sun, MessageSquare, Zap, ArrowRight, CheckCircle, Play } from 'lucide-react';
import GoogleLoginButton from './auth/GoogleLoginButton';

const Landing: React.FC = () => {
  const { signIn, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Parsing',
      description: 'Simply type "Bought coffee for $5" and watch AI categorize it automatically',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Beautiful charts and insights that help you understand your spending patterns',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and stored securely with Google OAuth protection',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Financial Insights',
      description: 'Get personalized recommendations to improve your financial health',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Sign In Securely',
      description: 'Connect with your Google account for secure, encrypted access to your financial data.',
      icon: Shield
    },
    {
      step: 2,
      title: 'Add Transactions Naturally',
      description: 'Type in plain English like "Bought lunch for $12" and our AI will parse and categorize it.',
      icon: MessageSquare
    },
    {
      step: 3,
      title: 'Get Smart Insights',
      description: 'View beautiful charts, spending trends, and personalized financial recommendations.',
      icon: TrendingUp
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      content: 'FinanceAI has completely transformed how I track my expenses. The natural language input is a game-changer!',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Software Engineer',
      content: 'The AI categorization is incredibly accurate. I love how it learns from my spending patterns.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Emily Johnson',
      role: 'Freelancer',
      content: 'Perfect for tracking both personal and business expenses. The insights help me budget better.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#16191f] dark:to-[#1a1d24] transition-colors duration-500">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto relative z-10">
        <div className={`flex items-center space-x-2 transform transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <BarChart3 className="h-8 w-8 text-[#e05b19]" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">FinanceAI</span>
        </div>
        
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl bg-white dark:bg-[#1f2226] shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
          style={{ transitionDelay: '200ms' }}
        >
          {theme === 'light' ? 
            <Moon className="h-5 w-5 text-gray-600" /> : 
            <Sun className="h-5 w-5 text-yellow-400" />
          }
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Smart Finance Tracking
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#e05b19] to-[#f97316] animate-pulse">
              Made Simple
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Track expenses with natural language, get AI-powered insights, and take control of your finances with beautiful visualizations.
          </p>
          <GoogleLoginButton />
          {/* <button
            onClick={signIn}
            disabled={loading}
            className="group inline-flex items-center px-8 py-4 bg-[#e05b19] hover:bg-[#d14d0f] text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
            ) : (
              <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button> */}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group bg-white dark:bg-[#1f2226] p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 w-fit group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-[#e05b19] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className={`mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get started in minutes with our intuitive three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className="bg-white dark:bg-[#1f2226] p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-[#e05b19] text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                      {step.step}
                    </div>
                    <step.icon className="h-8 w-8 text-[#e05b19] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-[#e05b19] animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div className={`mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
          <div className="bg-white dark:bg-[#1f2226] rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Natural Language Magic
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                See how our AI understands your spending in plain English
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 text-[#e05b19] mr-2" />
                  What You Type
                </h3>
                <div className="space-y-3">
                  {[
                    '"Bought coffee at Starbucks for $6.50"',
                    '"Got my $3500 salary today"',
                    '"Spent $45 on gas at Shell"',
                    '"Ordered Panda Express for $25"',
                    '"Samsung Galaxy watch $250"'
                  ].map((example, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 dark:bg-[#16191f] p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-[#e05b19] transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <code className="text-[#e05b19] font-medium text-sm md:text-base">{example}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 text-[#e05b19] mr-2" />
                  AI Understanding
                </h3>
                <div className="space-y-3">
                  {[
                    { category: 'Food & Dining', amount: '$6.50', confidence: '95%' },
                    { category: 'Income', amount: '+$3,500', confidence: '98%' },
                    { category: 'Transportation', amount: '$45.00', confidence: '92%' },
                    { category: 'Food & Dining', amount: '$25.00', confidence: '89%' },
                    { category: 'Electronics', amount: '$250.00', confidence: '96%' }
                  ].map((result, index) => (
                    <div 
                      key={index}
                      className="bg-gradient-to-r from-[#e05b19]/5 to-[#f97316]/5 dark:from-[#e05b19]/10 dark:to-[#f97316]/10 p-4 rounded-xl border border-[#e05b19]/20 hover:border-[#e05b19]/40 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{result.category}</p>
                          <p className={`text-lg font-bold ${result.amount.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {result.amount}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {result.confidence}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className={`mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1200ms' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join the community of smart spenders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-[#1f2226] p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 ring-2 ring-[#e05b19] ring-offset-2 ring-offset-white dark:ring-offset-[#1f2226]"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1400ms' }}>
          <div className="bg-gradient-to-r from-[#e05b19] to-[#f97316] rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Trusted Worldwide</h2>
              <p className="text-xl opacity-90">Join thousands of users managing their finances smarter</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '50K+', label: 'Active Users' },
                { number: '2M+', label: 'Transactions Tracked' },
                { number: '99.9%', label: 'Uptime' },
                { number: '4.9★', label: 'User Rating' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1600ms' }}>
          <div className="bg-white dark:bg-[#1f2226] rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Start tracking your finances intelligently today. No credit card required.
            </p>
            
            <button
              onClick={signIn}
              disabled={loading}
              className="group inline-flex items-center px-10 py-5 bg-[#e05b19] hover:bg-[#d14d0f] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xl"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              ) : (
                <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
              )}
              Get Started Free
            </button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Free forever • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1f2226] border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-[#e05b19]" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">FinanceAI</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center md:text-right">
              © 2025 FinanceAI. Built with AI-powered intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;