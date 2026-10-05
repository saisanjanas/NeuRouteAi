# ==========================================
# TEST SUPABASE DATABASE CONNECTION
# ==========================================

import os
from dotenv import load_dotenv
from supabase import create_client

# Load .env
load_dotenv()

# Get Supabase details
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Connect to Supabase
supabase = create_client(url, key)

print("✅ Supabase connection created successfully!")
print("Project URL:", url)


# ==========================================
# CHECK REAL SUPABASE DATA
# ==========================================

import os
from dotenv import load_dotenv
from supabase import create_client

# Load .env
load_dotenv()

# Get Supabase details
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Connect to Supabase
supabase = create_client(url, key)

# Read weather data
response = supabase.table("weather_data").select("*").limit(5).execute()

print("✅ Connected to Supabase")
print("Weather rows found:", len(response.data))

for row in response.data:
    print(row)