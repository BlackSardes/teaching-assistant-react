import React from "react";

interface AcademicStatusDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  status: {
    color: "green" | "orange" | "red" | "invisible";
    label: string;
    reasons: string[];
  } | null;
}

const AcademicStatusDetailModal: React.FC<AcademicStatusDetailModalProps> = ({
  isOpen,
  onClose,
  studentName,
  status
}) => {
  if (!isOpen || !status) return null;

  const colorMap: any = {
    green: "#16a34a",
    orange: "#d97706",
    red: "#dc2626"
  };

  const backgroundColor =
    status.color === "invisible" ? "#6b7280" : (colorMap[status.color] || "#6b7280");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "500px"
        }}
      >
        <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>
          Situação Acadêmica de <br /> <strong>{studentName}</strong>
        </h2>

        <div
          style={{
            backgroundColor,
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            textAlign: "center",
            marginBottom: "1rem",
            fontWeight: 600
          }}
        >
          {status.label || "Situação Indisponível"}
        </div>

        <ul>
          {(status.reasons.length ? status.reasons : ["Sem dados disponíveis"]).map(
            (reason, index) => (
              <li key={index}>• {reason}</li>
            )
          )}
        </ul>

        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "0.75rem",
            borderRadius: "6px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none"
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default AcademicStatusDetailModal;
