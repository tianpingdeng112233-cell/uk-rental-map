"use client";

interface ReviewScoresProps {
  scores: {
    transport: number;
    safety: number;
    value: number;
    overall: number;
  } | null;
  totalCount: number;
}

const LABELS: Record<string, string> = {
  transport: "交通",
  safety: "安全",
  value: "性价比",
  overall: "总评",
};

export default function ReviewScores({ scores, totalCount }: ReviewScoresProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(LABELS).map(([key, label]) => (
        <div key={key} className="p-3 bg-[#F7F9FB] rounded-lg text-center">
          <p className="text-[24px] font-bold text-[#191C1E]">
            {scores ? scores[key as keyof typeof scores].toFixed(1) : "--"}
          </p>
          <p className="text-[11px] text-[#434655] mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
