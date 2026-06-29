import { Resume } from '../types/resume';

/**
 * 用于模板预览的 mock 简历数据（中文内容）
 */
export const mockResume: Resume = {
  id: 'preview-mock',
  title: '预览示例',
  templateId: 'professional',
  personalInfo: {
    name: '张三',
    phone: '138-0000-1234',
    email: 'zhangsan@example.com',
    title: '高级前端工程师',
    city: '杭州',
    campusActivities: 'XX公众号（运营）、技术社区志愿者',
  },
  summary:
    '5年前端开发经验，精通 React 生态与 TypeScript，具备大型项目架构设计与团队管理能力。主导过多个核心业务系统的前端架构升级，擅长性能优化与工程化实践。',
  education: [
    {
      id: 'e1',
      school: '浙江大学',
      degree: '本科',
      major: '计算机科学与技术',
      startDate: '2016-09',
      endDate: '2020-06',
      highlights: [
        'GPA 3.8/4.0，专业课程成绩优异，获得学业优秀奖学金',
        '参加校级程序设计大赛，获得一等奖',
      ],
      tags: ['985', '211', '双一流', 'C9'],
    },
  ],
  workExperience: [
    {
      id: 'w1',
      company: '杭州星辰科技有限公司',
      position: '高级前端工程师',
      department: '基础架构部',
      location: '杭州',
      startDate: '2022-03',
      endDate: '至今',
      highlights: [
        '主导前端微服务架构升级，将单体应用拆分为 12 个独立子应用，部署效率提升 60%',
        '设计并实现统一组件库，覆盖 80+ 业务组件，被 5 个产品线复用',
        '推动 TypeScript 全量迁移，代码缺陷率降低 40%',
      ],
    },
    {
      id: 'w2',
      company: '上海云峰信息技术有限公司',
      position: '前端工程师',
      department: '产品技术部',
      location: '上海',
      startDate: '2020-06',
      endDate: '2022-02',
      highlights: [
        '负责电商平台前端开发，日均 PV 超 500 万',
        '实现首屏加载时间从 4.2s 优化至 1.5s，转化率提升 15%',
        '搭建前端监控体系，覆盖错误追踪、性能指标与用户行为分析',
      ],
    },
  ],
  projectExperience: [
    {
      id: 'p1',
      name: '企业级低代码搭建平台',
      role: '前端负责人',
      location: '杭州',
      startDate: '2022-06',
      endDate: '2023-12',
      highlights: [
        '基于 React + TypeScript 构建可视化拖拽搭建引擎，支持 50+ 物料组件',
        '设计插件化架构，支持第三方扩展，累计接入 20+ 自定义插件',
        '平台上线后服务内部 300+ 运营人员，页面搭建效率提升 5 倍',
      ],
    },
  ],
  organizationExperience: [
    {
      id: 'o1',
      name: '前端技术委员会',
      role: '核心成员',
      department: '技术中台',
      location: '公司级',
      startDate: '2022-01',
      endDate: '至今',
      highlights: [
        '制定前端编码规范与 Code Review 标准，推动团队代码质量提升',
        '组织月度技术分享，累计输出 15 篇技术文章',
      ],
    },
  ],
  awards: [
    {
      id: 'a1',
      title: '2023 年度最佳技术创新奖',
      date: '2024-01',
      description: '表彰在企业级低代码搭建平台项目中主导前端架构升级与组件库建设的突出贡献。',
    },
    {
      id: 'a2',
      title: '2022 年 Q3 优秀员工',
      date: '2022-10',
      description: '',
    },
    {
      id: 'a3',
      title: '一种在 Kubernetes 内提交 Slurm 物理机作业的方法',
      date: '2023-09',
      description: 'HPC 集群通常具有特定的硬件和网络架构，需要精确的资源调度和管理，而 Kubernetes 的默认调度器并不适用 HPC 场景。为了解决这些问题，本专利通过使用 VirtualKubelet、Kubernetes Operator 等技术提出了一种在 Kubernetes 集群内提交并监控 HPC（以 Slurm 为例）物理机作业的方法，让 Slurm 的算力资源通过桥接的方式在 Kubernetes 里能使用起来。',
    },
  ],
  others: {
    skills: [
      { category: '前端框架', items: 'React, Vue, Next.js, Umi' },
      { category: '编程语言', items: 'TypeScript, JavaScript (ES6+), HTML5, CSS3' },
      { category: '工程化工具', items: 'Webpack, Vite, Rollup, pnpm Monorepo' },
      { category: '其他技能', items: 'Node.js, Docker, Nginx, Git' },
    ],
    certificates: ['CFA（二级）', 'PMP 项目管理'],
    languages: ['英语（CET-6）', '日语（N2）'],
    hobbies: ['篮球（校队队长）', '摄影'],
  },
  tags: ['前端', 'React', 'TypeScript'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
