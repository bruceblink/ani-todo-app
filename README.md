<div align="center">

# FanJi - 今天的番看完了吗？ 🎬

</div>

<p align="center">
    <a href="https://github.com/bruceblink/FanJi/releases/latest" target="_blank">
        <img src="https://img.shields.io/github/v/release/bruceblink/FanJi" alt="release-version">
    </a>
    <!-- total download -->
    <a href="https://github.com/bruceblink/FanJi/releases/latest" target="_blank">
        <img src="https://img.shields.io/github/downloads/bruceblink/FanJi/total" alt="downloads">
    </a>
    <!-- stars -->
    <a href="https://github.com/bruceblink/FanJi/stargazers" target="_blank">
        <img src="https://img.shields.io/github/stars/bruceblink/FanJi?" alt="stars">
    </a>
    <!-- forks -->
    <a href="https://github.com/bruceblink/FanJi/network/members" target="_blank">
        <img src="https://img.shields.io/github/forks/bruceblink/FanJi.svg?" alt="fork">
    </a>
    <!-- visitors -->
    <a href="https://github.com/bruceblink/FanJi" target="_blank">
        <img src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Fbruceblink%2FFanJi&countColor=%23263759&style=flat"
            alt="visitors">
    </a>
    <!-- license -->
    <a href="https://github.com/bruceblink/FanJi/blob/main/LICENSE" target="_blank">
        <img src="https://img.shields.io/github/license/bruceblink/FanJi" alt="license">
    </a>
    <br>
    <!-- window -->
    <a href="https://github.com/bruceblink/FanJi/releases/latest" target="_blank">
        <img src="https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white" alt="window">
    </a>
    <!-- macos -->
    <a href="https://github.com/bruceblink/FanJi/releases/latest" target="_blank">
        <img src="https://img.shields.io/badge/MACOS-adb8c5?style=flat&logo=macos&logoColor=white" alt="macos">
    </a>
    <!-- linux -->
    <a href="https://github.com/bruceblink/FanJi/releases/latest" target="_blank">
        <img src="https://img.shields.io/badge/linux-1793D1?style=flat&logo=linux&logoColor=white" alt="linux">
    </a>
    <br>
    <a href="https://www.buymeacoffee.com/bruceblink" target="_blank"><img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee"
            style="height: 40px !important;width: 145px !important;">
    </a>
</p>

## 项目简介
这是一个使用 **Tauri** 框架构建的跨平台桌面应用，旨在帮助用户追踪和管理他们的动漫观看列表。该应用支持自动和手动更新各大视频平台的动漫最新信息，并提供了一个简洁易用的界面来查看和管理这些信息。
桌面端应用**主页**截图如下：

![snapshot](/picture/snapshotv1.0.0.png)

## 技术栈
**React + TypeScript + Vite + pnpm + Tauri(Rust)**

## 功能特点
- 🔄 自动更新：自动抓取各大视频平台的动漫最新更新信息
- ⚙️ 新增配置文件支持 cron 表达式自定义更新频率
- 📺 多平台支持：目前支持腾讯视频、哔哩哔哩、爱奇艺、优酷、AGE动漫等，后续将支持更多视频平台
- 🗓️ 周导航：可按日期切换查看任意一天的番剧更新
- 🎯 关注追踪：可关注特定番剧，只看自己在追的番
- ✅ 一键全部已看：一键将当前列表所有番剧标记为已看
- 🔀 排序支持：番剧列表可按更新时间 / 平台 / 标题排序
- 🗑️ 历史管理：可删除单条或清空全部观看历史记录
- 💾 本地存储：所有数据保存在本地 SQLite 数据库，无需联网登录
- 🌙 深色 / 浅色主题：支持系统主题自动跟随及手动切换

## 安装

最简单的入门方式是根据你所使用的操作系统下载以下对应版本之一:

<table>
  <tr>
    <td><b>Platform</b></td>
    <td><b>Download</b></td>
  </tr>
  <tr>
    <td><b>Windows</b></td>
    <td><a href='https://github.com/bruceblink/FanJi/releases/download/v1.0.0/FanJi_1.0.0_x64-setup.exe'>FanJi.exe</a></td>
  </tr>
  <tr>
    <td><b>macOS</b></td>
    <td><a href='https://github.com/bruceblink/FanJi/releases/download/v1.0.0/FanJi_1.0.0_universal.dmg'>FanJi.dmg</a></td>
  <tr>
    <td><b>Linux </b></td>
    <td><a href='https://github.com/bruceblink/FanJi/releases/download/v1.0.0/FanJi_1.0.0_amd64.deb'>FanJi.deb</a></td>
  </tr>
</table>

更多的下载选择 [GitHub Releases](https://github.com/bruceblink/FanJi/releases).

## 使用说明

开发环境准备，已经安装[rust](https://www.rust-lang.org/tools/install)和[nodejs](https://nodejs.org/en/download)

1. 克隆仓库到本地：
    ```bash
      git clone https://github.com/bruceblink/FanJi
      cd FanJi
    ```

2. 本地运行：
    ```bash
      cargo tauri dev # or tauri dev
    ```
3. 本地打包：
    ```bash
      cargo tauri build # or tauri build
    ```
4. 配置文件路径(Windows系统)

    ```text
      C:\Users\{username}\AppData\Roaming\{FanJi}\config.yaml
      格式为{AppData}\Roaming\{app_name}\config.yaml
    ```
    
5. 日志文件
    ```text
      应用安装目录的logs文件夹下面
    ```
    
## 项目文件说明
```txt
FanJi/
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

## 更新日志

### v1.0.0 (2026-04-25)
- ✅ 新增「一键全部已看」功能，批量标记当前列表所有番剧为已看
- 🔀 新增番剧列表排序（按更新时间 / 平台 / 标题）
- 🗑️ 新增观看历史删除功能（逐条删除 & 一键清空）
- 🌙 修复手动切换浅色模式不生效的问题
- 🎨 历史页面新增行进入动画，体验更流畅

## 未来计划

- [x] 支持更多视频平台
  - [x] 哔哩哔哩
  - [x] 腾讯视频
  - [x] 优酷
  - [x] 爱奇艺
  - [x] 蜜柑计划
  - [x] AGE动漫
- [x] 添加图形用户界面（GUI）
- [x] 🎯 个性化追踪：可以根据个人喜好设置关注的节目
- [x] 支持简单搜索
- [x] ✅ 一键全部已看
- [x] 🔀 番剧列表排序
- [x] 🗑️ 历史记录删除 / 清空
- [ ] 📅 每日更新提醒：及时获取最新剧集更新信息
- [ ] 添加导出功能
- [ ] ...更多功能

## 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 联系方式

如有任何问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/bruceblink/FanJi/issues)
- [发送邮件](mailto:likanug.g@qq.com)

## 致谢

感谢所有为本项目做出贡献的开发者和用户。

---

**注意**：本项目仅用于个人学习和研究使用，请勿用于任何商业用途。在使用过程中请遵守相关网站的使用条款和规定。

[badge-version]: https://img.shields.io/badge/version-1.0.0-blue

[badge-platforms]: https://img.shields.io/badge/platforms-macOS%2C%20Windows%2C%20Linux%2C%20-green

[badge-sponsor]: https://img.shields.io/badge/sponsor-ff69b4

[badge-hire]: https://img.shields.io/badge/hire%20developer-8b5cf6
