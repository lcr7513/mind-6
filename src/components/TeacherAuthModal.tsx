import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, AlertCircle, X, School, Eye, EyeOff } from 'lucide-react';
import { Teacher } from '../types';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacher: Teacher;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacher,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === '1234') {
      setError(null);
      setPassword('');
      onSuccess();
    } else {
      setError('비밀번호가 올바르지 않습니다. 다시 확인해 주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black tracking-tight">교사 관리 모드 인증</h3>
          <p className="text-xs text-indigo-200 mt-1 flex items-center justify-center gap-1.5">
            <School className="w-3.5 h-3.5" />
            <span>{teacher.school} · {teacher.name} 선생님 ({teacher.subject})</span>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs text-slate-600 leading-relaxed">
              학생 개인정보 및 세특 탐구 관리를 위해 <strong>교사 전용 비밀번호</strong>를 입력해 주세요.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              교사 인증 비밀번호
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                autoFocus
                placeholder="교사 인증 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-center text-base font-black tracking-widest focus:outline-none transition-colors ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                    : 'border-slate-300 focus:bg-white focus:border-indigo-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                title={showPassword ? '비밀번호 가리기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1.5 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소 (학생 모드 유지)
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>교사 모드 입장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
