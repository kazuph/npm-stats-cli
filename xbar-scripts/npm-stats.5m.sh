#!/bin/bash

# <xbar.title>NPM Stats</xbar.title>
# <xbar.version>v1.0</xbar.version>
# <xbar.author>kazuph</xbar.author>
# <xbar.author.github>kazuph</xbar.author.github>
# <xbar.desc>Display NPM package statistics for a user</xbar.desc>
# <xbar.image>https://github.com/matryer/xbar-plugins/raw/main/Dev/npm.png</xbar.image>
# <xbar.dependencies>node,npm</xbar.dependencies>
# <xbar.abouturl>https://github.com/kazuph/npm-stats-toolkit</xbar.abouturl>

# Configuration
USERNAME="kazuph"

# Check if npm/npx is available
if ! command -v npx &> /dev/null; then
    echo "📦 NPM Stats"
    echo "---"
    echo "Error: npx not found"
    echo "Please install Node.js and npm"
    exit 1
fi

# Get stats using npx (fetches from npm registry)
OUTPUT=$(npx @kazuph/npmstat-cli "$USERNAME" --short 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "📦 NPM Stats"
    echo "---"
    echo "Error fetching stats"
    echo "Refresh | refresh=true"
    exit 1
fi

# Parse output for key metrics
MONTHLY=$(echo "$OUTPUT" | grep "Monthly Downloads:" | cut -d':' -f2 | xargs)
WEEKLY=$(echo "$OUTPUT" | grep "Weekly Downloads:" | cut -d':' -f2 | xargs)
PACKAGES=$(echo "$OUTPUT" | grep "Total Packages:" | cut -d':' -f2 | xargs)

# Display in menu bar
if [ -n "$MONTHLY" ]; then
    echo "📦 $MONTHLY/mo"
else
    echo "📦 NPM Stats"
fi

echo "---"
echo "NPM Stats - $USERNAME"
echo "---"
echo "📦 Monthly Downloads: $MONTHLY"
echo "📅 Weekly Downloads: $WEEKLY"
echo "🎯 Total Packages: $PACKAGES"
echo "---"
echo "🔄 Refresh | refresh=true"
echo "🌐 Open NPM Profile | href=https://www.npmjs.com/~$USERNAME"
echo "📊 Detailed Stats | bash=/usr/bin/npx param1=@kazuph/npmstat-cli param2=$USERNAME terminal=true"