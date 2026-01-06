DROP TABLE IF EXISTS `click_user`;

CREATE TABLE `click_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `user_id` bigint NOT NULL COMMENT '用户ID（业务侧使用，游客登录会签发到 JWT 的 sub）',
  `device_id` varchar(128) DEFAULT NULL COMMENT '设备ID/插件安装ID（可选，用于复用同一游客）',
  `email` varchar(255) DEFAULT NULL COMMENT '邮箱（本地登录使用）',
  `display_name` varchar(255) DEFAULT NULL COMMENT '展示名',
  `merged_to_user_id` bigint DEFAULT NULL COMMENT '合并后账户的user_id',
  `merged_from_user_id` bigint DEFAULT NULL COMMENT '合并来源用户ID',
  `login_type` varchar(32) NOT NULL DEFAULT 'guest' COMMENT '登录类型：guest|local|oauth',
  `last_login_at` datetime(3) DEFAULT NULL COMMENT '最近一次登录时间',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_click_user_user_id` (`user_id`),
  UNIQUE KEY `uniq_click_user_email` (`email`),
  KEY `idx_click_user_device_id` (`device_id`),
  KEY `idx_click_user_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='click translate 用户表';
