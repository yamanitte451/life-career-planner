'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BasicInfoForm from '../../components/forms/BasicInfoForm';
import IncomeForm from '../../components/forms/IncomeForm';
import ExpenseForm from '../../components/forms/ExpenseForm';
import AssetForm from '../../components/forms/AssetForm';
import InvestmentForm from '../../components/forms/InvestmentForm';

const steps = [
  { title: '基本情報', icon: '👤', component: BasicInfoForm },
  { title: '収入', icon: '💰', component: IncomeForm },
  { title: '支出', icon: '🛒', component: ExpenseForm },
  { title: '資産・負債', icon: '🏦', component: AssetForm },
  { title: '投資前提', icon: '📈', component: InvestmentForm },
];

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const StepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(i)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
                  i === currentStep
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : i < currentStep
                    ? 'bg-indigo-200 text-indigo-700'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.icon}
              </button>
              <span className={`text-xs mt-1 hidden sm:block ${i === currentStep ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            STEP {currentStep + 1}: {steps[currentStep].title}
          </h2>
          <StepComponent />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition"
          >
            ← 戻る
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            {currentStep === steps.length - 1 ? 'シミュレーション実行 🚀' : '次へ →'}
          </button>
        </div>
      </div>
    </div>
  );
}
