from playwright.sync_api import sync_playwright
import os
import time

# 测试配置
BASE_URL = "http://localhost:3000"
SCREENSHOTS_DIR = "./screenshots"

# 确保截图目录存在
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def test_page_navigation(page, url, page_name):
    """测试页面导航"""
    print(f"测试页面: {page_name}")
    print(f"URL: {url}")
    
    # 导航到页面
    page.goto(url)
    
    # 等待网络空闲
    page.wait_for_load_state('networkidle')
    
    # 截图
    screenshot_path = os.path.join(SCREENSHOTS_DIR, f"{page_name.replace('/', '_')}.png")
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"截图保存: {screenshot_path}")
    
    # 检查页面标题
    title = page.title()
    print(f"页面标题: {title}")
    
    # 检查控制台错误
    console_errors = []
    def log_console_message(msg):
        if msg.type == 'error':
            console_errors.append(msg.text)
    
    page.on('console', log_console_message)
    
    # 等待1秒以捕获所有控制台消息
    time.sleep(1)
    
    if console_errors:
        print(f"控制台错误: {len(console_errors)}")
        for error in console_errors[:3]:  # 只显示前3个错误
            print(f"- {error[:100]}...")
    else:
        print("控制台无错误")
    
    print("-" * 50)
    return {
        "url": url,
        "page_name": page_name,
        "title": title,
        "console_errors": console_errors,
        "screenshot": screenshot_path
    }

def test_responsive_design(page, url):
    """测试响应式设计"""
    print("测试响应式设计")
    
    # 导航到页面
    page.goto(url)
    page.wait_for_load_state('networkidle')
    
    # 测试不同视口大小
    viewports = [
        (1920, 1080, "desktop"),  # 桌面
        (1024, 768, "tablet"),     # 平板
        (375, 667, "mobile")       # 移动设备
    ]
    
    results = []
    for width, height, device in viewports:
        print(f"测试 {device} 视口: {width}x{height}")
        
        # 设置视口
        page.set_viewport_size({"width": width, "height": height})
        
        # 等待页面调整
        time.sleep(1)
        
        # 截图
        screenshot_path = os.path.join(SCREENSHOTS_DIR, f"responsive_{device}.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"截图保存: {screenshot_path}")
        
        results.append({
            "device": device,
            "viewport": f"{width}x{height}",
            "screenshot": screenshot_path
        })
    
    print("-" * 50)
    return results

def test_core_functionality(page):
    """测试核心功能"""
    print("测试核心功能")
    
    # 测试导航菜单
    print("测试导航菜单...")
    
    # 检查导航链接
    navigation_links = [
        ("首页", "/"),
        ("About", "/about"),
        ("博客", "/blog"),
        ("房东-租户法律", "/landlord-tenant-laws"),
        ("功能", "/features")
    ]
    
    results = []
    for link_name, path in navigation_links:
        try:
            # 导航到首页
            page.goto(BASE_URL)
            page.wait_for_load_state('networkidle')
            
            # 点击导航链接
            if link_name == "首页":
                # 点击logo
                page.click("text=AcciLease AI")
            else:
                # 点击导航链接
                page.click(f"text={link_name}")
            
            page.wait_for_load_state('networkidle')
            
            # 检查URL
            current_url = page.url
            expected_url = f"{BASE_URL}{path}"
            
            if expected_url in current_url:
                status = "成功"
            else:
                status = "失败"
            
            print(f"{link_name}: {status} (URL: {current_url})")
            results.append({
                "link": link_name,
                "expected_url": expected_url,
                "actual_url": current_url,
                "status": status
            })
        except Exception as e:
            print(f"{link_name}: 错误 - {str(e)}")
            results.append({
                "link": link_name,
                "error": str(e),
                "status": "错误"
            })
    
    print("-" * 50)
    return results

def main():
    """主测试函数"""
    print("开始上线前全面检测")
    print(f"测试基础URL: {BASE_URL}")
    print("=" * 70)
    
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # 1. 测试主要页面
            pages_to_test = [
                ("首页", "/"),
                ("About", "/about"),
                ("博客", "/blog"),
                ("房东-租户法律", "/landlord-tenant-laws"),
                ("功能", "/features"),
                ("登录", "/login"),
                ("注册", "/signup"),
                ("隐私政策", "/privacy")
            ]
            
            page_results = []
            for page_name, path in pages_to_test:
                result = test_page_navigation(page, f"{BASE_URL}{path}", page_name)
                page_results.append(result)
            
            # 2. 测试响应式设计
            responsive_results = test_responsive_design(page, f"{BASE_URL}/")
            
            # 3. 测试核心功能
            core_results = test_core_functionality(page)
            
            # 4. 生成测试报告
            generate_report(page_results, responsive_results, core_results)
            
        finally:
            # 关闭浏览器
            browser.close()
    
    print("上线前全面检测完成")

def generate_report(page_results, responsive_results, core_results):
    """生成测试报告"""
    report_path = "./pre_launch_test_report.md"
    print(f"生成测试报告: {report_path}")
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# 上线前全面检测报告\n\n")
        f.write(f"测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"测试基础URL: {BASE_URL}\n\n")
        
        # 页面测试结果
        f.write("## 1. 页面测试结果\n\n")
        f.write("| 页面 | URL | 标题 | 控制台错误 | 截图 |\n")
        f.write("|------|-----|------|------------|------|\n")
        
        for result in page_results:
            error_count = len(result.get("console_errors", []))
            screenshot_link = f"![{result['page_name']}]({result['screenshot']})"
            f.write(f"| {result['page_name']} | {result['url']} | {result['title']} | {error_count} | {screenshot_link} |\n")
        
        # 响应式设计测试
        f.write("\n## 2. 响应式设计测试\n\n")
        f.write("| 设备 | 视口大小 | 截图 |\n")
        f.write("|------|----------|------|\n")
        
        for result in responsive_results:
            screenshot_link = f"![{result['device']}]({result['screenshot']})"
            f.write(f"| {result['device']} | {result['viewport']} | {screenshot_link} |\n")
        
        # 核心功能测试
        f.write("\n## 3. 核心功能测试\n\n")
        f.write("| 功能 | 预期URL | 实际URL | 状态 |\n")
        f.write("|------|---------|---------|------|\n")
        
        for result in core_results:
            if "error" in result:
                f.write(f"| {result['link']} | - | - | 错误: {result['error']} |\n")
            else:
                f.write(f"| {result['link']} | {result['expected_url']} | {result['actual_url']} | {result['status']} |\n")
        
        # 测试总结
        f.write("\n## 4. 测试总结\n\n")
        
        # 计算测试结果
        total_pages = len(page_results)
        error_pages = sum(1 for r in page_results if len(r.get("console_errors", [])) > 0)
        
        total_core_tests = len(core_results)
        successful_core_tests = sum(1 for r in core_results if r.get("status") == "成功")
        
        f.write(f"- 测试页面总数: {total_pages}\n")
        f.write(f"- 有控制台错误的页面: {error_pages}\n")
        f.write(f"- 核心功能测试总数: {total_core_tests}\n")
        f.write(f"- 核心功能测试成功数: {successful_core_tests}\n")
        
        # 检查是否有严重问题
        if error_pages == 0 and successful_core_tests == total_core_tests:
            f.write("\n### 测试结果: ✅ 通过\n")
            f.write("所有测试都通过了，项目可以上线。\n")
        else:
            f.write("\n### 测试结果: ⚠️ 需要注意\n")
            f.write("存在一些问题需要在上线前修复。\n")

if __name__ == "__main__":
    main()
