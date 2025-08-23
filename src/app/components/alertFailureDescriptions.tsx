"use client";

import { FailureReason } from "@/lib/openMeteo/types";
import CollapsibleAlert from "./alertCollapsible";

interface Props {
  failures: FailureReason[];
}

const AlertFailureDescriptions = ({ failures }: Props) => {
  if (!failures || failures.length === 0) return null;

  return (
    <CollapsibleAlert title="Failure Reasons" className="bg-red-600">
      <div className="p-4 text-white">
        <ul className="list-disc list-inside">
          {failures.map((failure, index) => (
            <li key={index} className="mb-2">
              {failure.description}
            </li>
          ))}
        </ul>
      </div>
    </CollapsibleAlert>
  );
};

export default AlertFailureDescriptions;
