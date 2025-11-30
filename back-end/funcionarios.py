def cadastro_funcionario(funcionarios):
    Nome = input("Nome: ")
    cpf = int(input("Cpf: "))
    Cargo = input("Cargo: ")

    funcionario = {
        "id": len(funcionarios) + 1,
        "Nome": Nome,
        "Cpf": cpf,
        "Cargo": Cargo,
    }

    funcionarios.append(funcionario)
    salvar_dados(funcionarios)
    print(f"Funcionário '{Nome}' cadastrado com sucesso!\n")

def ver_todos(funcionarios):
    if not funcionarios:
        print("Nenhum funcionário cadastrado.\n")
        return

    print("\n🎥 Lista de funcionários:")
    for f in funcionarios:
        print(f"ID: {f['id']} | {f['nome']} - CPF: {f['cpf']} - Cargo: {f['cargo']}")
    print()


def ver_um(funcionarios):
    if not funcionarios:
        print("Nenhum funcionário cadastrado.\n")
        return

    try:
        id_funcionario = int(input("Digite o ID do funcionário: "))
        for f in funcionarios:
            if f["id"] == id_funcionario:
                print("\n Detalhes do funcionário:")
                print(f"Nome: {f['nome']}")
                print(f"CPF: {f['cpf']}")
                print(f"Cargo: {f['cargo']}")
                return
        print("Funcionário não encontrado.\n")
    except ValueError:
        print("ID inválido.\n")


def atualizar_funcionario(funcionarios):
    ver_todos(funcionarios)
    try:
        id_funcionario = int(input("Digite o ID do funcionário que deseja atualizar: "))
        for f in funcionarios:
            if f["id"] == id_funcionario:
                print(f"Editando: {f['nome']}")
                f["nome"] = input("Novo nome: ") or f["nome"]
                f["CPF"] = input("Novo CPF: ") or f["CPF"]
                f["Cargo"] = input("Novo Cargo: ") or f["cargo"]

                salvar_dados(funcionarios)
                print("Funcionário atualizado com sucesso!\n")
                return
        print("Funcionário não encontrado.\n")
    except ValueError:
        print("ID inválido.\n")


def deletar_funcionario(funcionarios):
    ver_todos(funcionarios)
    try:
        id_funcionario = int(input("Digite o ID do funcionário que deseja excluir: "))
        for f in funcionarios:
            if f["id"] == id_funcionario:
                funcionarios.remove(f)
                salvar_dados(funcionarios)
                print(f"Funcionários '{f['nome']}' removido com sucesso!\n")
                return
        print("Funcionário não encontrado.\n")
    except ValueError:
        print("ID inválido.\n")
