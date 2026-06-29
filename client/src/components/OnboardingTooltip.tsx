import { useState, useEffect, useCallback } from 'react';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
}

interface OnboardingTooltipProps {
  steps: OnboardingStep[];
  onComplete: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingTooltip({ steps, onComplete }: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  const updateRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;
    const el = document.querySelector(`[data-onboarding="${step.target}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  // Tooltip card position: below the target or centered if no target
  const cardStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: Math.min(targetRect.top + targetRect.height + 12, window.innerHeight - 220),
        left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - 160, window.innerWidth - 340)),
        zIndex: 9999,
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      };

  return (
    <div className="fixed inset-0" style={{ zIndex: 9998 }}>
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 高亮区域（镂空效果） */}
      {targetRect && (
        <div
          className="absolute rounded-lg ring-2 ring-indigo-400 ring-offset-2 pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            zIndex: 9998,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
            backgroundColor: 'transparent',
          }}
        />
      )}

      {/* 提示卡片 */}
      <div
        className="bg-white rounded-xl shadow-2xl w-[320px] p-5"
        style={cardStyle}
      >
        {/* 步骤指示器 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{step.description}</p>

        {/* 步骤点指示器 */}
        <div className="flex items-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? 'w-6 bg-indigo-500' : i < currentStep ? 'w-1.5 bg-indigo-300' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 按钮区 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onComplete}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            跳过
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            {isLast ? '完成' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}
