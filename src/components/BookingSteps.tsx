import { Check } from "@phosphor-icons/react/dist/ssr";

const STEPS = ["Vehicle", "Dates", "Confirm", "Done"];

// Purely presentational — no interactivity, so this stays a Server
// Component. Steps before `currentStep` render as complete, `currentStep`
// itself as the active/next one, everything after as upcoming. This gets
// reused (and its later steps made functional) once the booking flow
// itself exists.
export function BookingSteps({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                isComplete
                  ? "bg-green-600 text-white"
                  : isActive
                    ? "border-2 border-rust text-rust"
                    : "border border-mist text-gray-400"
              }`}
            >
              {isComplete ? (
                <Check size={12} weight="bold" aria-hidden="true" />
              ) : (
                stepNumber
              )}
            </span>
            <span
              className={
                isActive
                  ? "font-medium"
                  : isComplete
                    ? "text-gray-600"
                    : "text-gray-400"
              }
            >
              {label}
            </span>
            {stepNumber < STEPS.length && (
              <span aria-hidden className="mx-1 h-px w-6 bg-mist" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
