#!/bin/bash
# Schedule daily updates using cron
#
# This script sets up a cron job to run daily updates automatically.
#
# Usage:
#   bash scripts/schedule_daily_updates.sh install    # Install cron job
#   bash scripts/schedule_daily_updates.sh uninstall  # Remove cron job
#   bash scripts/schedule_daily_updates.sh status     # Check status

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PYTHON_PATH=$(which python3 || which python)

CRON_COMMAND="0 2 * * * cd $PROJECT_DIR && $PYTHON_PATH scripts/run_daily_update.py >> logs/cron.log 2>&1"

install_cron() {
    echo "Installing daily update cron job..."
    echo "Command: $CRON_COMMAND"

    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -F "$PROJECT_DIR/scripts/run_daily_update.py" > /dev/null; then
        echo "❌ Cron job already exists!"
        echo "Run 'bash scripts/schedule_daily_updates.sh uninstall' first to remove it."
        return 1
    fi

    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

    echo "✅ Cron job installed successfully!"
    echo "Daily updates will run at 2:00 AM every day."
    echo "Logs will be written to: $PROJECT_DIR/logs/cron.log"
}

uninstall_cron() {
    echo "Removing daily update cron job..."

    # Remove cron job
    crontab -l 2>/dev/null | grep -v "$PROJECT_DIR/scripts/run_daily_update.py" | crontab -

    echo "✅ Cron job removed successfully!"
}

check_status() {
    echo "Checking cron job status..."

    if crontab -l 2>/dev/null | grep -F "$PROJECT_DIR/scripts/run_daily_update.py" > /dev/null; then
        echo "✅ Cron job is installed and active"
        echo ""
        echo "Current cron configuration:"
        crontab -l 2>/dev/null | grep -F "$PROJECT_DIR/scripts/run_daily_update.py"
        echo ""
        echo "Last 10 log entries:"
        if [ -f "$PROJECT_DIR/logs/cron.log" ]; then
            tail -n 10 "$PROJECT_DIR/logs/cron.log"
        else
            echo "No log file found yet."
        fi
    else
        echo "❌ Cron job is not installed"
    fi
}

case "$1" in
    install)
        install_cron
        ;;
    uninstall)
        uninstall_cron
        ;;
    status)
        check_status
        ;;
    *)
        echo "Usage: $0 {install|uninstall|status}"
        echo ""
        echo "Commands:"
        echo "  install    - Install daily update cron job (runs at 2:00 AM)"
        echo "  uninstall  - Remove daily update cron job"
        echo "  status     - Check if cron job is installed and view logs"
        exit 1
        ;;
esac
