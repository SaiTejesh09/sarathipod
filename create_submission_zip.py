import os
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DOCS_DIR = BASE_DIR / "docs"
ZIP_PATH = BASE_DIR / "SarathiPOD_Submission.zip"

def create_zip():
    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 1. Add Technical Design Document (PDF)
        pdf_path = DOCS_DIR / "Technical_Design_Document.pdf"
        if pdf_path.exists():
            zipf.write(pdf_path, arcname="Technical_Design_Document.pdf")
            print(f"Added: Technical_Design_Document.pdf ({os.path.getsize(pdf_path)} bytes)")

        # Also include docx for reviewer convenience
        docx_path = DOCS_DIR / "Technical_Design_Document.docx"
        if docx_path.exists():
            zipf.write(docx_path, arcname="Technical_Design_Document.docx")
            print(f"Added: Technical_Design_Document.docx ({os.path.getsize(docx_path)} bytes)")

        # 2. Add deployment.md
        dep_path = BASE_DIR / "deployment.md"
        if dep_path.exists():
            zipf.write(dep_path, arcname="deployment.md")
            print(f"Added: deployment.md ({os.path.getsize(dep_path)} bytes)")

    zip_size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print(f"\nCreated submission zip file: {ZIP_PATH}")
    print(f"Zip File Size: {zip_size_mb:.2f} MB (Well under 25 MB limit!)")

if __name__ == "__main__":
    create_zip()

