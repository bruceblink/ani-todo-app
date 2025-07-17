# Ani-Todo-App - 今日的番剧看完了吗？ 🎬

## 项目简介
汇总主流视频平台每日更新的动漫列表，自己根据个人情况查漏补缺观看，桌面端应用截图如下：
![snapshot](/public/snapshot.png)

**技术栈：React + TypeScript + Vite + Tauri**

## 功能特点
- 🔄 自动/手动更新：自动抓取各大视频平台的动漫最新更新信息
- 📺 多平台支持：目前支持蜜柑计划、腾讯视频、哔哩哔哩、爱奇艺和优酷等 后续将支持更多视频平台
- ~~💾 数据本地存储：所有信息保存在本地sqlite数据库中，方便查询和管理~~

## 系统要求

    目前支持Windows10+、Mac以及Linux等主流的桌面操作系统

## 使用说明

    开发环境准备，已经安装[rust](https://www.rust-lang.org/tools/install)和[nodejs](https://nodejs.org/en/download)

1. 克隆仓库到本地：
    ```bash
      git clone https://github.com/bruceblink/ani-todo-app
      cd ani-todo-app
    ```

2. 本地运行：
    ```bash
      cargo tauri dev
    ```
3. 本地打包：
    ```bash
      cargo tauri build
    ```

## 项目文件说明

```txt
ani-todo-app/
├── README.md                     项目说明文档
├── LICENSE                       项目许可证文件
├── public/                       前端公共资源目录
│   ├── vite.svg                  vite的图标
│   └── snapshot.png              应用截图
├── src/                          前端界面的ts相关源代码
│   ├── App.tsx                   React组件入口            
│   └── main.tsx                  React应用的界面入口
├── src-tauri/                    后端tauri的rust相关源代码
│   ├── src 
│   │   ├── main.rs               后端程序入口
│   └── Cargo.toml                后端rust应用的项目配置
├───index.html                    前端主页 
└── package.json                  前端应用的项目配置
```

## 贡献指南

欢迎对项目做出贡献！如果你有任何建议或发现了bug，请：

1. Fork 本仓库
2. 创建新的分支
3. 提交你的修改
4. 发起 Pull Request

## 未来计划

- [x] 支持更多视频平台
- [x] 添加图形用户界面（GUI）
- [ ] 📅 每日更新提醒：及时获取最新剧集更新信息
- [ ] 🎯 个性化追踪：可以根据个人喜好设置关注的节目
- [ ] 支持自定义过滤器
- [ ] 添加导出功能

## 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 联系方式

如有任何问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/bruceblink/ani-todo-app/issues)
- [发送邮件](mailto:likanug.g@qq.com)

## 致谢

感谢所有为本项目做出贡献的开发者和用户。

---

**注意**：本项目仅用于个人学习和研究使用，请勿用于任何商业用途。在使用过程中请遵守相关网站的使用条款和规定。
