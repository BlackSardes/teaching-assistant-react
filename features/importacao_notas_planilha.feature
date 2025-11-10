Feature: Importação de Notas
        As a professor do sistema
        I want to importar notas de um CSV para a minha turma
        So that eu possa consolidar o desempenho da minha turma

        Scenario: Importação correta de Metas/Notas
        Given Estou na página de importação
        And O formato padrão exige as colunas "cadeira" e "avaliação"
        And O arquivo "notas.csv" contém as colunas "cadeira" e "avaliação"
        When Faço upload do arquivo "notas.csv"
        Then Vejo a mensagem "Importação concluída com sucesso"

        Scenario: Importação de Metas/Notas com formato inválido
        Given Estou na página de importação
        When Faço upload do arquivo "notas.xlsx"   # ou .xls
        Then Vejo a mensagem "Formato de arquivo não suportado"
        And O sistema retorna o código HTTP 415

        Scenario: Colunas diferentes do formato padrão
        Given Estou na página de importação
        And O formato padrão exige as colunas "cadeira" e "avaliação"
        And O arquivo "notas.csv" contém as colunas "disciplina" e "nota"
        When Faço upload do arquivo "notas.csv"
        And O sistema exibe a interface de mapeamento de colunas
        And Mapeio "disciplina" para "cadeira"
        And Mapeio "nota" para "avaliação"
        Then Vejo a mensagem "Formato validado com sucesso"

        Scenario: Colunas diferentes do formato padrão, coluna obrigatória faltando
        Given Estou na página de importação
        And O formato padrão exige as colunas "cadeira" e "avaliação"
        And O arquivo "notas.csv" contém as colunas "disciplina" e "nota"
        When Faço upload do arquivo "notas.csv"
        And O sistema exibe a interface de mapeamento de colunas
        And Mapeio "nota" para "avaliação"
        Then Vejo a mensagem "Coluna obrigatória 'cadeira' não foi mapeada"
        And O sistema retorna o código HTTP 400

