
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { LucideQrCode, Download, FileText, Settings, Sparkles, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { Button } from './components/Button';
import { QRConfig, AIResult } from './types';
import { analyzeQRContent } from './services/geminiService';

const App: React.FC = () => {
  const [qrConfig, setQrConfig] = useState<QRConfig>({
    value: 'https://google.com',
    fgColor: '#000000',
    bgColor: '#ffffff',
    size: 256,
    level: 'M',
    includeMargin: true
  });

  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setQrConfig(prev => ({ ...prev, value: e.target.value }));
  };

  const handleColorChange = (key: 'fgColor' | 'bgColor', value: string) => {
    setQrConfig(prev => ({ ...prev, [key]: value }));
  };

  const runAIAnalysis = useCallback(async () => {
    if (!qrConfig.value.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeQRContent(qrConfig.value);
    setAiResult(result);
    setIsAnalyzing(false);
  }, [qrConfig.value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (qrConfig.value.length > 5) {
        runAIAnalysis();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [qrConfig.value, runAIAnalysis]);

  const downloadPNG = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
  };

  const downloadPDF = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text("Generated QR Code", 105, 20, { align: 'center' });
    pdf.addImage(imgData, 'PNG', 40, 40, 130, 130);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Content: ${qrConfig.value}`, 105, 180, { align: 'center' });
    pdf.save(`qr-code-${Date.now()}.pdf`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrConfig.value);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LucideQrCode className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">QR Pro Studio</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span>দ্রুত • নির্ভরযোগ্য • হাই-কোয়ালিটি</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Input & Controls */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  কিউআর কোড কন্টেন্ট (লিংক বা টেক্সট)
                </label>
                <div className="text-xs text-slate-400 font-medium">
                  {qrConfig.value.length} ক্যারেক্টার
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={qrConfig.value}
                  onChange={handleInputChange}
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-slate-700"
                  placeholder="এখানে আপনার লিংক, ফোন নম্বর বা যেকোনো টেক্সট লিখুন..."
                />
                <button 
                  onClick={copyToClipboard}
                  className="absolute bottom-3 right-3 p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
                  title="Copy content"
                >
                  {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* AI Analysis View */}
              <div className="mt-4">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    <span>AI কন্টেন্ট বিশ্লেষণ করছে...</span>
                  </div>
                ) : aiResult ? (
                  <div className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${aiResult.isSafe ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                    {aiResult.isSafe ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <p className="font-medium">{aiResult.suggestion}</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-800">কাস্টমাইজ করুন</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">ফোরগ্রাউন্ড কালার</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={qrConfig.fgColor} 
                        onChange={(e) => handleColorChange('fgColor', e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-sm font-mono font-medium text-slate-600">{qrConfig.fgColor.toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">ব্যাকগ্রাউন্ড কালার</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={qrConfig.bgColor} 
                        onChange={(e) => handleColorChange('bgColor', e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-sm font-mono font-medium text-slate-600">{qrConfig.bgColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">নির্ভুলতা স্তর (Error Correction)</label>
                    <select 
                      value={qrConfig.level}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, level: e.target.value as any }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="margin"
                      checked={qrConfig.includeMargin}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, includeMargin: e.target.checked }))}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="margin" className="text-sm font-medium text-slate-700 cursor-pointer select-none">মার্জিন যোগ করুন</label>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Side: Preview & Download */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white p-4 rounded-xl shadow-xl overflow-hidden">
                    <QRCodeCanvas
                      id="qr-canvas"
                      value={qrConfig.value || ' '}
                      size={qrConfig.size}
                      bgColor={qrConfig.bgColor}
                      fgColor={qrConfig.fgColor}
                      level={qrConfig.level}
                      includeMargin={qrConfig.includeMargin}
                    />
                  </div>
                </div>
                
                <p className="mt-8 text-sm font-medium text-slate-400 uppercase tracking-widest">কিউআর প্রিভিউ</p>
                <p className="text-xs text-slate-400 mt-1">ক্যানভাস সাইজ: {qrConfig.size}x{qrConfig.size}px</p>

                <div className="w-full mt-10 space-y-4">
                  <Button 
                    fullWidth 
                    onClick={downloadPNG} 
                    className="group"
                  >
                    <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                    ইমেজ ডাউনলোড করুন (PNG)
                  </Button>
                  <Button 
                    fullWidth 
                    variant="secondary" 
                    onClick={downloadPDF}
                    className="group"
                  >
                    <FileText className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                    পিডিএফ ডাউনলোড করুন (PDF)
                  </Button>
                </div>
              </section>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  টিপস
                </h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  সবচেয়ে ভালো স্ক্যানিং ফলাফলের জন্য ব্যাকগ্রাউন্ডের চেয়ে ফোরগ্রাউন্ড কালার গাঢ় রাখার চেষ্টা করুন। প্রিন্ট করার জন্য PDF ফরম্যাট বেছে নিন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} QR Pro Studio • সকল ডাটা আপনার ব্রাউজারে সংরক্ষিত থাকে</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
