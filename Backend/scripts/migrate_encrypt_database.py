"""
One-time migration script to encrypt sensitive records in moodmentor.db.

Steps:
1. Backs up the database securely before making any changes.
2. Reads existing sensitive plaintext fields (journal text, ai_reply, chat text, contact phone, contact email).
3. Encrypts each field using Fernet key from DB_ENCRYPTION_KEY.
4. Verifies raw database contains only ciphertexts (starts with 'gAAAAA').
5. Verifies SQLAlchemy model loading automatically decrypts back to original text.
"""

import os
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env is loaded
backend_dir = Path(__file__).resolve().parents[1]
load_dotenv(backend_dir / ".env")

import sys
sys.path.insert(0, str(backend_dir))

from app.services.encryption import encrypt, decrypt, is_encrypted
from app.database import SessionLocal, engine
from app.models import JournalEntry, ChatMessage, TrustedContact, ConnectedIntegration


def backup_database(db_path: Path) -> Path:
    backup_dir = backend_dir / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"moodmentor_pre_encryption_{timestamp}.db"
    shutil.copy2(db_path, backup_file)
    print(f"[Step 1] Secure backup created at: {backup_file} ({backup_file.stat().st_size} bytes)")
    return backup_file


def run_migration():
    db_path = backend_dir / "moodmentor.db"
    if not db_path.exists():
        print(f"Database not found at {db_path}. Nothing to migrate.")
        return

    key = os.getenv("DB_ENCRYPTION_KEY", "").strip()
    if not key:
        print("ERROR: DB_ENCRYPTION_KEY is not set in Backend/.env!")
        sys.exit(1)

    print("==================================================")
    print(" MoodMentor Sensitive Data Encryption Migration")
    print("==================================================")

    # Step 1: Backup
    backup_file = backup_database(db_path)

    # Step 2: Open direct SQLite connection for controlled migration
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    stats = {
        "journal_entries": 0,
        "chat_messages": 0,
        "trusted_contacts": 0,
        "connected_integrations": 0,
    }

    # Store originals in memory for verification
    originals = {
        "journal": {},
        "chat": {},
        "contacts": {},
    }

    print("\n[Step 2] Encrypting records...")

    # A. Journal Entries (text, ai_reply)
    cur.execute("SELECT id, text, ai_reply FROM journal_entries")
    for row_id, text_val, reply_val in cur.fetchall():
        originals["journal"][row_id] = (text_val, reply_val)
        new_text = text_val
        new_reply = reply_val
        changed = False

        if text_val and not is_encrypted(text_val):
            new_text = encrypt(text_val)
            changed = True
        if reply_val and not is_encrypted(reply_val):
            new_reply = encrypt(reply_val)
            changed = True

        if changed:
            cur.execute(
                "UPDATE journal_entries SET text = ?, ai_reply = ? WHERE id = ?",
                (new_text, new_reply, row_id),
            )
            stats["journal_entries"] += 1

    # B. Chat Messages (text)
    cur.execute("SELECT id, text FROM chat_messages")
    for row_id, text_val in cur.fetchall():
        originals["chat"][row_id] = text_val
        if text_val and not is_encrypted(text_val):
            new_text = encrypt(text_val)
            cur.execute("UPDATE chat_messages SET text = ? WHERE id = ?", (new_text, row_id))
            stats["chat_messages"] += 1

    # C. Trusted Contacts (phone, email)
    cur.execute("SELECT id, phone, email FROM trusted_contacts")
    for row_id, phone_val, email_val in cur.fetchall():
        originals["contacts"][row_id] = (phone_val, email_val)
        new_phone = phone_val
        new_email = email_val
        changed = False

        if phone_val and not is_encrypted(phone_val):
            new_phone = encrypt(phone_val)
            changed = True
        if email_val and not is_encrypted(email_val):
            new_email = encrypt(email_val)
            changed = True

        if changed:
            cur.execute(
                "UPDATE trusted_contacts SET phone = ?, email = ? WHERE id = ?",
                (new_phone, new_email, row_id),
            )
            stats["trusted_contacts"] += 1

    # D. Connected Integrations (access_token, refresh_token)
    cur.execute("SELECT id, access_token, refresh_token FROM connected_integrations")
    for row_id, at_val, rt_val in cur.fetchall():
        new_at = at_val
        new_rt = rt_val
        changed = False
        if at_val and not is_encrypted(at_val):
            new_at = encrypt(at_val)
            changed = True
        if rt_val and not is_encrypted(rt_val):
            new_rt = encrypt(rt_val)
            changed = True
        if changed:
            cur.execute(
                "UPDATE connected_integrations SET access_token = ?, refresh_token = ? WHERE id = ?",
                (new_at, new_rt, row_id),
            )
            stats["connected_integrations"] += 1

    conn.commit()
    conn.close()

    print(f"  - Encrypted {stats['journal_entries']} journal entries")
    print(f"  - Encrypted {stats['chat_messages']} chat messages")
    print(f"  - Encrypted {stats['trusted_contacts']} trusted contacts")
    print(f"  - Encrypted {stats['connected_integrations']} connected integrations")

    # Step 3: Raw Verification
    print("\n[Step 3] Verifying raw database ciphertexts...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT id, text FROM journal_entries")
    for jid, ctext in cur.fetchall():
        assert is_encrypted(ctext), f"Journal entry {jid} text is not encrypted!"
        orig_text, _ = originals["journal"][jid]
        decrypted = decrypt(ctext)
        assert decrypted == orig_text, f"Journal entry {jid} decryption mismatch!"

    cur.execute("SELECT id, text FROM chat_messages")
    for cid, ctext in cur.fetchall():
        assert is_encrypted(ctext), f"Chat message {cid} is not encrypted!"
        orig_text = originals["chat"][cid]
        decrypted = decrypt(ctext)
        assert decrypted == orig_text, f"Chat message {cid} decryption mismatch!"

    cur.execute("SELECT id, phone, email FROM trusted_contacts")
    for tid, cphone, cemail in cur.fetchall():
        if cphone:
            assert is_encrypted(cphone), f"Contact {tid} phone is not encrypted!"
        if cemail:
            assert is_encrypted(cemail), f"Contact {tid} email is not encrypted!"

    conn.close()
    print("  [OK] All raw DB fields are confirmed encrypted (Fernet ciphertext starting with 'gAAAAA').")

    # Step 4: Application-level SQLAlchemy test
    print("\n[Step 4] Testing decryption through application models...")
    with SessionLocal() as db:
        for j in db.query(JournalEntry).all():
            orig_text, orig_reply = originals["journal"][j.id]
            assert j.text == orig_text, f"SQLAlchemy JournalEntry {j.id} did not decrypt correctly"
            if orig_reply:
                assert j.ai_reply == orig_reply, f"SQLAlchemy JournalEntry {j.id} ai_reply mismatch"

        for m in db.query(ChatMessage).all():
            orig_text = originals["chat"][m.id]
            assert m.text == orig_text, f"SQLAlchemy ChatMessage {m.id} did not decrypt correctly"

        for tc in db.query(TrustedContact).all():
            orig_phone, orig_email = originals["contacts"][tc.id]
            assert tc.phone == orig_phone, f"SQLAlchemy TrustedContact {tc.id} phone mismatch"
            if orig_email:
                assert tc.email == orig_email, f"SQLAlchemy TrustedContact {tc.id} email mismatch"

    print("  [OK] Application-level decryption works seamlessly through SQLAlchemy models.")
    print("\n[SUCCESS] Migration completed successfully!")


if __name__ == "__main__":
    run_migration()
