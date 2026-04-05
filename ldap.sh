#!/bin/bash
set -eu

# Variables (Host is the service name in docker-compose)
LDAP_HOST="openldap-server"
LDAP_ROOT_DN="cn=admin,dc=obss,dc=com"
LDAP_PASSWORD="${LDAP_PASSWORD:-adminpassword}"
LDIF_FILE="/app/ldap_data.ldif"

echo "Waiting for OpenLDAP to be ready..."
until ldapsearch -x -H ldap://$LDAP_HOST -D "$LDAP_ROOT_DN" -w "$LDAP_PASSWORD" -b "dc=obss,dc=com" >/dev/null 2>&1; do
    echo "⏳ Waiting for LDAP connection..."
    sleep 2
done

echo "✅ OpenLDAP is up! Checking entries..."

# We use a counter to maintain LDIF order in filenames
counter=0
awk -v RS= '{ printf "%s", $0 > sprintf("entry_%03d.tmp", ++i) }' "$LDIF_FILE"

# Now we loop through them in numerical order
for f in entry_*.tmp; do
    [ -e "$f" ] || continue
    
    # Extract the DN, ensuring we handle multi-line DNs if they exist
    DN=$(grep "^dn: " "$f" | sed 's/^dn: //' | tr -d '\r')
    
    # Check if entry exists
    if ldapsearch -x -H ldap://$LDAP_HOST -D "$LDAP_ROOT_DN" -w "$LDAP_PASSWORD" -b "$DN" -s base >/dev/null 2>&1; then
        echo "⚠️  Entry $DN exists, skipping."
    else
        echo "➕ Adding $DN..."
        # If ldapadd fails, it might be a parent/child order issue
        if ! ldapadd -x -H ldap://$LDAP_HOST -D "$LDAP_ROOT_DN" -w "$LDAP_PASSWORD" -f "$f"; then
            echo "❌ Failed to add $DN. Check parent existence or schema."
        fi
    fi
    rm "$f"
done