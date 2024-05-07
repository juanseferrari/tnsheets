import requests #to make API Calls requests
import json

values = [
834914577,
833202178,
833323560,
835901553,
836098091,
836452530,
836664531,
813873297,
838186379,
838081830,
836250851,
838723789,
834301327,
838811213,
838902138,
838955739,
839069082]

headers = {'Content-Type': "application/json"}
for x in values:

    payload = json.dumps({
        "store_id": 1734366,
        "event": "order/paid",
        "id": x,
        "informed": "Postman"
    })
    res = requests.post("https://script.google.com/macros/s/AKfycbwzpIL3ByPheso5x2keLkG6d6x99UvL9t4wX51UXntKPigbmw0Ug34CqQZvankJ5A/exec", data=payload,headers=headers)
    print(res.text)
    print("------")