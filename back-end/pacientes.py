import json
import os

ARQUIVO_DB = "pacientes.json"

def carregar_dados():
    if not os.path.exists(ARQUIVO_DB):
        return []
    try:
        with open(ARQUIVO_DB, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def salvar_dados(dados):
    """Salva a lista atualizada no JSON."""
    try:
        with open(ARQUIVO_DB, "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Erro ao salvar: {e}")

def cadastrar_paciente(pacientes):
    print("--- Cadastro de Paciente ---")
    nome = input("Nome do Paciente: ")
    cpf = input("CPF: ") 
    telefone = input("Telefone: ")
    email = input("Email: ")

    novo_id = max([p.get("id", 0) for p in pacientes]) + 1 if pacientes else 1

    paciente = {
        "id": novo_id,
        "nome": nome,
        "cpf": cpf,
        "telefone": telefone,
        "email": email,
        "senha": ""
    }

    pacientes.append(paciente)
    salvar_dados(pacientes)
    print(f" Paciente '{nome}' cadastrado com sucesso! (ID: {novo_id})\n")

def listar_pacientes(pacientes):
    if not pacientes:
        print(" Nenhum paciente cadastrado.\n")
        return

    print("\ Lista de Pacientes:")
    for p in pacientes:
        print(f"ID: {p.get('id')} | {p.get('nome')} - CPF: {p.get('cpf')}")
    print()

def buscar_paciente(pacientes):
    try:
        id_paciente = int(input("Digite o ID do paciente: "))
        for p in pacientes:
            if p["id"] == id_paciente:
                print(f"\nNome: {p['nome']} | CPF: {p['cpf']} | Tel: {p['telefone']}")
                return
        print(" Paciente não encontrado.\n")
    except ValueError:
        print(" ID inválido.\n")

def atualizar_paciente(pacientes):
    listar_pacientes(pacientes)
    try:
        id_paciente = int(input("ID do paciente para atualizar: "))
        for p in pacientes:
            if p["id"] == id_paciente:
                print(f"Editando: {p['nome']} (Enter mantém o atual)")
                p["nome"] = input(f"Nome [{p['nome']}]: ") or p["nome"]
                p["cpf"] = input(f"CPF [{p['cpf']}]: ") or p["cpf"]
                p["telefone"] = input(f"Tel [{p['telefone']}]: ") or p["telefone"]

                salvar_dados(pacientes)
                print(" Paciente atualizado!\n")
                return
        print(" Paciente não encontrado.\n")
    except ValueError:
        print(" ID inválido.\n")

def deletar_paciente(pacientes):
    listar_pacientes(pacientes)
    try:
        id_paciente = int(input("ID do paciente para excluir: "))
        for p in pacientes:
            if p["id"] == id_paciente:
                pacientes.remove(p)
                salvar_dados(pacientes)
                print("Paciente removido!\n")
                return
        print("Paciente não encontrado.\n")
    except ValueError:
        print("ID inválido.\n")