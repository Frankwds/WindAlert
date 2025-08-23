"use client";

interface AlertRuleCardProps {
  alertName: string;
  result: string;
  className?: string;
}

export default function AlertRuleCard({
  alertName,
  result,
  className = ""
}: AlertRuleCardProps) {
  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{alertName}</h3>
          <p className="text-sm text-gray-300">
            Status: {result === "positive" ? "✅ Passed" : "❌ Failed"}
          </p>
        </div>
      </div>
    </div>
  );
}
