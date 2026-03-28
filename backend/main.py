from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware

from detector import detect_pii_full

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

class FileData(BaseModel):
    name: str
    content: str

@app.post("/scan")
async def scan_files(files: List[FileData]):
    results = []

    for file in files:
        file_data = {
            "file": file.name,
            "content": file.content
        }

        pii_result = detect_pii_full(file_data)["pii"]
        pii_flags = {
            "Name": False,
            "Phone": False,
            "Email": False,
            "Credit Card": False,
            "Aadhaar": False,
            "PAN": False,
            "IP Address": False
        }

        for item in pii_result:
            pii_flags[item["type"]] = True

        results.append({
            "file": file.name,
            "pii": pii_flags
        })

    return {"results": results}