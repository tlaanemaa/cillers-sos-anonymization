from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Allowed scripts for security
ALLOWED_SCRIPTS = {
    "script": "script.py",
    "censurering": "censurering.py"
}

@app.route('/run-script', methods=['GET', 'POST'])
def run_script():
    script_key = request.args.get("script")  # Get the script parameter from the request

    if script_key not in ALLOWED_SCRIPTS:
        return jsonify({"error": "Invalid script name"}), 400  # Return an error if script is not allowed

    script_name = ALLOWED_SCRIPTS[script_key]  # Get the actual script filename

    result = subprocess.run(["python3", script_name], capture_output=True, text=True)

    return jsonify({
        "output": result.stdout.strip(),
        "error": result.stderr.strip()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)