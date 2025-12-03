import React, { useState, ChangeEvent, useEffect } from "react";
import CustomFileInput from "./shared/InputFile/InputFile";

const API_BASE_URL = 'http://localhost:3005';

interface ImportGradeComponentProps {
  classID: string;
  toReset: () => Promise<void>;
}

export const ImportGradeComponent: React.FC<ImportGradeComponentProps> = ({ classID = "", toReset }) => {
  // ========== Estado do componente ==========
  
  // Passo atual do fluxo (1 = upload, 2 = mapping)
  const [step, setStep] = useState<number>(1);
  
  // Arquivo selecionado pelo usuário
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Colunas detectadas no arquivo pelo backend
  const [columns, setColumns] = useState<string[]>([]);
  
  // Campos esperados pela turma (goals + cpf)
  const [fields, setFields] = useState<string[]>([]);
  
  // Mapeamento: coluna do arquivo → campo esperado
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  
  // Session string retornada pelo backend (path do arquivo temporário)
  const [session, setSession] = useState<string>("");

  // ========== Efeitos ==========
  
  // Reseta todo o estado quando classID mudar
  useEffect(() => {
    setStep(1);
    setSelectedFile(null);
    setColumns([]);
    setFields([]);
    setMapping({});
    setSession("");
  }, [classID]);
  // ========== Handlers ==========
  
  /**
   * Handler chamado quando o usuário seleciona um arquivo
   */
  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  /**
   * Envia o arquivo para o backend processar e retorna:
   * - session_string: identificador da sessão (path temporário do arquivo)
   * - file_columns: colunas detectadas no arquivo
   * - mapping_colums: campos esperados pela turma (goals + cpf)
   */
  const processFileInBack = async () => {
    if (!selectedFile) {
      alert("Erro na seleção de arquivo");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileName', selectedFile.name);
    formData.append('fileType', selectedFile.type);

    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/gradeImport/${classID}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const respJson = await response.json();
        const sessionString: string = respJson.session_string;
        const fileColumns: string[] = respJson.file_columns;
        const mappingColumns: string[] = respJson.mapping_colums; // Note: typo no backend

        if (sessionString && fileColumns && mappingColumns) {
          setSession(sessionString);
          setColumns(fileColumns);
          setFields(mappingColumns);
          setStep(2);
        } else {
          console.error('Dados incompletos na resposta:', respJson);
          alert('Erro: Dados incompletos retornados pelo servidor');
        }
      } else {
        // Tratamento de erro HTTP
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error || response.statusText;
        console.error(`Erro HTTP: ${response.status} - ${errorMessage}`);
        alert(`Erro ao processar arquivo: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      alert(`Erro na requisição: ${error.message}`);
    }
  };

  /**
   * Volta para o passo 1 (upload) e limpa o mapeamento
   */
  const previousStep = () => {
    setMapping({});
    setStep(1);
  };

  /**
   * Envia o mapeamento para o backend processar o arquivo completo
   * Backend usa session_string para localizar o arquivo e mapping para interpretar as colunas
   */
  const sendToBackendMapping = async () => {
    // Remove entradas vazias do mapping
    const cleanedMapping = Object.fromEntries(
      Object.entries(mapping).filter(([_, value]) => value !== '')
    );

    try {
      const payload = {
        session_string: session,
        mapping: cleanedMapping,
      };

      const response = await fetch(`${API_BASE_URL}/api/classes/gradeImport/${classID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `Erro ao enviar o mapping: ${errorData.error || response.statusText}`;
        alert(errorMessage);
        throw new Error(errorMessage);
      }

      // Atualiza os dados no componente pai após importação bem-sucedida
      await toReset();
    } catch (error: any) {
      console.error({ error });
      if (error.message && !error.message.includes('Erro ao enviar o mapping')) {
        alert(`Erro: ${error.message}`);
      }
    }
  };

  /**
   * Atualiza o mapeamento quando o usuário seleciona um valor no dropdown
   */
  const updateMapping = (col: string, value: string) => {
    setMapping(prev => ({ ...prev, [col]: value }));
  };

  // ========== Estilos ==========
  
  const buttonStyle: React.CSSProperties = {
    background: "#078d64",
    color: "white",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen'",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "3px"
  };

  const mappingGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "max-content 1fr",
    rowGap: "8px",
    columnGap: "8px",
  };

  // ========== Render ==========
  
  return (
    <div>
      {/* ========== PASSO 1: Upload do arquivo ========== */}
      {step === 1 && (
        <div>
          <h2>Importar de Planilha de Notas</h2>
          <CustomFileInput 
            backColor="#078d64" 
            accept=".csv,.xlsx,.xls" 
            onChange={onFileSelected} 
            resetState={classID} 
          />
          <button
            onClick={processFileInBack}
            disabled={!selectedFile}
            style={buttonStyle}
          >
            Continuar
          </button>
        </div>
      )}

      {/* ========== PASSO 2: Mapeamento de colunas ========== */}
      {/* 
        Fluxo implementado:
        [Front] Upload → [Back] lê só o cabeçalho → retorna colunas
        [Front] Mapeia colunas → [Back] faz parse completo e atualiza enrollments
      */}
      {step === 2 && (
        <div>
          <h1>Mapeamento de colunas</h1>
          
          <div style={mappingGridStyle}>
            <h2 style={{ margin: 0, gridColumn: "1" }}>Colunas do Arquivo</h2>
            <h2 style={{ margin: 0, gridColumn: "2" }}>Campos Esperados pela Turma</h2>
            
            {columns.map(col => (
              // Para cada coluna do arquivo, renderiza uma linha com label + select
              // Usando React.Fragment para não adicionar nó extra no DOM
              <React.Fragment key={col}>
                <h4 style={{ margin: 0 }}>{col}</h4>
                <select
                  value={mapping[col] ?? ""}
                  onChange={e => updateMapping(col, e.target.value)}
                >
                  <option value="">--Selecione--</option>
                  {fields.map(opt => {
                    // Verifica se a opção já está sendo usada em outro select (exceto o atual)
                    // para evitar mapeamentos duplicados
                    const isAlreadyUsed = Object.entries(mapping).some(
                      ([key, value]) => key !== col && value === opt
                    );
                    return (
                      <option key={opt} value={opt} disabled={isAlreadyUsed}>
                        {opt}
                      </option>
                    );
                  })}
                </select>
              </React.Fragment>
            ))}
          </div>

          <div style={{ marginTop: "16px" }}>
            <button style={buttonStyle} onClick={previousStep}>
              Voltar
            </button>
            <button style={buttonStyle} onClick={sendToBackendMapping}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
