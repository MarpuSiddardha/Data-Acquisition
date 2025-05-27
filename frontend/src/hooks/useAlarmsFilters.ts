import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AlarmFilters } from "@/utils/types";

export function useAlarmsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const severity =
    (searchParams.get("severity") as AlarmFilters["severity"]) ?? "";
  const status = (searchParams.get("status") as AlarmFilters["status"]) ?? "";

  const setFilters = useCallback((filters: AlarmFilters) => {
    setSearchParams((params) => {
      if (filters.severity === "" || filters.status === "") {
        params.delete("severity");
        params.delete("status");
      }
      if (filters.severity) {
        params.set("severity", filters.severity);
      }
      if (filters.status) {
        params.set("status", filters.status);
      }
      return params;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    severity,
    status,
    setFilters,
  };
}
