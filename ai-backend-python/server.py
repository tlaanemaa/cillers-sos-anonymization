from flask import Flask, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/run-script', methods=['GET'])
def run_script():
    result = subprocess.run(["python3", "script.py"], capture_output=True, text=True)
    return jsonify({"output": result.stdout.strip()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)