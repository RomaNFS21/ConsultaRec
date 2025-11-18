import registro
import funcionarios
import consultas

def menu_principal():
   while True:
      print("===== MENU PRINCIPAL =====")
      print("1 --- Agendamento de Pacientes.")
      print("2 --- Verificar Consultas.")
      print("3 --- Registro de Funcionários.")
      print("4 --- Sair do Menu Principal.")
      print("==========================")

      opcao = int(input("Escolha uma opção do Menu Principal: "))

      if (opcao == 1):
         carregar_dados(pacientes)
         while True:
            print("===== AGENDAMENTO DE PACIENTES =====")
            print("1 --- Cadastrar um novo paciente.")
            print("2 --- Listar pacientes cadastrados.")
            print("3 --- Atualizar dados de um paciente.")
            print("4 --- Remover um paciente do registro.")
            print("5 --- Voltar ao Menu Principal.")
            print("6 --- Sair do Menu de Seleção.")
            print("====================================")

            opcao = int(input("Escolha uma opção para Agendamento de Pacientes: "))
            match opcao:
               case 1:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  cadastrar_paciente(pacientes)
               case 2:
                  print("Lista de pacientes encontrados: ")
                  listar_pacientes(pacientes)
               case 3:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  atualizar_pacientes(pacientes)
               case 4:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  remover_paciente(pacientes)
               case 5:
                  menu_principal()
               case 6:
                  print("Saindo do Sistema!")
                  break
               case _:
                  print("Opção inválida! Tente novamente.")

      elif (opcao == 2):
         carregar_dados(consultas)
         while True:
            print("===== VERIFICAR CONSULTAS =====")
            print("1 --- Marcar uma nova consulta médica.")
            print("2 --- Listar consultas médicas marcadas.")
            print("3 --- Buscar uma consulta médica específica.")
            print("4 --- Atualização de consulta médica.")
            print("5 --- Remover uma consulta médica do registro.")
            print("6 --- Voltar ao Menu Principal.")
            print("7 --- Sair do Menu de Seleção.")
            print("===============================")

            opcao = int(input("Escolha uma opção para Verificar Consultas: "))
            match opcao:
               case 1:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  criar_consulta(consultas)
               case 2:
                  print("Lista de consultas agendadas: ")
                  listar_consultas(consultas)
               case 3:
                  print("Realizando busca de consultas.")
                  buscar_consultas(consultas)
               case 4:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  atualizar_consultas(consultas)
               case 5:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  deletar_consultas(consultas)
               case 6:
                  menu_principal()
               case 7:
                  print("Saindo do Sistema!")
                  break
               case _:
                  print("Opção inválida! Tente novamente.")

      elif (opcao == 3):
         carregar_dados(funcionarios)
         while True:
            print("===== REGISTRO DE FUNCIONÁRIOS =====")
            print("1 --- Cadastrar um novo funcionário.")
            print("2 --- Listar todos os funcionários.")
            print("3 --- Buscar por um funcionário específico.")
            print("4 --- Atualizar cadastro de um funcionário.")
            print("5 --- Remover um funcionário do registro.")
            print("6 --- Voltar ao Menu Principal.")
            print("7 --- Sair do Menu de Seleção.")
            print("====================================")

            opcao = int(input("Escolha uma opção para Registro de Funcionários: "))
            match opcao:
               case 1:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  cadastro_funcionario(funcionarios)
               case 2:
                  print("Lista de funcionários cadastrados: ")
                  ver_todos(funcionarios)
               case 3:
                  print("Realizando busca de funcionários.")
                  ver_um(funcionarios)
               case 4:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  atualizar_funcionário(funcionarios)
               case 5:
                  print("Preencha o formulário à seguir com as informações requisitadas: ")
                  deletar_funcionario(funcionarios)
               case 6:
                  menu_principal()
               case 7:
                  print("Saindo do Sistema!")
                  break
               case _:
                  print("Opção inválida! Tente novamente.")

      else:
         print("Saindo do Sistema!")
         break

menu_principal()