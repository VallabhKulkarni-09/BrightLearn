import React from 'react'

interface ProgressBarProps {
  progress: number // 0 to 100
  color?: 'blue' | 'emerald'
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'blue', className = '' }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  
  const colorMap = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-500',
  }

  return (
    <div className={`w-full bg-slate-200 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className={`${colorMap[color]} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clampedProgress}%` }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  )
}
