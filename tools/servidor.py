"""Servidor local para las pruebas: como «python -m http.server», con una cola de conexiones amplia (varias
pestañas de prueba en paralelo) y que imita GitHub Pages: sirve la web también bajo /caducamovil/ y usa 404.html.
Uso: python caducamovil/tools/servidor.py [puerto]   (por defecto 8141; sirve la carpeta caducamovil/)
"""
import functools
import http.server
import pathlib
import sys

PREFIJO = "/caducamovil"  # igual que «base» en lib/manifest.js


class Servidor(http.server.ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True


class Manejador(http.server.SimpleHTTPRequestHandler):
    def log_message(self, formato, *args):  # sin una línea por petición
        pass

    def translate_path(self, ruta):
        if ruta == PREFIJO or ruta.startswith(PREFIJO + "/"):
            ruta = ruta[len(PREFIJO):] or "/"
        return super().translate_path(ruta)

    def send_error(self, codigo, mensaje=None, explicacion=None):
        pagina = pathlib.Path(self.directory, "404.html")
        if codigo != 404 or not pagina.exists():
            return super().send_error(codigo, mensaje, explicacion)
        cuerpo = pagina.read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8141
    raiz = pathlib.Path(__file__).resolve().parent.parent
    Servidor(("127.0.0.1", puerto), functools.partial(Manejador, directory=str(raiz))).serve_forever()
