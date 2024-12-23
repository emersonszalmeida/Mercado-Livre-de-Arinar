from flask import Flask, render_template, request, redirect, url_for, session, flash, abort, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import json
import os
import uuid

app = Flask(__name__)
app.secret_key = "chave_secreta_para_sessao"  # Necessário para usar sessões
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = 3600  # Sessão dura 1 hora

# Configuração de upload
UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Criar a pasta de uploads, se não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Caminho para o arquivo JSON
DATA_FILE = "usuarios.json"

# Garantir que o arquivo JSON existe
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as file:
        json.dump([], file)

# Verifica se o banco de dados já existe. Se não, cria o banco e a tabela.
if not os.path.exists("database.db"):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE anuncios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            categoria TEXT NOT NULL,
            nome TEXT NOT NULL,
            valor REAL NOT NULL,
            quantidade INTEGER NOT NULL,
            descricao TEXT NOT NULL,
            foto TEXT NOT NULL,
            criador TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Rota para servir arquivos de imagem
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Rota para a página inicial
@app.route("/")
def index():
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome, valor, foto, criador FROM anuncios")
        anuncios = cursor.fetchall()
        conn.close()

        # Função para formatar valores como moeda brasileira
        def formatar_moeda(valor):
            valor = float(valor)  # Certifique-se de que o valor é float
            return f"{valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

        anuncios_formatados = []
        for anuncio in anuncios:
            anuncio_id, nome, valor, foto, criador = anuncio
            valor_formatado = f"R$ {formatar_moeda(valor)}"
            anuncios_formatados.append((anuncio_id, nome, valor_formatado, foto, criador))

        return render_template("index.html", anuncios=anuncios_formatados)

# Rota para o formulário de registro
@app.route("/registro", methods=["GET", "POST"])
def registro():
    if request.method == "GET":
        return render_template("registro.html")

    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm-password")

        if not username or not email or not password or not confirm_password:
            return render_template("registro.html", erro="Todos os campos são obrigatórios.")

        if password != confirm_password:
            return render_template("registro.html", erro="As senhas não coincidem.")

        try:
            with open(DATA_FILE, "r+") as file:
                users = json.load(file)
                if any(u["email"] == email for u in users):
                    return render_template("registro.html", erro="Email já cadastrado.")

                hashed_password = generate_password_hash(password)
                users.append({"username": username, "email": email, "password": hashed_password})
                file.seek(0)
                json.dump(users, file, indent=4)

            session["username"] = username
            return redirect(url_for("index"))
        except (FileNotFoundError, json.JSONDecodeError):
            return render_template("registro.html", erro="Erro ao acessar os dados de usuários.")

# Rota para anunciar
@app.route("/anunciar", methods=["GET", "POST"])
def anunciar():
    if "username" not in session:
        flash("Faça login ou registre-se para anunciar.", "warning")
        return redirect(url_for("login"))

    if request.method == "POST":
        try:
            tipo_anuncio = request.form.get("tipo-anuncio")
            categoria = request.form.get("categoria")
            nome_anuncio = request.form.get("nome-anuncio")
            valor = request.form.get("valor")
            quantidade = request.form.get("quantidade")
            descricao = request.form.get("descricao")
            username = session["username"]

            # Upload de foto
            if "imagem" in request.files:
                imagem = request.files["imagem"]
                if imagem.filename != "":
                    filename = f"{uuid.uuid4().hex}_{imagem.filename}"
                    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                    imagem.save(filepath)
                    foto = filename
                else:
                    foto = ""
            else:
                foto = ""

            # Converter valores
            valor = float(valor.replace(",", "."))
            quantidade = int(quantidade)

            # Inserir no banco de dados
            conn = sqlite3.connect("database.db")
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO anuncios (tipo, categoria, nome, valor, quantidade, descricao, foto, criador)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (tipo_anuncio, categoria, nome_anuncio, valor, quantidade, descricao, foto, username))
            conn.commit()
            conn.close()

            flash("Anúncio cadastrado com sucesso!", "success")
            return redirect(url_for("index"))

        except ValueError:
            flash("Erro ao processar os dados. Certifique-se de que todos os campos estão corretos.", "error")
            return redirect(url_for("anunciar"))

        except Exception as e:
            flash(f"Ocorreu um erro: {str(e)}", "error")
            return redirect(url_for("anunciar"))

    return render_template("anunciar.html")

# Rota para detalhes do anúncio
@app.route("/anuncio/<int:anuncio_id>")
def detalhes_anuncio(anuncio_id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM anuncios WHERE id = ?", (anuncio_id,))
    anuncio = cursor.fetchone()
    conn.close()

    if not anuncio:
        abort(404)

    return render_template("detalhes_anuncio.html", anuncio=anuncio)

# Rota para login
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        try:
            with open(DATA_FILE, "r") as file:
                users = json.load(file)

            user = next((u for u in users if u["email"] == email), None)
            if user and check_password_hash(user["password"], password):
                session["username"] = user["username"]
                return redirect(url_for("index"))

            return render_template("login.html", erro="Email ou senha incorretos.")
        except (FileNotFoundError, json.JSONDecodeError):
            return render_template("login.html", erro="Erro ao acessar os dados de usuários.")

# Rota para logout
@app.route("/logout")
def logout():
    session.pop("username", None)
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")