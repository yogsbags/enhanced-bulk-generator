#!/bin/bash

##############################################################################
# Technical Analysis Content Generator - Quick Start Script
##############################################################################

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Print header
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Technical Analysis Content Generator - Quick Start          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ Error: GEMINI_API_KEY environment variable not set${NC}"
    echo ""
    echo "Please set your Gemini API key:"
    echo ""
    echo "  export GEMINI_API_KEY=\"your-api-key-here\""
    echo ""
    echo "Get your API key from: https://aistudio.google.com/app/apikey"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    cd "$PROJECT_ROOT"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Display options
echo -e "${GREEN}Choose an option:${NC}"
echo ""
echo "  1) Generate ALL 36 articles (Recommended)"
echo "  2) Generate first 10 articles (Test run)"
echo "  3) Generate first 5 articles (Quick test)"
echo "  4) Generate single topic (Testing)"
echo "  5) Custom range (you specify start/end)"
echo "  6) Exit"
echo ""
echo -n "Enter your choice [1-6]: "
read choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 Generating ALL 36 articles...${NC}"
        echo -e "${YELLOW}⏱️  Estimated time: 30-60 minutes${NC}"
        echo ""
        cd "$PROJECT_ROOT"
        node scripts/batch-technical-analysis-generator.js
        ;;
    2)
        echo ""
        echo -e "${GREEN}🚀 Generating first 10 articles...${NC}"
        echo -e "${YELLOW}⏱️  Estimated time: 8-15 minutes${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Note: This option requires modifying the script.${NC}"
        echo "Edit batch-technical-analysis-generator.js and change:"
        echo "  this.topics.slice(0, 10)  // Add this in generateAll()"
        echo ""
        echo "Press Enter to continue anyway or Ctrl+C to cancel..."
        read
        cd "$PROJECT_ROOT"
        node scripts/batch-technical-analysis-generator.js
        ;;
    3)
        echo ""
        echo -e "${GREEN}🚀 Generating first 5 articles (Quick test)...${NC}"
        echo -e "${YELLOW}⏱️  Estimated time: 4-8 minutes${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Note: This option requires modifying the script.${NC}"
        echo "Edit batch-technical-analysis-generator.js and change:"
        echo "  this.topics.slice(0, 5)  // Add this in generateAll()"
        echo ""
        echo "Press Enter to continue anyway or Ctrl+C to cancel..."
        read
        cd "$PROJECT_ROOT"
        node scripts/batch-technical-analysis-generator.js
        ;;
    4)
        echo ""
        echo -e "${GREEN}🚀 Generating single topic (Testing)...${NC}"
        echo -e "${YELLOW}⏱️  Estimated time: 2-5 minutes${NC}"
        echo ""
        echo -n "Enter topic title (or press Enter for 'What is Technical Analysis?'): "
        read topic
        if [ -z "$topic" ]; then
            topic="What is Technical Analysis?"
        fi
        echo ""
        echo -e "${GREEN}Generating: \"${topic}\"${NC}"
        echo ""
        cd "$PROJECT_ROOT"
        node scripts/batch-technical-analysis-generator.js --single "$topic"
        ;;
    5)
        echo ""
        echo -n "Enter start index (0-35): "
        read start
        echo -n "Enter end index (1-36): "
        read end
        echo ""
        echo -e "${GREEN}🚀 Generating articles ${start} to ${end}...${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Note: This option requires modifying the script.${NC}"
        echo "Edit batch-technical-analysis-generator.js and change:"
        echo "  this.topics.slice($start, $end)  // Add this in generateAll()"
        echo ""
        echo "Press Enter to continue anyway or Ctrl+C to cancel..."
        read
        cd "$PROJECT_ROOT"
        node scripts/batch-technical-analysis-generator.js
        ;;
    6)
        echo ""
        echo -e "${BLUE}👋 Goodbye!${NC}"
        echo ""
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        echo ""
        exit 1
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Content Generation Completed Successfully!               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📁 Output locations:${NC}"
    echo ""
    echo -e "  Markdown: ${GREEN}docs/articles/technical analysis/${NC}"
    echo -e "  HTML:     ${GREEN}docs/html_articles/technical analysis/${NC}"
    echo ""
    echo -e "${BLUE}📊 Next steps:${NC}"
    echo ""
    echo "  1. Review articles in the markdown folder"
    echo "  2. Edit any articles that need refinement"
    echo "  3. Publish to WordPress/Sanity using content-publisher.js"
    echo "  4. Monitor SEO performance and traffic"
    echo ""
else
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ Content Generation Failed                                ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}💡 Troubleshooting tips:${NC}"
    echo ""
    echo "  • Check if GEMINI_API_KEY is valid"
    echo "  • Check error logs above for details"
    echo "  • Try running with fewer topics (option 2 or 3)"
    echo "  • Check rate limits on Gemini API console"
    echo ""
    echo "See README-BATCH-GENERATOR.md for more help"
    echo ""
fi
