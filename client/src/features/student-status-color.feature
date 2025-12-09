@student-status-color
Feature: Student status color
  Validate the colored border that indicates student status on the Students List

  Background:
    Given the system has a class "Software Engineering (2025/2)"

  @display
  Scenario: Display of colors on the students list
    Given estou na página de Avaliações
    And selecionei a turma "Engenharia de Software e Sistemas-2025-2"
    And class has a student "Maria Modularidade" 
    And the class has a student "João Elegância"
    When eu preencho as notas da "Mari"com as notas "notas 1"
    And msm coisa de cima joao com "notas 2"
    Then eu volto para lista de estudantes
    And vejo se cor de "maria" está de acordo com "cor"
    And msm coisa pro joao

  //Ajustar cenários corretamente para devido acesso 
  //Feito isso aqui fazer o step
  //Given acessa direto nas Avaliações
  //When 
  //Then 