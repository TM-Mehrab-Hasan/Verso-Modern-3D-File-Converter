"""
File conversion handlers using open-source libraries
"""
import os
from pathlib import Path


def word_to_pdf(input_path: str, output_path: str):
    """Convert Word document to PDF"""
    try:
        # Method 1: Using docx2pdf (Windows/Mac)
        from docx2pdf import convert
        convert(input_path, output_path)
    except Exception as e:
        # Method 2: Using LibreOffice (cross-platform)
        try:
            import subprocess
            subprocess.run([
                "soffice",
                "--headless",
                "--convert-to", "pdf",
                "--outdir", str(Path(output_path).parent),
                input_path
            ], check=True, capture_output=True, text=True)
            
            # Check if file was created with original name
            expected = Path(output_path).parent / Path(input_path).stem + ".pdf"
            if expected.exists() and expected != Path(output_path):
                os.rename(str(expected), output_path)
        except Exception as inner_e:
            raise Exception(f"Word to PDF conversion failed. Error: {str(inner_e)}")


def pdf_to_word(input_path: str, output_path: str):
    """Convert PDF to Word document"""
    from pdf2docx import Converter
    
    cv = Converter(input_path)
    cv.convert(output_path)
    cv.close()


def pptx_to_pdf(input_path: str, output_path: str):
    """Convert PowerPoint to PDF"""
    # Try using LibreOffice first (cross-platform)
    try:
        import subprocess
        subprocess.run([
            "soffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", str(Path(output_path).parent),
            input_path
        ], check=True, capture_output=True, text=True)
        
        # Check if file was created with original name
        expected = Path(output_path).parent / Path(input_path).stem + ".pdf"
        if expected.exists() and expected != Path(output_path):
            os.rename(str(expected), output_path)
    except Exception as e:
        # Method 2: Using comtypes (Windows only - requires MS Office)
        try:
            import comtypes.client  # type: ignore
            
            powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
            powerpoint.Visible = 1
            
            abs_input = os.path.abspath(input_path)
            abs_output = os.path.abspath(output_path)
            
            presentation = powerpoint.Presentations.Open(abs_input)
            presentation.SaveAs(abs_output, 32)  # 32 = PDF format
            presentation.Close()
            powerpoint.Quit()
        except Exception as inner_e:
            raise Exception(f"PPTX to PDF conversion failed. Please install LibreOffice or MS PowerPoint. Error: {str(inner_e)}")


def md_to_pdf(input_path: str, output_path: str):
    """Convert Markdown to PDF using xhtml2pdf (no GTK required)"""
    import markdown
    from xhtml2pdf import pisa

    with open(input_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    html_content = markdown.markdown(
        md_content,
        extensions=['extra', 'codehilite', 'tables', 'toc']
    )

    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 40px;
                color: #333;
            }}
            h1, h2, h3 {{ color: #2c3e50; }}
            code {{
                background: #f4f4f4;
                padding: 2px 5px;
                font-family: monospace;
            }}
            pre {{
                background: #f4f4f4;
                padding: 15px;
            }}
            blockquote {{
                border-left: 4px solid #ddd;
                padding-left: 15px;
                color: #666;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
            }}
            th {{ background: #f4f4f4; }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    with open(output_path, 'wb') as f:
        result = pisa.CreatePDF(styled_html, dest=f)

    if result.err:
        raise Exception(f"PDF generation failed with {result.err} errors")


def md_to_word(input_path: str, output_path: str):
    """Convert Markdown to Word"""
    import pypandoc
    
    pypandoc.convert_file(
        input_path,
        'docx',
        outputfile=output_path,
        extra_args=['--standalone']
    )


def pdf_to_md(input_path: str, output_path: str):
    """Convert PDF to Markdown"""
    import pdfplumber
    
    markdown_content = []
    
    with pdfplumber.open(input_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            if text:
                markdown_content.append(f"## Page {page_num}\n\n{text}\n\n")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(markdown_content))


def word_to_md(input_path: str, output_path: str):
    """Convert Word to Markdown"""
    import pypandoc
    
    pypandoc.convert_file(
        input_path,
        'md',
        outputfile=output_path,
        extra_args=['--wrap=none']
    )
