"use client";

import { FailureReason } from "@/lib/openMeteo/types";
import Collapsible from "./Collapsible";
import FailureCard from "./FailureCard";

interface Props {
  failures: FailureReason[];
}

const AlertFailureDescriptions = ({ failures }: Props) => {
  if (!failures || failures.length === 0) return null;

  return (
    <Collapsible title="Failure Reasons" className="bg-red-600">
      <FailureCard failures={failures} />
    </Collapsible>
  );
};

export default AlertFailureDescriptions;
