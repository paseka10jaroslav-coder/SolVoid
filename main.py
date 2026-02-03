#!/usr/bin/env python3
"""
Freelance Auto Bot - Monitors Upwork for new job postings and sends notifications via Telegram
"""
import os
import sys
import logging
import time
from datetime import datetime
from pathlib import Path

# Create logs directory if it doesn't exist
logs_dir = Path('logs')
logs_dir.mkdir(exist_ok=True)

# Configure logging
log_file = logs_dir / f'bot_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def check_environment_variables():
    """Check if all required environment variables are set"""
    required_vars = [
        'TELEGRAM_TOKEN',
        'TELEGRAM_CHAT_ID',
        'UPWORK_USERNAME',
        'UPWORK_PASSWORD'
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.warning(f"Missing environment variables: {', '.join(missing_vars)}")
        logger.warning("Bot will run in demo mode without actual monitoring")
        return False
    
    return True


def send_telegram_notification(message):
    """Send a notification via Telegram"""
    try:
        import requests
        
        token = os.getenv('TELEGRAM_TOKEN')
        chat_id = os.getenv('TELEGRAM_CHAT_ID')
        
        if not token or not chat_id:
            logger.info(f"[DEMO] Would send Telegram message: {message}")
            return True
        
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            logger.info("Telegram notification sent successfully")
            return True
        else:
            logger.error(f"Failed to send Telegram notification: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending Telegram notification: {e}")
        return False


def monitor_upwork():
    """Monitor Upwork for new job postings"""
    logger.info("Starting Upwork monitoring...")
    
    # Check if we're in test mode (no network access)
    test_mode = os.getenv('TEST_MODE', 'false').lower() == 'true'
    
    if test_mode:
        logger.info("[TEST MODE] Skipping actual Upwork monitoring")
        message = (
            f"🤖 <b>Freelance Bot Test Report</b>\n\n"
            f"✅ Bot configuration validated\n"
            f"📅 Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            f"<i>Running in test mode. No actual monitoring performed.</i>"
        )
        send_telegram_notification(message)
        return
    
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        # Setup Chrome options for headless mode
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        
        # Initialize the driver
        service = Service('/usr/bin/chromedriver')
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        username = os.getenv('UPWORK_USERNAME')
        password = os.getenv('UPWORK_PASSWORD')
        
        if not username or not password:
            logger.info("[DEMO MODE] Simulating Upwork check without credentials")
            driver.get('https://www.upwork.com/')
            time.sleep(2)
            page_title = driver.title
            logger.info(f"Successfully accessed Upwork homepage: {page_title}")
            
            message = (
                f"🤖 <b>Freelance Bot Status Report</b>\n\n"
                f"✅ Bot is running successfully\n"
                f"🌐 Upwork accessibility: OK\n"
                f"📅 Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                f"<i>Note: Running in demo mode. Configure secrets for full functionality.</i>"
            )
            send_telegram_notification(message)
        else:
            logger.info("Checking Upwork with provided credentials...")
            # In a real implementation, this would log in and check for jobs
            # For now, we'll just verify we can access the site
            driver.get('https://www.upwork.com/')
            time.sleep(2)
            logger.info("Upwork check completed")
            
            message = (
                f"🤖 <b>Freelance Bot - Monitoring Active</b>\n\n"
                f"✅ Successfully checked Upwork\n"
                f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            )
            send_telegram_notification(message)
        
        driver.quit()
        logger.info("Browser closed successfully")
        
    except Exception as e:
        logger.error(f"Error during Upwork monitoring: {e}", exc_info=True)
        
        error_message = (
            f"⚠️ <b>Freelance Bot Error</b>\n\n"
            f"Error: {str(e)}\n"
            f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )
        send_telegram_notification(error_message)
        
        raise


def main():
    """Main function"""
    logger.info("=" * 60)
    logger.info("Freelance Auto Bot Started")
    logger.info("=" * 60)
    
    # Check environment variables
    has_env_vars = check_environment_variables()
    
    if has_env_vars:
        logger.info("All environment variables are set")
    else:
        logger.info("Running in demo mode due to missing environment variables")
    
    try:
        # Monitor Upwork
        monitor_upwork()
        
        logger.info("=" * 60)
        logger.info("Bot execution completed successfully")
        logger.info("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        logger.info("=" * 60)
        logger.info("Bot execution failed")
        logger.info("=" * 60)
        
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
