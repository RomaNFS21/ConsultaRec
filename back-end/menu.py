import pacientes
import funcionarios
import consultas
import sys
import os

def menu_principal():
    lista_pacientes = pacientes.carregar_dados()
    lista_funcionarios = funcionarios.carregar_dados()
    lista_consultas = consultas.carregar_dados()

    while True:
        print("\n===== MENU PRINCIPAL - ConsultaRec =====")
        print("1 --- Agendamento de Pacientes")
        print("2 --- Verificar Consultas")
        print("3 --- Registro de Funcionários")
        print("4 --- Sair e Salvar")
        print("===========================================")

        try:
            opcao = int(input("Escolha uma opção: "))
        except ValueError:
            print("Digite apenas números!")
            continue

        if opcao == 1:
            while True:
                print("\n --- PACIENTES ---")
                print("1. Cadastrar")
                print("2. Listar")
                print("3. Atualizar")
                print("4. Remover")
                print("5. Buscar Detalhes")
                print("6. Voltar ao Menu Principal")
                
                try:
                    op = int(input("Opção: "))
                    if op == 1: pacientes.cadastrar_paciente(lista_pacientes)
                    elif op == 2: pacientes.listar_pacientes(lista_pacientes)
                    elif op == 3: pacientes.atualizar_paciente(lista_pacientes)
                    elif op == 4: pacientes.deletar_paciente(lista_pacientes)
                    elif op == 5: pacientes.buscar_paciente(lista_pacientes)
                    elif op == 6: break
                    else: print("Opção inválida!")
                except ValueError: print("Opção inválida!")
        elif opcao == 2:
            while True:
                print("\n--- CONSULTAS ---")
                print("1. Agendar Nova")
                print("2. Listar Agenda")
                print("3. Buscar Consulta")
                print("4. Atualizar/Remarcar")
                print("5. Cancelar")
                print("6. Voltar ao Menu Principal")

                try:
                    op = int(input("Opção: "))
                    if op == 1: consultas.criar_consulta(lista_consultas)
                    elif op == 2: consultas.listar_consultas(lista_consultas)
                    elif op == 3: consultas.buscar_consulta(lista_consultas)
                    elif op == 4: consultas.atualizar_consulta(lista_consultas)
                    elif op == 5: consultas.deletar_consulta(lista_consultas)
                    elif op == 6: break
                    else: print("Opção inválida!")
                except ValueError: print("Opção inválida!")
        elif opcao == 3:
            while True:
                print("\n--- FUNCIONÁRIOS ---")
                print("1. Cadastrar")
                print("2. Listar Todos")
                print("3. Buscar Específico")
                print("4. Atualizar")
                print("5. Remover")
                print("6. Voltar ao Menu Principal")

                try:
                    op = int(input("Opção: "))
                    if op == 1: funcionarios.cadastro_funcionario(lista_funcionarios)
                    elif op == 2: funcionarios.ver_todos(lista_funcionarios)
                    elif op == 3: funcionarios.ver_um(lista_funcionarios)
                    elif op == 4: funcionarios.atualizar_funcionario(lista_funcionarios)
                    elif op == 5: funcionarios.deletar_funcionario(lista_funcionarios)
                    elif op == 6: break
                    else: print("Opção inválida!")
                except ValueError: print("Opção inválida!")

        elif opcao == 4:
            print("Saindo do sistema. Até logo!")
            sys.exit()
        else:
            print("Opção inválida!")

if __name__ == "__main__":
    menu_principal()