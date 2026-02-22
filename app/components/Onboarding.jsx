// ============================================
// FORESIGHT - ONBOARDING FLOW
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks';

// ============================================
// ONBOARDING CONFIGURATION
// ============================================

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Foresight',
    subtitle: 'Your guide through the custody process'
  },
  {
    id: 'jurisdiction',
    title: 'Where is your case?',
    subtitle: 'We\'ll customize everything for your province'
  },
  {
    id: 'situation',
    title: 'Tell us about your situation',
    subtitle: 'This helps us personalize your experience'
  },
  {
    id: 'goals',
    title: 'What are your goals?',
    subtitle: 'We\'ll prioritize features that matter most to you'
  },
  {
    id: 'tour',
    title: 'Quick Tour',
    subtitle: 'Let\'s show you around'
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Let\'s get started on your case'
  }
];

const JURISDICTIONS = [
  { id: 'saskatchewan', name: 'Saskatchewan', flag: '🇨🇦', court: 'Court of King\'s Bench' },
  { id: 'alberta', name: 'Alberta', flag: '🇨🇦', court: 'Court of King\'s Bench' },
  { id: 'ontario', name: 'Ontario', flag: '🇨🇦', court: 'Superior Court of Justice' },
  { id: 'bc', name: 'British Columbia', flag: '🇨🇦', court: 'Provincial/Supreme Court' },
  { id: 'manitoba', name: 'Manitoba', flag: '🇨🇦', court: 'Court of King\'s Bench' }
];

const SITUATIONS = [
  { id: 'starting', label: 'Just starting the process', icon: '🚀', description: 'Haven\'t filed yet' },
  { id: 'filed', label: 'Already filed', icon: '📋', description: 'Case is in progress' },
  { id: 'responding', label: 'Responding to a filing', icon: '📩', description: 'Other parent filed first' },
  { id: 'modifying', label: 'Modifying existing order', icon: '🔄', description: 'Changing current arrangement' },
  { id: 'enforcement', label: 'Enforcement issues', icon: '⚖️', description: 'Order not being followed' },
  { id: 'exploring', label: 'Just exploring options', icon: '🔍', description: 'Learning about the process' }
];

const GOALS = [
  { id: 'understand-process', label: 'Understand the legal process', icon: '📚' },
  { id: 'prepare-documents', label: 'Prepare my documents', icon: '📄' },
  { id: 'track-deadlines', label: 'Track important deadlines', icon: '📅' },
  { id: 'get-support', label: 'Connect with others', icon: '👥' },
  { id: 'find-mentor', label: 'Find a mentor', icon: '🤝' },
  { id: 'ai-help', label: 'Get AI-powered guidance', icon: '🤖' }
];

const TOUR_FEATURES = [
  {
    id: 'filing-guide',
    title: 'Filing Guide',
    description: 'Step-by-step instructions for your jurisdiction. Track your progress and never miss a requirement.',
    icon: '📋',
    color: 'orange'
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Ask questions about custody procedures, forms, and timelines. Available 24/7.',
    icon: '🤖',
    color: 'blue'
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect with other parents going through similar situations. Share experiences and support each other.',
    icon: '👥',
    color: 'green'
  },
  {
    id: 'documents',
    title: 'Document Analysis',
    description: 'Upload your documents for AI-powered review. Get suggestions to improve your filings.',
    icon: '📄',
    color: 'purple'
  },
  {
    id: 'calendar',
    title: 'Deadline Tracker',
    description: 'Never miss a filing deadline or court date. Get reminders before important dates.',
    icon: '📅',
    color: 'red'
  },
  {
    id: 'mentors',
    title: 'Mentor Matching',
    description: 'Connect with parents who\'ve successfully navigated their own cases.',
    icon: '🤝',
    color: 'pink'
  }
];

// ============================================
// MAIN ONBOARDING COMPONENT
// ============================================

export function OnboardingFlow({ onComplete }) {
  const { profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    jurisdiction: profile?.jurisdiction || '',
    situation: '',
    goals: [],
    tourCompleted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Save onboarding data to profile
      await updateProfile({
        jurisdiction: data.jurisdiction,
        onboarding_completed: true,
        onboarding_data: {
          situation: data.situation,
          goals: data.goals,
          completed_at: new Date().toISOString()
        }
      });
      onComplete?.();
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skip button */}
      {currentStep < ONBOARDING_STEPS.length - 1 && (
        <button
          onClick={handleSkip}
          className="fixed top-6 right-6 text-slate-400 hover:text-white text-sm z-50"
        >
          Skip for now
        </button>
      )}

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep
                    ? 'bg-orange-500'
                    : i < currentStep
                    ? 'bg-orange-500/50'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{step.title}</h1>
            <p className="text-slate-400">{step.subtitle}</p>
          </div>

          {/* Step-specific content */}
          {step.id === 'welcome' && (
            <WelcomeStep onNext={handleNext} />
          )}

          {step.id === 'jurisdiction' && (
            <JurisdictionStep
              value={data.jurisdiction}
              onChange={(v) => setData({ ...data, jurisdiction: v })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step.id === 'situation' && (
            <SituationStep
              value={data.situation}
              onChange={(v) => setData({ ...data, situation: v })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step.id === 'goals' && (
            <GoalsStep
              value={data.goals}
              onChange={(v) => setData({ ...data, goals: v })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step.id === 'tour' && (
            <TourStep
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step.id === 'complete' && (
            <CompleteStep
              data={data}
              onComplete={handleComplete}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP COMPONENTS
// ============================================

function WelcomeStep({ onNext }) {
  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-5xl shadow-2xl shadow-orange-500/20">
          👁️
        </div>
      </div>

      {/* Welcome message */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 space-y-4">
        <p className="text-lg text-slate-300">
          We know you're going through a difficult time. Custody battles are stressful, 
          expensive, and confusing. <strong className="text-white">But you're not alone.</strong>
        </p>
        <p className="text-slate-400">
          Foresight was built by someone who spent $30,000 on lawyers who failed him, 
          then figured out the system himself and won. Now we're here to help you do the same.
        </p>
      </div>

      {/* What you'll get */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '📋', text: 'Step-by-step guides' },
          { icon: '🤖', text: 'AI assistance' },
          { icon: '👥', text: 'Community support' },
          { icon: '🤝', text: 'Mentor matching' }
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center gap-3"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm">{item.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
      >
        Let's Get Started →
      </button>
    </div>
  );
}

function JurisdictionStep({ value, onChange, onNext, onBack }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {JURISDICTIONS.map((j) => (
          <button
            key={j.id}
            onClick={() => onChange(j.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              value === j.id
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{j.flag}</span>
              <div>
                <div className="font-semibold text-lg">{j.name}</div>
                <div className="text-sm text-slate-400">{j.court}</div>
              </div>
              {value === j.id && (
                <span className="ml-auto text-orange-500 text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500 text-center">
        Don't see your province? More coming soon! Contact us at support@foresight.app
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function SituationStep({ value, onChange, onNext, onBack }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {SITUATIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              value === s.id
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="font-semibold">{s.label}</div>
                <div className="text-sm text-slate-400">{s.description}</div>
              </div>
              {value === s.id && (
                <span className="ml-auto text-orange-500 text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function GoalsStep({ value, onChange, onNext, onBack }) {
  const toggleGoal = (goalId) => {
    if (value.includes(goalId)) {
      onChange(value.filter((id) => id !== goalId));
    } else {
      onChange([...value, goalId]);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-center">
        Select all that apply. We'll prioritize these features for you.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              value.includes(g.id)
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            }`}
          >
            <div className="text-2xl mb-2">{g.icon}</div>
            <div className="text-sm font-medium">{g.label}</div>
            {value.includes(g.id) && (
              <span className="absolute top-2 right-2 text-orange-500">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={value.length === 0}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function TourStep({ onNext, onBack }) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const feature = TOUR_FEATURES[currentFeature];

  const colorClasses = {
    orange: 'from-orange-500 to-amber-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    red: 'from-red-500 to-rose-500',
    pink: 'from-pink-500 to-fuchsia-500'
  };

  const handleNextFeature = () => {
    if (currentFeature < TOUR_FEATURES.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature card */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 text-center">
        <div 
          className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${colorClasses[feature.color]} flex items-center justify-center text-4xl mb-6 shadow-lg`}
        >
          {feature.icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
        <p className="text-slate-400 text-lg">{feature.description}</p>
      </div>

      {/* Feature indicators */}
      <div className="flex justify-center gap-2">
        {TOUR_FEATURES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentFeature(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === currentFeature
                ? 'bg-orange-500'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
        <button
          onClick={handleNextFeature}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold"
        >
          {currentFeature < TOUR_FEATURES.length - 1 ? 'Next Feature' : 'Finish Tour'}
        </button>
      </div>
    </div>
  );
}

function CompleteStep({ data, onComplete, isSubmitting }) {
  const jurisdiction = JURISDICTIONS.find((j) => j.id === data.jurisdiction);
  const situation = SITUATIONS.find((s) => s.id === data.situation);
  const selectedGoals = GOALS.filter((g) => data.goals.includes(g.id));

  return (
    <div className="space-y-6">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-5xl">
          🎉
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-4">Your Profile</h3>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
          <span className="text-2xl">{jurisdiction?.flag}</span>
          <div>
            <div className="text-sm text-slate-400">Jurisdiction</div>
            <div className="font-medium">{jurisdiction?.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
          <span className="text-2xl">{situation?.icon}</span>
          <div>
            <div className="text-sm text-slate-400">Situation</div>
            <div className="font-medium">{situation?.label}</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50">
          <div className="text-sm text-slate-400 mb-2">Your Goals</div>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((g) => (
              <span
                key={g.id}
                className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm"
              >
                {g.icon} {g.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
        <h4 className="font-semibold text-orange-300 mb-2">🚀 What's Next</h4>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Check out your personalized filing guide</li>
          <li>• Ask the AI assistant your first question</li>
          <li>• Join the community and introduce yourself</li>
        </ul>
      </div>

      {/* CTA */}
      <button
        onClick={onComplete}
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-lg disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Setting up...
          </span>
        ) : (
          'Go to Dashboard →'
        )}
      </button>
    </div>
  );
}

// ============================================
// FEATURE TOOLTIPS (For returning users)
// ============================================

const TOOLTIP_STEPS = [
  {
    id: 'filing-guide',
    target: '[data-tour="filing-guide"]',
    title: 'Filing Guide',
    content: 'Track your progress through the custody filing process step-by-step.',
    position: 'bottom'
  },
  {
    id: 'ai-assistant',
    target: '[data-tour="ai-assistant"]',
    title: 'AI Assistant',
    content: 'Ask questions about custody procedures, forms, and timelines.',
    position: 'bottom'
  },
  {
    id: 'community',
    target: '[data-tour="community"]',
    title: 'Community',
    content: 'Connect with other parents going through similar situations.',
    position: 'bottom'
  },
  {
    id: 'deadlines',
    target: '[data-tour="deadlines"]',
    title: 'Deadlines',
    content: 'Never miss an important date. Get reminders before due dates.',
    position: 'left'
  }
];

export function FeatureTooltips({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const step = TOOLTIP_STEPS[currentStep];

  useEffect(() => {
    // Find target element and position tooltip
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setPosition({
        top: step.position === 'bottom' ? rect.bottom + 10 : rect.top,
        left: step.position === 'left' ? rect.left - 280 : rect.left + rect.width / 2 - 140
      });
    }
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < TOOLTIP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* Tooltip */}
      <div
        className="fixed z-50 w-72 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">
            {currentStep + 1} of {TOOLTIP_STEPS.length}
          </span>
          <button onClick={handleSkip} className="text-slate-400 hover:text-white text-sm">
            Skip
          </button>
        </div>
        <h4 className="font-semibold mb-1">{step.title}</h4>
        <p className="text-sm text-slate-400 mb-4">{step.content}</p>
        <button
          onClick={handleNext}
          className="w-full py-2 bg-orange-500 rounded-lg text-sm font-medium"
        >
          {currentStep < TOOLTIP_STEPS.length - 1 ? 'Next' : 'Done'}
        </button>
      </div>
    </>
  );
}

// ============================================
// FIRST-TIME USER CHECKLIST
// ============================================

export function GettingStartedChecklist({ onDismiss }) {
  const [tasks, setTasks] = useState([
    { id: 'profile', label: 'Complete your profile', completed: false, link: '/profile' },
    { id: 'filing-guide', label: 'Review your filing guide', completed: false, link: '/filing' },
    { id: 'ai-question', label: 'Ask your first AI question', completed: false, link: '/ai' },
    { id: 'community', label: 'Introduce yourself in community', completed: false, link: '/community' },
    { id: 'deadline', label: 'Add your first deadline', completed: false, link: '/calendar' }
  ]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  const toggleTask = (taskId) => {
    setTasks(tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  if (completedCount === tasks.length) {
    return null; // Hide when all complete
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">🚀 Getting Started</h3>
        <button onClick={onDismiss} className="text-slate-400 hover:text-white text-sm">
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Progress</span>
          <span className="text-orange-400">{completedCount}/{tasks.length}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              task.completed ? 'bg-green-500/10' : 'bg-slate-800/50'
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-slate-600 hover:border-green-500'
              }`}
            >
              {task.completed && '✓'}
            </button>
            <a
              href={task.link}
              className={`flex-1 text-sm ${
                task.completed ? 'text-slate-400 line-through' : 'text-white'
              }`}
            >
              {task.label}
            </a>
            <span className="text-slate-400">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// ONBOARDING WRAPPER (Checks if needed)
// ============================================

export function OnboardingWrapper({ children }) {
  const { profile, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
    );
  }

  return children;
}

// ============================================
// EXPORTS
// ============================================

export default OnboardingFlow;
