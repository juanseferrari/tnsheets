from flask import Flask,request #Flask, in order to create a local web server
import os #Operating system - access to local information
import jwt #to generate token
import subprocess
import requests
import json
app = Flask(__name__) #start flask

#Installations
#installation of pip and python
#pip install flask
#pip install jwt
#pip3 install cryptography
#pip3 install requests


# -------- General Information -----------

redirect_uri = "http://127.0.0.1:4996/oba/auth"
redirect_uri_no_http = "127.0.0.1"
timestamp_number = 1672392433 #30 december 2023
amount = 12.00

#Environment management. You can establish "codes" or "sandbox" environment

# --- --- --- --- --- ---  ENVIRONMENT --- --- --- --- --- ---
environment = "codes" 
# environment Options: codes // sandbox
type_payment = "domestic-payments"

# type_payment Options: domestic-payments // domestic-scheduled-payments // domestic-standing-orders // international-payment // international-scheduled-payments // international-standing-orders

# --- --- --- --- --- ---  ENVIRONMENT --- --- --- --- --- ---


# -------------------- TYPES OF PAYMENT OPTIONS -----------------------

# DOMESTIC PAYMENTS
if (type_payment == "domestic-payments"):
  consent_url_route = "/domestic-payment-consents"
  payment_url_route = "/domestic-payments"
  json_body_no_consent_id = {"Data":{"Initiation":{"InstructionIdentification":"ID412","EndToEndIdentification":"E2E123","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."},"RemittanceInformation":{"Reference":"ReceiverRef","Unstructured":"Shipment fee"}}},"Risk":{"PaymentContextCode":"EcommerceGoods","MerchantCategoryCode":"5967","MerchantCustomerIdentification":"1238808123123","DeliveryAddress":{"AddressLine":["7"],"StreetName":"Apple Street","BuildingNumber":"1","PostCode":"E2 7AA","TownName":"London","Country":"UK"}}}

# DOMESTIC SCHEDULED PAYMENTS
elif (type_payment == "domestic-scheduled-payments"):
  consent_url_route = "/domestic-scheduled-payment-consents"
  payment_url_route = "/domestic-scheduled-payments"
  json_body_no_consent_id = {"Data":{"Permission":"Create","Initiation":{"InstructionIdentification":"ID412","EndToEndIdentification":"E2E123","RequestedExecutionDateTime":"2023-08-24T14:15:22Z","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."},"RemittanceInformation":{"Unstructured":"Shipment fee","Reference":"ReceiverRef"}}},"Risk":{"PaymentContextCode":"BillPayment"}}

# DOMESTIC STANDING ORDERS
elif (type_payment == "domestic-standing-orders"):
  consent_url_route = "/domestic-standing-order-consents"
  payment_url_route = "/domestic-standing-orders"
  json_body_no_consent_id = {"Data":{"Permission":"Create","Initiation":{"Frequency":"EvryDay","Reference":"Reference1234","NumberOfPayments":"1","FirstPaymentDateTime":"2023-09-24T14:15:22Z","FirstPaymentAmount":{"Amount":"1.00","Currency":"GBP"},"RecurringPaymentAmount":{"Amount":"1.00","Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}

# INTERNATIONAL PAYMENT
elif(type_payment == "international-payment"):
  consent_url_route = "/international-payment-consents"
  payment_url_route = "/international-payments"
  json_body_no_consent_id = {"Data":{"Initiation":{"InstructionIdentification":"Reference1234","EndToEndIdentification":"E2E1234","CurrencyOfTransfer":"GBP","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}

#INTERNATIONAL SCHEDULED PAYMENTS
elif (type_payment == "international-scheduled-payments"):
  consent_url_route = "/international-scheduled-payment-consents"
  payment_url_route = "/international-scheduled-payments"
  json_body_no_consent_id = {"Data":{"Permission":"Create","Initiation":{"InstructionIdentification":"Reference1234","EndToEndIdentification":"E2E1234","RequestedExecutionDateTime":"2022-10-01T14:15:22Z","CurrencyOfTransfer":"GBP","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}

#INTERNATIONAL STANDING ORDERS
elif (type_payment == "international-standing-orders"):
  consent_url_route = "/international-standing-order-consents"
  payment_url_route = "/international-standing-orders"
  json_body_no_consent_id = {"Data":{"Permission":"Create","Initiation":{"Frequency":"EvryDay","Reference":"Reference1234","FirstPaymentDateTime":"2022-10-01T14:15:22Z","CurrencyOfTransfer":"GBP","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}





def body_with_consent(consent_id=False,type_payment_function=True):
  if(type_payment_function == "domestic-payments"):
    return {"Data":{"ConsentId": consent_id,"Initiation":{"InstructionIdentification":"ID412","EndToEndIdentification":"E2E123","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."},"RemittanceInformation":{"Reference":"ReceiverRef","Unstructured":"Shipment fee"}}},"Risk":{"PaymentContextCode":"EcommerceGoods","MerchantCategoryCode":"5967","MerchantCustomerIdentification":"1238808123123","DeliveryAddress":{"AddressLine":["7"],"StreetName":"Apple Street","BuildingNumber":"1","PostCode":"E2 7AA","TownName":"London","Country":"UK"}}}
  if(type_payment_function == "domestic-scheduled-payments"):
    return {"Data":{"ConsentId":consent_id,"Initiation":{"InstructionIdentification":"ID412","EndToEndIdentification":"E2E123","RequestedExecutionDateTime":"2023-08-24T14:15:22Z","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."},"RemittanceInformation":{"Unstructured":"Shipment fee","Reference":"ReceiverRef"}}},"Risk":{"PaymentContextCode":"BillPayment"}}
  if(type_payment_function == "domestic-standing-orders"):
    return {"Data":{"ConsentId":consent_id,"Initiation":{"Frequency":"EvryDay","Reference":"Reference1234","NumberOfPayments":"1","FirstPaymentDateTime":"2023-09-24T14:15:22Z","FirstPaymentAmount":{"Amount":"1.00","Currency":"GBP"},"RecurringPaymentAmount":{"Amount":"1.00","Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}
  if(type_payment_function == "international-payment"):
    return {"Data":{"ConsentId":consent_id,"Initiation":{"InstructionIdentification":"Reference1234","EndToEndIdentification":"E2E1234","CurrencyOfTransfer":"GBP","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}
  if(type_payment_function == "international-scheduled-payments"):
    return {"Data":{"ConsentId": consent_id,"Initiation":{"InstructionIdentification":"Reference1234","EndToEndIdentification":"E2E1234","RequestedExecutionDateTime":"2022-10-01T14:15:22Z","CurrencyOfTransfer":"GBP","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}
  if(type_payment_function == "international-standing-orders"):
    return {"Data":{"ConsentId": consent_id,"Initiation":{"Frequency":"EvryDay","Reference":"Reference1234","FirstPaymentDateTime":"2022-10-01T14:15:22Z","CurrencyOfTransfer":"GBP","InstructedAmount":{"Amount":str(amount),"Currency":"GBP"},"CreditorAccount":{"SchemeName":"UK.OBIE.SortCodeAccountNumber","Identification":"11223321325698","Name":"Receiver Co."}}},"Risk":{"PaymentContextCode":"BillPayment"}}

# -------------------- END TYPES OF PAYMENT OPTIONS -----------------------


root_url = "https://oba-auth.revolut.codes"
consent_root_url = "https://oba.revolut.codes"
if(environment == "sandbox"):
  print("sandbox environment")
  root_url = "https://sandbox-oba-auth.revolut.com"
  consent_root_url = "https://sandbox-oba.revolut.com"


# -------- END General Information -----------


# --------- CLIENT_ID VALIDATION ---------------

#check if client_id exists:
client_id = os.path.exists('client_id.txt')

if not client_id:
    client_id = input("First create a new Application in the developer Portal and past the client_id:")
    with open("client_id.txt", "w") as file:
        file.write(client_id)
    print("Client_id saved correctly")
else:
    with open('./client_id.txt') as f:
        client_id = f.read()

# --------- END CLIENT_ID VALIDATION ---------------


# --------- PRIVATE KEY VALIDATION -----------------

#check if keys exist
private_key = ''
priv_key_exists = os.path.exists('./private.key')

if(priv_key_exists):
    #print('priv_key_exists')
    with open('./private.key') as f:
        private_key = f.read()
        #print(private_key)
else:
  print("generating private key")
  subprocess.run("openssl req -new -newkey rsa:2048 -nodes -out revolut.csr -keyout private.key -subj '/C=GB/ST=/L=/O=OpenBanking/OU=001580000103UAvAAM/CN=2kiXQyo0tedjW2somjSgH7' -sha256 -outform der", shell=True)
  print("private key generated")
  with open('./private.key') as f:
      private_key = f.read()

 #End check if keys exist

# --------- END PRIVATE KEY VALIDATION -----------------

# --------- CERTIFICATES CREATION ----------------------

cert_signing_der = os.path.exists('./signing.der')
cert_transport_der = os.path.exists('./transport.der')

if(not cert_signing_der and not cert_transport_der):
  input("Now, click on 'Configure Sandbox', select AISP and PISP and press continue.")
  input("Introduce this redirect_url: "+ redirect_uri +"   .Also upload your revolt.csr file in this folder. Press Continue when finished")
  input("Certificates missing. Download Sandbox Certificates and move them to the script folder. Press Enter when ready.")
  subprocess.Popen("openssl x509 -inform der -in signing.der -out signing.pem",cwd="./", shell=True)
  subprocess.Popen("openssl x509 -inform der -in transport.der -out transport.pem",cwd="./", shell=True)

cert_signing_pem = os.path.exists('./signing.pem')
cert_transport_pem = os.path.exists('./transport.pem')


if(cert_signing_der and not cert_signing_pem):
    print("cert_signing_der exists but not the pem")
    subprocess.Popen("openssl x509 -inform der -in signing.der -out signing.pem",cwd="./", shell=True)

if(cert_transport_der and not cert_transport_pem):
    print("cert_transport_der exists but not the pem")
    subprocess.Popen("openssl x509 -inform der -in transport.der -out transport.pem",cwd="./", shell=True)

if(cert_signing_der and cert_transport_der and cert_signing_pem and cert_transport_pem):
    print("all certificates OK")

# --------- END CERTIFICATES CREATION ----------------------

# ---------------------------- GENERAL REUSED FUNCTIONS ------------------------------------

# --------- JWK endpoint function -----------
def generate_jwk_url():
    # ------ n data ---------
    n_response = subprocess.run("openssl x509 -noout -modulus -in signing.pem | cut -c 9- | xxd -r -p | base64 | tr '/+' '_-' | tr -d '='",cwd="./", shell=True, capture_output=True, text=True)
    n_value= n_response.stdout
    n_value= n_value.replace('\n',"")
    # ------- x5c ---------
    x5c_response = subprocess.run("cat signing.pem | sed '1,1d;$ d'", shell=True, capture_output=True, text=True)
    x5c_value = x5c_response.stdout
    x5c_value = x5c_value.replace('\n',"")
    
    # ------- JWK json object ------ 
    jwk_json_object = {"keys": [
        {"use": "sig", 
          "n": n_value, 
          "e": "AQAB", 
          "kty": "RSA", 
          "kid": "scriptjuanse",
          "x5c": [x5c_value]
        } ]}
    #print(jwk_json_object)
    jwk_endpoint_request = requests.post('https://api.jsonbin.it/bins/', json=jwk_json_object)
    jwk_response = jwk_endpoint_request.json()
    jwk_url = "https://api.jsonbin.it/bins/" +jwk_response['bin']
    with open("jwk_endpoint.txt", "w") as file:
        file.write(jwk_url)
    print("Click in 'Setup JWKs Endpoint' and paste the following: " + jwk_url)
    input("Press Enter when JWK is correctly uploaded")

    print("Now click in 'Submit to production' with the following information:")
    print("Redirect_url : " + redirect_uri)
    print("JWKs URL: "+ jwk_url)
    print("Upload the transport.der certificate in the 'Production certificate' section")
    input("Press enter when ready")
    production_client_id = input("Now paste your Production Client_id: ")
    with open("client_id.txt", "w") as file:
        file.write(production_client_id)
    print("----------------------------------")



# --------- END JWK endpoint function -----------

def jwt_encription(consent_id=False):
    jwt_headers_pc = {
      "typ": "JOSE", # ESTO ES LA CLAVEEE, SINO NO FUNCIONAAA!!
      "alg": "PS256",
      "kid": "scriptjuanse",
      "crit": [
        "http://openbanking.org.uk/tan"
      ],
      "http://openbanking.org.uk/tan": "juanseferrari.github.io"
    }
    jwt_body_scheduled = json_body_no_consent_id

    if(consent_id):
      jwt_body_scheduled = body_with_consent(consent_id,type_payment)


    jwt_encoded_pc = jwt.encode(jwt_body_scheduled, key=private_key, algorithm="PS256",headers=jwt_headers_pc)
    #print(jwt_encoded_pc)
    jwt_list = jwt_encoded_pc.split(".")
    jwt_no_middle = jwt_list[0]+".."+jwt_list[2]

    #print(json.dumps(jwt_body_pc,separators=(',', ':')))
    object = {
      "body": json.dumps(jwt_body_scheduled,separators=(',', ':')),
      "jwt_no_middle": jwt_no_middle

    }
    return object

# ---------------------------- GENERAL REUSED FUNCTIONS ------------------------------------


#check if jwk endpoint exists:
jwk_endpoint = os.path.exists('jwk_endpoint.txt')
if not jwk_endpoint:
  generate_jwk_url()
else:
  with open('./jwk_endpoint.txt') as f:
    jwk_url = f.read()
    #print("This is your JWK URL: " + jwk_url)



# ------------------ Payment consent --------------

#1. -------  Generate a client credentials token
token_generation = """
curl -k --cert transport.pem --key private.key \
--location --request POST '"""+root_url+"""/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'scope=payments' \
--data-urlencode 'client_id=""" + client_id + """'"""


token = subprocess.run(token_generation, shell=True,capture_output=True,)
print(token.stdout)
access_token_output = json.loads(token.stdout)['access_token']

print("access_token_output")
print(access_token_output)
print("access_token_output")
# ------- POST payment consent to obtain a consent_id

#POST - curl to obtain Domestic payment consent:
domestic_payment_consent_url = consent_root_url + consent_url_route
#Esto cambia por cada tipo de payment

payment_consent_curl = """
curl --location --request POST '"""+domestic_payment_consent_url+"""' \
--header 'x-fapi-financial-id: 001580000103UAvAAM' \
--header 'Content-Type: application/json' \
--header 'x-idempotency-key: 123' \
--header 'Authorization: Bearer """+access_token_output+"""' \
--header 'x-jws-signature: """+jwt_encription()['jwt_no_middle']+"""' \
--data-raw '"""+jwt_encription()['body']+"""'
"""
print("jwt_encription()['jwt_no_middle']")
print(jwt_encription()['jwt_no_middle'])
print("jwt_encription()['jwt_no_middle']")

print("jwt_encription()['body']")
print(jwt_encription()['body'])
print("jwt_encription()['body']")
#print(payment_consent_curl)
consent = subprocess.run(payment_consent_curl, shell=True,capture_output=True)
print("consent response")
print(json.loads(consent.stdout))
print("consent response")
consentId = json.loads(consent.stdout)['Data']['ConsentId']

# ------------ END payment consent -------------


# --------- Create a JWT for the URL parameter ---------

#GET consent
#JWT Encription
jwt_headers = {
  "alg": "PS256",
  "kid": "scriptjuanse"
}
jwt_body = {
  "response_type": "code id_token",
  "client_id":client_id,
  "redirect_uri": redirect_uri,
  "scope": "payments",
  "claims": {
    "id_token": {
      "openbanking_intent_id": {
        "value": consentId
      }
    }
  }
}
jwt_encoded = jwt.encode(jwt_body, key=private_key, algorithm="RS256",headers=jwt_headers)
#print(jwt_encoded)
#END JWT Encription

#redirect URL:


codes_auth_redirect_url = consent_root_url + "/ui/index.html?response_type=code%26id_token&scope=payments&redirect_uri="+redirect_uri+"&client_id="+client_id+"&request="+jwt_encoded
print("Click on the following link to process a payment:")
print(codes_auth_redirect_url)

#NOTES
#Upload transport.der certificate to go to production

@app.route("/oba/auth", methods=['GET'])
def oba():
    args = request.args
    code = args["code"]
    print(code)
    # ------ 5. Exchange authorization code for access token  -------

    token_payment_curl = """
    curl -k --key private.key --cert transport.pem \
    --location --request POST '"""+root_url+"""/token' \
    --header 'Content-Type:application/x-www-form-urlencoded' \
    --data-urlencode 'grant_type=authorization_code' \
    --data-urlencode 'code="""+code+"""'
    """
    #print(token_payment_curl)
    token_payment = subprocess.run(token_payment_curl, shell=True,capture_output=True)
    token_payment_response = json.loads(token_payment.stdout)
    try:
      payment_access_token = token_payment_response['access_token']
      print("payment_access_token")
      print(payment_access_token)
      print("payment_access_token")
    except: 
      return(token_payment_response)

    # ------ END 5. Exchange authorization code for access token  -------
    # ------ 6.  Initiate a domestic payment ---------- 

    #Esto cambia por cada tipo de payment
    print("consentId: " + consentId)
    domestic_payment_curl = """
              curl --location --request POST '"""+consent_root_url+payment_url_route+"""' \
          --header 'x-fapi-financial-id: 001580000103UAvAAM' \
          --header 'Content-Type: application/json' \
          --header 'x-idempotency-key: 123' \
          --header 'Authorization: Bearer """+payment_access_token+"""' \
          --header 'x-jws-signature: """+jwt_encription(consentId)['jwt_no_middle']+"""' \
          --data '"""+jwt_encription(consentId)['body']+"""'
          """
    print("jwt_encription(consent_id)['jwt_no_middle']")
    print(jwt_encription(consentId)['jwt_no_middle'])
    print("jwt_encription(consent_id)['jwt_no_middle']")

    print("jwt_encription(consent_id)['body']")
    print(jwt_encription(consentId)['body'])
    print("jwt_encription(consent_id)['body']")

    #return jwt_encription(consentId)['body']
    domestic_payment_request = subprocess.run(domestic_payment_curl, shell=True,capture_output=True)
    
    # ------ END 6.  Initiate a domestic payment ---------- 

    return json.loads(domestic_payment_request.stdout)
    
     


    # ------ Initiate a domestic payment -------




app.run(port=4996)


