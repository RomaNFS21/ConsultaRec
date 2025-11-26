def salvar_dados(dados):
    """
    Função auxiliar simulada para salvar os dados.
    No projeto real, isso gravaria em um arquivo JSON.
    """
    import json
    try:
        with open("pacientes.json", "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar: {e}")

def cadastrar_paciente(pacientes):
    print("--- Cadastro de Paciente ---")
    nome = input("Nome do Paciente: ")
    cpf = input("CPF: ") 
    telefone = input("Telefone: ")

    paciente = {
        "id": len(pacientes) + 1,
        "nome": nome,
        "cpf": cpf,
        "telefone": telefone,
    }

    pacientes.append(paciente)
    salvar_dados(pacientes)
    print(f"Paciente '{nome}' cadastrado com sucesso!\n")

def listar_pacientes(pacientes):
    if not pacientes:
        print("Nenhum paciente cadastrado.\n")
        return

    print("\n📋 Lista de Pacientes:")
    for p in pacientes:
        print(f"ID: {p['id']} | {p['nome']} - CPF: {p['cpf']} - Tel: {p['telefone']}")
    print()

def buscar_paciente(pacientes):
    if not pacientes:
        print("Nenhum paciente cadastrado.\n")
        return

    try:
        id_paciente = int(input("Digite o ID do paciente: "))
        for p in pacientes:
            if p["id"] == id_paciente:
                print("\n Detalhes do Paciente:")
                print(f"Nome: {p['nome']}")
                print(f"CPF: {p['cpf']}")
                print(f"Telefone: {p['telefone']}")
                return
        print("Paciente não encontrado.\n")
    except ValueError:
        print("ID inválido. Digite um número.\n")

def atualizar_paciente(pacientes):
    listar_pacientes(pacientes)
    try:
        id_paciente = int(input("Digite o ID do paciente que deseja atualizar: "))
        for p in pacientes:
            if p["id"] == id_paciente:
                print(f"Editando dados de: {p['nome']}")
                
                p["nome"] = input("Novo nome: ") or p["nome"]
                p["cpf"] = input("Novo CPF: ") or p["cpf"]
                p["telefone"] = input("Novo Telefone: ") or p["telefone"]

                salvar_dados(pacientes)
                print(f"Paciente {id_paciente} atualizado com sucesso!\n")
                return
        print("Paciente não encontrado.\n")
    except ValueError:
        print("ID inválido.\n")

def deletar_paciente(pacientes):
    listar_pacientes(pacientes)
    try:
        id_paciente = int(input("Digite o ID do paciente que deseja excluir: "))
        for p in pacientes:
            if p["id"] == id_paciente:
                pacientes.remove(p)
                salvar_dados(pacientes)
                print(f"Paciente '{p['nome']}' removido com sucesso!\n")
                return
        print("Paciente não encontrado.\n")
    except ValueError:
        print("ID inválido.\n")