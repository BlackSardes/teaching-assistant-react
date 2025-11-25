import React, { useEffect, useState } from "react";

interface AcademicStatusResult {
  color: "green" | "orange" | "red" | "invisible";
  label: string;
  reasons: string[];
}

interface AcademicStatusBadgeProps {
  studentCPF: string;
  classId: string | null;
  onClick?: (status: AcademicStatusResult) => void;
  onStatusLoaded?: (status: AcademicStatusResult) => void; 
}

const AcademicStatusBadge: React.FC<AcademicStatusBadgeProps> = ({
  studentCPF,
  classId,
  onClick,
  onStatusLoaded
}) => {
  const [status, setStatus] = useState<AcademicStatusResult | null>(null);

  useEffect(() => {
    if (!classId) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:3005/api/academic-status/${classId}/${studentCPF}`
        );
        if (!response.ok) throw new Error();

        const data: AcademicStatusResult = await response.json();
        setStatus(data);
        onStatusLoaded?.(data);

      } catch {
        const fallback: AcademicStatusResult = {
          color: "invisible",
          label: "",
          reasons: []
        };
        setStatus(fallback);
        onStatusLoaded?.(fallback);
      }
    };

    fetchStatus();
  }, [classId, studentCPF, onStatusLoaded]);

  if (!classId || !status) return <span>Carregando...</span>;

  return (
    <button
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        cursor: "pointer",
        background: "#f3f4f6"
      }}
      onClick={() => onClick?.(status)}
    >
      Ver detalhes
    </button>
  );
};

export default AcademicStatusBadge;
