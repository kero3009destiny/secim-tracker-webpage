import flask
import requests
import time

anka_headers = {
    "Referer": "https://halktv.com.tr/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
}

app = flask.Flask(__name__)

# Variables for caching the data
aa_data = None
anka_data = None
last_fetch_time = 0
cache_duration = 10  # seconds

# Fetch data from Anadolu Ajansı
def fetch_aa_data():
    global aa_data, last_fetch_time
    response = requests.get("https://secim.aa.com.tr/data/new-result-web-short.json", headers=anka_headers)
    if response.status_code == 200:
        aa_data = response.json()
        last_fetch_time = time.time()

# Fetch data from Anka Haber Ajansı
def fetch_anka_data():
    global anka_data, last_fetch_time
    response = requests.get("https://scdn.ankahaber.net/secimsonuc/site/ikincitur/web/cb-overview.json", headers=anka_headers)
    if response.status_code == 200:
        anka_data = response.json()
        last_fetch_time = time.time()

# Mirror a request to a URL
@app.route("/<path:url>", methods=["GET", "POST"])
def mirror(url):
    if flask.request.method == "GET":
        return requests.get(url, headers=anka_headers).text
    elif flask.request.method == "POST":
        return requests.post(url, data=flask.request.form).text

@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Content-Type"] = "application/json"
    return response

# Update the data every 10 seconds
def update_data():
    while True:
        fetch_aa_data()
        fetch_anka_data()
        time.sleep(cache_duration)

# Run the update_data function in a separate thread
import threading
update_thread = threading.Thread(target=update_data)
update_thread.daemon = True
update_thread.start()

# Serve the cached data to users
@app.route("/")
def serve_data():
    global aa_data, anka_data, last_fetch_time, cache_duration
    if aa_data is None or anka_data is None or time.time() - last_fetch_time > cache_duration:
        # Data not available or expired, fetch it again
        fetch_aa_data()
        fetch_anka_data()
    return {
        "aa_data": aa_data,
        "anka_data": anka_data
    }

# Run the app
app.run()
