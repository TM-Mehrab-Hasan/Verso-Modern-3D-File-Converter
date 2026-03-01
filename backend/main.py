from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import uuid
from pathlib import Path
from converters import (
    word_to_pdf,
    pdf_to_word,
    pptx_to_pdf,
    md_to_pdf,
    md_to_word,
    pdf_to_md,
    word_to_md
)

app = FastAPI(title="File Converter API", version="1.0.0")

# CORS configuration — allow any localhost port (covers Vite on 5173/5174/etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Supported conversions
CONVERSIONS = {
    "word-to-pdf": {"from": ["docx", "doc"], "to": "pdf", "handler": word_to_pdf},
    "pdf-to-word": {"from": ["pdf"], "to": "docx", "handler": pdf_to_word},
    "pptx-to-pdf": {"from": ["pptx", "ppt"], "to": "pdf", "handler": pptx_to_pdf},
    "md-to-pdf": {"from": ["md", "markdown"], "to": "pdf", "handler": md_to_pdf},
    "md-to-word": {"from": ["md", "markdown"], "to": "docx", "handler": md_to_word},
    "pdf-to-md": {"from": ["pdf"], "to": "md", "handler": pdf_to_md},
    "word-to-md": {"from": ["docx", "doc"], "to": "md", "handler": word_to_md},
}


@app.get("/")
async def root():
    return {
        "message": "File Converter API",
        "version": "1.0.0",
        "supported_conversions": list(CONVERSIONS.keys())
    }


@app.get("/conversions")
async def get_conversions():
    """Get all supported conversion types"""
    return {
        "conversions": [
            {
                "id": key,
                "name": key.replace("-", " ").title(),
                "from": value["from"],
                "to": value["to"]
            }
            for key, value in CONVERSIONS.items()
        ]
    }


@app.post("/convert/{conversion_type}")
async def convert_file(conversion_type: str, file: UploadFile = File(...)):
    """Convert uploaded file based on conversion type"""
    
    if conversion_type not in CONVERSIONS:
        raise HTTPException(status_code=400, detail="Unsupported conversion type")
    
    # Get file extension
    file_ext = file.filename.split(".")[-1].lower()
    conversion = CONVERSIONS[conversion_type]
    
    # Validate file extension
    if file_ext not in conversion["from"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Expected {conversion['from']}, got {file_ext}"
        )
    
    # Generate unique filename
    unique_id = str(uuid.uuid4())
    input_path = UPLOAD_DIR / f"{unique_id}.{file_ext}"
    output_filename = f"{Path(file.filename).stem}_{unique_id}.{conversion['to']}"
    output_path = OUTPUT_DIR / output_filename
    
    try:
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Perform conversion
        handler = conversion["handler"]
        handler(str(input_path), str(output_path))
        
        # Clean up input file
        os.remove(input_path)
        
        # Return converted file
        return FileResponse(
            path=output_path,
            filename=output_filename,
            media_type="application/octet-stream",
            background=None
        )
    
    except Exception as e:
        # Clean up files on error
        if input_path.exists():
            os.remove(input_path)
        if output_path.exists():
            os.remove(output_path)
        
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@app.delete("/cleanup/{filename}")
async def cleanup_file(filename: str):
    """Clean up converted file"""
    file_path = OUTPUT_DIR / filename
    if file_path.exists():
        os.remove(file_path)
        return {"message": "File cleaned up successfully"}
    return {"message": "File not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
