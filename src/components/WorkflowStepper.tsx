import React from 'react';
import { Check } from 'lucide-react';

interface WorkflowStepperProps {
  hasDocument: boolean;
  hasExported: boolean;
}

const steps = ['Add document', 'Review detections', 'Export clean copy'];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ hasDocument, hasExported }) => {
  const activeIndex = hasExported ? 3 : hasDocument ? 1 : 0;

  return (
    <nav aria-label="Document workflow" className="rounded-2xl border border-[#D6CCC2] bg-white px-4 py-3 shadow-card dark:border-[#554A40] dark:bg-[#37312C]">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-2">
        {steps.map((step, index) => {
          const complete = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li key={step} className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                complete ? 'border-[#746250] bg-[#746250] text-white' : active ? 'border-[#746250] bg-[#E3D5CA] text-[#746250] dark:border-[#D5BDAF] dark:bg-[#494138] dark:text-[#F5EBE0]' : 'border-[#D6CCC2] bg-[#EDEDE9] text-[#988B80] dark:border-[#5B5046] dark:bg-[#413A34] dark:text-[#BBAE9F]'
              }`} aria-current={active ? 'step' : undefined}>
                {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={`truncate text-[10px] font-semibold sm:text-xs ${active ? 'text-[#3D3732] dark:text-white' : complete ? 'text-[#746250]' : 'text-[#988B80]'}`}>
                {step}
              </span>
              {index < steps.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 bg-[#D6CCC2] lg:block" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
