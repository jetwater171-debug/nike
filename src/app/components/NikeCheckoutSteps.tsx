type NikeCheckoutStepsProps = {
  activeStep: 1 | 2 | 3;
};

const STEPS = [
  { number: 1, label: "Carrinho" },
  { number: 2, label: "Identificacao" },
  { number: 3, label: "Pagamento" },
] as const;

function getStepClipPath(index: number) {
  if (index === 0) {
    return "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)";
  }

  if (index === STEPS.length - 1) {
    return "polygon(18px 0, 100% 0, 100% 100%, 18px 100%, 0 50%)";
  }

  return "polygon(18px 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0 50%)";
}

export default function NikeCheckoutSteps({
  activeStep,
}: NikeCheckoutStepsProps) {
  return (
    <div className="overflow-hidden bg-[#d7d7d7]">
      <div className="flex h-[62px]">
        {STEPS.map((step, index) => {
          const isActive = step.number === activeStep;
          const label =
            step.label === "Identificacao"
              ? "Identifica\u00e7\u00e3o"
              : step.label;

          return (
            <div
              key={step.label}
              className={`relative flex flex-1 items-center justify-center gap-2 text-[0.98rem] font-medium ${
                index > 0 ? "-ml-[18px] pl-[18px]" : ""
              } ${isActive ? "text-black" : "text-[#727272]"}`}
              style={{ zIndex: STEPS.length - index }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  clipPath: getStepClipPath(index),
                  backgroundColor: isActive ? "#ffffff" : "#d7d7d7",
                }}
              />
              <span
                className={`relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.74rem] font-semibold ${
                  isActive ? "bg-black text-white" : "bg-[#808080] text-white"
                }`}
              >
                {step.number}
              </span>
              <span className="relative z-10 whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
