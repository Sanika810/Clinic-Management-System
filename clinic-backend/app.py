from flask import Flask
from flask_cors import CORS

from routes.auth          import auth_bp
from routes.patients      import patients_bp
from routes.doctors       import doctors_bp
from routes.appointments  import appointments_bp
from routes.consultations import consultations_bp
from routes.billing       import billing_bp
from routes.records       import records_bp
from routes.payments      import payments_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp,          url_prefix="/api")
app.register_blueprint(patients_bp,      url_prefix="/api")
app.register_blueprint(doctors_bp,       url_prefix="/api")
app.register_blueprint(appointments_bp,  url_prefix="/api")
app.register_blueprint(consultations_bp, url_prefix="/api")
app.register_blueprint(billing_bp,       url_prefix="/api")
app.register_blueprint(records_bp,       url_prefix="/api")
app.register_blueprint(payments_bp,      url_prefix="/api")

@app.route("/")
def home():
    return {"message": "Clinic Management API is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)