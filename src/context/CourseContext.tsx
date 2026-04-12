import { getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

const firebaseConfig = {
    apiKey: "AIzaSyBAKhdryuoSlPhhgedbxb5-pL24TtAzfzA",
    authDomain: "courseapp-788ad.firebaseapp.com",
    projectId: "courseapp-788ad",
    storageBucket: "courseapp-788ad.firebasestorage.app",
    messagingSenderId: "650322013005",
    appId: "1:650322013005:web:5855bdc8aa1c0dc70be504",
    measurementId: "G-L6FBFFW8PM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// 1. 定義基礎課程型別
interface Course {
    id: string;
    name: string;
    teacher: string;
    timeSlots: string[];
    location: string;
}

// 2. 合併所有的介面定義 (Interface)
interface CourseContextType {
    selectedCourses: Course[];
    addCourse: (course: Course) => void;
    removeCourse: (courseId: string) => void; // 💡 確保這裡有 removeCourse
    currentSemester: string;

    // 學分檢核相關
    passedGeneralCourses: { [key: string]: boolean };
    generalCreditsTotal: number;
    updateGeneralCredits: (courses: { [key: string]: boolean }, totalCredits: number) => void;

    passedMustCourses: { [key: string]: boolean };
    mustCreditsTotal: number;
    updateMustCredits: (courses: { [key: string]: boolean }, totalCredits: number) => void;

    passedMajorCourses: { [key: string]: boolean };
    majorCreditsTotal: number;
    updateMajorCredits: (courses: { [key: string]: boolean }, totalCredits: number) => void;

    passedFlexibleCourses: { [key: string]: boolean };
    flexibleCreditsTotal: number;
    updateFlexibleCredits: (courses: { [key: string]: boolean }, totalCredits: number) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// 3. 唯一的 CourseProvider
export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [currentSemester] = useState("114-2");

    // 學分檢核狀態
    const [passedGeneralCourses, setPassedGeneralCourses] = useState<{ [key: string]: boolean }>({});
    const [generalCreditsTotal, setGeneralCreditsTotal] = useState(0);

    const [passedMustCourses, setPassedMustCourses] = useState<{ [key: string]: boolean }>({});
    const [mustCreditsTotal, setMustCreditsTotal] = useState(0);

    const [passedMajorCourses, setPassedMajorCourses] = useState<{ [key: string]: boolean }>({});
    const [majorCreditsTotal, setMajorCreditsTotal] = useState(0);

    const [passedFlexibleCourses, setPassedFlexibleCourses] = useState<{ [key: string]: boolean }>({});
    const [flexibleCreditsTotal, setFlexibleCreditsTotal] = useState(0);

    // --- Firebase Sync 儲存與讀取 ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userSnapshot = await getDoc(userDocRef);
                    if (userSnapshot.exists()) {
                        const data = userSnapshot.data();
                        if (data.creditProgress) {
                            if (data.creditProgress.passedGeneralCourses) setPassedGeneralCourses(data.creditProgress.passedGeneralCourses);
                            if (data.creditProgress.generalCreditsTotal !== undefined) setGeneralCreditsTotal(data.creditProgress.generalCreditsTotal);
                            
                            if (data.creditProgress.passedMustCourses) setPassedMustCourses(data.creditProgress.passedMustCourses);
                            if (data.creditProgress.mustCreditsTotal !== undefined) setMustCreditsTotal(data.creditProgress.mustCreditsTotal);
                            
                            if (data.creditProgress.passedMajorCourses) setPassedMajorCourses(data.creditProgress.passedMajorCourses);
                            if (data.creditProgress.majorCreditsTotal !== undefined) setMajorCreditsTotal(data.creditProgress.majorCreditsTotal);
                            
                            if (data.creditProgress.passedFlexibleCourses) setPassedFlexibleCourses(data.creditProgress.passedFlexibleCourses);
                            if (data.creditProgress.flexibleCreditsTotal !== undefined) setFlexibleCreditsTotal(data.creditProgress.flexibleCreditsTotal);
                        }
                    }
                } catch (error) {
                    console.error("Error loading credit progress from Firebase: ", error);
                }
            } else {
                // User logged out, reset to default
                setPassedGeneralCourses({}); setGeneralCreditsTotal(0);
                setPassedMustCourses({}); setMustCreditsTotal(0);
                setPassedMajorCourses({}); setMajorCreditsTotal(0);
                setPassedFlexibleCourses({}); setFlexibleCreditsTotal(0);
            }
        });
        return () => unsubscribe();
    }, []);

    const saveToFirebase = async (field: string, courses: any, totalCredits: number) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                creditProgress: {
                    [field]: courses,
                    [`${field.replace('passed', '').replace('Courses', '').toLowerCase()}CreditsTotal`]: totalCredits
                }
            }, { merge: true });
        } catch (error) {
            console.error("Error saving credit progress to Firebase: ", error);
        }
    };

    // --- 功能實作 ---
    const addCourse = (course: Course) => {
        if (!selectedCourses.find(c => c.id === course.id)) {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    // 💡 實作刪除邏輯
    const removeCourse = (courseId: string) => {
        setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
    };

    const updateGeneralCredits = (courses: { [key: string]: boolean }, totalCredits: number) => {
        setPassedGeneralCourses(courses);
        setGeneralCreditsTotal(totalCredits);
        saveToFirebase('passedGeneralCourses', courses, totalCredits);
    };

    const updateMustCredits = (courses: { [key: string]: boolean }, totalCredits: number) => {
        setPassedMustCourses(courses);
        setMustCreditsTotal(totalCredits);
        saveToFirebase('passedMustCourses', courses, totalCredits);
    };

    const updateMajorCredits = (courses: { [key: string]: boolean }, totalCredits: number) => {
        setPassedMajorCourses(courses);
        setMajorCreditsTotal(totalCredits);
        saveToFirebase('passedMajorCourses', courses, totalCredits);
    };

    const updateFlexibleCredits = (courses: { [key: string]: boolean }, totalCredits: number) => {
        setPassedFlexibleCourses(courses);
        setFlexibleCreditsTotal(totalCredits);
        saveToFirebase('passedFlexibleCourses', courses, totalCredits);
    };

    return (
        <CourseContext.Provider value={{
            selectedCourses,
            addCourse,
            removeCourse, // 💡 記得傳出去
            currentSemester,
            passedGeneralCourses,
            generalCreditsTotal,
            updateGeneralCredits,
            passedMustCourses,
            mustCreditsTotal,
            updateMustCredits,
            passedMajorCourses,
            majorCreditsTotal,
            updateMajorCredits,
            passedFlexibleCourses,
            flexibleCreditsTotal,
            updateFlexibleCredits
        }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) throw new Error('useCourse must be used within a CourseProvider');
    return context;
};