import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Save, 
  Search, 
  Trash2, 
  LogOut, 
  Upload, 
  UserPlus,
  ShieldCheck,
  AlertCircle,
  X,
  Plus,
  Settings,
  Eraser,
  Printer,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Member {
  id: string;
  fullName: string;
  dob: string;
  residence: string;
  landmark: string;
  phone: string;
  profession: string;
  currentUnit: string;
  previousUnit: string;
  nationalId: string;
  image: string; // Base64 image
  isArchived: boolean;
  customFields?: Record<string, string>;
}

interface CustomFieldDef {
  id: string;
  name: string;
}

// --- Constants ---
const INITIAL_MEMBER_BASE = {
  fullName: '',
  dob: '',
  residence: '',
  landmark: '',
  phone: '',
  profession: '',
  currentUnit: '',
  previousUnit: '',
  nationalId: '',
  image: '',
  isArchived: false,
  customFields: {},
};

const DEFAULT_AUTH = {
  username: '123456',
  password: '123456',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [auth, setAuth] = useState(DEFAULT_AUTH);
  const [isChangingAuth, setIsChangingAuth] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDef[]>([]);
  const [currentMember, setCurrentMember] = useState<Partial<Member>>(INITIAL_MEMBER_BASE);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfiguringFields, setIsConfiguringFields] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'active' | 'archived'>('active');
  const [loginError, setLoginError] = useState('');
  const [authUpdateError, setAuthUpdateError] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedMembers = localStorage.getItem('security_members');
    const savedFields = localStorage.getItem('security_custom_fields');
    const savedAuth = localStorage.getItem('security_auth');

    if (savedMembers) {
      try { setMembers(JSON.parse(savedMembers)); } catch (e) { console.error(e); }
    }
    if (savedFields) {
      try { setCustomFieldDefs(JSON.parse(savedFields)); } catch (e) { console.error(e); }
    }
    if (savedAuth) {
      try { setAuth(JSON.parse(savedAuth)); } catch (e) { console.error(e); }
    }
  }, []);

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem('security_members', JSON.stringify(members));
    localStorage.setItem('security_custom_fields', JSON.stringify(customFieldDefs));
    localStorage.setItem('security_auth', JSON.stringify(auth));
  }, [members, customFieldDefs, auth]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formData.get('username') === auth.username && formData.get('password') === auth.password) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleChangeAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oldU = formData.get('oldUsername');
    const oldP = formData.get('oldPassword');
    const newU = formData.get('newUsername') as string;
    const newP = formData.get('newPassword') as string;

    if (oldU === auth.username && oldP === auth.password) {
      setAuth({ username: newU, password: newP });
      setIsChangingAuth(false);
      setAuthUpdateError('');
      alert("تم تحديث بيانات الدخول بنجاح");
    } else {
      setAuthUpdateError('بيانات الدخول القديمة غير صحيحة');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCurrentMember(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMember = () => {
    if (!currentMember.fullName?.trim()) {
      alert("يرجى إدخال الاسم الكامل على الأقل");
      return;
    }

    if (currentMember.id) {
      setMembers(prev => prev.map(m => m.id === currentMember.id ? { ...currentMember } as Member : m));
      alert("تم تحديث السجل بنجاح");
    } else {
      const newMember: Member = {
        ...(currentMember as any),
        id: Date.now().toString(),
        isArchived: false
      };
      setMembers(prev => [...prev, newMember]);
      alert("تم إضافة السجل بنجاح");
    }
    setCurrentMember(INITIAL_MEMBER_BASE);
  };

  const handleDeleteMember = () => {
    if (currentMember.id) {
      if (window.confirm('هل أنت متأكد من حذف بيانات هذا المنتسب نهائياً من قاعدة البيانات؟')) {
        setMembers(prev => prev.filter(m => m.id !== currentMember.id));
        setCurrentMember(INITIAL_MEMBER_BASE);
        alert("تم حذف البيانات بنجاح");
      }
    } else {
      // Just clear the form if it's a new unsaved record
      setCurrentMember(INITIAL_MEMBER_BASE);
    }
  };

  const handleClearForm = () => {
    if (window.confirm('⚠️ تحذير: هل أنت متأكد من مسح جميع السجلات المخزنة في الأرشيف؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      setMembers([]);
      setCurrentMember(INITIAL_MEMBER_BASE);
      alert("تم تصفية قاعدة البيانات بالكامل");
    }
  };

  const handleResetCurrentForm = () => {
    // Only clear the visible fields on the page
    setCurrentMember(INITIAL_MEMBER_BASE);
  };

  const handleAddCustomField = () => {
    if (newFieldName.trim()) {
      if (customFieldDefs.some(f => f.name === newFieldName.trim())) {
        alert("هذا الحقل موجود بالفعل");
        return;
      }
      setCustomFieldDefs(prev => [...prev, { id: Date.now().toString(), name: newFieldName.trim() }]);
      setNewFieldName('');
    }
  };

  const handleRemoveCustomField = (id: string) => {
    if (confirm('حذف هذا الحقل سيؤدي إلى إزالته من النموذج. هل أنت متأكد؟')) {
      setCustomFieldDefs(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleSaveMemberAndLogout = () => {
    if (!currentMember.fullName?.trim()) {
      alert("يرجى إدخال الاسم الكامل على الأقل");
      return;
    }
    handleSaveMember();
    setIsLoggedIn(false);
  };

  const displayMembers = members.filter(m => {
    const matchesSearch = m.fullName.includes(searchQuery) || m.nationalId.includes(searchQuery);
    const matchesTab = searchTab === 'archived' ? m.isArchived : !m.isArchived;
    return matchesSearch && matchesTab;
  });

  if (!isLoggedIn) {
     return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans" dir="rtl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <AnimatePresence mode="wait">
              {!isChangingAuth ? (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex flex-col items-center mb-10">
                    <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-200 mb-6"><ShieldCheck className="w-12 h-12 text-white" /></div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">معلومات أمنية</h1>
                    <p className="text-slate-400 mt-2 text-sm font-bold opacity-60">نظام إدارة بيانات المنتسبين</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">اسم المستخدم</label>
                      <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input type="text" name="username" required placeholder="123456" className="w-full bg-slate-50 border border-slate-100 p-4 pr-12 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">كلمة المرور</label>
                      <div className="relative group">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input type="password" name="password" required placeholder="123456" className="w-full bg-slate-50 border border-slate-100 p-4 pr-12 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold" />
                      </div>
                    </div>
                    {loginError && <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-xl border border-red-100 animate-pulse">{loginError}</div>}
                    <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-sm hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-slate-200">تسجيل الدخول</button>
                    
                    <button type="button" onClick={() => setIsChangingAuth(true)} className="w-full text-blue-600 text-xs font-bold hover:underline mt-4 flex items-center justify-center gap-2">
                      <KeyRound className="w-4 h-4" /> تغيير بيانات الدخول
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="changeAuth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">تحديث بيانات الدخول</h2>
                    <p className="text-slate-400 text-xs font-bold">تعديل اسم المستخدم وكلمة المرور الحالية</p>
                  </div>
                  <form onSubmit={handleChangeAuth} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">اسم المستخدم القديم</label>
                        <input type="text" name="oldUsername" required className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">اسم المستخدم الجديد</label>
                        <input type="text" name="newUsername" required className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">كلمة المرور القديمة</label>
                        <input type="password" name="oldPassword" required className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">كلمة المرور الجديدة</label>
                        <input type="password" name="newPassword" required className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none font-bold" />
                      </div>
                    </div>
                    {authUpdateError && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl border border-red-100">{authUpdateError}</div>}
                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="flex-1 bg-blue-600 text-white p-4 rounded-xl font-black text-xs hover:bg-blue-700 transition-all">حفظ التغييرات</button>
                      <button type="button" onClick={() => setIsChangingAuth(false)} className="flex-1 bg-slate-100 text-slate-600 p-4 rounded-xl font-black text-xs hover:bg-slate-200 transition-all">إلغاء</button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 font-sans overflow-x-hidden flex flex-col print:bg-white" dir="rtl">
      {/* Dynamic Header */}
      <header className="bg-[#1e293b] text-white px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-2xl print:hidden">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20"><ShieldCheck className="w-7 h-7" /></div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-none mb-1">منظومة المعلومات الأمنية</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Secure Database v2.1</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsConfiguringFields(true)} className="flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl border border-slate-700 transition-all"><Settings className="w-4 h-4" /> إعدادات الحقول</button>
          <button onClick={() => { setCurrentMember(INITIAL_MEMBER_BASE); setIsSearching(false); }} className="flex items-center gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl border border-blue-500 transition-all"><UserPlus className="w-4 h-4" /> إضافة منتسب</button>
          <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>
          <button onClick={() => setIsLoggedIn(false)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-xl border border-red-500/20 transition-all"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 w-[98.5%] mx-auto p-4 lg:p-6 space-y-6 print:p-0 print:w-full">
        {/* Quick Search */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden print:hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">Quick Access / Search Database</p>
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input type="text" placeholder="البحث بالاسم، اللقب، السكن، أو رقم البطاقة الوطنية..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-12 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-800 transition-all shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearching(true)} />
            </div>
            <button onClick={() => setIsSearching(true)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:shadow-xl active:scale-95 transition-all">بدء البحث</button>
          </div>
        </div>

        {/* Main Data Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-12 relative print:border-none print:shadow-none print:p-0">
          
          {/* Top-Left Image Box */}
          <div className="absolute top-8 left-8 z-10 print:static print:flex print:justify-end print:mb-6">
             <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-44 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden relative group shadow-sm bg-center bg-cover print:border-solid print:border-slate-200"
                  style={currentMember.image ? { backgroundImage: `url(${currentMember.image})` } : {}}
                >
                  {!currentMember.image && <div className="text-center p-4 print:hidden"><Upload className="w-8 h-8 text-slate-300 mb-2 mx-auto" /><p className="text-[10px] font-black text-slate-600">إرفاق صورة</p></div>}
                  {currentMember.image && <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[1px] print:hidden"><Upload className="text-white w-6 h-6" /></div>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                {currentMember.id && <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase print:hidden">UID: {currentMember.id}</span>}
             </div>
          </div>

          <div className="max-w-full space-y-12 print:space-y-8">
            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 print:grid-cols-2">
              {[
                { label: 'الاسم الكامل للمنتسب', key: 'fullName', type: 'text' },
                { label: 'تاريخ المواليد', key: 'dob', type: 'date' },
                { label: 'محل السكن', key: 'residence', type: 'text' },
                { label: 'أقرب نقطة دالة', key: 'landmark', type: 'text' },
                { label: 'رقم الهاتف', key: 'phone', type: 'tel' },
                { label: 'المهنة / التخصص', key: 'profession', type: 'text' },
                { label: 'الوحدة الحالية', key: 'currentUnit', type: 'text' },
                { label: 'الوحدة السابقة', key: 'previousUnit', type: 'text' },
                { label: 'رقم البطاقة الوطنية', key: 'nationalId', type: 'text' },
              ].map((field) => (
                <div key={field.key} className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest border-r-2 border-slate-200 pr-3 print:text-black">{field.label}</label>
                  <input type={field.type} value={(currentMember as any)[field.key] || ''} onChange={(e) => setCurrentMember(prev => ({ ...prev, [field.key]: e.target.value }))} className="w-full bg-slate-50/50 border-b-2 border-slate-100 px-1 py-3 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-800 print:bg-white print:border-slate-300" />
                </div>
              ))}

              {/* Dynamic Custom Fields */}
              {customFieldDefs.map((field) => (
                <div key={field.id} className="space-y-3">
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest border-r-2 border-blue-200 pr-3 print:text-black">{field.name}</label>
                  <input type="text" value={currentMember.customFields?.[field.name] || ''} onChange={(e) => setCurrentMember(prev => ({ ...prev, customFields: { ...prev.customFields, [field.name]: e.target.value } }))} className="w-full bg-blue-50/30 border-b-2 border-blue-100 px-1 py-3 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-800 print:bg-white print:border-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Toolbar Layer */}
        <div className="bg-slate-900/95 backdrop-blur-xl p-8 rounded-[40px] flex flex-wrap gap-5 items-center justify-center border border-slate-800 shadow-2xl print:hidden">
          <button onClick={handleSaveMemberAndLogout} className="flex-1 min-w-[180px] flex items-center justify-center gap-3 px-8 py-5 bg-slate-800 border border-slate-700 text-white hover:bg-black transition-all text-sm font-black uppercase rounded-2xl active:scale-95">
            <LogOut className="w-5 h-5 text-red-500" /> حفظ وخروج
          </button>
          
          <button onClick={handlePrint} className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 py-5 bg-blue-700 text-white hover:bg-blue-600 transition-all text-sm font-black uppercase rounded-2xl active:scale-95 shadow-xl shadow-blue-500/10">
            <Printer className="w-5 h-5" /> طباعة الاستمارة
          </button>
          
          <button onClick={handleResetCurrentForm} className="flex-1 min-w-[160px] flex items-center justify-center gap-3 px-6 py-5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 transition-all text-sm font-black uppercase rounded-2xl active:scale-95">
            <Eraser className="w-5 h-5" /> مسح الاستمارة (تفريغ)
          </button>

          <button onClick={handleSaveMember} className="flex-[2] min-w-[240px] flex items-center justify-center gap-3 px-10 py-5 bg-emerald-600 text-white hover:bg-emerald-500 transition-all text-sm font-black uppercase rounded-2xl shadow-2xl shadow-emerald-500/20 active:scale-95">
            <Save className="w-6 h-6" /> حفظ وتخزين البيانات
          </button>
        </div>
      </main>

      {/* Field Management Modal */}
      <AnimatePresence>
        {isConfiguringFields && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsConfiguringFields(false)} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 border border-slate-200 overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-black text-slate-800 text-xl flex items-center gap-3"><Settings className="w-6 h-6 text-blue-600" /> تخصيص الحقول المضافة</h3>
                  <button onClick={() => setIsConfiguringFields(false)} className="bg-slate-200 p-3 rounded-2xl hover:bg-slate-300 transition-colors"><X className="w-6 h-6" /></button>
               </div>
               <div className="p-10 space-y-8">
                  <div className="flex gap-3">
                    <input type="text" placeholder="اسم الحفل الجديد (مثلاً: رقم سلاح)..." className="flex-1 bg-slate-50 border border-slate-200 p-5 rounded-2xl font-bold outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()} />
                    <button onClick={handleAddCustomField} className="bg-blue-600 text-white px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"><Plus className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pl-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">إدارة الحقول الحالية</p>
                    {customFieldDefs.map(field => (
                      <div key={field.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-200 transition-all">
                        <span className="font-black text-slate-700 group-hover:text-blue-600 transition-colors">{field.name}</span>
                        <button onClick={() => handleRemoveCustomField(field.id)} className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    ))}
                    {customFieldDefs.length === 0 && <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 italic">لا توجد حقول إضافية حالياً. يمكنك إضافة حقول لتظهر في الاستمارة.</div>}
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearching(false)} className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative z-10 border border-slate-200 overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-black text-slate-800 text-xl flex items-center gap-3"><Search className="w-6 h-6 text-blue-600" /> محرك البحث في الأرشيف الموحد</h3>
                  <button onClick={() => setIsSearching(false)} className="bg-slate-200 p-3 rounded-2xl"><X className="w-6 h-6" /></button>
               </div>
                <div className="p-10">
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                    <button onClick={() => setSearchTab('active')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${searchTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>السجلات النشطة</button>
                    <button onClick={() => setSearchTab('archived')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${searchTab === 'archived' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>الأرشيف</button>
                  </div>
                  <input autoFocus type="text" placeholder="اكتب اسم أو رقم هوية للبحث الفوري..." className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-3xl outline-none font-black text-xl text-slate-800 focus:border-blue-600 mb-10 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar space-y-4 px-2">
                    {displayMembers.map(m => (
                      <div key={m.id} onClick={() => { setCurrentMember(m); setIsSearching(false); }} className={`flex items-center gap-8 p-6 rounded-[30px] transition-all cursor-pointer group active:scale-[0.99] shadow-sm border ${m.isArchived ? 'bg-amber-50/30 border-amber-100 hover:border-amber-300' : 'bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50'}`}>
                        <div className="w-20 h-24 rounded-2xl bg-white overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                          {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="text-slate-200 w-10 h-10" /></div>}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-black text-2xl group-hover:text-blue-700 transition-all ${m.isArchived ? 'text-amber-800' : 'text-slate-800'}`}>{m.fullName} {m.isArchived && <span className="text-[10px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full mr-2">مؤرشف</span>}</h4>
                          <div className="flex flex-wrap gap-4 mt-3">
                             <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-100">بطاقة وطنية: {m.nationalId || '--'}</span>
                             <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-100">الوحدة: {m.currentUnit || '--'}</span>
                             {Object.entries(m.customFields || {}).map(([key, val]) => (
                                val && <span key={key} className="text-xs font-bold text-blue-400 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100">{key}: {val}</span>
                             ))}
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Save className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    ))}
                    {displayMembers.length === 0 && <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-slate-400 italic font-bold">لا توجد سجلات مطابقة للبحث في {searchTab === 'active' ? 'القوائم النشطة' : 'الأرشيف'} حالياً.</div>}
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
