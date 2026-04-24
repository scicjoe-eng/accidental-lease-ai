from playwright.sync_api import sync_playwright
import time

def test_application():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # 测试 1: 验证主页是否能正常加载（修复 metadata 错误）
            print("Testing home page load...")
            page.goto('http://localhost:3000')
            page.wait_for_load_state('networkidle')
            
            # 检查页面标题
            title = page.title()
            print(f"Page title: {title}")
            assert "AcciLease AI" in title, f"Expected title to contain 'AcciLease AI', got '{title}'"
            
            # 截图主页
            page.screenshot(path='test-results/home-page.png', full_page=True)
            print("Home page loaded successfully!")
            
            # 测试 2: 验证登录页面
            print("\nTesting login page...")
            page.goto('http://localhost:3000/login')
            page.wait_for_load_state('networkidle')
            
            # 检查登录表单是否存在
            email_input = page.locator('input[type="email"]')
            password_input = page.locator('input[type="password"]')
            signin_button = page.locator('button:has-text("Sign in with Email")')
            
            assert email_input.is_visible(), "Email input not found"
            assert password_input.is_visible(), "Password input not found"
            assert signin_button.is_visible(), "Sign in button not found"
            
            # 截图登录页面
            page.screenshot(path='test-results/login-page.png', full_page=True)
            print("Login page loaded successfully!")
            
            # 测试 3: 验证 Apple Touch 图标是否配置正确
            print("\nTesting Apple Touch icon...")
            # 检查页面头部是否包含 Apple Touch 图标链接
            apple_touch_icon = page.locator('link[rel="apple-touch-icon"]')
            assert apple_touch_icon.is_visible(), "Apple Touch icon link not found"
            
            # 获取 Apple Touch 图标 URL
            apple_touch_icon_url = apple_touch_icon.get_attribute('href')
            print(f"Apple Touch icon URL: {apple_touch_icon_url}")
            
            # 测试 4: 验证错误处理（模拟登录尝试）
            print("\nTesting error handling...")
            # 输入测试凭据
            email_input.fill('test@example.com')
            password_input.fill('password123')
            
            # 点击登录按钮
            signin_button.click()
            
            # 等待可能的错误消息
            time.sleep(3)
            
            # 检查是否有错误消息
            error_toast = page.locator('.sonner-toast[aria-live="assertive"]')
            if error_toast.is_visible():
                error_message = error_toast.inner_text()
                print(f"Error message displayed: {error_message}")
                # 截图错误消息
                page.screenshot(path='test-results/login-error.png', full_page=True)
            else:
                print("No error message displayed (may be successful or no network error)")
            
            # 测试 5: 验证导航到受保护路由
            print("\nTesting protected routes...")
            page.goto('http://localhost:3000/dashboard')
            page.wait_for_load_state('networkidle')
            
            # 检查是否重定向到登录页面
            current_url = page.url
            print(f"Current URL after navigating to dashboard: {current_url}")
            assert "login" in current_url, f"Expected redirect to login page, got {current_url}"
            
            print("All tests completed successfully!")
            
        except Exception as e:
            print(f"Test failed: {e}")
            # 截图错误状态
            page.screenshot(path='test-results/error.png', full_page=True)
            raise
        finally:
            # 关闭浏览器
            browser.close()

if __name__ == "__main__":
    # 创建测试结果目录
    import os
    if not os.path.exists('test-results'):
        os.makedirs('test-results')
    
    test_application()
