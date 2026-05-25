#!/usr/bin/env python3
"""
Create an admin user for CaraCarriers TMS.

Usage:
  python3 scripts/create-admin.py \
    --supabase-url https://your-project.supabase.co \
    --service-key your-service-role-key \
    --email admin@caracarriers.com \
    --password MyS3cur3P@ss

Or set env vars instead:
  export SUPABASE_URL=...
  export SUPABASE_SERVICE_KEY=...
  python3 scripts/create-admin.py --email admin@caracarriers.com --password MyS3cur3P@ss
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error


def call_supabase(method, url, headers, body=None):
    req = urllib.request.Request(url, method=method, headers=headers)
    if body is not None:
        req.data = json.dumps(body).encode()
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  HTTP {e.code}: {err}", file=sys.stderr)
        return None


def main():
    parser = argparse.ArgumentParser(description="Create an admin user for CaraCarriers TMS")
    parser.add_argument("--supabase-url", default=os.getenv("SUPABASE_URL"), help="Supabase project URL")
    parser.add_argument("--service-key", default=os.getenv("SUPABASE_SERVICE_KEY"), help="Supabase service_role key")
    parser.add_argument("--email", required=True, help="Admin email (must be @caracarriers.com)")
    parser.add_argument("--password", required=True, help="Admin password (min 8 chars)")
    args = parser.parse_args()

    if not args.supabase_url or not args.service_key:
        print("ERROR: --supabase-url and --service-key are required (or set SUPABASE_URL / SUPABASE_SERVICE_KEY env vars)", file=sys.stderr)
        sys.exit(1)

    if not args.email.endswith("@caracarriers.com"):
        print("ERROR: Email must be @caracarriers.com", file=sys.stderr)
        sys.exit(1)

    if len(args.password) < 8:
        print("ERROR: Password must be at least 8 characters", file=sys.stderr)
        sys.exit(1)

    base = args.supabase_url.rstrip("/")
    headers = {
        "apikey": args.service_key,
        "Authorization": f"Bearer {args.service_key}",
        "Content-Type": "application/json",
    }

    print(f"[1/3] Creating Supabase Auth user: {args.email} ...")
    user = call_supabase("POST", f"{base}/auth/v1/admin/users", headers, {
        "email": args.email,
        "password": args.password,
        "email_confirm": True,
        "user_metadata": {"firstName": "Admin", "lastName": "User", "company": "CaraCarriers"},
    })
    if not user:
        sys.exit(1)
    auth_id = user["id"]
    print(f"  Auth user created: {auth_id}")

    print("[2/3] Creating company record ...")
    company = call_supabase("POST", f"{base}/rest/v1/companies", headers, {
        "name": "CaraCarriers",
    })
    if not company:
        print("  Trying direct insert via service_role ...")
        req = urllib.request.Request(
            f"{base}/rest/v1/companies",
            method="POST",
            headers=headers | {"Prefer": "return=representation"},
            data=json.dumps({"name": "CaraCarriers"}).encode(),
        )
        try:
            with urllib.request.urlopen(req) as resp:
                company = json.loads(resp.read().decode())
        except Exception as e:
            print(f"  Failed: {e}", file=sys.stderr)
            sys.exit(1)

    if isinstance(company, list):
        company_id = company[0]["id"]
    elif isinstance(company, dict):
        company_id = company["id"]
    else:
        company_id = company.get("id") if company else None

    if not company_id:
        print("ERROR: Could not create or find company record", file=sys.stderr)
        sys.exit(1)
    print(f"  Company created: {company_id}")

    print("[3/3] Creating user record ...")
    user_record = call_supabase("POST", f"{base}/rest/v1/users", headers | {"Prefer": "return=representation"}, {
        "auth_id": auth_id,
        "company_id": company_id,
        "first_name": "Admin",
        "last_name": "User",
        "email": args.email,
        "role": "ADMIN",
    })
    if not user_record:
        sys.exit(1)
    print(f"  User record created")

    print("\nDone! You can now log in at the app:")
    print(f"  Email:    {args.email}")
    print(f"  Password: {args.password}")


if __name__ == "__main__":
    main()
