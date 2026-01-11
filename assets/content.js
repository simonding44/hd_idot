export const TAGS = [
  { key: "history", en: "History", zh: "历史" },
  { key: "learning", en: "Learning", zh: "学习" },
  { key: "initiative", en: "Initiative", zh: "主动担当" },
  { key: "strategy", en: "Strategy", zh: "谋略" },
  { key: "integrity", en: "Integrity", zh: "诚信" },
  { key: "courage", en: "Courage", zh: "勇气" },
  { key: "dream", en: "Dreams & reflection", zh: "梦与反思" },
  { key: "everyday", en: "Everyday use", zh: "日常表达" },
];

// Content is intentionally “international-audience first”:
// clear English, light cultural context, practical modern usage.
export const IDIOMS = [
  {
    id: "handan-xue-bu",
    hanzi: "邯郸学步",
    pinyin: "Hándān xuébù",
    tags: ["learning", "everyday"],
    meaningEn: "To imitate others so blindly that you lose your own strengths.",
    meaningZh: "盲目模仿他人，结果把自己的本领也丢了。",
    storyEn:
      "A young man went to the city of Handan to copy its elegant walking style. He practiced so hard that he forgot how he used to walk—and ended up unable to walk properly at all.",
    storyZh:
      "有人到邯郸学当地人走路的姿势，学来学去，反而把自己原来的走法忘了，最后走路都不会了。",
    usageEn:
      "Use it when someone copies a trend or a competitor without understanding their own situation.",
    usageZh: "用于形容不顾自身条件、盲目跟风模仿，反而失去自我。",
    noteEn: "Handan is named directly in the idiom, making it one of the city’s signature stories.",
    noteZh: "成语直接点出“邯郸”，也是邯郸最具代表性的成语之一。",
  },
  {
    id: "wan-bi-gui-zhao",
    hanzi: "完璧归赵",
    pinyin: "Wánbì guī Zhào",
    tags: ["history", "integrity"],
    meaningEn: "To return something intact; to protect something valuable through diplomacy and integrity.",
    meaningZh: "使珍贵之物完好无损地归还原主；也指处事机智、维护尊严。",
    storyEn:
      "The State of Zhao possessed a precious jade. When another state tried to seize it through political pressure, Zhao’s envoy used tact and courage to ensure the jade returned safely, without losing face.",
    storyZh:
      "赵国有和氏璧，秦国想借机夺取。赵国使者凭借机智与胆识，最终使和氏璧完好归赵，也维护了国体与尊严。",
    usageEn: "Often used for returning an item in perfect condition, or for handling a tense situation skillfully.",
    usageZh: "常用于“物归原主且完好无损”，也可引申为周旋得当、维护尊严。",
    noteEn: "This story is tied to Zhao’s court culture; Handan was Zhao’s capital.",
    noteZh: "此类故事多与赵国朝廷文化相关，而赵国都城在今邯郸一带。",
  },
  {
    id: "fu-jing-qing-zui",
    hanzi: "负荆请罪",
    pinyin: "Fù jīng qǐngzuì",
    tags: ["history", "courage", "integrity"],
    meaningEn: "To sincerely apologize and ask for punishment; to make amends with humility.",
    meaningZh: "真诚认错、当面请罪；以谦卑态度化解矛盾。",
    storyEn:
      "A general carried thorn branches on his back as he visited the person he had offended, showing he accepted punishment. The two reconciled, and their unity strengthened Zhao.",
    storyZh:
      "有人背着荆条上门请罪，表示愿受责罚。双方因此冰释前嫌，赵国也因此更为团结。",
    usageEn: "Use it for a serious, face-to-face apology—especially after a public mistake.",
    usageZh: "用于形容郑重其事地道歉认错，尤其是愿意承担责任的态度。",
    noteEn: "The most famous versions involve Zhao figures (Lin Xiangru and Lian Po).",
    noteZh: "最经典的版本与赵国人物（蔺相如、廉颇）相关。",
  },
  {
    id: "hu-fu-qi-she",
    hanzi: "胡服骑射",
    pinyin: "Húfú qíshè",
    tags: ["history", "strategy"],
    meaningEn: "To adopt practical innovations from others to strengthen yourself.",
    meaningZh: "吸收外来先进经验与制度改革，以增强自身实力。",
    storyEn:
      "To modernize the military, Zhao’s leadership promoted adopting the nomadic-style clothing and cavalry archery techniques that worked better on the northern frontiers—an early example of pragmatic reform.",
    storyZh:
      "赵国为适应北方作战需要，推行“胡服骑射”，学习更适用的服饰与骑射技术，体现务实改革精神。",
    usageEn: "Use it when emphasizing openness, learning, and upgrading systems in a practical way.",
    usageZh: "用于强调开放学习、务实改进、制度与能力升级。",
    noteEn: "A strong talking point for international audiences: innovation through cross-cultural learning.",
    noteZh: "对国际传播很友好：体现跨文化学习与创新的价值。",
  },
  {
    id: "zhi-shang-tan-bing",
    hanzi: "纸上谈兵",
    pinyin: "Zhǐshàng tán bīng",
    tags: ["history", "everyday"],
    meaningEn: "Armchair strategizing; theory without real-world practice.",
    meaningZh: "空谈理论、不切实际；纸面谈兵而无实战能力。",
    storyEn:
      "A talented reader of military texts could recite strategy perfectly—yet in real conflict he failed because he treated war like a textbook exercise.",
    storyZh:
      "有人熟读兵书、谈兵如流，但真正上阵却失败，因为把战争当成纸面推演，缺乏实践与应变。",
    usageEn: "Use it for plans that sound smart but ignore constraints, logistics, and reality.",
    usageZh: "用于批评脱离实际的方案、纸面工作与空谈。",
    noteEn: "Often connected with the Zhao general Zhao Kuo and Zhao’s wartime history.",
    noteZh: "常与赵括及赵国战史相关联。",
  },
  {
    id: "wei-wei-jiu-zhao",
    hanzi: "围魏救赵",
    pinyin: "Wéi Wèi jiù Zhào",
    tags: ["strategy", "history"],
    meaningEn: "To relieve pressure by attacking the opponent’s weak point; indirect strategy.",
    meaningZh: "避实击虚、围点打援；通过攻其必救之处来解围。",
    storyEn:
      "Instead of confronting an enemy head-on, a strategist attacked the enemy’s home territory, forcing them to withdraw and saving Zhao—an indirect approach still discussed in strategy today.",
    storyZh:
      "不与强敌硬碰硬，而是攻其要害与后方，迫使其撤军，从而解救赵国。这种间接策略至今仍常被引用。",
    usageEn: "Use it for solving a problem by changing the battlefield—business, negotiation, or competition.",
    usageZh: "用于比喻转移战场、攻其要害来解决困局（商业、谈判等亦可）。",
    noteEn: "A classic from Chinese strategy culture; Zhao’s story-world is central.",
    noteZh: "中国战略文化经典案例之一，赵国是核心叙事对象。",
  },
  {
    id: "huang-liang-yi-meng",
    hanzi: "黄粱一梦",
    pinyin: "Huángliáng yī mèng",
    tags: ["dream", "history", "everyday"],
    meaningEn: "A brief illusion of success; a dreamlike fantasy that vanishes when you wake up.",
    meaningZh: "荣华富贵如梦一场；美梦转瞬即逝。",
    storyEn:
      "A young man stopped at an inn in (today’s) Handan. While a pot of millet was cooking, he fell asleep and dreamed of a lifetime of fame and wealth. Before the millet was even done, he woke up—realizing it had all been a dream.",
    storyZh:
      "相传有人在（今）邯郸旅店投宿，黄粱尚未煮熟便入睡，梦中历尽功名富贵；醒来时米饭还没熟，方知一切不过一梦。",
    usageEn:
      "Use it to describe “overnight success” fantasies, or any ambition that ignores reality and time.",
    usageZh: "用于形容不切实际的幻想、荣华富贵如梦；也可用来提醒脚踏实地。",
    noteEn:
      "This tale is famous in Chinese literature and is closely associated with Handan through the ‘Handan Dream’ tradition.",
    noteZh: "该典故在文学中影响深远，与“邯郸梦”叙事传统紧密相连。",
  },
  {
    id: "mao-sui-zi-jian",
    hanzi: "毛遂自荐",
    pinyin: "Máo Suì zìjiàn",
    tags: ["initiative", "courage", "history"],
    meaningEn: "To recommend yourself; to step forward voluntarily when needed.",
    meaningZh: "自告奋勇、主动推荐自己承担任务。",
    storyEn:
      "Mao Sui was an overlooked retainer in Zhao. When a high-stakes diplomatic mission needed talent, he volunteered himself, seized the moment, and proved his ability—changing his fate.",
    storyZh:
      "毛遂原本默默无闻，关键时刻主动请缨随行出使，凭借胆识与口才把握机会，最终一举成名。",
    usageEn:
      "Use it when someone proactively offers their skills—especially in a moment when others hesitate.",
    usageZh: "用于形容关键时刻主动站出来、毛遂自荐承担责任或展示能力。",
    noteEn: "Often introduced as a Zhao-era story; great for encouraging initiative in modern contexts.",
    noteZh: "多与赵国故事背景相关，也常被用来鼓励现代职场与生活中的主动担当。",
  },
];
