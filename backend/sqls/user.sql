DROP TABLE IF EXISTS `click_user`;

CREATE TABLE `click_user` (
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `merged_to_user_id` bigint DEFAULT NULL COMMENT '合并后账户的user_id',
  `merged_from_user_id` bigint DEFAULT NULL COMMENT '合并来源用户ID',
  `login_type` varchar(255) DEFAULT NULL COMMENT '登录类型',
  `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  KEY `idx_click_user_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='click translate 用户表';