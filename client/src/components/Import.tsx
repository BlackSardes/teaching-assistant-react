import React, { useState, ChangeEvent } from "react";

// Campos alvo para o mapping
// TODO: Pegar isso com base na turma do back
const TARGET_FIELDS = [
  "Requirements",
  "Configuration Management",
  "Project Management",
  "Design",
  "Tests",
  "Refactoring",
];

export const ImportComponent: React.FC = () => {
  // Estado do passo atual
  const [step, setStep] = useState<number>(1);

  // Arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Nome do arquivo
  const [fileName, setFileName] = useState<string>("");

  // Colunas detectadas
  const [columns, setColumns] = useState<string[]>([]);

  // Mapeamento colunas → TARGET_FIELDS
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});

  // -----------------------------
  // Funções a implementar
  // -----------------------------
  
  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setFileName(file.name);
  };

  const processFile = () => {
    // Aqui você vai processar o arquivo, extrair as colunas
    // e atualizar 'columns' e 'mapping'
    // Depois mudar o passo: setStep(2)
  };

  const previousStep = () => {
    setStep(1);
  };

  const sendToBackend = () => {
    // Aqui você envia 'selectedFile' + 'mapping' para o backend
  };

  // Atualiza o mapping quando o usuário seleciona um valor
  const updateMapping = (col: string, value: string) => {
    setMapping(prev => ({ ...prev, [col]: value }));
  };

  // -----------------------------
  // Render JSX
  // -----------------------------
  return (
    <div>
      {/* Passo 1: Upload */}
      {step === 1 && (
        <div>
          <h2>Importar Arquivo</h2>
          <input
            type="file"
            name="arq"
            accept=".csv,.xls,.xlsx"
            onChange={onFileSelected}
          />
          <button disabled={!selectedFile} onClick={processFile}>
            Continuar
          </button>
        </div>
      )}

      {/* Passo 2: Mapping */}
      {step === 2 && (
        <div>
          <h2>Mapeamento de colunas</h2>
          {columns.map(col => (
            <div key={col}>
              <label>{col}</label>
              <select
                value={mapping[col] ?? ""}
                onChange={e => updateMapping(col, e.target.value)}
              >
                <option value="">--Selecione--</option>
                {TARGET_FIELDS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button onClick={previousStep}>Voltar</button>
          <button onClick={sendToBackend}>Enviar</button>
        </div>
      )}
    </div>
  );
};
