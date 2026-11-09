import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print("  SarathiPOD - AI Proof of Delivery & Fast Billing Platform")
    print("  Client: Company A Logistics, Chhatrapati Sambhajinagar")
    print("=" * 65)
    print("  🚀 Starting server at: http://localhost:8000")
    print("  📋 Reviewer Demo Accounts:")
    print("     - Driver:       driver1   / password123")
    print("     - Billing Exec: billing   / password123")
    print("     - Ops Head:     opshead   / password123")
    print("     - Managing Dir: director  / password123")
    print("     - Client Rep:   company_b / password123")
    print("=" * 65)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False, app_dir=str(backend_dir))

