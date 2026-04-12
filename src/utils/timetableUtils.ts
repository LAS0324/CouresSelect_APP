// 排序規則：1. 開始時間早的在前 2. 節數少（課短）的在前
export const sortOverlappingCourses = (courses: any[]) => {
    return [...courses].sort((a, b) => {
        // 假設 slot 格式為 "1-01"
        const startA = parseInt(a.timeSlots[0].split('-')[1]);
        const startB = parseInt(b.timeSlots[0].split('-')[1]);

        if (startA !== startB) return startA - startB;
        return a.timeSlots.length - b.timeSlots.length;
    });
};

// 將選課清單轉換成二維陣列 [星期Idx][節次Idx]
export const getGridData = (selectedCourses: any[], periods: any[]) => {
    // 💡 在宣告時加上類型的定義：any[][][] 代表這是「陣列中的陣列中的陣列」
    const grid: any[][][] = Array.from({ length: 5 }, () =>
        Array.from({ length: periods.length }, () => [])
    );

    selectedCourses.forEach(course => {
        course.timeSlots.forEach((slot: string) => {
            const [dayStr, pId] = slot.split('-');
            const dIdx = parseInt(dayStr) - 1;
            const pIdx = periods.findIndex(p => p.id === pId);

            if (dIdx >= 0 && dIdx < 5 && pIdx !== -1) {
                // 現在這裡就不會報錯了，因為 grid 知道裡面可以放東西
                grid[dIdx][pIdx].push(course);
            }
        });
    });
    return grid;
};