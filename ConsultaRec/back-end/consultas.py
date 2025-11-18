def carregar_dados():
    """Carregar as consultas do banco (a ser implementado)."""
    pass


def salvar_dados(dados):
    """Salvar consultas no banco (a ser implementado)."""
    pass


def validar_data(data):
    """Validar data no formato correto (a ser implementado)."""
    pass


def validar_hora(horario):
    """Validar horário (a ser implementado)."""
    pass


def criar_consulta(id_consulta, id_paciente, id_profissional, data, horario, descricao):
    
    consultas = carregar_dados()

    if not validar_data(data):
        return "Data inválida! Use DD/MM/AAAA"
    if not validar_hora(horario):
        return "Horário inválido! Use HH:MM"

    nova_consulta = {
        "id": id_consulta,
        "id_paciente": id_paciente,
        "id_profissional": id_profissional,
        "data": data,
        "horario": horario,
        "descricao": descricao
    }

    consultas.append(nova_consulta)
    salvar_dados(consultas)
    return f"Consulta {id_consulta} criada com sucesso!"


def listar_consultas():
    return carregar_dados()


def buscar_consulta(id_consulta):
    consultas = carregar_dados()

    for consulta in consultas:
        if consulta["id"] == id_consulta:
            return consulta

    return "Consulta não encontrada."


def atualizar_consulta(id_consulta, **novos_dados):
    consultas = carregar_dados()

    for consulta in consultas:
        if consulta["id"] == id_consulta:

            for chave, valor in novos_dados.items():

                if chave == "data" and not validar_data(valor):
                    return "Data inválida!"
                if chave == "horario" and not validar_hora(valor):
                    return "Horário inválido!"

                consulta[chave] = valor

            salvar_dados(consultas)
            return f"Consulta {id_consulta} atualizada com sucesso!"

    return "Consulta não encontrada."


def deletar_consulta(id_consulta):
    consultas = carregar_dados()
    novas_consultas = [c for c in consultas if c["id"] != id_consulta]

    if len(novas_consultas) == len(consultas):
        return "Consulta não encontrada."

    salvar_dados(novas_consultas)
    return f"Consulta {id_consulta} removida com sucesso!"