import * as React from "react"
import { CodeQuestOnboardingStep1 } from "./CodeQuestOnboardingStep1"
import { CodeQuestOnboardingStep2 } from "./CodeQuestOnboardingStep2"
import { CodeQuestOnboardingStep3 } from "./CodeQuestOnboardingStep3"
import { CodeQuestOnboardingStep4 } from "./CodeQuestOnboardingStep4"
import { CodeQuestOnboardingStep5 } from "./CodeQuestOnboardingStep5"

interface CodeQuestOnboardingFlowProps {
  onComplete?: () => void
}

export function CodeQuestOnboardingFlow({ onComplete }: CodeQuestOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState<number>(1)

  if (currentStep === 5) {
    return (
      <CodeQuestOnboardingStep5
        onBack={() => setCurrentStep(4)}
        onFinish={() => {
          onComplete?.()
        }}
      />
    )
  }

  if (currentStep === 4) {
    return (
      <CodeQuestOnboardingStep4
        onBack={() => setCurrentStep(3)}
        onFinish={() => setCurrentStep(5)}
      />
    )
  }

  if (currentStep === 3) {
    return (
      <CodeQuestOnboardingStep3
        onBack={() => setCurrentStep(2)}
        onContinue={() => setCurrentStep(4)}
      />
    )
  }

  if (currentStep === 2) {
    return (
      <CodeQuestOnboardingStep2
        onBack={() => setCurrentStep(1)}
        onContinue={() => setCurrentStep(3)}
      />
    )
  }

  return (
    <CodeQuestOnboardingStep1
      onContinue={() => setCurrentStep(2)}
    />
  )
}
