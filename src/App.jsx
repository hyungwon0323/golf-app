import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  PenTool, 
  BarChart2, 
  TrendingUp,
  CreditCard, 
  User, 
  Trophy, 
  Eye, 
  Target, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronUp, 
  List, 
  CheckCircle,
  X,
  Save,
  TableProperties,
  CircleDot,
  Thermometer,
  Wind,
  Focus,
  MoveRight,
  RefreshCw,
  CheckSquare,
  Map,
  Mountain,
  Ruler, 
  Activity,
  Flag,
  Coffee,
  CloudRain,
  Mail, 
  Key, 
  LogOut, 
  Crosshair,
  Lock,
  Target as TargetIcon
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore'; 

// --- [Firebase Initialization] ---
let app, auth, db;
const firebaseConfig = {
  apiKey: "AIzaSyAKyBw7Ca5Zi9XGEudGkDPh69_W7T1N-lc",
  authDomain: "zeno-golf.firebaseapp.com",
  projectId: "zeno-golf",
  storageBucket: "zeno-golf.firebasestorage.app",
  messagingSenderId: "1019871498079",
  appId: "1:1019871498079:web:b081472d8f442bbbebf0ea",
  measurementId: "G-ZWDRQV93RV"
};

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.log('Firebase init skipped or failed', e);
}
const appId = "zeno-golf-app";

// --- [커스텀 아이콘] ---
const DriverFaceIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16c1 0 2 0.8 2 2v4c0 4-4 7-10 7S2 17 2 13V9c0-1.2 1-2 2-2z" />
    <line x1="7" y1="11" x2="17" y2="11" />
    <line x1="6" y1="14" x2="18" y2="14" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

const ZoroEyesIcon = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 7 L 11 10" strokeWidth="2.5" />
    <path d="M23 7 L 13 10" strokeWidth="2.5" />
    <path d="M1 12 Q 6 9 11 13" strokeWidth="2" />
    <path d="M23 12 Q 18 9 13 13" strokeWidth="2" />
    <circle cx="6" cy="11.5" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="11.5" r="2.5" fill="currentColor" stroke="none" />
    <path d="M19 3 L 17 21" strokeWidth="1.5" opacity="0.9" />
  </svg>
);

// 글로벌 미스 요인 리스트
const MISS_REASONS = [
  { id: 'hit', label: '타점', icon: <Focus size={14} /> },
  { id: 'face', label: '페이스앵글', icon: <DriverFaceIcon size={14} /> },
  { id: 'path', label: '패스', icon: <MoveRight size={14} /> },
  { id: 'aim', label: '에임', icon: <Crosshair size={14} /> }, 
  { id: 'routine', label: '루틴', icon: <RefreshCw size={14} /> },
  { id: 'clubSelection', label: '클럽선택', icon: <CheckSquare size={14} /> },
  { id: 'strategy', label: '공략', icon: <Map size={14} /> },
  { id: 'trouble', label: '트러블라이', icon: <Mountain size={14} /> },
  { id: 'carry', label: '캐리조절', icon: <Ruler size={14} /> },
];

// --- [모의 데이터] ---
const generateMockDetailedHoles = () => {
  const getMockReasons = (maxIdx) => {
    const shuffled = [...MISS_REASONS].slice(0, maxIdx).sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 1).map(r => r.id);
  };

  return Array.from({ length: 18 }, (_, i) => {
    const par = i % 4 === 0 ? 3 : i % 5 === 0 ? 5 : 4;
    const driveRes = par !== 3 ? (Math.random() > 0.4 ? 'O' : 'X') : null;
    const secondRes = par === 5 ? (Math.random() > 0.4 ? 'O' : 'X') : null;
    const girRes = Math.random() > 0.5 ? 'O' : 'X';
    const udRes = Math.random() > 0.5 ? 'O' : 'X';
    
    const puttsCount = Math.random() > 0.8 ? 3 : Math.random() > 0.4 ? 2 : 1;
    const firstPuttDist = Math.random() > 0.2 ? Math.floor(Math.random() * 40 + 5).toString() : '';
    const secondPuttDist = puttsCount >= 2 && Math.random() > 0.3 ? Math.floor(Math.random() * 15 + 1).toString() : '';

    const puttDetails = Array.from({length: 4}, (_, pIdx) => {
      if (pIdx === 0) return { distance: firstPuttDist, hook: '', slice: '', downhill: '', uphill: '' };
      if (pIdx === 1) return { distance: secondPuttDist, hook: '', slice: '', downhill: '', uphill: '' };
      return { distance: '', hook: '', slice: '', downhill: '', uphill: '' };
    });

    return {
      hole: i + 1,
      par: par,
      score: par + Math.floor(Math.random() * 2),
      putts: puttsCount,
      penaltyOB: Math.random() > 0.9 ? 1 : 0,
      penaltyHazard: Math.random() > 0.8 ? 1 : 0,
      firstPuttFt: firstPuttDist, 
      puttDetails: puttDetails,
      drive: driveRes,
      driveMissReason: driveRes === 'X' ? getMockReasons(7) : [],
      secondShotResult: secondRes,
      secondShotMissReason: secondRes === 'X' ? getMockReasons(7) : [],
      girResult: girRes,
      girMissReason: girRes === 'X' ? getMockReasons(8) : [],
      udResult: udRes,
      udMissReason: udRes === 'X' ? getMockReasons(9) : []
    };
  });
};

const initialScores = [
  { id: 1, date: '2026-02-28', course: '용인 CC', total: 95, putts: 38, fairways: 6, type: 'practice', temperature: '12', wind: '한클럽', roundReflection: '후반 홀 체력 저하로 샷이 많이 흔들렸다. 특히 드라이버 슬라이스가 심했음.', instructorComment: '체력 훈련과 함께 백스윙 탑에서 급해지지 않도록 템포 조절에 신경 써봅시다!', detailedHoles: generateMockDetailedHoles() },
  { id: 2, date: '2026-03-01', course: '레이크사이드', total: 92, putts: 36, fairways: 8, type: 'practice', temperature: '10', wind: '반클럽', detailedHoles: generateMockDetailedHoles() },
  { id: 3, date: '2026-03-05', course: '남부 CC', total: 89, putts: 34, fairways: 9, type: 'tournament', tournamentName: '청소년 컵', temperature: '15', wind: '두클럽', roundReflection: '그린 스피드 적응을 못해서 3퍼트가 많았다. 숏게임과 퍼팅 연습이 시급함.', detailedHoles: generateMockDetailedHoles() },
  { id: 4, date: '2026-03-07', course: '태광 CC', total: 88, putts: 33, fairways: 10, type: 'tournament', tournamentName: '용인시장배', temperature: '14', wind: '무풍', detailedHoles: generateMockDetailedHoles() },
];

const generateInitialHoles = () => Array.from({ length: 18 }, (_, i) => ({
  hole: i + 1,
  par: 4,
  score: 4,
  putts: 2,
  penaltyOB: 0,
  penaltyHazard: 0,
  firstPuttFt: '', 
  puttDetails: Array.from({length: 4}, () => ({ distance: '', hook: '', slice: '', downhill: '', uphill: '' })),
  teeClub: null,
  drive: null, 
  driveMissReason: [], 
  secondClub: null, 
  secondShotResult: null, 
  secondShotMissReason: [], 
  girClub: null, 
  girResult: null, 
  girMissReason: [], 
  udDist: null, 
  udClub: null, 
  udResult: null,
  udMissReason: [] 
}));

const generateInitialInfo = () => ({
  date: new Date().toISOString().split('T')[0],
  course: '',
  type: 'practice',
  tournamentName: '',
  greenSpeed: '', 
  temperature: '',
  wind: '',
  isRaining: false,
  precipitation: '',
  roundReflection: ''
});

const initialPracticeRecords = [
  { id: 1, date: '2026-03-08', type: 'long', method: 'block', title: '드라이버 방향성 교정', content: '백스윙 탑에서 크로스오버 되는 느낌을 잡기 위해 노력함. 임팩트 시 클럽 페이스가 열리는 문제를 신경 썼다.', instructorComment: '백스윙 궤도를 영상으로 찍어서 확인해 보는 것이 좋겠습니다. 잘하고 있어요!' },
  { id: 2, date: '2026-03-09', type: 'short', method: 'random', title: '50m, 30m 어프로치', content: '거리감 맞추기 위주로 연습. 50m는 샌드웨지 3/4 스윙, 30m는 하프 스윙으로 기준을 잡았다. 스핀량은 아직 부족함.' },
];

export default function GolfStudentApp() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student'); 
  const [userEmail, setUserEmail] = useState(''); 
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [scores, setScores] = useState([]);
  const [practiceRecords, setPracticeRecords] = useState(initialPracticeRecords); 
  const [isPremium, setIsPremium] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null); 
  const [analysisContext, setAnalysisContext] = useState(null); 
  const [showUserMenu, setShowUserMenu] = useState(false); 
  
  const [addScoreStep, setAddScoreStep] = useState(1);
  const [addScoreInfo, setAddScoreInfo] = useState(generateInitialInfo());
  const [addScoreHoles, setAddScoreHoles] = useState(generateInitialHoles());
  const [addScoreCurrentHoleIdx, setAddScoreCurrentHoleIdx] = useState(0);
  const [editingScoreId, setEditingScoreId] = useState(null);

  const resetAddScoreState = () => {
    setAddScoreStep(1);
    setAddScoreInfo(generateInitialInfo());
    setAddScoreHoles(generateInitialHoles());
    setAddScoreCurrentHoleIdx(0);
    setEditingScoreId(null);
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('zeno_golf_email');
    const savedRole = localStorage.getItem('zeno_golf_role');
    if (savedEmail && savedRole) {
      setUserEmail(savedEmail);
      setUserRole(savedRole);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setUserRole('student');
    setCurrentTab('dashboard');
    const prevEmail = userEmail;
    setUserEmail('');
    localStorage.removeItem('zeno_golf_email');
    localStorage.removeItem('zeno_golf_role');

    if (prevEmail && db) {
      try {
        const stateRef = doc(db, 'artifacts', appId, 'users', prevEmail, 'appState', 'current');
        await setDoc(stateRef, { isLoggedIn: false, userRole: 'student', currentTab: 'dashboard' }, { merge: true });
      } catch (e) {
        console.warn("Logout save error", e);
      }
    }
  };

  const handleLoginSuccess = async (role, email, encodedEmail) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserEmail(encodedEmail);
    
    localStorage.setItem('zeno_golf_email', encodedEmail);
    localStorage.setItem('zeno_golf_role', role);

    if (db) {
      try {
        const stateRef = doc(db, 'artifacts', appId, 'users', encodedEmail, 'appState', 'current');
        await setDoc(stateRef, { isLoggedIn: true, userRole: role }, { merge: true });

        if (email) {
          const dirRef = doc(db, 'artifacts', appId, 'public', 'data', 'directory', encodedEmail);
          await setDoc(dirRef, {
            encodedEmail: encodedEmail,
            email: email,
            name: email.split('@')[0],
            role: role,
            createdAt: Date.now()
          }, { merge: true });
        }
      } catch (e) {
        console.warn("Login save error", e);
      }
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch(e) {
        console.warn("Auth error", e);
        setIsAuthReady(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isLoggedIn || !user || !userEmail || !db) {
      if (!isLoggedIn) {
        setScores(initialScores);
        setIsDataLoaded(true);
      }
      return;
    }

    const loadState = async () => {
      try {
        const stateRef = doc(db, 'artifacts', appId, 'users', userEmail, 'appState', 'current');
        const docSnap = await getDoc(stateRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.isLoggedIn !== undefined) setIsLoggedIn(data.isLoggedIn);
          if (data.userRole) setUserRole(data.userRole);
          if (data.currentTab) setCurrentTab(data.currentTab);
          if (data.addScoreStep) setAddScoreStep(data.addScoreStep);
          if (data.addScoreInfo) setAddScoreInfo(data.addScoreInfo);
          if (data.addScoreHoles) setAddScoreHoles(data.addScoreHoles);
          if (data.addScoreCurrentHoleIdx !== undefined) setAddScoreCurrentHoleIdx(data.addScoreCurrentHoleIdx);
          if (data.editingScoreId !== undefined) setEditingScoreId(data.editingScoreId);
          if (data.isPremium !== undefined) setIsPremium(data.isPremium);
        }
      } catch (e) {
        console.warn("State load error", e);
      }
      setIsDataLoaded(true);
    };
    loadState();
  }, [user, userEmail, isLoggedIn, isAuthReady]);

  useEffect(() => {
    if (!isDataLoaded || !user || !userEmail || !db || !isLoggedIn) return;

    const saveState = async () => {
      try {
        const stateRef = doc(db, 'artifacts', appId, 'users', userEmail, 'appState', 'current');
        const stateToSave = JSON.parse(JSON.stringify({
          isLoggedIn,
          userRole,
          currentTab,
          addScoreStep,
          addScoreInfo,
          addScoreHoles,
          addScoreCurrentHoleIdx,
          editingScoreId,
          isPremium
        }));
        await setDoc(stateRef, stateToSave, { merge: true });
      } catch (e) {
        console.warn("State save error", e);
      }
    };

    const timer = setTimeout(() => {
      saveState();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoggedIn, userRole, currentTab, addScoreStep, addScoreInfo, addScoreHoles, addScoreCurrentHoleIdx, editingScoreId, isPremium, isDataLoaded, user, userEmail]);

  useEffect(() => {
    if (!isDataLoaded || !user || !userEmail || !db || !isLoggedIn) return;
    
    const scoresRef = collection(db, 'artifacts', appId, 'users', userEmail, 'scores');
    const unsubscribeScores = onSnapshot(scoresRef, (snapshot) => {
      if (snapshot.empty) {
        setScores([]);
      } else {
        const fetchedScores = snapshot.docs.map(d => ({ id: Number(d.id), ...d.data() }));
        fetchedScores.sort((a,b) => a.id - b.id);
        setScores(fetchedScores);
      }
    }, (error) => console.warn("Scores sync error", error));

    const practiceRef = collection(db, 'artifacts', appId, 'users', userEmail, 'practice');
    const unsubscribePractice = onSnapshot(practiceRef, (snapshot) => {
      if (snapshot.empty) {
        setPracticeRecords([]);
      } else {
        const fetchedRecords = snapshot.docs.map(d => ({ id: Number(d.id), ...d.data() }));
        fetchedRecords.sort((a,b) => b.id - a.id);
        setPracticeRecords(fetchedRecords);
      }
    }, (error) => console.warn("Practice sync error", error));

    return () => {
      unsubscribeScores();
      unsubscribePractice();
    };
  }, [isDataLoaded, user, userEmail, isLoggedIn]);

  const handleSaveScore = async (newScore) => {
    if (userEmail && db) {
      try {
        const cleanScore = JSON.parse(JSON.stringify(newScore));
        const scoreRef = doc(db, 'artifacts', appId, 'users', userEmail, 'scores', cleanScore.id.toString());
        await setDoc(scoreRef, cleanScore); 
      } catch(e) { console.warn("Save score error", e); }
    } else {
      setScores(prev => {
        const exists = prev.find(s => s.id === newScore.id);
        if (exists) return prev.map(s => s.id === newScore.id ? newScore : s);
        return [...prev, newScore];
      });
    }
  };

  const handleSavePractice = async (newRecord) => {
    if (userEmail && db) {
      try {
        const cleanRecord = JSON.parse(JSON.stringify(newRecord));
        const recordRef = doc(db, 'artifacts', appId, 'users', userEmail, 'practice', cleanRecord.id.toString());
        await setDoc(recordRef, cleanRecord);
      } catch(e) { console.warn("Save practice error", e); }
    } else {
      setPracticeRecords(prev => [newRecord, ...prev]);
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (window.confirm('이 라운드 기록을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      if (userEmail && db) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', userEmail, 'scores', scoreId.toString()));
        } catch(e) { console.warn("Delete score error", e); }
      } else {
        setScores(prev => prev.filter(s => s.id !== scoreId));
      }
    }
  };

  const handleDeletePractice = async (recordId) => {
    if (window.confirm('이 연습 기록을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      if (userEmail && db) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', userEmail, 'practice', recordId.toString()));
        } catch(e) { console.warn("Delete practice error", e); }
      } else {
        setPracticeRecords(prev => prev.filter(r => r.id !== recordId));
      }
    }
  };

  if (!isAuthReady || (!isDataLoaded && !isLoggedIn)) {
    return (
      <div className="min-h-screen bg-emerald-600 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="text-white font-bold tracking-widest text-sm animate-pulse">데이터를 동기화 중...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} user={user} auth={auth} db={db} appId={appId} />;
  }

  if (userRole === 'instructor') {
    return <InstructorApp onLogout={handleLogout} userEmail={userEmail} user={user} db={db} appId={appId} />;
  }

  const renderTabContent = () => {
    switch(currentTab) {
      case 'dashboard': 
        return <DashboardView 
                  scores={scores} 
                  isPremium={isPremium} 
                  onScoreClick={(score) => {
                    setSelectedScore(score);
                    setCurrentTab('roundDetail');
                  }} 
                  onDeleteScore={handleDeleteScore} 
               />;
      case 'add': 
        return <AddScoreDetailedView 
                 onSaveScore={handleSaveScore} 
                 setCurrentTab={setCurrentTab}
                 step={addScoreStep} setStep={setAddScoreStep}
                 info={addScoreInfo} setInfo={setAddScoreInfo}
                 holes={addScoreHoles} setHoles={setAddScoreHoles}
                 currentHoleIdx={addScoreCurrentHoleIdx} setCurrentHoleIdx={setAddScoreCurrentHoleIdx}
                 editingScoreId={editingScoreId}
                 onReset={resetAddScoreState}
               />;
      case 'stats': return <StatsView scores={scores} />;
      case 'practice': return <PracticeView records={practiceRecords} onSave={handleSavePractice} onDelete={handleDeletePractice} userRole="student" />; 
      case 'roundDetail': 
        return <RoundDetailView 
                 score={selectedScore} 
                 onBack={() => setCurrentTab('dashboard')} 
                 onAnalyze={(statType, title, category = 'miss') => {
                   setAnalysisContext({ statType, title, category });
                   setCurrentTab(category === 'putting' ? 'puttingAnalysis' : 'missAnalysis');
                 }}
                 userRole="student"
                 onEdit={(scoreToEdit) => {
                   setEditingScoreId(scoreToEdit.id);
                   setAddScoreInfo({
                     date: scoreToEdit.date || generateInitialInfo().date,
                     course: scoreToEdit.course || '',
                     type: scoreToEdit.type || 'practice',
                     tournamentName: scoreToEdit.tournamentName || '',
                     greenSpeed: scoreToEdit.greenSpeed || '',
                     temperature: scoreToEdit.temperature || '',
                     wind: scoreToEdit.wind || '',
                     isRaining: scoreToEdit.isRaining || false,
                     precipitation: scoreToEdit.precipitation || '',
                     roundReflection: scoreToEdit.roundReflection || ''
                   });
                   setAddScoreHoles(scoreToEdit.detailedHoles.map(h => ({
                       ...h,
                       penaltyOB: h.penaltyOB || 0,
                       penaltyHazard: h.penaltyHazard || 0,
                       puttDetails: h.puttDetails && h.puttDetails.length === 4 
                           ? h.puttDetails 
                           : Array.from({length: 4}, () => ({ distance: '', hook: '', slice: '', downhill: '', uphill: '' }))
                   })));
                   setAddScoreStep(1);
                   setAddScoreCurrentHoleIdx(0);
                   setCurrentTab('add');
                 }}
               />;
      case 'missAnalysis': 
        return <MissAnalysisView 
                 score={selectedScore} 
                 context={analysisContext} 
                 onBack={() => setCurrentTab('roundDetail')} 
               />;
      case 'puttingAnalysis': 
        return <PuttingAnalysisView 
                 score={selectedScore} 
                 context={analysisContext} 
                 onBack={() => setCurrentTab('roundDetail')} 
               />;
      default: 
        return <DashboardView 
                  scores={scores} 
                  isPremium={isPremium} 
                  onScoreClick={(score) => {
                    setSelectedScore(score);
                    setCurrentTab('roundDetail');
                  }} 
                  onDeleteScore={handleDeleteScore} 
               />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        <header className="bg-emerald-600 text-white p-4 sticky top-0 z-10 flex justify-center items-center shadow-md relative">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ZoroEyesIcon size={34} className="text-white" />
            Zeno Golf
          </h1>
          
          <div className="absolute right-4 flex items-center gap-3">
            {isPremium && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Coffee size={12} /> SUPPORTER
              </span>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="p-1 -mr-1 text-emerald-100 hover:text-white transition-colors focus:outline-none"
              >
                <User size={20} />
              </button>
              
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 bg-gray-50">
          {renderTabContent()}
        </main>

        <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md flex justify-around p-3 pb-safe z-10">
          <NavItem icon={<Home />} label="홈" isActive={currentTab === 'dashboard'} onClick={() => setCurrentTab('dashboard')} />
          <NavItem icon={<PenTool />} label="라운드기록" isActive={currentTab === 'add'} onClick={() => setCurrentTab('add')} />
          <NavItem icon={<TrendingUp />} label="분석" isActive={currentTab === 'stats'} onClick={() => setCurrentTab('stats')} />
          <NavItem icon={<TargetIcon />} label="연습기록" isActive={currentTab === 'practice'} onClick={() => setCurrentTab('practice')} />
        </nav>
      </div>
    </div>
  );
}

function PracticeRecordItem({ record, userRole, onSaveComment, onDelete }) {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentText, setCommentText] = useState(record.instructorComment || '');

  const [touchStartX, setTouchStartX] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const maxSwipe = 80;

  const handleTouchStart = (e) => {
    if (!onDelete) return;
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!onDelete || touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = touchStartX - currentX;

    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipe));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!onDelete) return;
    if (swipeOffset > maxSwipe / 2) {
      setSwipeOffset(maxSwipe);
    } else {
      setSwipeOffset(0);
    }
    setTouchStartX(null);
  };

  const handleSave = () => {
    if (onSaveComment) {
      onSaveComment(record.id, commentText);
    }
    setIsEditingComment(false);
  };

  const getRecordTypeBadge = (type) => {
    switch (type) {
      case 'long': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">롱게임</span>;
      case 'short': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold">숏게임</span>;
      case 'putting': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">퍼팅</span>;
      default: return null;
    }
  };

  const getRecordMethodBadge = (method) => {
    switch (method) {
      case 'block': return <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">블록 연습</span>;
      case 'random': return <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">랜덤 연습</span>;
      case 'routine': return <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">루틴 연습</span>;
      case 'game': return <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">게임 연습</span>;
      default: return null;
    }
  };

  return (
    <div className="relative rounded-2xl shadow-sm border border-gray-100 overflow-hidden group bg-red-500">
      {onDelete && (
        <div className="absolute right-0 top-0 bottom-0 w-[80px] flex items-center justify-center z-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(record.id); setSwipeOffset(0); }}
            className="text-white flex flex-col items-center gap-1 w-full h-full justify-center opacity-100 hover:bg-red-600 transition-colors"
          >
            <X size={20} />
            <span className="text-[10px] font-bold">삭제</span>
          </button>
        </div>
      )}

      <div 
        className={`relative z-10 w-full bg-white p-4 transition-transform duration-200 ease-out ${onDelete ? 'sm:group-hover:-translate-x-[80px]' : ''}`}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-2 mb-2">
          {getRecordTypeBadge(record.type)}
          {getRecordMethodBadge(record.method)}
          <span className="text-[10px] text-gray-400 font-medium ml-auto">{record.date}</span>
        </div>
        <h3 className="font-bold text-gray-800 mb-2">{record.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-50 mb-3">
          {record.content}
        </p>

        {(record.instructorComment || userRole === 'instructor') && (
          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <User size={12} /> 교습가 피드백
              </span>
              {userRole === 'instructor' && !isEditingComment && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingComment(true); }}
                  className="text-[10px] text-slate-400 hover:text-slate-700 font-bold underline p-1 -m-1"
                >
                  {record.instructorComment ? '수정' : '작성'}
                </button>
              )}
            </div>
            
            {userRole === 'instructor' && isEditingComment ? (
              <div className="space-y-2 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="피드백을 남겨주세요."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 min-h-[60px] resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditingComment(false)} className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded">취소</button>
                  <button onClick={handleSave} className="px-3 py-1.5 text-[10px] font-bold bg-slate-600 text-white rounded shadow-sm hover:bg-slate-700">저장</button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {record.instructorComment ? record.instructorComment : <span className="italic text-slate-400">아직 피드백이 없습니다.</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PracticeView({ records, onSave, userRole, onSaveComment, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: 'long', method: 'block', title: '', content: '' });

  const handleSave = () => {
    if (!newRecord.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!newRecord.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const recordToSave = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...newRecord
    };

    onSave(recordToSave);
    setIsAdding(false);
    setNewRecord({ type: 'long', method: 'block', title: '', content: '' });
  };

  if (isAdding) {
    return (
      <div className="p-5 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">새 연습 기록</h2>
          <button onClick={() => setIsAdding(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">연습 종류</label>
            <div className="flex gap-2">
              {[
                { id: 'long', label: '롱게임' },
                { id: 'short', label: '숏게임' },
                { id: 'putting', label: '퍼팅' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setNewRecord({...newRecord, type: t.id})}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-all ${newRecord.type === t.id ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">연습 방법</label>
            <div className="flex gap-2">
              {[
                { id: 'block', label: '블록' },
                { id: 'random', label: '랜덤' },
                { id: 'routine', label: '루틴' },
                { id: 'game', label: '게임' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setNewRecord({...newRecord, method: m.id})}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-all ${newRecord.method === m.id ? 'bg-blue-600 border-blue-700 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-snug break-keep">
              * <span className="font-bold text-gray-500">블록</span>: 한 가지 동작/클럽 반복 | <span className="font-bold text-gray-500">랜덤</span>: 클럽/타겟 계속 변경 | <span className="font-bold text-gray-500">루틴</span>: 실제 코스처럼 | <span className="font-bold text-gray-500">게임</span>: 스코어링/실전 감각
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">연습 주제 / 제목</label>
            <input 
              type="text" 
              placeholder="예) 드라이버 방향성 교정" 
              value={newRecord.title}
              onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">연습 내용 / 깨달은 점</label>
            <textarea 
              placeholder="오늘 연습에서 집중한 부분이나 깨달은 느낌을 자유롭게 적어주세요." 
              value={newRecord.content}
              onChange={(e) => setNewRecord({...newRecord, content: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm min-h-[150px] resize-none"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-md hover:bg-emerald-700 transition-colors mt-2 flex justify-center items-center gap-2"
          >
            <Save size={18} /> 기록 저장하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 animate-fadeIn pb-32">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">연습 기록장</h2>
          <p className="text-xs text-gray-500">매일의 연습 내용과 느낌을 기록하세요.</p>
        </div>
        {userRole !== 'instructor' && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <PenTool size={12} /> 새 기록
          </button>
        )}
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm bg-white rounded-2xl border border-gray-100 border-dashed">
            아직 작성된 연습 기록이 없습니다.
          </div>
        ) : (
          records.map(record => (
            <PracticeRecordItem 
              key={record.id} 
              record={record} 
              userRole={userRole} 
              onSaveComment={onSaveComment} 
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function LoginView({ onLoginSuccess, user, auth, db, appId }) {
  const [role, setRole] = useState('student'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);

  const TEST_OTP = '123456';

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`[발송 시뮬레이션 성공]\n\n입력하신 이메일(${email})로 인증번호가 발송된 것으로 간주합니다.\n\n아래의 테스트 코드를 입력해주세요:\n\n[ ${TEST_OTP} ]`);
      
      setStep(2); 
    } catch (error) {
      console.error("OTP 이메일 발송 에러:", error);
      alert('이메일 발송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert('6자리 인증번호를 정확히 입력해주세요.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      setIsLoading(false);
      
      if (otp === TEST_OTP) {
        const encodedEmail = email.replace(/[\.\#\$\[\]]/g, '_');
        if (db && appId && user) {
          try {
            const accountRef = doc(db, 'artifacts', appId, 'users', encodedEmail, 'accounts', encodedEmail);
            const snap = await getDoc(accountRef);
            if (!snap.exists()) {
               await setDoc(accountRef, { email, role, createdAt: Date.now() });
            }
          } catch (e) {
            console.warn('Account save error', e);
          }
        }
        onLoginSuccess(role, email, encodedEmail);
      } else {
        alert('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-emerald-600 min-h-screen shadow-2xl relative flex flex-col items-center justify-center p-6 text-white">
        
        <div className="flex flex-col items-center mb-10 animate-fadeIn">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <ZoroEyesIcon size={50} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Zeno Golf</h1>
          <p className="text-emerald-100 text-sm font-medium text-center px-4 break-keep">
            강한 게임은 그대로 두고, 약한 게임은 시간과 노력과 비용을 투자하세요.
          </p>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-xl p-6 text-gray-800 animate-slideUp">
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">이메일 로그인</h2>
              <p className="text-xs text-gray-500">계정 이메일을 입력하면 인증코드를 보내드립니다.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">계정 유형</label>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all font-bold text-sm ${role === 'student' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                  <input type="radio" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="hidden" />
                  🏌️ 학생
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all font-bold text-sm ${role === 'instructor' ? 'bg-slate-50 border-slate-500 text-slate-700 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                  <input type="radio" value="instructor" checked={role === 'instructor'} onChange={() => setRole('instructor')} className="hidden" />
                  🧑‍🏫 교습가
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">이메일 주소</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={step === 2}
                  placeholder="student@example.com" 
                  className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all ${step === 2 ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'}`}
                />
              </div>
            </div>

            {step === 1 ? (
              <button 
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 mt-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  '인증코드 발송'
                )}
              </button>
            ) : (
              <div className="space-y-5 animate-slideUp pt-2 border-t border-gray-100">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-gray-600">인증코드 (6자리)</label>
                    <button onClick={() => setStep(1)} className="text-[10px] font-bold text-emerald-600 underline">이메일 다시 입력</button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="number" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                      placeholder="123456" 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-700 tracking-widest text-center text-lg transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    '로그인 하기'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-6 text-[10px] text-emerald-200/50">
          © 2026 Zeno Golf. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function SwipeableScoreItem({ score, onClick, onDelete }) {
  const [touchStartX, setTouchStartX] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const maxSwipe = 80; 

  const handleTouchStart = (e) => {
    if (!onDelete) return;
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!onDelete || touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = touchStartX - currentX;

    if (diff > 0) {
      setSwipeOffset(Math.min(diff, maxSwipe));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!onDelete) return;
    if (swipeOffset > maxSwipe / 2) {
      setSwipeOffset(maxSwipe);
    } else {
      setSwipeOffset(0);
    }
    setTouchStartX(null);
  };

  const totalOB = score.detailedHoles?.reduce((sum, h) => sum + (h.penaltyOB || 0), 0) || 0;
  const totalHazard = score.detailedHoles?.reduce((sum, h) => sum + (h.penaltyHazard || 0), 0) || 0;

  return (
    <div className="relative border-b border-gray-50 overflow-hidden group">
      {onDelete && (
        <div className="absolute right-0 top-0 bottom-0 w-[80px] bg-red-500 flex items-center justify-center z-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(score.id); setSwipeOffset(0); }}
            className="text-white flex flex-col items-center gap-1 w-full h-full justify-center opacity-100 hover:bg-red-600 transition-colors"
          >
            <X size={20} />
            <span className="text-[10px] font-bold">삭제</span>
          </button>
        </div>
      )}

      <div 
        className={`relative z-10 w-full bg-white p-4 flex items-center justify-between cursor-pointer transition-transform duration-200 ease-out ${onDelete ? 'sm:group-hover:-translate-x-[80px]' : ''}`}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (swipeOffset === 0) onClick(score);
          else setSwipeOffset(0); 
        }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
            <Calendar size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-sm truncate">
              {score.course}
              {score.type === 'tournament' && score.tournamentName && (
                <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded align-middle inline-block">
                  {score.tournamentName}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
              <span>{score.date}</span>
              {score.greenSpeed && <span>• 그린 {score.greenSpeed}m</span>}
              {score.temperature && <span>• {score.temperature}°C</span>}
              {score.isRaining && score.precipitation && <span className="text-blue-500 font-medium">• 🌧️ {score.precipitation}mm</span>}
              {score.wind && <span>• {score.wind}</span>}
            </div>
            {(totalOB > 0 || totalHazard > 0) && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {totalOB > 0 && <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">OB {totalOB}</span>}
                {totalHazard > 0 && <span className="text-[9px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100">해저드 {totalHazard}</span>}
              </div>
            )}
            {score.roundReflection && (
              <div className="text-[10px] text-emerald-700 mt-1.5 truncate bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100">
                 <PenTool size={9} className="inline mr-1 mb-0.5" />
                 {score.roundReflection}
              </div>
            )}
            {score.instructorComment && (
              <div className="text-[10px] text-slate-600 mt-1 truncate bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                 <User size={9} className="inline mr-1 mb-0.5" />
                 {score.instructorComment}
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          <div className="font-bold text-lg text-gray-800">{score.total} <span className="text-xs font-normal text-gray-500">타</span></div>
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
}

function DashboardView({ scores, isPremium, onScoreClick, onDeleteScore }) {
  const practiceScores = scores.filter(s => s.type === 'practice' || !s.type);
  const tournamentScores = scores.filter(s => s.type === 'tournament');

  const avgPractice = practiceScores.length > 0 
    ? (practiceScores.reduce((acc, curr) => acc + curr.total, 0) / practiceScores.length).toFixed(1) 
    : '-';
  
  const tournamentCount = tournamentScores.length;
  const avgTournamentVal = tournamentCount > 0 
    ? (tournamentScores.reduce((acc, curr) => acc + curr.total, 0) / tournamentCount).toFixed(1) 
    : '-';

  const calcGroupStats = (groupScores) => {
    const allHoles = groupScores.flatMap(s => s.detailedHoles || []);
    
    const fwTries = allHoles.filter(h => h.par !== 3 && h.drive !== null).length;
    const fwSus = allHoles.filter(h => h.par !== 3 && h.drive === 'O').length;
    const fwRate = fwTries > 0 ? Math.round((fwSus / fwTries) * 100) : '-';

    const girTries = allHoles.filter(h => h.girResult !== null).length;
    const girSus = allHoles.filter(h => h.girResult === 'O').length;
    const girRate = girTries > 0 ? Math.round((girSus / girTries) * 100) : '-';

    const udTries = allHoles.filter(h => h.udResult !== null).length;
    const udSus = allHoles.filter(h => h.udResult === 'O').length;
    const udRate = udTries > 0 ? Math.round((udSus / udTries) * 100) : '-';

    const avgPutts = groupScores.length > 0 
      ? (groupScores.reduce((acc, curr) => acc + curr.putts, 0) / groupScores.length).toFixed(1) 
      : '-';

    return { fwRate, girRate, udRate, avgPutts };
  };

  const pracStats = calcGroupStats(practiceScores);
  const tourStats = calcGroupStats(tournamentScores);

  const MiniStatCard = ({ title, pracVal, tourVal, unit, colorClass }) => (
    <div className="bg-white p-3 py-3.5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
      <span className={`text-[11px] font-bold tracking-tight mb-2.5 text-center ${colorClass}`}>{title}</span>
      <div className="flex justify-between items-center px-1">
        <div className="flex flex-col items-center w-[45%]">
          <span className="text-[9px] text-gray-400 font-medium mb-0.5">연습</span>
          <span className="text-[13px] font-black text-gray-700">{pracVal}{pracVal !== '-' ? unit : ''}</span>
        </div>
        <div className="w-px h-6 bg-gray-100"></div>
        <div className="flex flex-col items-center w-[45%]">
          <span className="text-[9px] text-emerald-600/70 font-medium mb-0.5">시합</span>
          <span className="text-[13px] font-black text-emerald-600">{tourVal}{tourVal !== '-' ? unit : ''}</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="p-5 space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">최근 라운드 요약</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 text-[11px] font-bold mb-1 tracking-tight">연습라운드 평균 타수</span>
            <span className="text-3xl font-black text-gray-800">{avgPractice}</span>
            <span className="text-[10px] text-gray-400 mt-1">최근 기록</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 text-[11px] font-bold mb-1 tracking-tight">시합라운드 평균 타수</span>
            <span className="text-3xl font-black text-emerald-600">{avgTournamentVal}</span>
            <span className="text-[10px] text-emerald-600/70 mt-1">대회 기록</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniStatCard title="페어웨이 안착률" pracVal={pracStats.fwRate} tourVal={tourStats.fwRate} unit="%" colorClass="text-purple-600" />
          <MiniStatCard title="그린적중률(GIR)" pracVal={pracStats.girRate} tourVal={tourStats.girRate} unit="%" colorClass="text-emerald-600" />
          <MiniStatCard title="리커버리 성공률" pracVal={pracStats.udRate} tourVal={tourStats.udRate} unit="%" colorClass="text-orange-500" />
          <MiniStatCard title="평균 퍼팅수" pracVal={pracStats.avgPutts} tourVal={tourStats.avgPutts} unit="" colorClass="text-gray-700" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">최근 스코어 리스트</h3>
        </div>
        <div className="divide-y divide-gray-50 flex flex-col-reverse">
          {scores.map((score) => (
            <SwipeableScoreItem 
              key={score.id} 
              score={score} 
              onClick={onScoreClick} 
              onDelete={onDeleteScore} 
            />
          ))}
          {scores.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-sm">
                아직 기록된 스코어가 없습니다.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoundDetailView({ score, onBack, onAnalyze, onEdit, userRole, onSaveInstructorComment }) {
  const [instructorComment, setInstructorComment] = useState('');
  const [isEditingComment, setIsEditingComment] = useState(false);

  useEffect(() => {
    setInstructorComment(score?.instructorComment || '');
    setIsEditingComment(false);
  }, [score]);

  const handleSaveComment = () => {
    if (onSaveInstructorComment) {
      onSaveInstructorComment(score.id, instructorComment);
    }
    setIsEditingComment(false);
  };

  if (!score) return null;

  const holes = score.detailedHoles || [];

  const calcRate = (conditionFn, successFn) => {
    const tries = holes.filter(conditionFn).length;
    const successes = holes.filter(successFn).length;
    const rate = tries > 0 ? Math.round((successes / tries) * 100) : 0;
    return { tries, successes, rate };
  };

  const teeShot = calcRate(h => h.par !== 3 && h.drive !== null, h => h.drive === 'O');
  const secondShot = calcRate(h => h.par === 5 && h.secondShotResult !== null, h => h.secondShotResult === 'O');
  const gir = calcRate(h => h.girResult !== null, h => h.girResult === 'O');
  const ud = calcRate(h => h.udResult !== null, h => h.udResult === 'O');
  const bunkerSave = calcRate(h => h.udDist === 'bunker_25' && h.udResult !== null, h => h.udResult === 'O');

  const totalPuttsFromHoles = holes.reduce((sum, h) => sum + (h.putts || 0), 0);
  const actualTotalPutts = totalPuttsFromHoles > 0 ? totalPuttsFromHoles : score.putts;
  const avgPutts = holes.length > 0 ? (actualTotalPutts / holes.length).toFixed(1) : (score.putts / 18).toFixed(1);
  const onePutts = holes.filter(h => h.putts === 1).length;
  const threePutts = holes.filter(h => h.putts >= 3).length;

  const girFirstPutts = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.girResult === 'O');
  const totalGirFirstPuttFt = girFirstPutts.reduce((sum, h) => sum + parseFloat(h.firstPuttFt), 0);
  const avgGirFirstPuttFt = girFirstPutts.length > 0 ? (totalGirFirstPuttFt / girFirstPutts.length).toFixed(1) : '-';

  const recFirstPutts = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.girResult === 'X'); 
  const totalRecFirstPuttFt = recFirstPutts.reduce((sum, h) => sum + parseFloat(h.firstPuttFt), 0);
  const avgRecFirstPuttFt = recFirstPutts.length > 0 ? (totalRecFirstPuttFt / recFirstPutts.length).toFixed(1) : '-';

  const secondPutts = holes.filter(h => h.putts >= 2 && h.puttDetails?.[1]?.distance && !isNaN(h.puttDetails[1].distance));
  const totalSecondPuttFt = secondPutts.reduce((sum, h) => sum + parseFloat(h.puttDetails[1].distance), 0);
  const avgSecondPuttFt = secondPutts.length > 0 ? (totalSecondPuttFt / secondPutts.length).toFixed(1) : '-';

  const totalPenaltyOB = holes.reduce((sum, h) => sum + (h.penaltyOB || 0), 0);
  const totalPenaltyHazard = holes.reduce((sum, h) => sum + (h.penaltyHazard || 0), 0);

  return (
    <div className="p-5 animate-fadeIn pb-24 h-full bg-gray-50">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-gray-800 leading-tight">{score.course}</h2>
          <div className="text-xs font-medium text-gray-500 mt-0.5">
            {score.date} • {score.type === 'tournament' ? `시합라운드${score.tournamentName ? ` (${score.tournamentName})` : ''}` : '연습라운드'}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="flex items-center justify-end gap-2 mb-0.5">
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</div>
             {userRole === 'student' && (
               <button 
                 onClick={() => onEdit && onEdit(score)} 
                 className="text-gray-400 hover:text-emerald-600 flex items-center gap-1 text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 shadow-sm active:bg-gray-100"
               >
                  <PenTool size={10} /> 수정
               </button>
             )}
          </div>
          <div className="text-2xl font-black text-emerald-600 leading-none">{score.total}</div>
          {(totalPenaltyOB > 0 || totalPenaltyHazard > 0) && (
            <div className="text-[9px] text-red-500 font-bold mt-1 whitespace-nowrap">
              OB {totalPenaltyOB} / 해저드 {totalPenaltyHazard}
            </div>
          )}
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-800 mb-3 px-1 flex items-center gap-2">
        <Activity size={16} className="text-emerald-500" />
        라운드 상세 분석
      </h3>

      <div className="space-y-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <DetailStatRow label="티샷 페어웨이 안착률" data={teeShot} color="text-purple-600" bg="bg-purple-50" icon={<Flag size={14}/>} onClick={() => onAnalyze('drive', '티샷 페어웨이 안착 실패 요인')} />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow label="세컨샷 페어웨이 안착률 (Par5)" data={secondShot} color="text-blue-600" bg="bg-blue-50" icon={<Target size={14}/>} onClick={() => onAnalyze('secondShot', '세컨샷(Par5) 실패 요인')} />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow label="그린적중률 (GIR)" data={gir} color="text-emerald-600" bg="bg-emerald-50" icon={<CircleDot size={14}/>} onClick={() => onAnalyze('gir', '그린적중률(GIR) 실패 요인')} />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow label="UP&DOWN 성공률" data={ud} color="text-orange-500" bg="bg-orange-50" icon={<RefreshCw size={14}/>} onClick={() => onAnalyze('ud', 'UP&DOWN 실패 요인')} />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow label="벙커 세이브율" data={bunkerSave} color="text-yellow-600" bg="bg-yellow-50" icon={<Mountain size={14}/>} onClick={() => onAnalyze('bunkerSave', '벙커 세이브 실패 요인')} />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow label="OB (아웃오브바운즈)" valueText={`${totalPenaltyOB}회`} color="text-red-600" bg="bg-red-50" icon={<span className="text-[10px] font-black leading-none">OB</span>} />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow label="해저드 (페널티구역)" valueText={`${totalPenaltyHazard}회`} color="text-orange-600" bg="bg-orange-50" icon={<span className="text-[10px] font-black leading-none">HZ</span>} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Putting Stats</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div onClick={() => onAnalyze('girFirstPuttDist', 'GIR 적중시 1st 퍼트 상세', 'putting')} className="flex flex-col items-center justify-center p-2 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 active:bg-blue-200 transition-colors relative group">
                <span className="text-[9px] font-bold text-blue-600 mb-1 whitespace-nowrap">GIR 1st 평균</span>
                <span className="text-lg font-black text-blue-700">{avgGirFirstPuttFt}<span className="text-[10px] font-normal ml-0.5">ft</span></span>
              </div>
              <div onClick={() => onAnalyze('recFirstPuttDist', '리커버리시 1st 퍼트 상세', 'putting')} className="flex flex-col items-center justify-center p-2 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 active:bg-orange-200 transition-colors relative group">
                <span className="text-[9px] font-bold text-orange-600 mb-1 whitespace-nowrap">리커버리 1st 평균</span>
                <span className="text-lg font-black text-orange-700">{avgRecFirstPuttFt}<span className="text-[10px] font-normal ml-0.5">ft</span></span>
              </div>
              <div onClick={() => onAnalyze('secondPuttDist', '2nd 퍼트 평균거리 상세', 'putting')} className="flex flex-col items-center justify-center p-2 bg-violet-50 rounded-xl border border-violet-100 cursor-pointer hover:bg-violet-100 active:bg-violet-200 transition-colors relative group">
                <span className="text-[9px] font-bold text-violet-600 mb-1 whitespace-nowrap">2nd 평균거리</span>
                <span className="text-lg font-black text-violet-700">{avgSecondPuttFt}<span className="text-[10px] font-normal ml-0.5">ft</span></span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 mb-1">평균 퍼팅수</span>
                <span className="text-xl font-black text-gray-800">{avgPutts}</span>
              </div>
              <div onClick={() => onAnalyze('onePutt', '1퍼팅 상세 기록', 'putting')} className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 active:bg-emerald-200 transition-colors relative group">
                <span className="text-[10px] font-bold text-emerald-600 mb-1">1퍼팅</span>
                <span className="text-xl font-black text-emerald-700">{onePutts}<span className="text-xs font-normal ml-0.5">회</span></span>
                <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-300 group-hover:text-emerald-500" />
              </div>
              <div onClick={() => onAnalyze('threePutt', '3퍼팅 이상 상세 기록', 'putting')} className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 active:bg-red-200 transition-colors relative group">
                <span className="text-[10px] font-bold text-red-600 mb-1">3퍼팅 이상</span>
                <span className="text-xl font-black text-red-700">{threePutts}<span className="text-xs font-normal ml-0.5">회</span></span>
                <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-300 group-hover:text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {score.roundReflection && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-2">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <PenTool size={16} className="text-emerald-500" />
              오늘 라운드 아쉬운 점
            </h3>
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed border border-gray-100 shadow-inner">
              {score.roundReflection}
            </div>
          </div>
        )}

        {/* 교습가 피드백 영역 */}
        {(score.instructorComment || userRole === 'instructor') && (
          <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-5 mt-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User size={16} className="text-slate-500" />
                교습가 코멘트
              </h3>
              {userRole === 'instructor' && !isEditingComment && (
                <button onClick={() => setIsEditingComment(true)} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline px-1">
                  {score.instructorComment ? '수정' : '작성'}
                </button>
              )}
            </div>

            {userRole === 'instructor' && isEditingComment ? (
              <div className="space-y-3 animate-fadeIn">
                <textarea
                  value={instructorComment}
                  onChange={(e) => setInstructorComment(e.target.value)}
                  placeholder="학생의 라운드에 대한 피드백을 남겨주세요."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[80px] resize-none shadow-sm"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingComment(false)} className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-200 rounded-lg font-bold transition-colors">취소</button>
                  <button onClick={handleSaveComment} className="px-4 py-2 text-xs bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">저장</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-700 bg-white p-4 rounded-xl whitespace-pre-wrap leading-relaxed border border-slate-100 shadow-sm">
                {score.instructorComment ? score.instructorComment : <span className="text-slate-400 italic">아직 코멘트가 없습니다.</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailStatRow({ label, data, valueText, color, bg, icon, onClick }) {
  return (
    <div 
      className={`flex items-center justify-between ${onClick ? 'cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors active:bg-gray-100' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${bg} ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-gray-700">{label}</span>
      </div>
      <div className="text-right flex items-center gap-2">
        <div className="flex items-center gap-3">
          {valueText ? (
            <span className="text-sm font-black text-gray-700">{valueText}</span>
          ) : (
            <span className="text-xs text-gray-400 font-medium">{data?.successes} / {data?.tries}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MissAnalysisView({ score, context, onBack }) {
  if (!score || !context) return null;

  const holes = score.detailedHoles || [];
  const reasonCounts = {};
  let totalMissHoles = 0;

  const resultKeyMap = { 'drive': 'drive', 'secondShot': 'secondShotResult', 'gir': 'girResult', 'ud': 'udResult', 'bunkerSave': 'udResult' };
  const reasonKeyMap = { 'drive': 'driveMissReason', 'secondShot': 'secondShotMissReason', 'gir': 'girMissReason', 'ud': 'udMissReason', 'bunkerSave': 'udMissReason' };
  const resultKey = resultKeyMap[context.statType];
  const reasonKey = reasonKeyMap[context.statType];

  holes.forEach(h => {
    if (context.statType === 'bunkerSave' && h.udDist !== 'bunker_25') return;
    if (h[resultKey] === 'X') {
      totalMissHoles++;
      if (h[reasonKey] && h[reasonKey].length > 0) {
        h[reasonKey].forEach(r => {
          reasonCounts[r] = (reasonCounts[r] || 0) + 1;
        });
      }
    }
  });

  const sortedReasons = Object.entries(reasonCounts)
    .map(([id, count]) => ({ ...MISS_REASONS.find(mr => mr.id === id), count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = sortedReasons.length > 0 ? sortedReasons[0].count : 0;

  return (
    <div className="p-5 animate-fadeIn pb-24 h-full bg-gray-50">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-black text-gray-800 leading-tight">{context.title}</h2>
          <div className="text-xs font-medium text-gray-500 mt-0.5">{score.course} • 총 {totalMissHoles}회 실패</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          요인별 분석 <span className="text-[10px] font-normal text-gray-400 ml-auto">(복수 선택 포함)</span>
        </h3>
        {sortedReasons.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-sm">기록된 실패 요인이 없습니다.</div>
        ) : (
          <div className="space-y-5">
            {sortedReasons.map((reason, idx) => {
              const percentage = totalMissHoles > 0 ? Math.round((reason.count / totalMissHoles) * 100) : 0;
              const barWidth = maxCount > 0 ? (reason.count / maxCount) * 100 : 0;
              const barColor = idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-400' : 'bg-emerald-400';
              return (
                <div key={reason.id} className="group">
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <span className="text-gray-400 p-1 bg-gray-50 rounded-md">{reason.icon}</span>
                      {reason.label}
                    </div>
                    <div className="text-xs font-bold text-gray-700">{percentage}% <span className="text-gray-400 font-normal">({reason.count}회)</span></div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${barColor} h-2.5 rounded-full transition-all duration-700 ease-out`} style={{ width: `${barWidth}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PuttingAnalysisView({ score, context, onBack }) {
  if (!score || !context) return null;

  const holes = score.detailedHoles || [];
  let displayHoles = [];
  let emptyMessage = "";

  if (context.statType === 'girFirstPuttDist') {
    displayHoles = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.girResult === 'O');
    emptyMessage = "GIR 적중 후 기록된 1st 퍼트 거리가 없습니다.";
  } else if (context.statType === 'recFirstPuttDist') {
    displayHoles = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.girResult === 'X');
    emptyMessage = "리커버 시도 후 기록된 1st 퍼트 거리가 없습니다.";
  } else if (context.statType === 'secondPuttDist') {
    displayHoles = holes.filter(h => h.putts >= 2 && h.puttDetails?.[1]?.distance && !isNaN(h.puttDetails[1].distance));
    emptyMessage = "기록된 2nd 퍼트 거리가 없습니다.";
  } else if (context.statType === 'onePutt') {
    displayHoles = holes.filter(h => h.putts === 1);
    emptyMessage = "1퍼팅 기록이 없습니다.";
  } else if (context.statType === 'threePutt') {
    displayHoles = holes.filter(h => h.putts >= 3);
    emptyMessage = "3퍼팅 이상 기록이 없습니다.";
  }

  const isDistanceStat = context.statType.includes('PuttDist');

  return (
    <div className="p-5 animate-fadeIn pb-24 h-full bg-gray-50">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-black text-gray-800 leading-tight">{context.title}</h2>
          <div className="text-xs font-medium text-gray-500 mt-0.5">{score.course} • 총 {displayHoles.length}홀</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {displayHoles.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-sm flex flex-col items-center justify-center">
            <Activity size={24} className="mb-2 text-gray-300" />
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayHoles.map(h => (
              <div key={h.hole} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-lg border-2
                    ${context.statType === 'girFirstPuttDist' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                      context.statType === 'recFirstPuttDist' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                      context.statType === 'secondPuttDist' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                      context.statType === 'onePutt' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      'bg-red-50 text-red-700 border-red-100'}`}>
                    {h.hole}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800 mb-0.5">Par {h.par}</div>
                    <div className="text-[11px] text-gray-500 font-medium">스코어: {h.score}타</div>
                  </div>
                </div>
                <div className="text-right">
                  {isDistanceStat ? (
                    <div>
                      <span className={`text-2xl font-black ${
                        context.statType === 'girFirstPuttDist' ? 'text-blue-600' : 
                        context.statType === 'recFirstPuttDist' ? 'text-orange-600' : 
                        'text-violet-600'
                      }`}>
                        {context.statType === 'secondPuttDist' ? h.puttDetails[1].distance : h.firstPuttFt}
                      </span>
                      <span className={`text-xs font-bold ${
                        context.statType === 'girFirstPuttDist' ? 'text-blue-400' : 
                        context.statType === 'recFirstPuttDist' ? 'text-orange-400' : 
                        'text-violet-400'
                      } ml-1`}>ft</span>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-2xl font-black ${context.statType === 'onePutt' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {h.putts}
                      </span>
                      <span className="text-xs font-bold text-gray-400 ml-1">퍼트</span>
                    </div>
                  )}
                  {context.statType === 'secondPuttDist' && h.firstPuttFt && (
                     <div className="text-[11px] font-medium text-gray-400 mt-0.5">1st 퍼트: <span className="font-bold text-gray-600">{h.firstPuttFt}ft</span></div>
                  )}
                  {!isDistanceStat && h.firstPuttFt && (
                     <div className="text-[11px] font-medium text-gray-400 mt-0.5">1st 퍼트 거리: <span className="font-bold text-gray-600">{h.firstPuttFt}ft</span></div>
                  )}
                  {isDistanceStat && context.statType !== 'secondPuttDist' && (
                     <div className="text-[11px] font-medium text-gray-400 mt-0.5">결과: <span className="font-bold text-gray-600">{h.putts}퍼트</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddScoreDetailedView({ 
  onSaveScore, setCurrentTab,
  step, setStep,
  info, setInfo,
  holes, setHoles,
  currentHoleIdx, setCurrentHoleIdx,
  editingScoreId,
  onReset
}) {
  const curHole = holes[currentHoleIdx];

  const updateCurHole = (key, value) => {
    const newHoles = [...holes];
    newHoles[currentHoleIdx] = { ...newHoles[currentHoleIdx], [key]: value };
    setHoles(newHoles);
  };

  const updateNestedCurHole = (key1, val1, key2, val2) => {
    const newHoles = [...holes];
    newHoles[currentHoleIdx] = { ...newHoles[currentHoleIdx], [key1]: val1, [key2]: val2 };
    setHoles(newHoles);
  }

  const updatePuttDetail = (puttIndex, field, value) => {
    if (value !== '' && Number(value) < 0) return;

    const newHoles = [...holes];
    const currentHole = newHoles[currentHoleIdx];
    
    const currentDetails = currentHole.puttDetails || Array.from({length: 4}, () => ({ distance: '', hook: '', slice: '', downhill: '', uphill: '' }));
    const newDetails = [...currentDetails];
    
    newDetails[puttIndex] = { ...newDetails[puttIndex], [field]: value };
    
    if (puttIndex === 0 && field === 'distance') {
      newHoles[currentHoleIdx] = { ...currentHole, puttDetails: newDetails, firstPuttFt: value };
    } else {
      newHoles[currentHoleIdx] = { ...currentHole, puttDetails: newDetails };
    }
    
    setHoles(newHoles);
  };

  const handleNextHole = () => {
    if (currentHoleIdx < 17) setCurrentHoleIdx(prev => prev + 1);
  };

  const handlePrevHole = () => {
    if (currentHoleIdx > 0) setCurrentHoleIdx(prev => prev - 1);
  };

  const calculateTotals = () => {
    const totalScore = holes.reduce((sum, h) => sum + h.score, 0);
    const totalPutts = holes.reduce((sum, h) => sum + h.putts, 0);
    const totalFairways = holes.filter(h => h.drive === 'O' && h.par !== 3).length; 
    const totalPenaltyOB = holes.reduce((sum, h) => sum + (h.penaltyOB || 0), 0);
    const totalPenaltyHazard = holes.reduce((sum, h) => sum + (h.penaltyHazard || 0), 0);
    return { totalScore, totalPutts, totalFairways, totalPenaltyOB, totalPenaltyHazard };
  };

  const handleSave = async () => {
    if (!info.course) {
      alert('골프장 이름을 입력해주세요.');
      setStep(1);
      return;
    }
    if (info.type === 'tournament' && !info.tournamentName) {
      alert('시합 이름을 입력해주세요.');
      setStep(1);
      return;
    }
    
    const { totalScore, totalPutts, totalFairways } = calculateTotals();
    
    const newScore = {
      id: editingScoreId || Date.now(), 
      date: info.date,
      course: info.course,
      type: info.type,
      tournamentName: info.type === 'tournament' ? info.tournamentName : null,
      greenSpeed: info.greenSpeed,
      temperature: info.temperature,
      wind: info.wind,
      isRaining: info.isRaining,
      precipitation: info.precipitation,
      roundReflection: info.roundReflection,
      total: totalScore,
      putts: totalPutts,
      fairways: totalFairways,
      detailedHoles: holes 
    };

    if (onSaveScore) {
      await onSaveScore(newScore);
    }
    
    alert(editingScoreId ? '라운드 기록이 성공적으로 수정되었습니다!' : '새로운 스코어가 성공적으로 저장되었습니다!');
    
    onReset(); 
    setCurrentTab('dashboard');
  };

  const calcStats = (conditionFn, successFn) => {
    const validHoles = holes.filter(conditionFn);
    const tries = validHoles.length;
    const successes = validHoles.filter(successFn).length;
    const rate = tries > 0 ? Math.round((successes / tries) * 100) : 0;
    return { try: tries, sus: successes, rate: rate };
  };

  const girStatsGrouped = {
    wood: calcStats(h => ['3w', '4w', '5w'].includes(h.girClub), h => h.girResult === 'O'),
    hybrid: calcStats(h => ['2h', '3h', '4h', '5h'].includes(h.girClub), h => h.girResult === 'O'),
    longIron: calcStats(h => ['2i', '3i', '4i', '5i'].includes(h.girClub), h => h.girResult === 'O'),
    midIron: calcStats(h => ['6i', '7i', '8i'].includes(h.girClub), h => h.girResult === 'O'),
    shortIron: calcStats(h => ['9i', 'pw'].includes(h.girClub), h => h.girResult === 'O'),
    wedge: calcStats(h => ['50°', '52°', '54°', '56°', '58°', '60°'].includes(h.girClub), h => h.girResult === 'O'),
  };

  const statsData = {
    drive: calcStats(h => h.drive !== null && h.par !== 3, h => h.drive === 'O'), 
    ud50100: calcStats(h => h.udDist === '50-100' && h.udResult !== null, h => h.udResult === 'O'),
    ud2550: calcStats(h => h.udDist === '25-50' && h.udResult !== null, h => h.udResult === 'O'),
    ud25: calcStats(h => h.udDist === '-25' && h.udResult !== null, h => h.udResult === 'O'),
    udBunker25: calcStats(h => h.udDist === 'bunker_25' && h.udResult !== null, h => h.udResult === 'O')
  };

  if (step === 1) {
    const windOptions = ['무풍', '반클럽', '한클럽', '두클럽', '세 클럽 이상'];

    return (
      <div className="p-5 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {editingScoreId ? '라운드 기록 수정' : '라운드 정보 입력'}
          </h2>
          <button 
            onClick={onReset} 
            className="text-[11px] font-bold text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:text-emerald-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={12} className="inline mr-1 mb-0.5" /> 
            새로 작성 (초기화)
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">라운드 종류</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <input type="radio" value="practice" checked={info.type === 'practice'} onChange={e => setInfo({...info, type: e.target.value})} className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                <span className="text-sm text-gray-700 font-bold">연습라운드</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <input type="radio" value="tournament" checked={info.type === 'tournament'} onChange={e => setInfo({...info, type: e.target.value})} className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                <span className="text-sm text-gray-700 font-bold">시합라운드</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">날짜</label>
            <input type="date" value={info.date} onChange={e => setInfo({...info, date: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">골프장 이름</label>
            <input type="text" placeholder="예) 태광 CC" value={info.course} onChange={e => setInfo({...info, course: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
          </div>
          {info.type === 'tournament' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-bold text-gray-700 mb-2">시합 이름</label>
              <input type="text" placeholder="예) 전국 청소년 골프대회" value={info.tournamentName || ''} onChange={e => setInfo({...info, tournamentName: e.target.value})} className="w-full p-3 bg-emerald-50/30 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">그린 스피드 (m)</label>
            <div className="flex gap-2">
              {['2.3', '2.5', '2.7', '3.0'].map(speed => (
                <button
                  key={speed}
                  onClick={() => setInfo({...info, greenSpeed: info.greenSpeed === speed ? '' : speed})}
                  className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg border transition-all ${info.greenSpeed === speed ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {speed}m
                </button>
              ))}
              <input
                type="number"
                step="0.1"
                value={info.greenSpeed}
                onChange={e => setInfo({...info, greenSpeed: e.target.value})}
                placeholder="직접입력"
                className="flex-1 w-full text-center border border-gray-200 rounded-lg text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer size={18} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-800">날씨 및 환경</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">기온 (°C)</label>
                <input 
                  type="number" 
                  placeholder="예) 18" 
                  value={info.temperature}
                  onChange={e => setInfo({...info, temperature: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">강수 여부</label>
                <button
                  onClick={() => setInfo({...info, isRaining: !info.isRaining, precipitation: !info.isRaining ? info.precipitation : ''})}
                  className={`w-full p-3 rounded-lg border focus:outline-none transition-all flex items-center justify-center gap-2 text-sm font-bold
                    ${info.isRaining ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-inner' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                >
                  <CloudRain size={16} />
                  {info.isRaining ? '비 옴' : '비 안 옴'}
                </button>
              </div>
            </div>

            {info.isRaining && (
              <div className="animate-fadeIn bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-2">
                <label className="block text-xs font-bold text-blue-600 mb-1">예상 강수량 (mm)</label>
                <input
                  type="number"
                  placeholder="예) 5"
                  value={info.precipitation}
                  onChange={e => setInfo({...info, precipitation: e.target.value})}
                  className="w-full p-2.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-medium text-blue-800 placeholder-blue-300"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-1 mb-2">
                <Wind size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-gray-600 tracking-tight">바람 세기</span>
                <span className="text-[10px] text-gray-400 font-medium ml-1">(클럽 조절 기준)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {windOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setInfo({...info, wind: info.wind === opt ? '' : opt})}
                    className={`px-3 py-2 text-[11px] font-bold rounded-full border transition-all
                      ${info.wind === opt 
                        ? 'bg-blue-600 border-blue-700 text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => setStep(2)} className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-black transition-colors mt-6 flex justify-center items-center gap-2">
          상세 스코어 입력 시작 <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  if (step === 2) {
    const teeClubs = [
      { id: 'DR', label: 'DR' }, { id: '3W', label: '3W' }, { id: '5W', label: '5W' },
      { id: '3H', label: '3H' }, { id: '4H', label: '4H' }, { id: '5H', label: '5H' },
      { id: '2I', label: '2I' }, { id: '3I', label: '3I' }, { id: '4I', label: '4I' }
    ];

    const secondClubGroups = [
      { title: 'Woods', clubs: ['3w', '4w', '5w'] },
      { title: 'Hybrids', clubs: ['2h', '3h', '4h', '5h'] },
      { title: 'Irons', clubs: ['2i', '3i', '4i', '5i', '6i', '7i', '8i'] }
    ];

    const girClubGroups = [
      { title: 'Woods', clubs: ['3w', '4w', '5w'] },
      { title: 'Hybrids', clubs: ['2h', '3h', '4h', '5h'] },
      { title: 'Irons', clubs: ['2i', '3i', '4i', '5i', '6i', '7i', '8i', '9i', 'pw'] },
      { title: 'Wedges', clubs: ['50°', '52°', '54°', '56°', '58°', '60°'] }
    ];

    const driveMissReasons = MISS_REASONS.slice(0, 7);
    const girMissReasons = MISS_REASONS.slice(0, 8);
    const udMissReasons = MISS_REASONS; 

    const udClubs = ['7i', '8i', '9i', 'pw', '50°', '52°', '54°', '56°', '58°', '60°'];
    const bunkerClubs = ['9i', 'pw', '50°', '52°', '54°', '56°', '58°', '60°'];

    const handleUdDistChange = (dist) => {
      const newDist = curHole.udDist === dist ? null : dist;
      let newClub = curHole.udClub;
      
      if (newDist === 'bunker_25' && newClub && !bunkerClubs.includes(newClub)) {
         newClub = null;
      }
      
      const newHoles = [...holes];
      newHoles[currentHoleIdx] = { ...newHoles[currentHoleIdx], udDist: newDist, udClub: newClub };
      setHoles(newHoles);
    };

    const getScoreEmoji = (score, par) => {
      const diff = score - par;
      if (diff >= 1) return ' 😭'; 
      if (diff === 0) return ' 🙂'; 
      if (diff === -1) return ' 😄'; 
      if (diff <= -2) return ' 🤩'; 
      return '';
    };

    const getPuttEmoji = (p) => {
      if (p >= 3) return ' 😭';
      if (p === 2) return ' 🙂';
      if (p === 1) return ' 😄';
      if (p === 0) return ' 🤩'; 
      return '';
    };

    return (
      <div className="flex flex-col h-full bg-gray-100">
        <div className="bg-white border-b border-gray-200 px-2 py-3 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 sticky top-0 z-20">
          {holes.map((h, idx) => (
            <button 
              key={h.hole}
              onClick={() => setCurrentHoleIdx(idx)}
              className={`w-10 h-10 flex-shrink-0 rounded-full font-bold text-sm flex items-center justify-center transition-colors
                ${currentHoleIdx === idx ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
            >
              {h.hole}
            </button>
          ))}
        </div>

        <div className="p-4 flex-1 overflow-y-auto animate-fadeIn pb-32">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-emerald-900">Hole {curHole.hole}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-tighter">Par</span>
                <div className="flex bg-white rounded-lg border border-emerald-200 p-0.5 shadow-sm">
                  {[3, 4, 5].map(p => (
                    <button
                      key={p}
                      onClick={() => updateNestedCurHole('par', p, 'score', p)}
                      className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${curHole.par === p ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Stepper 
                  label={`스코어 (Score)${getScoreEmoji(curHole.score, curHole.par)}`} 
                  value={curHole.score} 
                  onChange={v => updateCurHole('score', v)} 
                />
                <Stepper 
                  label={`퍼트 (Putts)${getPuttEmoji(curHole.putts)}`} 
                  value={curHole.putts} 
                  onChange={v => updateCurHole('putts', v)} 
                />
              </div>

              {/* 패널티 입력 영역 */}
              <div className="bg-red-50/40 p-4 rounded-xl border border-red-100 shadow-sm">
                <label className="block text-[11px] font-black text-red-800 mb-3 uppercase tracking-tight flex items-center justify-between">
                  패널티 (Penalty)
                  <span className="text-[9px] font-normal text-red-400">최대 5회까지 입력</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Stepper 
                    label="OB" 
                    value={curHole.penaltyOB || 0} 
                    onChange={v => updateCurHole('penaltyOB', Math.min(5, Math.max(0, v)))} 
                    bgClass="bg-white"
                  />
                  <Stepper 
                    label="해저드" 
                    value={curHole.penaltyHazard || 0} 
                    onChange={v => updateCurHole('penaltyHazard', Math.min(5, Math.max(0, v)))} 
                    bgClass="bg-white"
                  />
                </div>
              </div>

              {/* 동적 퍼팅 상세 입력 영역 */}
              {curHole.putts > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-[11px] font-black text-emerald-800 mb-3 uppercase tracking-tight flex items-center justify-between">
                    퍼팅 상세 기록 (거리 및 경사도)
                    <span className="text-[9px] font-normal text-gray-400">단위: ft, %</span>
                  </label>
                  <div className="space-y-3">
                    {Array.from({ length: Math.min(curHole.putts, 4) }).map((_, idx) => {
                      const pDetail = curHole.puttDetails?.[idx] || { distance: '', hook: '', slice: '', downhill: '', uphill: '' };
                      const puttLabel = ['1st', '2nd', '3rd', '4th'][idx] || `${idx + 1}th`;
                      return (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm animate-slideUp">
                          <div className="text-[10px] font-black text-gray-700 mb-2 uppercase">{puttLabel} Putt</div>
                          <div className="grid grid-cols-5 gap-1.5">
                            <div className="flex flex-col">
                              <label className="text-[8px] font-bold text-gray-400 text-center mb-1">거리(ft)</label>
                              <input type="number" min="0" value={pDetail.distance} onChange={(e) => updatePuttDetail(idx, 'distance', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-center text-[11px] font-bold focus:ring-1 focus:ring-emerald-500" placeholder="ft" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[8px] font-bold text-blue-500 text-center mb-1">훅(%)</label>
                              <input type="number" min="0" value={pDetail.hook} onChange={(e) => updatePuttDetail(idx, 'hook', e.target.value)} className="w-full bg-blue-50/30 border border-blue-100 rounded p-1.5 text-center text-[11px] font-bold text-blue-700 focus:ring-1 focus:ring-blue-500" placeholder="%" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[8px] font-bold text-orange-500 text-center mb-1">슬라이스</label>
                              <input type="number" min="0" value={pDetail.slice} onChange={(e) => updatePuttDetail(idx, 'slice', e.target.value)} className="w-full bg-orange-50/30 border border-orange-100 rounded p-1.5 text-center text-[11px] font-bold text-orange-700 focus:ring-1 focus:ring-orange-500" placeholder="%" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[8px] font-bold text-cyan-600 text-center mb-1">내리막</label>
                              <input type="number" min="0" value={pDetail.downhill} onChange={(e) => updatePuttDetail(idx, 'downhill', e.target.value)} className="w-full bg-cyan-50/30 border border-cyan-100 rounded p-1.5 text-center text-[11px] font-bold text-cyan-700 focus:ring-1 focus:ring-cyan-500" placeholder="%" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[8px] font-bold text-rose-500 text-center mb-1">오르막</label>
                              <input type="number" min="0" value={pDetail.uphill} onChange={(e) => updatePuttDetail(idx, 'uphill', e.target.value)} className="w-full bg-rose-50/30 border border-rose-100 rounded p-1.5 text-center text-[11px] font-bold text-rose-700 focus:ring-1 focus:ring-rose-500" placeholder="%" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <hr className="border-gray-100" />

              {curHole.par !== 3 && (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                       티샷 클럽 (Tee Shot Club)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {teeClubs.map(club => (
                        <button
                          key={club.id}
                          onClick={() => updateCurHole('teeClub', curHole.teeClub === club.id ? null : club.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all 
                            ${curHole.teeClub === club.id 
                              ? 'bg-slate-700 border-slate-800 text-white shadow-md scale-[1.02]' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                          <CircleDot size={14} className={curHole.teeClub === club.id ? 'text-yellow-400' : 'text-slate-300'} />
                          <span className="text-[11px] font-black mt-1 uppercase tracking-tighter">{club.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase tracking-tight">Drive on Fairway (페어웨이 안착)</label>
                    <div className="flex gap-2">
                      <SelectBtn active={curHole.drive === 'O'} onClick={() => updateNestedCurHole('drive', curHole.drive === 'O' ? null : 'O', 'driveMissReason', [])} color="blue">성공 (O)</SelectBtn>
                      <SelectBtn active={curHole.drive === 'X'} onClick={() => updateCurHole('drive', curHole.drive === 'X' ? null : 'X')} color="red">실패 (X)</SelectBtn>
                    </div>

                    {curHole.drive === 'X' && (
                      <div className="mt-3 bg-red-50/50 p-3 rounded-xl border border-red-100 animate-slideUp">
                        <div className="text-[10px] font-bold text-red-600 mb-2 uppercase tracking-tight">미스 요인 분석</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {driveMissReasons.map(reason => {
                            const isSelected = (curHole.driveMissReason || []).includes(reason.id);
                            return (
                              <button
                                key={reason.id}
                                onClick={() => {
                                  const currentReasons = curHole.driveMissReason || [];
                                  const newReasons = isSelected 
                                    ? currentReasons.filter(r => r !== reason.id) 
                                    : [...currentReasons, reason.id];
                                  updateCurHole('driveMissReason', newReasons);
                                }}
                                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[10px] font-bold transition-all
                                  ${isSelected 
                                    ? 'bg-red-500 border-red-600 text-white shadow-sm scale-[1.05]' 
                                    : 'bg-white border-red-100 text-red-400 hover:bg-red-50'}`}
                              >
                                <div className="mb-1">{reason.icon}</div>
                                <span className="whitespace-nowrap">{reason.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <hr className="border-gray-100" />
                </>
              )}

              {curHole.par === 5 && (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-tight">
                       세컨샷 클럽 (Par 5 전용)
                    </label>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide mb-5">
                      {secondClubGroups.map(group => (
                        <div key={group.title}>
                          <div className="text-[10px] font-bold text-emerald-600 mb-1.5 uppercase tracking-widest pl-1">{group.title}</div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {group.clubs.map(club => (
                              <button
                                key={club}
                                onClick={() => updateCurHole('secondClub', curHole.secondClub === club ? null : club)}
                                className={`py-2 text-[11px] font-black rounded-md border transition-all
                                  ${curHole.secondClub === club 
                                    ? 'bg-slate-700 border-slate-800 text-white shadow-sm scale-[1.02]' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                              >
                                {club.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 animate-fadeIn">
                      <div className="text-[11px] text-gray-500 mb-2 font-bold">세컨샷 페어웨이 안착 여부</div>
                      <div className="flex gap-2">
                        <SelectBtn active={curHole.secondShotResult === 'O'} onClick={() => updateNestedCurHole('secondShotResult', curHole.secondShotResult === 'O' ? null : 'O', 'secondShotMissReason', [])} color="blue">성공 (O)</SelectBtn>
                        <SelectBtn active={curHole.secondShotResult === 'X'} onClick={() => updateCurHole('secondShotResult', curHole.secondShotResult === 'X' ? null : 'X')} color="red">실패 (X)</SelectBtn>
                      </div>

                      {curHole.secondShotResult === 'X' && (
                        <div className="mt-3 bg-red-50/50 p-3 rounded-xl border border-red-100 animate-slideUp">
                          <div className="text-[10px] font-bold text-red-600 mb-2 uppercase tracking-tight">세컨샷 미스 요인 분석</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {driveMissReasons.map(reason => {
                              const isSelected = (curHole.secondShotMissReason || []).includes(reason.id);
                              return (
                                <button
                                  key={reason.id}
                                  onClick={() => {
                                    const currentReasons = curHole.secondShotMissReason || [];
                                    const newReasons = isSelected 
                                      ? currentReasons.filter(r => r !== reason.id) 
                                      : [...currentReasons, reason.id];
                                    updateCurHole('secondShotMissReason', newReasons);
                                  }}
                                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[10px] font-bold transition-all
                                    ${isSelected 
                                      ? 'bg-red-500 border-red-600 text-white shadow-sm scale-[1.05]' 
                                      : 'bg-white border-red-100 text-red-400 hover:bg-red-50'}`}
                                >
                                  <div className="mb-1">{reason.icon}</div>
                                  <span className="whitespace-nowrap">{reason.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                </>
              )}

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 font-black uppercase tracking-tight">GIR (그린 적중)</label>
                
                <div className="text-[11px] text-gray-500 mb-3">그린 공략 클럽 선택 (선택 사항)</div>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide mb-5">
                  {girClubGroups.map(group => (
                    <div key={group.title}>
                      <div className="text-[10px] font-bold text-emerald-600 mb-1.5 uppercase tracking-widest pl-1">{group.title}</div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {group.clubs.map(club => (
                          <button
                            key={club}
                            onClick={() => updateCurHole('girClub', curHole.girClub === club ? null : club)}
                            className={`py-2 text-[11px] font-black rounded-md border transition-all
                              ${curHole.girClub === club 
                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' 
                                : 'bg-white border-gray-200 text-gray-600'}`}
                          >
                            {club.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 animate-fadeIn">
                  <div className="text-[11px] text-gray-500 mb-2">적중 결과 선택</div>
                  <div className="flex gap-2">
                    <SelectBtn active={curHole.girResult === 'O'} onClick={() => updateNestedCurHole('girResult', curHole.girResult === 'O' ? null : 'O', 'girMissReason', [])} color="blue">성공 (O)</SelectBtn>
                    <SelectBtn active={curHole.girResult === 'X'} onClick={() => updateCurHole('girResult', curHole.girResult === 'X' ? null : 'X')} color="red">실패 (X)</SelectBtn>
                  </div>

                  {curHole.girResult === 'X' && (
                    <div className="mt-3 bg-red-50/50 p-3 rounded-xl border border-red-100 animate-slideUp">
                      <div className="text-[10px] font-bold text-red-600 mb-2 uppercase tracking-tight">GIR 실패 요인 분석</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {girMissReasons.map(reason => {
                          const isSelected = (curHole.girMissReason || []).includes(reason.id);
                          return (
                            <button
                              key={reason.id}
                              onClick={() => {
                                const currentReasons = curHole.girMissReason || [];
                                const newReasons = isSelected 
                                  ? currentReasons.filter(r => r !== reason.id) 
                                  : [...currentReasons, reason.id];
                                updateCurHole('girMissReason', newReasons);
                              }}
                              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[10px] font-bold transition-all
                                ${isSelected 
                                  ? 'bg-red-500 border-red-600 text-white shadow-sm scale-[1.05]' 
                                  : 'bg-white border-red-100 text-red-400 hover:bg-red-50'}`}
                            >
                              <div className="mb-1">{reason.icon}</div>
                              <span className="whitespace-nowrap">{reason.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {curHole.girResult === 'X' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 animate-slideUp">
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-emerald-800">리커버리 (UP&DOWN)</label>
                  <div className="text-xs text-gray-500 mb-2">1. 상황 및 거리 선택</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <SelectBtn size="sm" active={curHole.udDist === '50-100'} onClick={() => handleUdDistChange('50-100')}>50~100m</SelectBtn>
                    <SelectBtn size="sm" active={curHole.udDist === '25-50'} onClick={() => handleUdDistChange('25-50')}>25~50m</SelectBtn>
                    <SelectBtn size="sm" active={curHole.udDist === '-25'} onClick={() => handleUdDistChange('-25')}>-25m</SelectBtn>
                    <SelectBtn size="sm" active={curHole.udDist === 'bunker_25'} onClick={() => handleUdDistChange('bunker_25')}>-25m 벙커</SelectBtn>
                  </div>
                  
                  {curHole.udDist && (
                    <div className="animate-slideUp border-t border-gray-200 pt-3 mt-3">
                      <div className="text-xs text-gray-500 mb-2">2. 사용 클럽 선택</div>
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
                        {(curHole.udDist === 'bunker_25' ? bunkerClubs : udClubs).map(club => (
                          <button
                            key={club}
                            onClick={() => updateNestedCurHole('udClub', curHole.udClub === club ? null : club, 'udResult', null)}
                            className={`py-2 text-[11px] font-black rounded-md border transition-all
                              ${curHole.udClub === club 
                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50'}`}
                          >
                            {club.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {curHole.udClub && (
                        <div className="animate-slideUp border-t border-gray-200 pt-3 mt-3">
                          <div className="text-xs text-gray-500 mb-2">3. 세이브 결과</div>
                          <div className="flex gap-2">
                            <SelectBtn active={curHole.udResult === 'O'} onClick={() => updateNestedCurHole('udResult', curHole.udResult === 'O' ? null : 'O', 'udMissReason', [])} color="blue">성공 (O)</SelectBtn>
                            <SelectBtn active={curHole.udResult === 'X'} onClick={() => updateCurHole('udResult', curHole.udResult === 'X' ? null : 'X')} color="red">실패 (X)</SelectBtn>
                          </div>

                          {curHole.udResult === 'X' && (
                            <div className="mt-3 bg-red-50/50 p-3 rounded-xl border border-red-100 animate-slideUp">
                              <div className="text-[10px] font-bold text-red-600 mb-2 uppercase tracking-tight">리커버리 실패 요인 분석</div>
                              <div className="grid grid-cols-4 gap-1.5">
                                {udMissReasons.map(reason => {
                                  const isSelected = (curHole.udMissReason || []).includes(reason.id);
                                  return (
                                    <button
                                      key={reason.id}
                                      onClick={() => {
                                        const currentReasons = curHole.udMissReason || [];
                                        const newReasons = isSelected 
                                          ? currentReasons.filter(r => r !== reason.id) 
                                          : [...currentReasons, reason.id];
                                        updateCurHole('udMissReason', newReasons);
                                      }}
                                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-[10px] font-bold transition-all
                                        ${isSelected 
                                          ? 'bg-red-500 border-red-600 text-white shadow-sm scale-[1.05]' 
                                          : 'bg-white border-red-100 text-red-400 hover:bg-red-50'}`}
                                    >
                                      <div className="mb-1">{reason.icon}</div>
                                      <span className="whitespace-nowrap text-[9px]">{reason.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentHoleIdx === 17 && (
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mt-4 animate-slideUp">
                  <label className="block text-sm font-black text-emerald-800 mb-3 flex items-center gap-2">
                    <PenTool size={16} className="text-emerald-600" />
                    오늘 라운드 아쉬운 점 (총평)
                  </label>
                  <textarea
                    value={info.roundReflection || ''}
                    onChange={(e) => setInfo({...info, roundReflection: e.target.value})}
                    placeholder="오늘 라운드에서 아쉬웠던 점이나 보완해야 할 부분을 자유롭게 적어주세요."
                    className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] resize-none shadow-sm"
                  />
                </div>
              )}

            </div>
          </div>

          {currentHoleIdx === 0 && (
            <div className="mt-6 flex justify-center animate-fadeIn">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 transition-all hover:bg-gray-50 active:scale-95"
              >
                <ChevronLeft size={18} />
                라운드 설정(이전 화면)으로 돌아가기
              </button>
            </div>
          )}

        </div>

        <div className="fixed bottom-[60px] w-full max-w-md bg-white border-t border-gray-200 p-3 flex gap-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-10">
          <button onClick={handlePrevHole} disabled={currentHoleIdx === 0} className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 disabled:opacity-30"><ChevronLeft size={24} /></button>
          
          {currentHoleIdx < 17 ? (
             <button onClick={handleNextHole} className="flex-1 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2">다음 홀 <ChevronRight size={20} /></button>
          ) : (
             <button onClick={() => setStep(3)} className="flex-1 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"><TableProperties size={20} /> 데이터 요약 보기</button>
          )}
        </div>
      </div>
    );
  }

  if (step === 3) {
    const { totalScore, totalPutts, totalPenaltyOB, totalPenaltyHazard } = calculateTotals();
    
    return (
      <div className="p-4 animate-fadeIn pb-24 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => setStep(2)} 
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">통계 요약 (수식 결과)</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 flex-1">
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
            <div>
              <div className="text-xs text-gray-400">Total Score</div>
              <div className="text-3xl font-black">{totalScore}</div>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
               <div className="text-[10px] text-gray-400">
                 {info.greenSpeed ? `그린 ${info.greenSpeed}m ` : ''}
                 {info.temperature ? `${info.temperature}°C ` : ''} 
                 {info.wind ? `${info.wind} ` : ''}
                 {info.isRaining && info.precipitation ? `🌧️${info.precipitation}mm` : ''}
               </div>
               <div className="text-xs font-bold text-gray-200 bg-gray-700 px-2 py-1 rounded">
                 🚨 OB <span className="text-red-400">{totalPenaltyOB}</span> | 해저드 <span className="text-red-400">{totalPenaltyHazard}</span>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-bold">항목 (기준)</th>
                  <th className="px-3 py-3 text-center font-bold">Try</th>
                  <th className="px-3 py-3 text-center font-bold">Sus(O)</th>
                  <th className="px-3 py-3 text-center font-bold">% (Rate)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <StatRow label="Drive on Fairway" stats={statsData.drive} color="bg-purple-50" />
                <StatRow label="GIR Woods" stats={girStatsGrouped.wood} color="bg-green-50" />
                <StatRow label="GIR Hybrids" stats={girStatsGrouped.hybrid} color="bg-green-50" />
                <StatRow label="GIR Long Iron (2-5)" stats={girStatsGrouped.longIron} color="bg-green-50" />
                <StatRow label="GIR Mid Iron (6-8)" stats={girStatsGrouped.midIron} color="bg-green-50" />
                <StatRow label="GIR Short Iron (9,P)" stats={girStatsGrouped.shortIron} color="bg-green-50" />
                <StatRow label="GIR Wedges" stats={girStatsGrouped.wedge} color="bg-green-50" />
                <StatRow label="UP&DOWN 50-100" stats={statsData.ud50100} color="bg-orange-50" />
                <StatRow label="UP&DOWN 25-50" stats={statsData.ud2550} color="bg-orange-50" />
                <StatRow label="UP&DOWN -25" stats={statsData.ud25} color="bg-orange-50" />
                <StatRow label="UP&DOWN -25 벙커" stats={statsData.udBunker25} color="bg-orange-50" />
              </tbody>
            </table>
          </div>
        </div>

        <button onClick={handleSave} className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2">
          <Save size={20} /> {editingScoreId ? '수정된 기록 저장하기' : '최종 기록 저장하기'}
        </button>
      </div>
    );
  }
}

function Stepper({ label, value, onChange, bgClass = 'bg-gray-50' }) {
  return (
    <div className={`${bgClass} border border-gray-200 rounded-xl p-3 flex flex-col items-center`}>
      <span className="text-xs font-bold text-gray-500 mb-2">{label}</span>
      <div className="flex items-center gap-3 w-full justify-between">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-600 flex items-center justify-center font-bold shadow-sm">-</button>
        <span className="text-xl font-black text-gray-800 w-8 text-center">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-600 flex items-center justify-center font-bold shadow-sm">+</button>
      </div>
    </div>
  );
}

function SelectBtn({ children, active, onClick, color = 'emerald', size = 'md' }) {
  const baseClass = "flex-1 rounded-lg border font-bold transition-all flex justify-center items-center text-center";
  const sizeClass = size === 'sm' ? "py-2 text-xs" : "py-3 text-sm";
  
  let colorClass = "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
  if (active) {
    if (color === 'emerald') colorClass = "bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20";
    if (color === 'blue') colorClass = "bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-500/20";
    if (color === 'red') colorClass = "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-500/20";
  }

  return (
    <button onClick={onClick} className={`${baseClass} ${sizeClass} ${colorClass}`}>
      {children}
    </button>
  );
}

function StatRow({ label, stats, color }) {
  return (
    <tr className={color}>
      <td className="px-4 py-3 font-semibold text-gray-800 border-r border-gray-100">{label}</td>
      <td className="px-3 py-3 text-center text-gray-600 bg-white/50">{stats.try}</td>
      <td className="px-3 py-3 text-center text-gray-600 bg-white/50">{stats.sus}</td>
      <td className="px-3 py-3 text-center font-bold text-emerald-600 bg-white/80">{stats.rate}</td>
    </tr>
  );
}

function StatsView({ scores }) {
  const [filterType, setFilterType] = useState('all');
  const [selectedMetrics, setSelectedMetrics] = useState(['gir']);
  const [selectedRoundIds, setSelectedRoundIds] = useState([]);
  const [isRoundListExpanded, setIsRoundListExpanded] = useState(false);
  const [activeChartIdx, setActiveChartIdx] = useState(null); 

  const METRICS = [
    { id: 'teeShot', label: '티샷 페어웨이 안착률', unit: '%', strokeHex: '#9333ea', bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-500' },
    { id: 'secondShot', label: '세컨샷 페어웨이 안착률', unit: '%', strokeHex: '#2563eb', bgClass: 'bg-blue-100', textClass: 'text-blue-700', borderClass: 'border-blue-500' },
    { id: 'gir', label: '그린적중률(GIR)', unit: '%', strokeHex: '#10b981', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', borderClass: 'border-emerald-500' },
    { id: 'ud', label: 'UP&DOWN 성공률', unit: '%', strokeHex: '#f97316', bgClass: 'bg-orange-100', textClass: 'text-orange-700', borderClass: 'border-orange-500' },
    { id: 'bunkerSave', label: '벙커 세이브율', unit: '%', strokeHex: '#eab308', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', borderClass: 'border-yellow-500' },
    { id: 'avgPutts', label: '평균 퍼팅수', unit: '개', strokeHex: '#4b5563', bgClass: 'bg-gray-200', textClass: 'text-gray-700', borderClass: 'border-gray-500' },
    { id: 'girFirstPuttDist', label: 'GIR시 1st 평균거리', unit: 'ft', strokeHex: '#06b6d4', bgClass: 'bg-cyan-100', textClass: 'text-cyan-700', borderClass: 'border-cyan-500' },
    { id: 'recFirstPuttDist', label: '리커버리시 1st 평균거리', unit: 'ft', strokeHex: '#ef4444', bgClass: 'bg-red-100', textClass: 'text-red-700', borderClass: 'border-red-500' },
    { id: 'secondPuttDist', label: '2nd 평균 퍼팅거리', unit: 'ft', strokeHex: '#8b5cf6', bgClass: 'bg-violet-100', textClass: 'text-violet-700', borderClass: 'border-violet-500' },
    { id: 'onePutts', label: '1퍼팅', unit: '회', strokeHex: '#14b8a6', bgClass: 'bg-teal-100', textClass: 'text-teal-700', borderClass: 'border-teal-500' },
    { id: 'threePutts', label: '3퍼팅 이상', unit: '회', strokeHex: '#f43f5e', bgClass: 'bg-rose-100', textClass: 'text-rose-700', borderClass: 'border-rose-500' },
    { id: 'penaltyOB', label: 'OB 갯수', unit: '개', strokeHex: '#dc2626', bgClass: 'bg-red-50', textClass: 'text-red-600', borderClass: 'border-red-400' },
    { id: 'penaltyHazard', label: '해저드 갯수', unit: '개', strokeHex: '#ea580c', bgClass: 'bg-orange-50', textClass: 'text-orange-600', borderClass: 'border-orange-400' }
  ];

  const typeFilteredScores = useMemo(() => {
    if (filterType === 'all') return scores;
    return scores.filter(s => s.type === filterType);
  }, [scores, filterType]);

  useEffect(() => {
    const latest4Ids = typeFilteredScores.slice(-4).map(s => s.id);
    setSelectedRoundIds(latest4Ids);
  }, [typeFilteredScores]);

  const chartScores = useMemo(() => {
    return typeFilteredScores.filter(s => selectedRoundIds.includes(s.id));
  }, [typeFilteredScores, selectedRoundIds]);

  useEffect(() => {
    setActiveChartIdx(chartScores.length > 0 ? chartScores.length - 1 : null);
  }, [chartScores.length]);

  const calculateMetricVal = (score, metricId) => {
    const holes = score.detailedHoles || [];
    let val = 0;

    const calcRate = (cond, suc) => {
      const t = holes.filter(cond).length;
      const s = holes.filter(suc).length;
      return t > 0 ? Math.round((s/t)*100) : 0;
    };

    switch(metricId) {
      case 'teeShot': return calcRate(h => h.par !== 3 && h.drive !== null, h => h.drive === 'O');
      case 'secondShot': return calcRate(h => h.par === 5 && h.secondShotResult !== null, h => h.secondShotResult === 'O');
      case 'gir': return calcRate(h => h.girResult !== null, h => h.girResult === 'O');
      case 'ud': return calcRate(h => h.udResult !== null, h => h.udResult === 'O');
      case 'bunkerSave': return calcRate(h => h.udDist === 'bunker_25' && h.udResult !== null, h => h.udResult === 'O');
      case 'avgPutts': {
        const actualTotalPutts = holes.reduce((sum, h) => sum + (h.putts || 0), 0) || score.putts;
        return holes.length > 0 ? parseFloat((actualTotalPutts / holes.length).toFixed(1)) : parseFloat((score.putts / 18).toFixed(1));
      }
      case 'girFirstPuttDist': {
        const vPutts = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.firstPuttFt !== '' && h.girResult === 'O');
        const tFt = vPutts.reduce((sum, h) => sum + parseFloat(h.firstPuttFt), 0);
        return vPutts.length > 0 ? parseFloat((tFt / vPutts.length).toFixed(1)) : 0;
      }
      case 'recFirstPuttDist': {
        const vPutts = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.firstPuttFt !== '' && h.girResult === 'X');
        const tFt = vPutts.reduce((sum, h) => sum + parseFloat(h.firstPuttFt), 0);
        return vPutts.length > 0 ? parseFloat((tFt / vPutts.length).toFixed(1)) : 0;
      }
      case 'secondPuttDist': {
        const vPutts = holes.filter(h => h.putts >= 2 && h.puttDetails?.[1]?.distance && !isNaN(h.puttDetails[1].distance));
        const tFt = vPutts.reduce((sum, h) => sum + parseFloat(h.puttDetails[1].distance), 0);
        return vPutts.length > 0 ? parseFloat((tFt / vPutts.length).toFixed(1)) : 0;
      }
      case 'onePutts': return holes.filter(h => h.putts === 1).length;
      case 'threePutts': return holes.filter(h => h.putts >= 3).length;
      case 'penaltyOB': return holes.reduce((sum, h) => sum + (h.penaltyOB || 0), 0);
      case 'penaltyHazard': return holes.reduce((sum, h) => sum + (h.penaltyHazard || 0), 0);
      default: return 0;
    }
  };

  const chartSeries = useMemo(() => {
    return selectedMetrics.map(metricId => {
      const metricObj = METRICS.find(m => m.id === metricId);
      const data = chartScores.map(score => ({
        id: score.id,
        date: score.date,
        val: calculateMetricVal(score, metricId)
      }));
      return { ...metricObj, data };
    });
  }, [chartScores, selectedMetrics]);

  const isAllPercentages = chartSeries.length > 0 && chartSeries.every(s => s.unit === '%');
  
  let effectiveMin, range;
  if (isAllPercentages) {
     effectiveMin = 0;
     range = 100;
  } else {
     const allVals = chartSeries.flatMap(s => s.data.map(d => d.val));
     const minVal = allVals.length > 0 ? Math.min(...allVals) : 0;
     const maxVal = allVals.length > 0 ? Math.max(...allVals) : 100;
     range = (maxVal - minVal === 0) ? 1 : (maxVal - minVal) * 1.2; 
     effectiveMin = minVal - (range - (maxVal - minVal)) / 2; 
  }

  const paddingX = 10;
  const paddingY = 25;
  const chartWidthPercent = Math.max(100, chartScores.length * 18); 

  const toggleMetric = (id) => {
    setSelectedMetrics(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; 
        return prev.filter(m => m !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <div className="p-5 space-y-6 animate-fadeIn pb-32">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">성장 추이 분석</h2>
        <p className="text-xs text-gray-500">강한 게임은 그대로, 약한 게임에 시간과 노력과 비용을 투자하세요.</p>
      </div>

      <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner">
         <button onClick={()=>setFilterType('all')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filterType==='all' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>전체 기록</button>
         <button onClick={()=>setFilterType('practice')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filterType==='practice' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>연습 라운드</button>
         <button onClick={()=>setFilterType('tournament')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filterType==='tournament' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>시합 라운드</button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-xs font-bold text-gray-500">분석할 상세 지표 <span className="font-normal text-[10px]">(복수 선택 가능)</span></span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{selectedMetrics.length}개 선택됨</span>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-5 px-5">
          {METRICS.map(m => {
            const isSelected = selectedMetrics.includes(m.id);
            return (
              <button 
                key={m.id}
                onClick={() => toggleMetric(m.id)}
                className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border 
                  ${isSelected ? `bg-white ${m.borderClass} ${m.textClass} ring-1 ring-inset ring-current` : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-xs font-bold text-gray-500">차트에 표시할 라운드 <span className="font-normal text-[10px]">(기본: 최근 4경기)</span></span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{selectedRoundIds.length}개 선택됨</span>
            <button
              onClick={() => setIsRoundListExpanded(!isRoundListExpanded)}
              className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
            >
              {isRoundListExpanded ? <><ChevronUp size={12} /> 접기</> : <><List size={12} /> 목록보기</>}
            </button>
          </div>
        </div>
        
        <div className={isRoundListExpanded ? "flex flex-col gap-2 max-h-60 overflow-y-auto bg-gray-100/80 p-3 rounded-xl border border-gray-200 shadow-inner" : "flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-5 px-5"}>
          {typeFilteredScores.map(score => {
            const isSelected = selectedRoundIds.includes(score.id);
            return (
              <button
                key={score.id}
                onClick={() => {
                  setSelectedRoundIds(prev => 
                    isSelected ? prev.filter(id => id !== score.id) : [...prev, score.id]
                  );
                }}
                className={isRoundListExpanded
                  ? `w-full flex items-center justify-between px-3 py-3 rounded-lg text-xs font-bold transition-all border shadow-sm ${isSelected ? 'bg-white text-emerald-700 border-emerald-400 ring-1 ring-emerald-400' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`
                  : `whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${isSelected ? 'bg-gray-800 text-white border-gray-800 shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`
                }
              >
                {isRoundListExpanded ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Calendar size={14} className={isSelected ? "text-emerald-500" : "text-gray-400"} />
                      <span>{score.date} <span className="text-gray-300 mx-1">|</span> <span className={isSelected ? "text-gray-800" : "text-gray-600"}>{score.course}</span></span>
                    </div>
                    {isSelected ? <CheckCircle size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                  </>
                ) : (
                  <>
                    {isSelected ? <CheckCircle size={12} className="text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                    {score.date.slice(5)} {score.course}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
         <div className="grid grid-cols-2 gap-3 mb-6 border-b border-gray-100 pb-4">
            {chartSeries.map(series => {
               const avgVal = series.data.length > 0 ? parseFloat((series.data.reduce((s, d) => s + d.val, 0) / series.data.length).toFixed(1)) : 0;
               const isLowerBetter = ['avgPutts', 'girFirstPuttDist', 'recFirstPuttDist', 'secondPuttDist', 'threePutts', 'penaltyOB', 'penaltyHazard'].includes(series.id);
               const vals = series.data.map(d => d.val);
               const bestVal = vals.length > 0 ? (isLowerBetter ? Math.min(...vals) : Math.max(...vals)) : '-';

               return (
                  <div key={series.id} className={`p-3 rounded-xl border ${series.bgClass} ${series.borderClass} bg-opacity-30`}>
                     <div className={`text-[10px] font-bold ${series.textClass} mb-2 leading-tight`}>{series.label}</div>
                     <div className="flex justify-between items-end">
                        <div>
                           <div className="text-[9px] text-gray-500 mb-0.5 font-bold">베스트</div>
                           <div className="text-sm font-bold text-gray-700">{bestVal}<span className="text-[9px] font-normal ml-0.5 text-gray-500">{series.unit}</span></div>
                        </div>
                        <div className="text-right">
                           <div className="text-[9px] text-gray-500 mb-0.5 font-bold">평균</div>
                           <div className={`text-lg font-black ${series.textClass} leading-none`}>{avgVal}<span className="text-[9px] font-normal ml-0.5 opacity-70">{series.unit}</span></div>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>

         {/* 동적 선형 그래프 (SVG 및 터치 인터랙티브 데이터 카드 적용) */}
         {chartScores.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Activity size={24} className="mb-2 text-gray-300" />
              선택된 라운드가 없습니다.
            </div>
         ) : (
            <div className="w-full overflow-x-auto scrollbar-hide -mx-5 px-5">
               <div className="relative h-64 mt-2 mb-8 border-b border-gray-100 transition-all duration-300" style={{ width: `${chartWidthPercent}%` }}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                    
                    {[25, 50, 75, 100].map(val => {
                      const plotVal = isAllPercentages ? val : effectiveMin + (range * (val / 100));
                      const y = 100 - paddingY - ((plotVal - effectiveMin) / range) * (100 - paddingY * 2);
                      
                      return (
                        <g key={`grid-${val}`}>
                          <line x1="0" y1={y} x2="100" y2={y} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1.5,1.5" vectorEffect="non-scaling-stroke" opacity="0.8" />
                        </g>
                      );
                    })}

                    {chartSeries.map((series, sIdx) => {
                      const pointsStr = series.data.map((d, i) => {
                        const x = chartScores.length === 1 ? 50 : paddingX + (i / (chartScores.length - 1)) * (100 - paddingX * 2);
                        const y = 100 - paddingY - ((d.val - effectiveMin) / range) * (100 - paddingY * 2);
                        return `${x},${y}`;
                      }).join(' ');
                      
                      let polygonLayer = null;
                      if (chartSeries.length === 1) {
                         const firstX = chartScores.length === 1 ? 50 : paddingX;
                         const lastX = chartScores.length === 1 ? 50 : 100 - paddingX;
                         const polyStr = `${firstX},100 ${pointsStr} ${lastX},100`;
                         polygonLayer = (
                           <>
                             <defs>
                               <linearGradient id={`grad-${series.id}`} x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={series.strokeHex} stopOpacity="0.2" />
                                 <stop offset="100%" stopColor={series.strokeHex} stopOpacity="0" />
                               </linearGradient>
                             </defs>
                             <polygon points={polyStr} fill={`url(#grad-${series.id})`} />
                           </>
                         );
                      }

                      return (
                        <g key={series.id}>
                          {polygonLayer}
                          <polyline points={pointsStr} fill="none" stroke={series.strokeHex} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* 인터랙티브 데이터 마커 및 툴팁 영역 */}
                  {chartScores.map((score, i) => {
                     const x = chartScores.length === 1 ? '50%' : `${paddingX + (i / (chartScores.length - 1)) * (100 - paddingX * 2)}%`;
                     const isActive = activeChartIdx === i;
                     
                     let tooltipClass = "-translate-x-1/2";
                     if (i === 0 && chartScores.length > 1) tooltipClass = "translate-x-0"; 
                     else if (i === chartScores.length - 1 && chartScores.length > 1) tooltipClass = "-translate-x-full"; 
                     
                     return (
                        <div 
                           key={`col-${score.id}`} 
                           className="absolute top-0 bottom-0 cursor-pointer group" 
                           style={{ left: x, width: '40px', marginLeft: '-20px' }}
                           onClick={() => setActiveChartIdx(i)}
                        >
                           <div className={`absolute top-4 bottom-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-300 ${isActive ? 'bg-gray-400 border-dashed border-l border-gray-400' : 'bg-transparent group-hover:bg-gray-200'}`}></div>

                           {chartSeries.map(series => {
                              const d = series.data[i];
                              const y = `${100 - paddingY - ((d.val - effectiveMin) / range) * (100 - paddingY * 2)}%`;
                              return (
                                 <div key={`dot-${series.id}-${d.id}`} className="absolute w-full h-0 transition-all duration-500 z-10 pointer-events-none" style={{ top: y }}>
                                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${isActive ? 'w-3.5 h-3.5 ring-2 ring-emerald-100' : 'w-2.5 h-2.5 opacity-80'}`} style={{ backgroundColor: series.strokeHex }}></div>
                                 </div>
                              );
                           })}

                           {isActive && (
                              <div className={`absolute z-30 top-2 left-1/2 transform ${tooltipClass} bg-gray-900/70 backdrop-blur-md px-3 py-2.5 rounded-xl shadow-xl pointer-events-none min-w-[130px] animate-fadeIn border border-gray-600/30 whitespace-nowrap`}>
                                 <div className="text-[10px] font-bold text-gray-300 mb-2 flex justify-between items-center border-b border-gray-600/50 pb-1.5 gap-3">
                                   <span>{score.course}</span>
                                   <span>{score.date.slice(5)}</span>
                                 </div>
                                 <div className="space-y-1.5">
                                   {chartSeries.map(series => {
                                      const d = series.data[i];
                                      return (
                                         <div key={`tip-${series.id}`} className="flex items-center justify-between gap-4 text-xs">
                                            <div className="flex items-center gap-1.5">
                                               <div className="w-2 h-2 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: series.strokeHex }}></div>
                                               <span className="text-gray-200 font-medium">{series.label}</span>
                                            </div>
                                            <span className="font-black text-white text-right">{d.val}<span className="text-[9px] font-normal text-gray-400 ml-0.5">{series.unit}</span></span>
                                         </div>
                                      );
                                   })}
                                 </div>
                              </div>
                           )}

                           <div className={`absolute bottom-0 left-1/2 transform translate-y-7 -translate-x-1/2 text-center text-[9px] font-bold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-gray-900 bg-gray-200 px-2.5 py-1 rounded-full shadow-sm' : 'text-gray-400'}`}>
                              {score.date.slice(5)}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

function PremiumView({ isPremium, setShowPaymentModal }) {
  if (isPremium) {
    return (
      <div className="p-8 text-center animate-fadeIn space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <Coffee size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">커피 잘 마셨습니다! ☕</h2>
          <p className="text-gray-600 text-sm">보내주신 따뜻한 커피 덕분에 <br/>오늘도 으쌰으쌰 개발 중입니다!</p>
        </div>
        <div className="w-full bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-left mt-4 space-y-4">
           <h3 className="font-bold text-sm text-gray-800 border-b pb-2">나의 후원 내역</h3>
           <div className="flex justify-between text-sm">
             <span className="text-gray-500">후원 항목</span>
             <span className="font-semibold text-gray-800">개발자 커피 사주기 (₩4,500)</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-gray-500">마지막 후원일</span>
             <span className="font-semibold text-gray-800">방금 전</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 animate-fadeIn">
      <div className="text-center mb-8 mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">개발자에게 커피 한 잔 사주기 🥺</h2>
        <p className="text-gray-500 text-sm px-2">앱이 마음에 드셨다면, 밤샘 코딩하는 개발자를 위해 따뜻한 커피 한 잔 어떠신가요?</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">DONATION</div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">커피 한 잔 후원 ☕</h3>
          <div className="text-3xl font-black text-gray-900 mb-4">₩4,500 <span className="text-sm font-normal text-gray-500">/ 1회</span></div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-emerald-500" /> 개발자의 혈중 카페인 농도 유지
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-emerald-500" /> 버그 없는 쾌적한 앱 업데이트
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-emerald-500" /> 개발자의 사랑과 감사 (무한 제공)
            </li>
          </ul>

          <button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <CreditCard size={18} /> 결제하고 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); 

  const handlePay = () => {
    setStep(2);
    setTimeout(() => {
      setStep(3);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden relative animate-slideUp">
        {step === 1 && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
            <X size={24} />
          </button>
        )}

        <div className="p-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">결제 수단 선택</h2>
              <p className="text-sm text-gray-500 mb-6">개발자 커피 후원 (₩4,500)</p>

              <div className="space-y-3 mb-6">
                <label className="flex items-center p-4 border border-emerald-500 bg-emerald-50 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="form-radio text-emerald-600 focus:ring-emerald-500 h-5 w-5" />
                  <span className="ml-3 font-medium text-emerald-900">신용/체크카드 (앱카드)</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" className="form-radio text-emerald-600 focus:ring-emerald-500 h-5 w-5" />
                  <span className="ml-3 font-medium text-gray-700">카카오페이</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" className="form-radio text-emerald-600 focus:ring-emerald-500 h-5 w-5" />
                  <span className="ml-3 font-medium text-gray-700">네이버페이</span>
                </label>
              </div>

              <div className="text-xs text-gray-400 mb-6 bg-gray-50 p-3 rounded-lg">
                * 본 결제창은 테스트용 모의 환경입니다. 실제 금액이 청구되지 않습니다.
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-black transition-colors"
              >
                4,500원 결제하기
              </button>
            </>
          )}

          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <h3 className="font-bold text-gray-800">안전하게 결제를 진행하고 있습니다...</h3>
              <p className="text-sm text-gray-500">창을 닫지 마세요.</p>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">결제 완료!</h3>
              <p className="text-gray-500 text-center text-sm">개발자에게 커피가 전달되었습니다.<br/>잠시 후 화면으로 이동합니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InstructorApp({ onLogout, userEmail, user, db, appId }) {
  const [studentEmail, setStudentEmail] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false); 
  
  const [myStudents, setMyStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // 리얼타임 데이터 저장을 위한 State
  const [studentScores, setStudentScores] = useState([]);
  const [studentPractice, setStudentPractice] = useState([]);
  const [selectedScore, setSelectedScore] = useState(null); 
  const [analysisContext, setAnalysisContext] = useState(null);

  // 1. 등록된 내 학생 리스트 실시간 로드
  useEffect(() => {
    if (!userEmail || !db) return;
    const myStudentsRef = collection(db, 'artifacts', appId, 'users', userEmail, 'myStudents');
    const unsubscribe = onSnapshot(myStudentsRef, (snapshot) => {
      const loaded = snapshot.docs.map(doc => doc.data());
      // 최신 등록 순
      setMyStudents(loaded.sort((a,b) => b.createdAt - a.createdAt));
    }, (error) => console.warn("Instructor students load error", error));

    return () => unsubscribe();
  }, [userEmail, db, appId]);

  // 2. 선택된 학생의 스코어 & 연습기록 실시간 로드
  useEffect(() => {
    if (!selectedStudent || !db) return;
    
    const targetEmail = selectedStudent.encodedEmail;
    const scoresRef = collection(db, 'artifacts', appId, 'users', targetEmail, 'scores');
    const unsubScores = onSnapshot(scoresRef, snap => {
      const loaded = snap.docs.map(d => ({id: Number(d.id), ...d.data()})).sort((a,b)=>a.id-b.id);
      setStudentScores(loaded);
    }, err => console.warn("Student scores load error", err));

    const pracRef = collection(db, 'artifacts', appId, 'users', targetEmail, 'practice');
    const unsubPrac = onSnapshot(pracRef, snap => {
      const loaded = snap.docs.map(d => ({id: Number(d.id), ...d.data()})).sort((a,b)=>b.id-a.id);
      setStudentPractice(loaded);
    }, err => console.warn("Student practice load error", err));

    return () => { 
      unsubScores(); 
      unsubPrac(); 
    };
  }, [selectedStudent, db, appId]);


  // Firebase Directory에서 학생 검색 및 등록
  const handleAddStudent = async () => {
    if (!studentEmail || !studentEmail.includes('@')) {
      alert('정확한 학생의 이메일을 입력해주세요.');
      return;
    }

    try {
      const dirRef = collection(db, 'artifacts', appId, 'public', 'data', 'directory');
      const snapshot = await getDocs(dirRef);
      const allUsers = snapshot.docs.map(d => d.data());
      const foundStudent = allUsers.find(u => u.email === studentEmail && u.role === 'student');

      if (foundStudent) {
        const myStudentRef = doc(db, 'artifacts', appId, 'users', userEmail, 'myStudents', foundStudent.encodedEmail);
        await setDoc(myStudentRef, { ...foundStudent, createdAt: Date.now() });
        alert(`${foundStudent.name} 학생이 성공적으로 연동되었습니다!`);
        setStudentEmail('');
      } else {
        alert('해당 이메일로 가입된 학생 계정을 찾을 수 없습니다.');
      }
    } catch (e) {
      console.error("Student search error", e);
      alert('학생 검색 중 오류가 발생했습니다.');
    }
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setCurrentTab('dashboard');
    setSelectedScore(null);
  };

  const handleSaveInstructorComment = async (scoreId, comment) => {
    if (!selectedStudent || !db) return;
    try {
      const scoreRef = doc(db, 'artifacts', appId, 'users', selectedStudent.encodedEmail, 'scores', scoreId.toString());
      await setDoc(scoreRef, { instructorComment: comment }, { merge: true });
    } catch (e) {
      console.warn("Instructor comment save error", e);
      alert('코멘트 저장 중 오류가 발생했습니다.');
    }
  };

  const handleSavePracticeComment = async (recordId, comment) => {
    if (!selectedStudent || !db) return;
    try {
      const pracRef = doc(db, 'artifacts', appId, 'users', selectedStudent.encodedEmail, 'practice', recordId.toString());
      await setDoc(pracRef, { instructorComment: comment }, { merge: true });
    } catch (e) {
      console.warn("Instructor practice comment save error", e);
      alert('연습기록 코멘트 저장 중 오류가 발생했습니다.');
    }
  };

  if (selectedStudent) {
    // 실시간으로 업데이트되는 선택된 스코어 포인터 유지
    const activeScore = studentScores.find(s => s.id === selectedScore?.id) || selectedScore;

    const renderStudentTabContent = () => {
      switch(currentTab) {
        case 'dashboard': 
          return <DashboardView 
                    scores={studentScores} 
                    isPremium={true} 
                    onScoreClick={(score) => {
                      setSelectedScore(score);
                      setCurrentTab('roundDetail');
                    }} 
                    onDeleteScore={null} // 교습가는 삭제 불가
                 />;
        case 'stats': 
          return <StatsView scores={studentScores} />;
        case 'practice': 
          return <PracticeView 
                   records={studentPractice} 
                   userRole="instructor" 
                   onSaveComment={handleSavePracticeComment}
                   onDelete={null} 
                 />;
        case 'roundDetail': 
          return <RoundDetailView 
                   score={activeScore} 
                   onBack={() => setCurrentTab('dashboard')} 
                   onAnalyze={(statType, title, category = 'miss') => {
                     setAnalysisContext({ statType, title, category });
                     setCurrentTab(category === 'putting' ? 'puttingAnalysis' : 'missAnalysis');
                   }}
                   userRole="instructor"
                   onSaveInstructorComment={handleSaveInstructorComment}
                 />;
        case 'missAnalysis': 
          return <MissAnalysisView 
                   score={activeScore} 
                   context={analysisContext} 
                   onBack={() => setCurrentTab('roundDetail')} 
                 />;
        case 'puttingAnalysis': 
          return <PuttingAnalysisView 
                   score={activeScore} 
                   context={analysisContext} 
                   onBack={() => setCurrentTab('roundDetail')} 
                 />;
        default: 
          return <DashboardView scores={studentScores} onScoreClick={() => {}} onDeleteScore={null} />; // 교습가는 삭제 불가
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
          <header className="bg-slate-800 text-white p-4 sticky top-0 z-10 flex items-center shadow-md gap-3">
            <button onClick={handleBackToList} className="p-1 -ml-1 text-slate-300 hover:text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold flex items-center gap-2 leading-none">
                {selectedStudent.name}
              </h1>
              <span className="text-[10px] text-slate-400">{selectedStudent.email}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-700 px-2 py-1 rounded-full flex items-center gap-1">
              <Eye size={12} /> 관전 모드
            </span>
          </header>

          <main className="flex-1 overflow-y-auto pb-20 bg-gray-50">
            {renderStudentTabContent()}
          </main>

          <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md flex justify-around p-3 pb-safe z-10">
            <NavItem icon={<Home />} label="홈 (요약)" isActive={currentTab === 'dashboard'} onClick={() => setCurrentTab('dashboard')} />
            <NavItem icon={<TrendingUp />} label="상세 분석" isActive={currentTab === 'stats'} onClick={() => setCurrentTab('stats')} />
            <NavItem icon={<TargetIcon />} label="연습기록" isActive={currentTab === 'practice'} onClick={() => setCurrentTab('practice')} />
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative flex flex-col">
        <header className="bg-slate-800 text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ZoroEyesIcon size={28} className="text-white" />
            Zeno Golf <span className="text-[10px] font-bold text-slate-300 bg-slate-700 px-2 py-0.5 rounded-full ml-1 align-middle">교습가 모드</span>
          </h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)} 
              className="p-1 -mr-1 text-slate-300 hover:text-white transition-colors focus:outline-none"
            >
              <User size={20} />
            </button>
            
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pb-24 animate-fadeIn">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-800 mb-1">내 학생 관리</h2>
            <p className="text-sm text-gray-500">학생들의 스코어와 통계를 한눈에 확인하세요.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <User size={16} className="text-slate-600" />
              새로운 학생 등록
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input 
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="학생 이메일 입력" 
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                />
              </div>
              <button 
                onClick={handleAddStudent}
                className="bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
              >
                등록
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 ml-1">* 학생이 가입한 이메일을 입력하면 자동으로 데이터가 연동됩니다.</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="font-bold text-gray-700">등록된 학생 목록</h3>
              <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">총 {myStudents.length}명</span>
            </div>
            
            <div className="space-y-3">
              {myStudents.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                   등록된 학생이 없습니다. 이메일로 학생을 연동해보세요.
                </div>
              ) : (
                myStudents.map(student => (
                  <div 
                    key={student.encodedEmail} 
                    onClick={() => setSelectedStudent(student)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 hover:border-slate-300 transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg uppercase">
                        {student.name ? student.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm mb-0.5">{student.name}</div>
                        <div className="text-[10px] text-gray-500">{student.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

