import json
import os
from datetime import datetime

ARQUIVO_DB = "consultas.json"

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
        return True
    except Exception as e:
        print(f"Erro ao salvar: {e}")
        return False

def validar_data(data_str):
    try:
        datetime.strptime(data_str, "%d/%m/%Y")
        return True
    except ValueError:
        return False

def validar_hora(hora_str):
    try:
        datetime.strptime(hora_str, "%H:%M")
        return True
    except ValueError:
        return False

def criar_consulta(consultas):
    print("--- Nova Consulta ---")
    cpf_paciente = input("CPF do Paciente: ")
    id_medico = input("ID do Médico: ")
    data = input("Data (DD/MM/AAAA): ")
    horario = input("Horário (HH:MM): ")

    if not validar_data(data):
        print(" Data inválida! Use DD/MM/AAAA")
        return
    if not validar_hora(horario):
        print(" Horário inválido! Use HH:MM")
        return

    novo_id = max([c.get("id", 0) for c in consultas]) + 1 if consultas else 1

    nova = {
        "id": novo_id,
        "cpf_paciente": cpf_paciente,
        "id_profissional": id_medico,
        "data": data,
        "horario": horario,
        "status": "Agendada"
    }

    consultas.append(nova)
    salvar_dados(consultas)
    print(f" Consulta agendada! (ID: {novo_id})\n")

def listar_consultas(consultas):
    if not consultas:
        print("Nenhuma consulta.\n")
        return
    print("\nAgenda:")
    for c in consultas:
        print(f"ID: {c['id']} | Data: {c['data']} - {c['horario']} | Paciente CPF: {c['cpf_paciente']}")
    print()

def buscar_consulta(consultas):
    try:
        id_con = int(input("ID da consulta: "))
        for c in consultas:
            if c["id"] == id_con:
                print(f"\nDetalhes: {c['data']} às {c['horario']} - Status: {c.get('status','?')}")
                return
        print(" Não encontrada.")
    except ValueError:
        print(" ID inválido.")

def atualizar_consulta(consultas):
    listar_consultas(consultas)
    try:
        id_con = int(input("ID para atualizar: "))
        for c in consultas:
            if c["id"] == id_con:
                nova_data = input(f"Nova Data [{c['data']}]: ")
                if nova_data and not validar_data(nova_data):
                    print("Data inválida."); return
                
                novo_hora = input(f"Novo Horário [{c['horario']}]: ")
                if novo_hora and not validar_hora(novo_hora):
                    print("Hora inválida."); return

                c['data'] = nova_data or c['data']
                c['horario'] = novo_hora or c['horario']
                salvar_dados(consultas)
                print(" Atualizada!\n")
                return
        print(" Não encontrada.")
    except ValueError:
        print(" ID inválido.")

def deletar_consulta(consultas):
    listar_consultas(consultas)
    try:
        id_con = int(input("ID para cancelar: "))
        for c in consultas:
            if c["id"] == id_con:
                consultas.remove(c)
                salvar_dados(consultas)
                print("Cancelada/Removida!\n")
                return
        print(" Não encontrada.")
    except ValueError:
        print(" ID inválido.")