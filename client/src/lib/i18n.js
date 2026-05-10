const labels = {
  English: {
    home: "Home",
    chat: "AI Chat",
    notes: "Notes",
    tasks: "Tasks",
    profile: "Profile",
    search: "Search subjects, topics, notes...",
    guest: "Guest progress",
    settingsTitle: "Settings",
    settingsSubtitle: "Account, language, help, and app info.",
    language: "Language",
    notesTitle: "Notes",
    notesSubtitle: "Create, edit, delete, and convert topic notes into flashcards."
  },
  "Bahasa Melayu": {
    home: "Utama",
    chat: "AI Chat",
    notes: "Nota",
    tasks: "Tugasan",
    profile: "Profil",
    search: "Cari subjek, topik, nota...",
    guest: "Kemajuan tetamu",
    settingsTitle: "Tetapan",
    settingsSubtitle: "Akaun, bahasa, bantuan, dan info app.",
    language: "Bahasa",
    notesTitle: "Nota",
    notesSubtitle: "Cipta, edit, padam, dan tukar nota kepada flashcard."
  },
  Indonesian: {
    home: "Beranda",
    chat: "AI Chat",
    notes: "Catatan",
    tasks: "Tugas",
    profile: "Profil",
    search: "Cari mata pelajaran, topik, catatan...",
    guest: "Progress tamu",
    settingsTitle: "Pengaturan",
    settingsSubtitle: "Akun, bahasa, bantuan, dan info aplikasi.",
    language: "Bahasa",
    notesTitle: "Catatan",
    notesSubtitle: "Buat, edit, hapus, dan ubah catatan menjadi flashcard."
  },
  Spanish: {
    home: "Inicio",
    chat: "Chat IA",
    notes: "Notas",
    tasks: "Tareas",
    profile: "Perfil",
    search: "Buscar materias, temas, notas...",
    guest: "Progreso invitado",
    settingsTitle: "Ajustes",
    settingsSubtitle: "Cuenta, idioma, ayuda e info de la app.",
    language: "Idioma",
    notesTitle: "Notas",
    notesSubtitle: "Crear, editar, eliminar y convertir notas en tarjetas."
  },
  Chinese: {
    home: "首页",
    chat: "AI 聊天",
    notes: "笔记",
    tasks: "任务",
    profile: "个人",
    search: "搜索科目、主题、笔记...",
    guest: "访客进度",
    settingsTitle: "设置",
    settingsSubtitle: "账号、语言、帮助和应用信息。",
    language: "语言",
    notesTitle: "笔记",
    notesSubtitle: "创建、编辑、删除笔记，并转换成抽认卡。"
  },
  Tamil: {}
};

export function t(language, key) {
  return (labels[language] || labels.English)[key] || labels.English[key] || key;
}
