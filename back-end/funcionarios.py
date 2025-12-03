import json
import os

ARQUIVO_DB = "funcionarios.json"

def carregar_dados():
    if not os.path.exists(ARQUIVO_DB):
        return []
    try:
        with open(ARQUIVO_DB, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def salvar_dados(dados):
    try:
        with open(ARQUIVO_DB, "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar: {e}")

def cadastro_funcionario(funcionarios):
    print("--- Novo Funcionário ---")
    nome = input("Nome: ")
    cpf = input("CPF: ")
    cargo = input("Cargo: ")
    especialidade = input("Especialidade (Enter para repetir cargo): ") or cargo

    novo_id = max([f.get("id", 20250000) for f in funcionarios]) + 1 if funcionarios else 20250001

    funcionario = {
        "id": novo_id,
        "nome": nome,
        "cpf": cpf,
        "cargo": cargo,
        "especialidade": especialidade,
        "senha": ""
    }

    funcionarios.append(funcionario)
    salvar_dados(funcionarios)
    print(f"Funcionário cadastrado! (ID: {novo_id})\n")

def ver_todos(funcionarios):
    if not funcionarios:
        print("Nenhum funcionário cadastrado.\n")
        return

    print("\nLista de Funcionários:")
    for f in funcionarios:
        print(f"ID: {f['id']} | {f['nome']} - {f['cargo']}")
    print()

def ver_um(funcionarios):
    try:
        id_func = int(input("Digite o ID do funcionário: "))
        for f in funcionarios:
            if f["id"] == id_func:
                print(f"\nNome: {f['nome']} | CPF: {f['cpf']} | Cargo: {f['cargo']}")
                return
        print("Funcionário não encontrado.\n")
    except ValueError:
        print("ID inválido.")

def atualizar_funcionario(funcionarios):
    ver_todos(funcionarios)
    try:
        id_func = int(input("ID para atualizar: "))
        for f in funcionarios:
            if f["id"] == id_func:
                print(f"Editando: {f['nome']}")
                f["nome"] = input(f"Nome [{f['nome']}]: ") or f["nome"]
                f["cpf"] = input(f"CPF [{f['cpf']}]: ") or f["cpf"]
                f["cargo"] = input(f"Cargo [{f['cargo']}]: ") or f["cargo"]
                
                salvar_dados(funcionarios)
                print("Atualizado com sucesso!\n")
                return
        print("Não encontrado.")
    except ValueError:
        print("ID inválido.")

def deletar_funcionario(funcionarios):
    ver_todos(funcionarios)
    try:
        id_func = int(input("ID para excluir: "))
        for f in funcionarios:
            if f["id"] == id_func:
                funcionarios.remove(f)
                salvar_dados(funcionarios)
                print("Removido com sucesso!\n")
                return
        print(" Não encontrado.")
    except ValueError:
        print("ID inválido.")