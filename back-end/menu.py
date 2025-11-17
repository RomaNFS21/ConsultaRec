def menu_principal():
 def carregar_dados(pacientes):
    while True:
        print("=== AGENDAMENTO DE PACIENTES ===")
        print("1. Cadastrar novo paciente")
        print("2. Listar pacientes cadastrados")
        print("3. Atualizar dados do paciente")
        print("4. Remover paciente")
        print("5. Sair")
        print("===============================")

        opcao = int(input("Escolha uma opção: "))

        if opcao == 1:
           cadastrar_paciente(pacientes)           
        elif opcao == 2:
           listar_pacientes(pacientes)
            
        elif opcao == 3:
           atualizar_pacientes(pacientes)
            
        elif opcao == 4:
           remover_pacientes(pacientes)
            
        elif opcao == 5:
            print("Saindo do sistema :)")
            break
        else:
            print("Opção inválida. tente novamente.")
        