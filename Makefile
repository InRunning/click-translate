# Makefile for Lingo Link Enhanced Chrome Extension
# 编译并打包Chrome扩展的自动化脚本

# 项目配置
PROJECT_NAME := lingo-link-enhanced
PACKAGE_NAME := click-translate.zip
BUILD_DIR := dist/chrome
SRC_DIR := .

# 颜色定义
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# 默认目标
.PHONY: all
all: clean build package

# 安装依赖
.PHONY: install
install:
	@echo "$(BLUE)安装依赖...$(RESET)"
	@npm install

# 清理构建文件
.PHONY: clean
clean:
	@echo "$(BLUE)清理构建文件...$(RESET)"
	@rm -rf $(BUILD_DIR)
	@rm -f $(PACKAGE_NAME)
	@rm -f dist/key.pem
	@echo "$(GREEN)清理完成$(RESET)"

# 构建Chrome扩展
.PHONY: build
build:
	@echo "$(BLUE)构建Chrome扩展...$(RESET)"
	@npm run build:chrome
	@echo "$(GREEN)构建完成$(RESET)"

# 打包为zip文件
.PHONY: package
package: build
	@echo "$(BLUE)打包为zip文件...$(RESET)"
	@cd $(BUILD_DIR) && zip -r ../../$(PACKAGE_NAME) . -x ".vite/*"
	@echo "$(GREEN)打包完成: $(PACKAGE_NAME)$(RESET)"

# 验证打包结果
.PHONY: verify
verify: package
	@echo "$(BLUE)验证打包结果...$(RESET)"
	@if [ -f $(PACKAGE_NAME) ]; then \
		echo "$(GREEN)✓ 打包文件存在: $(PACKAGE_NAME)$(RESET)"; \
		ls -lh $(PACKAGE_NAME); \
		file $(PACKAGE_NAME); \
		echo "$(BLUE)ZIP内容预览:$(RESET)"; \
		unzip -l $(PACKAGE_NAME) | head -10; \
	else \
		echo "$(RED)✗ 打包文件不存在$(RESET)"; \
		exit 1; \
	fi

# 完整构建流程
.PHONY: release
release: install clean verify
	@echo "$(GREEN)完整构建流程完成!$(RESET)"

# 快速重新构建（跳过依赖安装）
.PHONY: quick
quick: clean package
	@echo "$(GREEN)快速重新构建完成!$(RESET)"

# 仅构建，不打包
.PHONY: build-only
build-only:
	@$(MAKE) build
	@echo "$(YELLOW)构建完成，未打包$(RESET)"

# 仅打包（假设已构建）
.PHONY: package-only
package-only:
	@if [ ! -d $(BUILD_DIR) ]; then \
		echo "$(RED)错误: 构建目录不存在，请先运行 make build$(RESET)"; \
		exit 1; \
	fi
	@$(MAKE) package

# 开发模式
.PHONY: dev
dev:
	@echo "$(BLUE)启动开发模式...$(RESET)"
	@npm run dev:chrome

# 代码检查
.PHONY: lint
lint:
	@echo "$(BLUE)运行代码检查...$(RESET)"
	@npm run lint

# 显示帮助信息
.PHONY: help
help:
	@echo "$(BLUE)Lingo Link Enhanced 构建工具$(RESET)"
	@echo ""
	@echo "$(YELLOW)可用目标:$(RESET)"
	@echo "  all        - 完整构建流程（默认）"
	@echo "  install    - 安装项目依赖"
	@echo "  clean      - 清理构建文件"
	@echo "  build      - 构建Chrome扩展"
	@echo "  package    - 打包为zip文件"
	@echo "  verify     - 验证打包结果"
	@echo "  release    - 完整发布流程"
	@echo "  quick      - 快速重新构建"
	@echo "  dev        - 启动开发模式"
	@echo "  lint       - 运行代码检查"
	@echo "  run-backend - 启动后端服务 (Go)"
	@echo "  tidy-backend - 后端依赖整理 (go mod tidy)"
	@echo "  help       - 显示此帮助信息"
	@echo ""
	@echo "$(YELLOW)使用示例:$(RESET)"
	@echo "  make                    # 完整构建"
	@echo "  make clean package      # 清理并打包"
	@echo "  make verify            # 验证打包结果"
	@echo "  make quick             # 快速重新构建"
	@echo "  make run-backend       # 启动后端服务"

# 后端相关
.PHONY: run-backend
run-backend:
	@echo "$(BLUE)启动后端...$(RESET)"
	@JWT_SECRET=$${JWT_SECRET:-dev-secret-please-change} \
	RELAY_API_KEY=$${RELAY_API_KEY:-dummy} \
	DB_DSN=$${DB_DSN:-} \
	go run ./backend/cmd/server

.PHONY: tidy-backend
tidy-backend:
	@cd backend && go mod tidy

# 防止文件名冲突
.DEFAULT_GOAL := all
