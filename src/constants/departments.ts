// 1. 定義系所資料類型
export interface DepartmentItem {
    label: string;
    value: string;
}

// 2. 學院清單 (注意：value 必須跟下方 DEPARTMENTS 的 Key 一模一樣)
export const ACADEMIES = [
    { label: '教育學院', value: 'education' },
    { label: '人文藝術學院', value: 'arts' },
    { label: '理學院', value: 'science' },
];

// 3. 系所資料 (只保留這一個定義)
export const DEPARTMENTS: { [key: string]: DepartmentItem[] } = {
    education: [
        { label: '教育經營與管理學系', value: '教經' },
        { label: '教育學系', value: '教育' },
        { label: '幼兒與家庭教育學系', value: '幼教' },
        { label: '特殊教育學系', value: '特教' },
        { label: '心理與諮商學系', value: '心諮' },
        { label: '社會與區域發展學系', value: '社發' },
    ],
    arts: [
        { label: '語文與創作學系', value: '語創' },
        { label: '兒童英語教育學系', value: '兒英' },
        { label: '藝術與造形設計學系', value: '藝設' },
        { label: '音樂學系', value: '音樂' },
        { label: '文化創意產業經營學系', value: '文創' },
    ],
    science: [
        { label: '數學暨資訊教育學系', value: '數資' },
        { label: '自然科學教育學系', value: '自然' },
        { label: '體育學系', value: '體育' },
        { label: '資訊科學系', value: '資科' },
        { label: '數位科技設計學系', value: '數位' },
    ],
};

export const getClassOptions = (deptValue: string) => {
    if (!deptValue) return [];
    const years = ['一', '二', '三', '四'];
    let options: { label: string; value: string }[] = [];

    // 根據你的補充，重新對應資料庫標籤
    const dbTagMap: { [key: string]: string } = {
        '語創': '語',
        '藝設': '藝',
        '體育': '體',
        // 其他如 教經、教育、數位 等若與 deptValue 一致則不用特別改
    };

    const tag = dbTagMap[deptValue] || deptValue;

    years.forEach(year => {
        if (tag === '語' || tag === '藝') {
            options.push({ label: `${deptValue}${year}甲`, value: `${tag}${year}甲` });
            options.push({ label: `${deptValue}${year}乙`, value: `${tag}${year}乙` });
        } else if (tag === '數資') {
            options.push({ label: `${deptValue}${year}數學組`, value: `數資${year}數學組` });
            options.push({ label: `${deptValue}${year}AI資教組`, value: `數資${year}AI資教組` });
        } else {
            options.push({ label: `${deptValue}${year}甲`, value: `${tag}${year}甲` });
        }
    });
    return options;
};