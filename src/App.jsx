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
  Mail, // 이메일 아이콘 추가
  Key, // 인증번호 아이콘 추가
  LogOut // 로그아웃 아이콘 추가
} from 'lucide-react';

// --- [커스텀 아이콘: 드라이버 헤드 페이스] ---
const DriverFaceIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16c1 0 2 0.8 2 2v4c0 4-4 7-10 7S2 17 2 13V9c0-1.2 1-2 2-2z" />
    <line x1="7" y1="11" x2="17" y2="11" />
    <line x1="6" y1="14" x2="18" y2="14" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

// --- [커스텀 아이콘: 롤로노아 조로 눈 (크고 강렬하게 수정)] ---
const ZoroEyesIcon = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeLinecap="round" strokeLinejoin="round">
    {/* 우측 눈썹 (사용자 기준 왼쪽) */}
    <path d="M1 7 L 11 10" strokeWidth="2.5" />
    {/* 좌측 눈썹 (사용자 기준 오른쪽) */}
    <path d="M23 7 L 13 10" strokeWidth="2.5" />
    
    {/* 우측 눈매 (곡선을 주어 눈을 더 크게 트이게 함) */}
    <path d="M1 12 Q 6 9 11 13" strokeWidth="2" />
    {/* 좌측 눈매 (곡선을 주어 눈을 더 크게 트이게 함) */}
    <path d="M23 12 Q 18 9 13 13" strokeWidth="2" />
    
    {/* 양쪽 눈동자 (크기를 1.5에서 2.5로 키움) */}
    <circle cx="6" cy="11.5" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="11.5" r="2.5" fill="currentColor" stroke="none" />
    
    {/* 조로의 아이덴티티: 왼쪽 눈을 가로지르는 흉터 (사용자 기준 오른쪽) */}
    <path d="M19 3 L 17 21" strokeWidth="1.5" opacity="0.9" />
  </svg>
);

// 글로벌 미스 요인 리스트
const MISS_REASONS = [
  { id: 'hit', label: '타점', icon: <Focus size={14} /> },
  { id: 'face', label: '페이스앵글', icon: <DriverFaceIcon size={14} /> },
  { id: 'path', label: '패스', icon: <MoveRight size={14} /> },
  { id: 'routine', label: '루틴', icon: <RefreshCw size={14} /> },
  { id: 'clubSelection', label: '클럽선택', icon: <CheckSquare size={14} /> },
  { id: 'strategy', label: '공략', icon: <Map size={14} /> },
  { id: 'trouble', label: '트러블라이', icon: <Mountain size={14} /> },
  { id: 'carry', label: '캐리조절', icon: <Ruler size={14} /> },
];

// --- [모의 데이터 생성 함수 (상세 페이지 확인용)] ---
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
    
    const firstPuttDist = Math.random() > 0.2 ? Math.floor(Math.random() * 40 + 5).toString() : '';
    const puttDetails = Array.from({length: 4}, (_, pIdx) => {
      if (pIdx === 0) return { distance: firstPuttDist, hook: '', slice: '', downhill: '', uphill: '' };
      return { distance: '', hook: '', slice: '', downhill: '', uphill: '' };
    });

    return {
      hole: i + 1,
      par: par,
      score: par + Math.floor(Math.random() * 2),
      putts: Math.random() > 0.8 ? 3 : Math.random() > 0.4 ? 2 : 1,
      firstPuttFt: firstPuttDist, 
      puttDetails: puttDetails,
      drive: driveRes,
      driveMissReason: driveRes === 'X' ? getMockReasons(6) : [],
      secondShotResult: secondRes,
      secondShotMissReason: secondRes === 'X' ? getMockReasons(6) : [],
      girResult: girRes,
      girMissReason: girRes === 'X' ? getMockReasons(7) : [],
      udResult: udRes,
      udMissReason: udRes === 'X' ? getMockReasons(8) : []
    };
  });
};

// --- [모의 데이터] ---
const initialScores = [
  { id: 1, date: '2026-02-28', course: '용인 CC', total: 95, putts: 38, fairways: 6, type: 'practice', temperature: '12', wind: '한클럽', detailedHoles: generateMockDetailedHoles() },
  { id: 2, date: '2026-03-01', course: '레이크사이드', total: 92, putts: 36, fairways: 8, type: 'practice', temperature: '10', wind: '반클럽', detailedHoles: generateMockDetailedHoles() },
  { id: 3, date: '2026-03-05', course: '남부 CC', total: 89, putts: 34, fairways: 9, type: 'tournament', tournamentName: '청소년 컵', temperature: '15', wind: '두클럽', detailedHoles: generateMockDetailedHoles() },
  { id: 4, date: '2026-03-07', course: '태광 CC', total: 88, putts: 33, fairways: 10, type: 'tournament', tournamentName: '용인시장배', temperature: '14', wind: '무풍', detailedHoles: generateMockDetailedHoles() },
];

export default function GolfStudentApp() {
  // 로그인 상태 관리 (기본값: false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student'); // 'student' | 'instructor' 교습가 상태 추가

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [scores, setScores] = useState(initialScores);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null); 
  const [analysisContext, setAnalysisContext] = useState(null); 
  const [showUserMenu, setShowUserMenu] = useState(false); // 학생 로그아웃 메뉴 상태 추가
  
  // 로그아웃 핸들러 (confirm 팝업 제거)
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
    setCurrentTab('dashboard');
  };

  // 로그인되지 않은 경우 로그인 화면만 렌더링
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={(role) => { setIsLoggedIn(true); setUserRole(role); }} />;
  }

  // 교습가 로그인인 경우 교습가 전용 앱 페이지 렌더링
  if (userRole === 'instructor') {
    return <InstructorApp onLogout={handleLogout} />;
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
               />;
      case 'add': return <AddScoreDetailedView setScores={setScores} setCurrentTab={setCurrentTab} />;
      case 'stats': return <StatsView scores={scores} />;
      case 'premium': return <PremiumView isPremium={isPremium} setShowPaymentModal={setShowPaymentModal} />;
      case 'roundDetail': 
        return <RoundDetailView 
                 score={selectedScore} 
                 onBack={() => setCurrentTab('dashboard')} 
                 onAnalyze={(statType, title, category = 'miss') => {
                   setAnalysisContext({ statType, title, category });
                   setCurrentTab(category === 'putting' ? 'puttingAnalysis' : 'missAnalysis');
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
            
            {/* 유저 아이콘 및 로그아웃 드롭다운 메뉴 */}
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
          <NavItem icon={<PenTool />} label="기록" isActive={currentTab === 'add'} onClick={() => setCurrentTab('add')} />
          <NavItem icon={<TrendingUp />} label="분석" isActive={currentTab === 'stats'} onClick={() => setCurrentTab('stats')} />
          <NavItem icon={<Coffee />} label="후원" isActive={currentTab === 'premium'} onClick={() => setCurrentTab('premium')} />
        </nav>

        {showPaymentModal && (
          <PaymentModal 
            onClose={() => setShowPaymentModal(false)} 
            onSuccess={() => {
              setIsPremium(true);
              setShowPaymentModal(false);
            }} 
          />
        )}
      </div>
    </div>
  );
}

// --- [새로 추가된 컴포넌트: 로그인 뷰] ---
function LoginView({ onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증번호 입력
  const [role, setRole] = useState('student'); // 'student' | 'instructor' 계정 타입 선택
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const TEST_OTP = '123456';

  const handleSendCode = () => {
    if (!email || !email.includes('@')) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    // 이메일 발송 모의 딜레이
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      alert(`[테스트 모드] 인증번호가 발송되었습니다.\n테스트용 인증번호: ${TEST_OTP}`);
    }, 1200);
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      alert('6자리 인증번호를 정확히 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (otp === TEST_OTP) {
        onLoginSuccess(role); // 선택된 역할(role)을 메인 컴포넌트로 전달
      } else {
        alert('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-emerald-600 min-h-screen shadow-2xl relative flex flex-col items-center justify-center p-6 text-white">
        
        {/* 상단 로고 영역 */}
        <div className="flex flex-col items-center mb-10 animate-fadeIn">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <ZoroEyesIcon size={50} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Zeno Golf</h1>
          <p className="text-emerald-100 text-sm font-medium text-center px-4 break-keep">
            강한 게임은 그대로 두고, 약한 게임은 시간과 노력과 비용을 투자하세요.
          </p>
        </div>

        {/* 로그인 폼 카드 */}
        <div className="w-full bg-white rounded-2xl shadow-xl p-6 text-gray-800 animate-slideUp">
          {step === 1 ? (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">이메일 로그인</h2>
                <p className="text-xs text-gray-500">계정 이메일을 입력하면 인증코드를 보내드립니다.</p>
              </div>

              {/* 추가된 영역: 계정 유형 선택 (학생 vs 교습가) */}
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
                    placeholder="student@example.com" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  '인증코드 받기'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => setStep(1)} className="p-1 -ml-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-xl font-bold text-gray-800">인증코드 입력</h2>
                </div>
                <p className="text-xs text-gray-500 pl-1"><span className="font-bold text-emerald-600">{email}</span>(으)로<br/>발송된 6자리 숫자를 입력해주세요.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">인증코드 (6자리)</label>
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

              <div className="text-center pt-2">
                <button 
                  onClick={handleSendCode}
                  className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors underline underline-offset-2"
                >
                  코드를 받지 못하셨나요? 재전송
                </button>
              </div>
            </div>
          )}
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

function DashboardView({ scores, isPremium, onScoreClick }) {
  const practiceScores = scores.filter(s => s.type === 'practice' || !s.type);
  const tournamentScores = scores.filter(s => s.type === 'tournament');

  const avgPractice = practiceScores.length > 0 
    ? (practiceScores.reduce((acc, curr) => acc + curr.total, 0) / practiceScores.length).toFixed(1) 
    : '-';
  
  const tournamentCount = tournamentScores.length;
  const avgTournamentVal = tournamentCount > 0 
    ? (tournamentScores.reduce((acc, curr) => acc + curr.total, 0) / tournamentCount).toFixed(1) 
    : '-';

  // --- [추가된 그룹별 통계 계산 함수] ---
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

  // 미니 스탯 카드 UI 컴포넌트
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
        
        {/* 기존: 평균 타수 요약 */}
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

        {/* 신규: 4가지 주요 통계 (연습/시합 분리형 카드) - 순서 변경됨 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 왼쪽 위 */}
          <MiniStatCard title="페어웨이 안착률" pracVal={pracStats.fwRate} tourVal={tourStats.fwRate} unit="%" colorClass="text-purple-600" />
          {/* 오른쪽 위 */}
          <MiniStatCard title="그린적중률(GIR)" pracVal={pracStats.girRate} tourVal={tourStats.girRate} unit="%" colorClass="text-emerald-600" />
          {/* 왼쪽 아래 */}
          <MiniStatCard title="리커버리 성공률" pracVal={pracStats.udRate} tourVal={tourStats.udRate} unit="%" colorClass="text-orange-500" />
          {/* 오른쪽 아래 */}
          <MiniStatCard title="평균 퍼팅수" pracVal={pracStats.avgPutts} tourVal={tourStats.avgPutts} unit="" colorClass="text-gray-700" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">최근 스코어 리스트</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {scores.slice().reverse().map((score) => (
            <div 
              key={score.id} 
              onClick={() => onScoreClick(score)}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
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
                    {score.temperature && <span>• {score.temperature}°C</span>}
                    {score.isRaining && score.precipitation && <span className="text-blue-500 font-medium">• 🌧️ {score.precipitation}mm</span>}
                    {score.wind && <span>• {score.wind}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="font-bold text-lg text-gray-800">{score.total} <span className="text-xs font-normal text-gray-500">타</span></div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- [새로 추가된 컴포넌트: 라운드 상세 분석 뷰] ---
function RoundDetailView({ score, onBack, onAnalyze }) {
  if (!score) return null;

  const holes = score.detailedHoles || [];

  const calcRate = (conditionFn, successFn) => {
    const tries = holes.filter(conditionFn).length;
    const successes = holes.filter(successFn).length;
    const rate = tries > 0 ? Math.round((successes / tries) * 100) : 0;
    return { tries, successes, rate };
  };

  // 1. 티샷 페어웨이 안착률
  const teeShot = calcRate(h => h.par !== 3 && h.drive !== null, h => h.drive === 'O');
  // 2. 세컨샷 페어웨이 안착률 (Par 5)
  const secondShot = calcRate(h => h.par === 5 && h.secondShotResult !== null, h => h.secondShotResult === 'O');
  // 3. 그린적중률 (GIR)
  const gir = calcRate(h => h.girResult !== null, h => h.girResult === 'O');
  // 4. UP&DOWN 성공률
  const ud = calcRate(h => h.udResult !== null, h => h.udResult === 'O');

  // 5. 퍼팅 횟수 통계
  const totalPuttsFromHoles = holes.reduce((sum, h) => sum + (h.putts || 0), 0);
  const actualTotalPutts = totalPuttsFromHoles > 0 ? totalPuttsFromHoles : score.putts;
  const avgPutts = holes.length > 0 ? (actualTotalPutts / holes.length).toFixed(1) : (score.putts / 18).toFixed(1);
  const onePutts = holes.filter(h => h.putts === 1).length;
  const threePutts = holes.filter(h => h.putts >= 3).length;

  // 6. 1st 퍼트 평균 거리 계산 (GIR 성공 vs 실패 분리)
  const girFirstPutts = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.girResult === 'O');
  const totalGirFirstPuttFt = girFirstPutts.reduce((sum, h) => sum + parseFloat(h.firstPuttFt), 0);
  const avgGirFirstPuttFt = girFirstPutts.length > 0 ? (totalGirFirstPuttFt / girFirstPutts.length).toFixed(1) : '-';

  const recFirstPutts = holes.filter(h => h.firstPuttFt && !isNaN(h.firstPuttFt) && h.girResult === 'X'); // GIR 실패 시 리커버리 상황으로 간주
  const totalRecFirstPuttFt = recFirstPutts.reduce((sum, h) => sum + parseFloat(h.firstPuttFt), 0);
  const avgRecFirstPuttFt = recFirstPutts.length > 0 ? (totalRecFirstPuttFt / recFirstPutts.length).toFixed(1) : '-';

  return (
    <div className="p-5 animate-fadeIn pb-24 h-full bg-gray-50">
      {/* 헤더 영역 */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-black text-gray-800 leading-tight">{score.course}</h2>
          <div className="text-xs font-medium text-gray-500 mt-0.5">
            {score.date} • {score.type === 'tournament' ? `시합라운드${score.tournamentName ? ` (${score.tournamentName})` : ''}` : '연습라운드'}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</div>
          <div className="text-2xl font-black text-emerald-600">{score.total}</div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-800 mb-3 px-1 flex items-center gap-2">
        <Activity size={16} className="text-emerald-500" />
        라운드 상세 분석
      </h3>

      <div className="space-y-3">
        {/* 샷 통계 그룹 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <DetailStatRow 
            label="티샷 페어웨이 안착률" data={teeShot} color="text-purple-600" bg="bg-purple-50" icon={<Flag size={14}/>} 
            onClick={() => onAnalyze('drive', '티샷 페어웨이 안착 실패 요인')}
          />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow 
            label="세컨샷 페어웨이 안착률 (Par5)" data={secondShot} color="text-blue-600" bg="bg-blue-50" icon={<Target size={14}/>} 
            onClick={() => onAnalyze('secondShot', '세컨샷(Par5) 실패 요인')}
          />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow 
            label="그린적중률 (GIR)" data={gir} color="text-emerald-600" bg="bg-emerald-50" icon={<CircleDot size={14}/>} 
            onClick={() => onAnalyze('gir', '그린적중률(GIR) 실패 요인')}
          />
          <div className="border-t border-gray-50"></div>
          <DetailStatRow 
            label="UP&DOWN 성공률" data={ud} color="text-orange-500" bg="bg-orange-50" icon={<RefreshCw size={14}/>} 
            onClick={() => onAnalyze('ud', 'UP&DOWN 실패 요인')}
          />
        </div>

        {/* 퍼팅 통계 그룹 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Putting Stats</h4>
          
          <div className="space-y-3">
            {/* 거리 통계 (2열 분할) */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => onAnalyze('girFirstPuttDist', 'GIR 적중시 1st 퍼트 상세', 'putting')}
                className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 active:bg-blue-200 transition-colors relative group"
              >
                <span className="text-[10px] font-bold text-blue-600 mb-1">GIR시 1st 평균거리</span>
                <span className="text-xl font-black text-blue-700">{avgGirFirstPuttFt}<span className="text-xs font-normal ml-0.5">ft</span></span>
                <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-300 group-hover:text-blue-500" />
              </div>
              <div 
                onClick={() => onAnalyze('recFirstPuttDist', '리커버리시 1st 퍼트 상세', 'putting')}
                className="flex flex-col items-center justify-center p-3 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 active:bg-orange-200 transition-colors relative group"
              >
                <span className="text-[10px] font-bold text-orange-600 mb-1">리커버리시 1st 평균거리</span>
                <span className="text-xl font-black text-orange-700">{avgRecFirstPuttFt}<span className="text-xs font-normal ml-0.5">ft</span></span>
                <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-300 group-hover:text-orange-500" />
              </div>
            </div>

            {/* 횟수 통계 (3열 분할) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 mb-1">평균 퍼팅수</span>
                <span className="text-xl font-black text-gray-800">{avgPutts}</span>
              </div>
              <div 
                onClick={() => onAnalyze('onePutt', '1퍼팅 상세 기록', 'putting')}
                className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 active:bg-emerald-200 transition-colors relative group"
              >
                <span className="text-[10px] font-bold text-emerald-600 mb-1">1퍼팅</span>
                <span className="text-xl font-black text-emerald-700">{onePutts}<span className="text-xs font-normal ml-0.5">회</span></span>
                <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-300 group-hover:text-emerald-500" />
              </div>
              <div 
                onClick={() => onAnalyze('threePutt', '3퍼팅 이상 상세 기록', 'putting')}
                className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 active:bg-red-200 transition-colors relative group"
              >
                <span className="text-[10px] font-bold text-red-600 mb-1">3퍼팅 이상</span>
                <span className="text-xl font-black text-red-700">{threePutts}<span className="text-xs font-normal ml-0.5">회</span></span>
                <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-300 group-hover:text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStatRow({ label, data, color, bg, icon, onClick }) {
  return (
    <div 
      className={`flex items-center justify-between ${onClick ? 'cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors active:bg-gray-100' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-gray-700">{label}</span>
      </div>
      <div className="text-right flex items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">{data.successes} / {data.tries}</span>
          <span className={`text-lg font-black w-10 text-right ${color}`}>{data.rate}%</span>
        </div>
        {onClick && <ChevronRight size={16} className="text-gray-300" />}
      </div>
    </div>
  );
}

function MissAnalysisView({ score, context, onBack }) {
  if (!score || !context) return null;

  const holes = score.detailedHoles || [];
  const reasonCounts = {};
  let totalMissHoles = 0;

  // 실패(X)로 기록된 전체 홀 수를 먼저 구합니다.
  const resultKeyMap = {
    'drive': 'drive',
    'secondShot': 'secondShotResult',
    'gir': 'girResult',
    'ud': 'udResult'
  };
  
  const reasonKeyMap = {
    'drive': 'driveMissReason',
    'secondShot': 'secondShotMissReason',
    'gir': 'girMissReason',
    'ud': 'udMissReason'
  };
  
  const resultKey = resultKeyMap[context.statType];
  const reasonKey = reasonKeyMap[context.statType];

  holes.forEach(h => {
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
    .map(([id, count]) => {
      const reasonObj = MISS_REASONS.find(mr => mr.id === id);
      return { ...reasonObj, count };
    })
    .sort((a, b) => b.count - a.count);

  const maxCount = sortedReasons.length > 0 ? sortedReasons[0].count : 0;

  return (
    <div className="p-5 animate-fadeIn pb-24 h-full bg-gray-50">
      {/* 헤더 영역 */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-black text-gray-800 leading-tight">{context.title}</h2>
          <div className="text-xs font-medium text-gray-500 mt-0.5">{score.course} • 총 {totalMissHoles}회 실패</div>
        </div>
      </div>

      {/* 차트 영역 */}
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
    emptyMessage = "리커버리 시도 후 기록된 1st 퍼트 거리가 없습니다.";
  } else if (context.statType === 'onePutt') {
    displayHoles = holes.filter(h => h.putts === 1);
    emptyMessage = "1퍼팅 기록이 없습니다.";
  } else if (context.statType === 'threePutt') {
    displayHoles = holes.filter(h => h.putts >= 3);
    emptyMessage = "3퍼팅 이상 기록이 없습니다.";
  }

  const isDistanceStat = context.statType.includes('FirstPuttDist');

  return (
    <div className="p-5 animate-fadeIn pb-24 h-full bg-gray-50">
      {/* 헤더 영역 */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-black text-gray-800 leading-tight">{context.title}</h2>
          <div className="text-xs font-medium text-gray-500 mt-0.5">{score.course} • 총 {displayHoles.length}홀</div>
        </div>
      </div>

      {/* 리스트 영역 */}
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
                      <span className={`text-2xl font-black ${context.statType === 'girFirstPuttDist' ? 'text-blue-600' : 'text-orange-600'}`}>{h.firstPuttFt}</span>
                      <span className={`text-xs font-bold ${context.statType === 'girFirstPuttDist' ? 'text-blue-400' : 'text-orange-400'} ml-1`}>ft</span>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-2xl font-black ${context.statType === 'onePutt' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {h.putts}
                      </span>
                      <span className="text-xs font-bold text-gray-400 ml-1">퍼트</span>
                    </div>
                  )}
                  {!isDistanceStat && h.firstPuttFt && (
                     <div className="text-[11px] font-medium text-gray-400 mt-0.5">1st 퍼트 거리: <span className="font-bold text-gray-600">{h.firstPuttFt}ft</span></div>
                  )}
                  {isDistanceStat && (
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

function AddScoreDetailedView({ setScores, setCurrentTab }) {
  const [step, setStep] = useState(1); 
  
  const [info, setInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    course: '',
    type: 'practice',
    tournamentName: '',
    temperature: '',
    wind: '',
    isRaining: false,
    precipitation: ''
  });

  const [holes, setHoles] = useState(Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    par: 4,
    score: 4,
    putts: 2,
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
  })));

  const [currentHoleIdx, setCurrentHoleIdx] = useState(0);
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

  // 각 차수별 퍼팅 세부 기록 업데이트 함수
  const updatePuttDetail = (puttIndex, field, value) => {
    if (value !== '' && Number(value) < 0) return;

    const newHoles = [...holes];
    const currentHole = newHoles[currentHoleIdx];
    
    const currentDetails = currentHole.puttDetails || Array.from({length: 4}, () => ({ distance: '', hook: '', slice: '', downhill: '', uphill: '' }));
    const newDetails = [...currentDetails];
    
    newDetails[puttIndex] = { ...newDetails[puttIndex], [field]: value };
    
    // 1st putt 거리 입력 시 기존 firstPuttFt와 동기화 (기존 통계 호환용)
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
    return { totalScore, totalPutts, totalFairways };
  };

  const handleSave = () => {
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
      id: Date.now(),
      date: info.date,
      course: info.course,
      type: info.type,
      tournamentName: info.type === 'tournament' ? info.tournamentName : undefined,
      temperature: info.temperature,
      wind: info.wind,
      isRaining: info.isRaining,
      precipitation: info.precipitation,
      total: totalScore,
      putts: totalPutts,
      fairways: totalFairways,
      detailedHoles: holes 
    };

    setScores(prev => [...prev, newScore]);
    alert('스코어와 상세 통계가 성공적으로 저장되었습니다!');
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
        <h2 className="text-xl font-bold text-gray-800 mb-6">라운드 정보 입력</h2>
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
              <input type="text" placeholder="예) 전국 청소년 골프대회" value={info.tournamentName} onChange={e => setInfo({...info, tournamentName: e.target.value})} className="w-full p-3 bg-emerald-50/30 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
            </div>
          )}

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

    // Par 5 세컨샷 클럽 그룹
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

    // 글로벌 MISS_REASONS 배열에서 각각 필요한 만큼 잘라서 사용합니다.
    const driveMissReasons = MISS_REASONS.slice(0, 6);
    const girMissReasons = MISS_REASONS.slice(0, 7);
    const udMissReasons = MISS_REASONS; // 8개 전체 사용

    // 리커버리 사용 클럽 리스트
    const udClubs = ['7i', '8i', '9i', 'pw', '50°', '52°', '54°', '56°', '58°', '60°'];
    const bunkerClubs = ['9i', 'pw', '50°', '52°', '54°', '56°', '58°', '60°'];

    // 리커버리 거리/상황 변경 처리 함수 (벙커 선택 시 유효하지 않은 클럽 리셋)
    const handleUdDistChange = (dist) => {
      const newDist = curHole.udDist === dist ? null : dist;
      let newClub = curHole.udClub;
      
      // 벙커 선택 시 기존에 선택된 클럽이 벙커용 클럽 목록에 없다면 초기화
      if (newDist === 'bunker_25' && newClub && !bunkerClubs.includes(newClub)) {
         newClub = null;
      }
      
      const newHoles = [...holes];
      newHoles[currentHoleIdx] = { ...newHoles[currentHoleIdx], udDist: newDist, udClub: newClub };
      setHoles(newHoles);
    };

    // 스코어에 따른 기분 이모티콘 결정 함수
    const getScoreEmoji = (score, par) => {
      const diff = score - par;
      if (diff >= 1) return ' 😭'; // 보기 이상
      if (diff === 0) return ' 🙂'; // 파
      if (diff === -1) return ' 😄'; // 버디
      if (diff <= -2) return ' 🤩'; // 이글 이상
      return '';
    };

    // 퍼트 수에 따른 기분 이모티콘 결정 함수
    const getPuttEmoji = (p) => {
      if (p >= 3) return ' 😭';
      if (p === 2) return ' 🙂';
      if (p === 1) return ' 😄';
      if (p === 0) return ' 🤩'; // 칩인 등
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
    const { totalScore, totalPutts } = calculateTotals();
    
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
            <div className="text-right">
               <div className="text-xs text-gray-400">Weather Info</div>
               <div className="text-sm font-bold">
                 {info.temperature ? `${info.temperature}°C` : '-'} / {info.wind || '-'}
                 {info.isRaining && info.precipitation ? ` / 🌧️ ${info.precipitation}mm` : ''}
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
          <Save size={20} /> 최종 기록 저장하기
        </button>
      </div>
    );
  }
}

function Stepper({ label, value, onChange }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col items-center">
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
  const [selectedMetrics, setSelectedMetrics] = useState(['gir']); // 다중 선택 배열로 변경
  const [selectedRoundIds, setSelectedRoundIds] = useState([]);
  const [isRoundListExpanded, setIsRoundListExpanded] = useState(false);

  const METRICS = [
    { id: 'teeShot', label: '티샷 페어웨이 안착률', unit: '%', strokeHex: '#9333ea', bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-500' },
    { id: 'secondShot', label: '세컨샷 페어웨이 안착률', unit: '%', strokeHex: '#2563eb', bgClass: 'bg-blue-100', textClass: 'text-blue-700', borderClass: 'border-blue-500' },
    { id: 'gir', label: '그린적중률(GIR)', unit: '%', strokeHex: '#10b981', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', borderClass: 'border-emerald-500' },
    { id: 'ud', label: 'UP&DOWN 성공률', unit: '%', strokeHex: '#f97316', bgClass: 'bg-orange-100', textClass: 'text-orange-700', borderClass: 'border-orange-500' },
    { id: 'avgPutts', label: '평균 퍼팅수', unit: '개', strokeHex: '#4b5563', bgClass: 'bg-gray-200', textClass: 'text-gray-700', borderClass: 'border-gray-500' },
    { id: 'girFirstPuttDist', label: 'GIR시 1st 평균거리', unit: 'ft', strokeHex: '#06b6d4', bgClass: 'bg-cyan-100', textClass: 'text-cyan-700', borderClass: 'border-cyan-500' },
    { id: 'recFirstPuttDist', label: '리커버리시 1st 평균거리', unit: 'ft', strokeHex: '#ef4444', bgClass: 'bg-red-100', textClass: 'text-red-700', borderClass: 'border-red-500' },
    { id: 'onePutts', label: '1퍼팅', unit: '회', strokeHex: '#14b8a6', bgClass: 'bg-teal-100', textClass: 'text-teal-700', borderClass: 'border-teal-500' },
    { id: 'threePutts', label: '3퍼팅 이상', unit: '회', strokeHex: '#f43f5e', bgClass: 'bg-rose-100', textClass: 'text-rose-700', borderClass: 'border-rose-500' }
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
      case 'onePutts': return holes.filter(h => h.putts === 1).length;
      case 'threePutts': return holes.filter(h => h.putts >= 3).length;
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

  // 다중 그래프를 위한 Y축 min/max 계산
  const isAllPercentages = chartSeries.length > 0 && chartSeries.every(s => s.unit === '%');
  
  let effectiveMin, range;
  if (isAllPercentages) {
     // 퍼센트 지표만 있을 경우 Y축 스케일을 0~100으로 고정
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
        if (prev.length === 1) return prev; // 최소 1개는 선택 유지
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

      {/* 다중 선택 가능한 지표 메뉴 */}
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

      {/* 라운드 커스텀 선택 메뉴 */}
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
         {/* 다중 지표 요약 (Grid) */}
         <div className="grid grid-cols-2 gap-3 mb-6 border-b border-gray-100 pb-4">
            {chartSeries.map(series => {
               const avgVal = series.data.length > 0 ? parseFloat((series.data.reduce((s, d) => s + d.val, 0) / series.data.length).toFixed(1)) : 0;
               const isLowerBetter = ['avgPutts', 'girFirstPuttDist', 'recFirstPuttDist', 'threePutts'].includes(series.id);
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

         {/* 동적 선형 그래프 (SVG) */}
         {chartScores.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Activity size={24} className="mb-2 text-gray-300" />
              선택된 라운드가 없습니다.
            </div>
         ) : (
            <div className="w-full overflow-x-auto scrollbar-hide -mx-5 px-5">
               <div className="relative h-64 mt-2 border-b border-gray-100 transition-all duration-300" style={{ width: `${chartWidthPercent}%` }}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                    
                    {/* Y축 점선 그리드 (25%, 50%, 75%, 100%) */}
                    {[25, 50, 75, 100].map(val => {
                      const plotVal = isAllPercentages ? val : effectiveMin + (range * (val / 100));
                      const y = 100 - paddingY - ((plotVal - effectiveMin) / range) * (100 - paddingY * 2);
                      
                      return (
                        <g key={`grid-${val}`}>
                          <line x1="0" y1={y} x2="100" y2={y} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="1.5,1.5" vectorEffect="non-scaling-stroke" opacity="0.8" />
                        </g>
                      );
                    })}

                    {/* 다중 차트 렌더링 */}
                    {chartSeries.map((series, sIdx) => {
                      const pointsStr = series.data.map((d, i) => {
                        const x = chartScores.length === 1 ? 50 : paddingX + (i / (chartScores.length - 1)) * (100 - paddingX * 2);
                        const y = 100 - paddingY - ((d.val - effectiveMin) / range) * (100 - paddingY * 2);
                        return `${x},${y}`;
                      }).join(' ');
                      
                      // 하나만 선택됐을 때는 예쁘게 아래 그라데이션 채우기 추가
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
                  
                  {/* 데이터 포인트 오버레이 */}
                  {chartScores.map((score, i) => {
                     const x = chartScores.length === 1 ? '50%' : `${paddingX + (i / (chartScores.length - 1)) * (100 - paddingX * 2)}%`;
                     return (
                        <div key={`col-${score.id}`} className="absolute top-0 bottom-0 pointer-events-none" style={{ left: x, width: '20px', marginLeft: '-10px' }}>
                           {chartSeries.map(series => {
                              const d = series.data[i];
                              const y = `${100 - paddingY - ((d.val - effectiveMin) / range) * (100 - paddingY * 2)}%`;
                              return (
                                 <div key={`${series.id}-${d.id}`} className="absolute w-full h-0 transition-all duration-500" style={{ top: y }}>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-1.5 flex flex-col items-center">
                                       <span className={`text-[9px] font-bold bg-white/90 px-1 py-0.5 rounded shadow-sm border whitespace-nowrap ${series.textClass} ${series.borderClass}`}>
                                         {d.val}{series.unit === '%' ? '%' : ''}
                                       </span>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10" style={{ backgroundColor: series.strokeHex }}></div>
                                 </div>
                              );
                           })}
                           {/* X축 날짜 라벨 */}
                           <div className="absolute bottom-0 left-1/2 transform translate-y-7 -translate-x-1/2 text-center text-[9px] text-gray-400 font-bold whitespace-nowrap">
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

// --- [새로 추가된 컴포넌트: 교습가 전용 앱 페이지] ---
function InstructorApp({ onLogout }) {
  const [studentEmail, setStudentEmail] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false); // 로그아웃 메뉴 상태
  
  // 모의 데이터(initialScores)를 학생 데이터에 연동
  const [students, setStudents] = useState([
    { id: 1, email: 'tiger.woods@example.com', name: '타이거 우즈', lastRound: '2026.03.08', avgScore: 68, scores: initialScores },
    { id: 2, email: 'rory@example.com', name: '로리 맥길로이', lastRound: '2026.03.05', avgScore: 69, scores: initialScores.slice(0, 2) },
  ]);

  // 특정 학생 조회 모드 상태 관리
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedScore, setSelectedScore] = useState(null); 
  const [analysisContext, setAnalysisContext] = useState(null);

  const handleAddStudent = () => {
    if (!studentEmail || !studentEmail.includes('@')) {
      alert('정확한 학생의 이메일을 입력해주세요.');
      return;
    }
    
    // 새로운 학생 추가
    const newStudent = {
      id: Date.now(),
      email: studentEmail,
      name: studentEmail.split('@')[0], 
      lastRound: '기록 없음',
      avgScore: '-',
      scores: [] // 새 학생은 빈 데이터
    };
    
    setStudents([newStudent, ...students]);
    setStudentEmail('');
    alert('학생이 성공적으로 등록되었습니다!\n추후 해당 학생의 데이터를 이곳에서 연동하여 볼 수 있습니다.');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setCurrentTab('dashboard');
    setSelectedScore(null);
  };

  // 학생 계정을 터치하여 상세 화면에 진입한 경우
  if (selectedStudent) {
    const renderStudentTabContent = () => {
      switch(currentTab) {
        case 'dashboard': 
          return <DashboardView 
                    scores={selectedStudent.scores} 
                    isPremium={true} 
                    onScoreClick={(score) => {
                      setSelectedScore(score);
                      setCurrentTab('roundDetail');
                    }} 
                 />;
        case 'stats': 
          return <StatsView scores={selectedStudent.scores} />;
        case 'roundDetail': 
          return <RoundDetailView 
                   score={selectedScore} 
                   onBack={() => setCurrentTab('dashboard')} 
                   onAnalyze={(statType, title, category = 'miss') => {
                     setAnalysisContext({ statType, title, category });
                     setCurrentTab(category === 'putting' ? 'puttingAnalysis' : 'missAnalysis');
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
          return <DashboardView scores={selectedStudent.scores} onScoreClick={() => {}} />;
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
          {/* 교습가용 열람 헤더 (슬레이트 테마 유지) */}
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

          {/* 교습가용 심플 하단 네비게이션 */}
          <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md flex justify-around p-3 pb-safe z-10">
            <NavItem icon={<Home />} label="홈 (요약)" isActive={currentTab === 'dashboard'} onClick={() => setCurrentTab('dashboard')} />
            <NavItem icon={<TrendingUp />} label="상세 분석" isActive={currentTab === 'stats'} onClick={() => setCurrentTab('stats')} />
          </nav>
        </div>
      </div>
    );
  }

  // 기본 교습가 메인 화면 (학생 목록)
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative flex flex-col">
        <header className="bg-slate-800 text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ZoroEyesIcon size={28} className="text-white" />
            Zeno Golf <span className="text-[10px] font-bold text-slate-300 bg-slate-700 px-2 py-0.5 rounded-full ml-1 align-middle">교습가 모드</span>
          </h1>
          
          {/* 유저 아이콘 및 로그아웃 드롭다운 메뉴 */}
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

          {/* 학생 추가 폼 */}
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

          {/* 학생 리스트 */}
          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="font-bold text-gray-700">등록된 학생 목록</h3>
              <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">총 {students.length}명</span>
            </div>
            
            <div className="space-y-3">
              {students.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => setSelectedStudent(student)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 hover:border-slate-300 transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm mb-0.5">{student.name}</div>
                      <div className="text-[10px] text-gray-500">{student.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <div className="text-[10px] text-gray-400 font-bold mb-0.5">평균 타수</div>
                      <div className="text-sm font-black text-slate-600">{student.avgScore} <span className="text-[10px] font-normal">타</span></div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}