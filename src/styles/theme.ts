// src/styles/theme.ts
export const COLORS = {
    // ==========================================
    // 全域共用顏色 (Global)
    // ==========================================
    background: '#F8F7F2', // 柔和米白
    primary: '#B2AC88',    // 鼠尾草綠 (主色)
    surface: '#FFFFFF',    // 純白 (卡片用)
    text: '#333333',       // 深灰文字
    placeholder: '#999999',
    accent: '#F3E99F',     // 淡淡的黃色 (點綴用)
    
    // ==========================================
    // 頂部導覽列 (TopNavBar)
    // ==========================================
    navBarIcon: '#000000', // 導覽列圖示顏色
    navBarText: '#000000', // 導覽列標題字體顏色

    // ==========================================
    // 設定頁面 (Personal Settings)
    // ==========================================
    avatarEditBg: '#FFFFFF',   // 設定頁：個人頭像右下角的圓圈背景色
    avatarEditIcon: '#333333', // 設定頁：個人頭像右下角的 photo 圖示顏色
    nameEditIcon: '#714C0F',   // 設定頁：名稱旁邊的鉛筆圖示顏色
    settingsCardBg: '#FFFEFA', // 設定頁：330px 寬度的容器背景顏色
    darkModeIconBg: '#5E5CE6', // 設定頁：深夜模式圖示的背景色
    darkModeIcon: '#ffffff',   // 設定頁：深夜模式圖示的顏色    
    settingIconBg: '#D0B589',  // 設定頁：其他四個設定選項的圖示背景色
    forwardIconColor: '#000000', // 設定頁：右側箭頭圖示顏色

    // ==========================================
    // 學分檢核 / 通識學分標籤 (CreditDetail_General)
    // ==========================================
    tags: {
        '生涯職能': { bg: '#FFB6B6', border: '#D98A8A', text: '#000000' }, // 粉紅色系
        '品德、思考與社會': { bg: '#FFD3B6', border: '#D9A88A', text: '#000000' }, // 粉橘色系
        '文史哲領域': { bg: '#FFFFB6', border: '#D9D98A', text: '#000000' }, // 鵝黃色系
        '藝術美感與設計': { bg: '#E2F0CB', border: '#B5C492', text: '#000000' }, // 淺綠色系
        '環境與自然科學': { bg: '#B5EAD7', border: '#92C4A8', text: '#000000' }, // 薄荷綠色系
        '數位科技與傳播': { bg: '#C7CEEA', border: '#9CA4C4', text: '#000000' }, // 寶寶藍色系
        '外國語言與文化': { bg: '#EBD4E8', border: '#C4A8C4', text: '#000000' }, // 淺紫色系
        '體育興趣': { bg: '#FAD6A5', border: '#E0B584', text: '#000000' }, // 淺橘黃色
        '其他': { bg: '#EAEAEA', border: '#CCCCCC', text: '#333333' }, // 灰色
        '已選取': { bg: '#ebf7ee', border: '#23A85B', text: '#000000' }, // 綠色系 (用於已選取標籤)
        '全部': { bg: '#ffffff', border: '#CCCCCC', text: '#333333' }, // 灰色系 (預設/全部)
    }
};