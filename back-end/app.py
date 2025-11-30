from flask import Flask, request, jsonify
from flask_cors import CORS 
import json
import os

app = Flask(__name__)
CORS(app) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILES = {
    "pacientes": os.path.join(BASE_DIR, "pacientes.json"),
    "funcionarios": os.path.join(BASE_DIR, "funcionarios.json"),
    "consultas": os.path.join(BASE_DIR, "consultas.json"),
    "especialidades": os.path.join(BASE_DIR, "especialidades.json")
}

def carregar_dados(key):
    try:
        with open(FILES[key], "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def salvar_dados(key, dados):
    try:
        with open(FILES[key], "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Erro ao salvar: {e}")
        return False

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "API ConsultaRec rodando. Pronto para integração."}), 200

@app.route('/api/pacientes', methods=['POST'])
def cadastrar_paciente_api():
    novo_paciente_data = request.json
    pacientes = carregar_dados('pacientes')

    if any(p.get('cpf') == novo_paciente_data.get('cpf') for p in pacientes):
        return jsonify({"message": "CPF já cadastrado!"}), 400

    novo_id = max([p.get('id', 0) for p in pacientes]) + 1 if pacientes else 1
    paciente_para_salvar = {
        "id": novo_id,
        "nome": novo_paciente_data.get('nome'),
        "cpf": novo_paciente_data.get('cpf'),
        "telefone": novo_paciente_data.get('telefone'),
        "email": novo_paciente_data.get('email')
    }
    pacientes.append(paciente_para_salvar)
    if salvar_dados('pacientes', pacientes):
        return jsonify({"message": "Paciente cadastrado com sucesso!", "id": novo_id}), 201
    return jsonify({"message": "Erro interno ao salvar paciente."}), 500

@app.route('/api/login', methods=['POST'])
def login_api():
    data = request.json
    val = data.get('valor')
    tipo = data.get('tipo')

    if tipo == 'medico':
        user = next((f for f in carregar_dados('funcionarios') if str(f.get('id')) == str(val) or f.get('cpf') == val), None)
        user_type = 'medico'
    elif tipo == 'paciente':
        user = next((p for p in carregar_dados('pacientes') if p.get('cpf') == val), None)
        user_type = 'paciente'
    else:
        return jsonify({"message": "Tipo de login inválido."}), 400

    if user:
        return jsonify({"message": "Login realizado com sucesso!", "user": user, "type": user_type}), 200
    else:
        return jsonify({"message": "Credenciais inválidas."}), 401

@app.route('/api/data/<key>', methods=['GET'])
def get_data(key):
    if key not in FILES:
        return jsonify({"message": "Tipo de dado inválido."}), 400
    return jsonify(carregar_dados(key)), 200

@app.route('/api/consultas', methods=['POST'])
def agendar_consulta():
    data = request.json
    consultas = carregar_dados('consultas')
    
    conflito = next((c for c in consultas if c.get('id_profissional') == data.get('id_profissional') and c.get('data') == data.get('data') and c.get('horario') == data.get('horario') and c.get('status') != 'Cancelada'), None)
    if conflito:
        return jsonify({"message": "Horário já ocupado!"}), 409

    novo_id = max([c.get('id', 0) for c in consultas]) + 1 if consultas else 1
    nova_consulta = {
        "id": novo_id,
        "cpf_paciente": data.get('cpf_paciente'),
        "nome_paciente": data.get('nome_paciente'),
        "id_profissional": data.get('id_profissional'),
        "data": data.get('data'),
        "horario": data.get('horario'),
        "status": 'Agendada'
    }

    consultas.append(nova_consulta)
    if salvar_dados('consultas', consultas):
        return jsonify({"message": "Agendado com sucesso!"}), 201
    return jsonify({"message": "Erro ao agendar."}), 500

@app.route('/api/consultas/<int:id>/cancelar', methods=['POST'])
def cancelar_consulta(id):
    consultas = carregar_dados('consultas')
    consulta = next((c for c in consultas if c.get('id') == id), None)

    if not consulta:
        return jsonify({"message": "Consulta não encontrada."}), 404

    consulta['status'] = 'Cancelada'
    if salvar_dados('consultas', consultas):
        return jsonify({"message": "Consulta cancelada!"}), 200
    return jsonify({"message": "Erro ao cancelar."}), 500

@app.route('/api/consultas/<int:id>/concluir', methods=['POST'])
def concluir_consulta(id):
    consultas = carregar_dados('consultas')
    consulta = next((c for c in consultas if c.get('id') == id), None)
    if not consulta:
        return jsonify({"message": "Consulta não encontrada."}), 404

    consulta['status'] = 'Concluída'
    if salvar_dados('consultas', consultas):
        return jsonify({"message": "Consulta concluída!"}), 200
    return jsonify({"message": "Erro ao concluir."}), 500

@app.route('/api/funcionarios', methods=['POST'])
def cadastrar_funcionario():
    data = request.json
    funcionarios = carregar_dados('funcionarios')

    novo_id = max([f.get('id', 20250000) for f in funcionarios]) + 1
    funcionario_para_salvar = {
        "id": novo_id,
        "nome": data.get('nome'),
        "cpf": data.get('cpf'),
        "cargo": data.get('cargo'),
        "especialidade": data.get('especialidade') 
    }
    
    funcionarios.append(funcionario_para_salvar)
    if salvar_dados('funcionarios', funcionarios):
        return jsonify({"message": "Funcionário cadastrado!", "id": novo_id}), 201
    return jsonify({"message": "Erro ao cadastrar funcionário."}), 500

@app.route('/api/pacientes/<int:id>', methods=['DELETE'])
def deletar_paciente(id):
    pacientes = carregar_dados('pacientes')
    initial_len = len(pacientes)
    pacientes = [p for p in pacientes if p.get('id') != id]

    if len(pacientes) == initial_len:
        return jsonify({"message": "Paciente não encontrado."}), 404
        
    if salvar_dados('pacientes', pacientes):
        return jsonify({"message": "Paciente removido!"}), 200
    return jsonify({"message": "Erro ao remover paciente."}), 500


if __name__ == '__main__':
    app.run(debug=True)