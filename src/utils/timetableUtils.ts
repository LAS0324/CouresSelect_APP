const PERIOD_ORDER = ['0M', '01', '02', '03', '04', '0N', '05', '06', '07', '08', '0E', '09', '10', '11', '12'];

const getPeriodIdx = (pId: string) => {
    const idx = PERIOD_ORDER.indexOf(pId);
    return idx === -1 ? 0 : idx;
};

export const calculateCourseLayout = (course: any, allCourses: any[], cellHeight: number) => {
    if (!course.timeSlots || course.timeSlots.length === 0) {
        return { height: 0, top: 0, widthPercent: 100, leftOffsetPercent: 0, day: 0 };
    }
    const periodIndices = course.timeSlots.map((s: string) => getPeriodIdx(s.split('-')[1]));
    const day = parseInt(course.timeSlots[0].split('-')[0]);

    const startIdx = Math.min(...periodIndices);
    const endIdx = Math.max(...periodIndices) + 1;

    // 💡 1. 找出該天所有課
    const dailyCourses = allCourses.filter(c => parseInt(c.timeSlots[0].split('-')[0]) === day);

    // 💡 2. 核心重疊邏輯：找出這堂課在「同一個時間群組」中的所有課
    // 只要有任何一節課重疊，就視為同一組
    const overlaps = dailyCourses.filter(other => {
        const otherIndices = other.timeSlots.map((s: string) => getPeriodIdx(s.split('-')[1]));
        const otherStart = Math.min(...otherIndices);
        const otherEnd = Math.max(...otherIndices) + 1;
        return (startIdx < otherEnd && endIdx > otherStart);
    });

    // 💡 3. 排序規則：依照開始時間與長度排序，確保渲染順序一致
    const sortedOverlaps = [...overlaps].sort((a, b) => {
        const aStart = Math.min(...a.timeSlots.map((s: any) => getPeriodIdx(s.split('-')[1])));
        const bStart = Math.min(...b.timeSlots.map((s: any) => getPeriodIdx(s.split('-')[1])));
        if (aStart !== bStart) return aStart - bStart;
        return a.timeSlots.length - b.timeSlots.length;
    });

    const myIndex = sortedOverlaps.findIndex(c => c.id === course.id);
    const totalColumns = sortedOverlaps.length;

    return {
        day: day - 1,
        top: startIdx * cellHeight,
        height: (endIdx - startIdx) * cellHeight,
        // 寬度百分比：假設一週五天，每天佔 20%，這裡算的是在當天 20% 裡的占比
        widthPercent: 100 / totalColumns,
        leftOffsetPercent: (100 / totalColumns) * myIndex
    };
};