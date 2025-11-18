def cadastrar_paciente(pacientes):
    nome = input("Digite o nome do paciente: ")
    idade =input("Digite a idade do paciente: ")
    telefone = input("Digite o telefone do paciente: ")
    sexo = input("Digite o sexo do paciente (M/F): ".upper())
    cpf = input("digite o CPF do paciente: ")
    email = input("digite o email do paciente: ")

    paciente ={
        "nome": nome,
        "idade": idade,
        "telefone": telefone,
        "sexo": sexo,
        "cpf": cpf,
        "email": email
    }

    pacientes.append(paciente)
    salvar_dados(pacientes)
    print("Paciente cadastrado com sucesso!")
    return pacientes


def carregar_dados():
    import json
    try:
        with open("pacientes.json", "r") as arquivo:
            pacientes = json.load(arquivo)
    except FileNotFoundError:
        pacientes = []
    return pacientes


def listar_pacientes(pacientes):
    if not pacientes:
        print("Nenhum paciente cadastrado.")
        return

    for i, paciente in enumerate(pacientes, start=1):
        print(f"{i}. Nome: {paciente['nome']}, Idade: {paciente['idade']}, Telefone: {paciente['telefone']}, Sexo: {paciente['sexo']}, CPF: {paciente['cpf']}, Email: {paciente['email']}")
    print("=======================================")
    

def atualizar_pacientes(pacientes):
    listar_pacientes(pacientes)
    if not pacientes:
        return

    indice = int(input("Digite o número do paciente que deseja atualizar: ")) - 1

    if 0 <= indice < len(pacientes):
        nome = input("Digite o novo nome do paciente: ")
        idade = input("Digite a nova idade do paciente: ")
        telefone = input("Digite o novo telefone do paciente: ")
        sexo = input("Digite o novo sexo do paciente (M/F): ".upper())
        cpf = input("digite o novo CPF do paciente: ")
        email = input("digite o novo email do paciente: ")

        pacientes[indice] = {
            "nome": nome,
            "idade": idade,
            "telefone": telefone,
            "sexo": sexo,
            "cpf": cpf,
            "email": email
        }

        print("Dados do paciente atualizados com sucesso!")
    else:
        print("Índice inválido.")

def remover_pacientes():
    listar_pacientes(pacientes)
    try:
        cpf_paciente = int(input("Digite o CPF do paciente: "))
        for p in range:
            if p["cpf"] == cpf_paciente:
                pacientes.remove(p)
                salvar_dados(pacientes)
                print(f"Paciente {'nome'} removido com sucesso!")
                return
            print("Paciente não encontrado.\n")
    except ValueError:
        print("CPF do paciente é inválido.\n")