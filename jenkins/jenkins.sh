#!/bin/bash
set -eux
LDAP_CONTAINER="openldap-server"
LDAP_ROOT_DN="cn=admin,dc=obss,dc=com"
LDAP_PASSWORD="${LDAP_PASSWORD:-adminpassword}"
LDIF_FILE="/var/jenkins_home/ldap_data.ldif"

# Define the function first
process_entry() {
    local entry="$1"
    
    # Extract DN from the entry
    local dn_line=$(echo "$entry" | grep "^dn: " | head -1)
    if [[ -z "$dn_line" ]]; then
        echo "⚠️ No DN found in entry, skipping"
        return
    fi
    
    local entry_dn=$(echo "${dn_line#dn: }" | tr -d '\r')
    
    # Check if entry exists
    if docker exec "$LDAP_CONTAINER" ldapsearch -x -D "$LDAP_ROOT_DN" -w "$LDAP_PASSWORD" -b "$entry_dn" -s base dn >/dev/null 2>&1; then
        echo "⚠️ Entry $entry_dn exists, skipping"
    else
        echo "➕ Adding $entry_dn"
        # Write entry to temporary file in container and add it
        docker exec -i "$LDAP_CONTAINER" bash -c "cat > /tmp/temp.ldif" <<< "$entry"
        if docker exec "$LDAP_CONTAINER" ldapadd -x -D "$LDAP_ROOT_DN" -w "$LDAP_PASSWORD" -f /tmp/temp.ldif; then
            echo "✅ Successfully added $entry_dn"
        else
            echo "❌ Failed to add $entry_dn"
        fi
    fi
}

echo "Waiting for OpenLDAP to be ready..."
for i in {1..15}; do
    if docker exec "$LDAP_CONTAINER" ldapsearch -x -D "$LDAP_ROOT_DN" -w "$LDAP_PASSWORD" -b "dc=obss,dc=com" >/dev/null 2>&1; then
        echo "✅ OpenLDAP is up!"
        break
    fi
    echo "⏳ Waiting..."
    sleep 5
done

echo "Copying LDIF file into container..."
docker cp "$LDIF_FILE" "$LDAP_CONTAINER":/tmp/init.ldif

echo "Adding missing entries individually..."

# Process LDIF file properly - entries are separated by blank lines
{
    current_entry=""
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Remove carriage returns
        line=$(echo "$line" | tr -d '\r')
        
        # If line is empty or we hit EOF, process the current entry
        if [[ -z "$line" ]]; then
            if [[ -n "$current_entry" ]]; then
                process_entry "$current_entry"
                current_entry=""
            fi
        else
            # Skip comment lines
            if [[ "$line" =~ ^[[:space:]]*# ]]; then
                continue
            fi
            # Add line to current entry
            if [[ -n "$current_entry" ]]; then
                current_entry="$current_entry"$'\n'"$line"
            else
                current_entry="$line"
            fi
        fi
    done < "$LDIF_FILE"
    
    # Process the last entry if there's no trailing blank line
    if [[ -n "$current_entry" ]]; then
        process_entry "$current_entry"
    fi
}

echo "🎉 LDIF insertion complete!"