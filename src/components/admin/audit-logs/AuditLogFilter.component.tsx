import React from "react";

interface AuditLogFilterProps {
  onFilterChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
}

const AuditLogFilter: React.FC<AuditLogFilterProps> = ({ onFilterChange, onSeverityChange }) => {
  return (
    <div className="flex gap-4 mb-4">
      <select
        className="border rounded p-2"
        onChange={(e) => onSeverityChange(e.target.value)}
      >
        <option value="all">All Severities</option>
        <option value="normal">Normal</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="severe">Severe</option>
      </select>
      <input
        className="border rounded p-2"
        type="text"
        placeholder="Search logs..."
        onChange={(e) => onFilterChange(e.target.value)}
      />
    </div>
  );
};

export default AuditLogFilter;
