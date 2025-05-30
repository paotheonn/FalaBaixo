import tkinter as tk
from tkinter import messagebox
import sounddevice as sd
import numpy as np
import threading    
import time
import datetime
import requests
from openpyxl import Workbook
import os

# Configure suas credenciais do Telegram aqui
TELEGRAM_BOT_TOKEN = 'SEU_TOKEN_AQUI'  # Substitua pelo seu token do bot
TELEGRAM_CHAT_ID = 'SEU_CHAT_ID_AQUI'  # Substitua pelo seu chat ID


wb = Workbook()
ws = wb.active
ws.append([
    "Timestamp",
    "Volume (dB)",
    "Status",
    "Sensibilidade",
    "Mensagem Telegram",
    "Tempo desde última medição (s)",
    "Usuário/Local",
    "Observações"
])


monitorando = False
limite_db = 60  
dados_volume = []
ultimo_envio_telegram = 0  
ultimo_timestamp = None
USUARIO_LOCAL = "Padrão"
OBSERVACOES = ""


def enviar_telegram(mensagem):
    global ultimo_envio_telegram
    agora = time.time()
    if agora - ultimo_envio_telegram < 10:
        return  
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": mensagem}
    requests.post(url, data=payload)
    ultimo_envio_telegram = agora

def calcular_db(indata):

    audio = indata.astype(np.float32)

    if np.max(np.abs(audio)) > 1.1:
        audio = audio / 32768.0
    rms = np.sqrt(np.mean(audio**2))
    db = 20 * np.log10(rms) if rms > 0 else -80 
    db_visual = db + 80  
    return round(db_visual, 1)


ULTIMO_DB_PATH = "ultimo_db.txt"
def salvar_ultimo_db(valor):
    try:
        with open(ULTIMO_DB_PATH, "w") as f:
            f.write(str(valor))
    except Exception as e:
        pass

def carregar_ultimo_db():
    if os.path.exists(ULTIMO_DB_PATH):
        try:
            with open(ULTIMO_DB_PATH, "r") as f:
                return f.read().strip()
        except Exception:
            return "0.0"
    return "0.0"

# Função de monitoramento
def monitorar_audio():
    global monitorando, dados_volume, ultimo_timestamp

    def callback(indata, frames, time_info, status):
        global ultimo_timestamp
        if not monitorando:
            return
        volume_db = calcular_db(indata)
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        status_str = "Alto" if volume_db > limite_db else "Normal"
        sensibilidade = limite_db
        tempo_desde_ultima = 0.0
        agora = time.time()
        if ultimo_timestamp:
            dt1 = datetime.datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
            dt2 = datetime.datetime.strptime(ultimo_timestamp, "%Y-%m-%d %H:%M:%S")
            tempo_desde_ultima = (dt1 - dt2).total_seconds()
        ultimo_timestamp = timestamp
        mensagem_telegram = "Sim" if status_str == "Alto" and (agora - ultimo_envio_telegram) < 1 else "Não"
        
        # Registrar todos os dados
        dados_volume.append((timestamp, volume_db, status_str, sensibilidade, mensagem_telegram, tempo_desde_ultima, USUARIO_LOCAL, OBSERVACOES))
        ws.append([timestamp, volume_db, status_str, sensibilidade, mensagem_telegram, tempo_desde_ultima, USUARIO_LOCAL, OBSERVACOES])
        
        salvar_ultimo_db(volume_db)
        if status_str == "Alto":
            status_label.config(text="🔊 Volume alto detectado!", fg="#ff2e63")
            face_label.config(text="😠")
            enviar_telegram(f"⚠️ Volume alto detectado: {volume_db:.1f} dB\nPor favor, fale mais baixo.")
        else:
            status_label.config(text="✅ Tudo certo", fg="#00ff99")
            face_label.config(text="😄")
        volume_label.config(text=f"{volume_db:.1f} dB")
    with sd.InputStream(callback=callback, dtype='float32'):
        while monitorando:
            time.sleep(0.5)


def toggle_monitoramento():
    global monitorando
    monitorando = not monitorando
    if monitorando:
        botao.config(text="Parar")
        threading.Thread(target=monitorar_audio, daemon=True).start()
    else:
        botao.config(text="Iniciar")
        salvar_dados()


def atualizar_sensibilidade(valor):
    global limite_db
    limite_db = int(valor)


def salvar_dados():
    wb.save("dados_volume.xlsx")
    messagebox.showinfo("Salvo", "Arquivo XLSX salvo com sucesso.")


janela = tk.Tk()
janela.title("Fala Baixo")
janela.geometry("380x420")
janela.configure(bg="#222831")


frame_central = tk.Frame(janela, bg="#222831")
frame_central.pack(expand=True)


face_label = tk.Label(frame_central, text="😄", font=("Segoe UI Emoji", 60), bg="#222831", fg="#ffffff")
face_label.pack(pady=(30, 5))


status_label = tk.Label(frame_central, text="✅ Tudo certo", fg="#00ff99", bg="#222831", font=("Segoe UI", 18, "bold"))
status_label.pack(pady=(0, 5))


ultimo_db = carregar_ultimo_db()
volume_label = tk.Label(frame_central, text=f"{ultimo_db} dB", font=("Segoe UI", 22, "bold"), fg="#ffd369", bg="#222831")
volume_label.pack(pady=(0, 20))


frame_inferior = tk.Frame(janela, bg="#222831")
frame_inferior.pack(side="bottom", fill="x", pady=(0, 20))

sens_label = tk.Label(frame_inferior, text="Sensibilidade (dB):", bg="#222831", fg="#eeeeee", font=("Segoe UI", 12))
sens_label.pack()
sens_slider = tk.Scale(frame_inferior, from_=30, to=90, orient="horizontal", command=atualizar_sensibilidade, bg="#393e46", fg="#eeeeee", troughcolor="#393e46", highlightthickness=0)
sens_slider.set(limite_db)
sens_slider.pack(pady=(0, 10))

botao = tk.Button(frame_inferior, text="Iniciar", command=toggle_monitoramento, font=("Segoe UI", 14, "bold"), bg="#00adb5", fg="#eeeeee", activebackground="#393e46", activeforeground="#ffd369", relief="flat", bd=0, padx=20, pady=8)
botao.pack(pady=10)

janela.mainloop()
