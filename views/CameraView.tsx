
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { ScanningOverlay } from '../components/ScanningOverlay';

interface CameraViewProps {
  onCaptured: (result: AnalysisResult, image: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCaptured, onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // 拍摄的照片

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化摄像头
  const startCamera = useCallback(async () => {
    try {
      // 先停止之前的流
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera Error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setCameraError('摄像头访问被拒绝，请在浏览器设置中允许访问摄像头');
        } else if (err.name === 'NotFoundError') {
          setCameraError('未找到摄像头设备');
        } else {
          setCameraError(`无法访问摄像头: ${err.message}`);
        }
      }
    }
  }, [facingMode, stream]);

  // 组件挂载时启动摄像头
  useEffect(() => {
    startCamera();

    // 清理函数
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 切换摄像头时重新启动
  useEffect(() => {
    if (stream && !capturedImage) {
      startCamera();
    }
  }, [facingMode]);

  // 切换前后摄像头
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // 拍照并分析
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // 设置 canvas 尺寸与视频一致
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制当前帧
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 转换为 base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64String = dataUrl.split(',')[1];

    // 保存拍摄的照片并暂停摄像头
    setCapturedImage(dataUrl);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(base64String);
      onCaptured(result, dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "分析失败，请稍后重试");
      // 分析失败，重新启动摄像头
      setCapturedImage(null);
      setIsAnalyzing(false);
      startCamera();
    }
  };

  // 重新拍照
  const retakePhoto = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    startCamera();
  };

  // 文件上传处理（备选方案）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      const base64String = dataUrl.split(',')[1];

      // 显示选中的图片
      setCapturedImage(dataUrl);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setIsAnalyzing(true);
      try {
        const result = await analyzeFoodImage(base64String);
        onCaptured(result, dataUrl);
      } catch (err) {
        alert(err instanceof Error ? err.message : "分析失败，请稍后重试");
        setCapturedImage(null);
        setIsAnalyzing(false);
        startCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-black overflow-hidden">
      {/* 视觉预览区域 */}
      <div className="absolute inset-0 z-0">
        {capturedImage ? (
          // 显示拍摄/选择的照片
          <img
            className="h-full w-full object-cover"
            src={capturedImage}
            alt="Captured"
          />
        ) : cameraError ? (
          // 摄像头出错时显示备选背景
          <>
            <img className="h-full w-full object-cover opacity-60 filter blur-[2px]" src="https://picsum.photos/seed/salad/800/1200" alt="Viewfinder" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center px-8">
                <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">videocam_off</span>
                <p className="text-white/80 text-sm mb-4">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/80 transition"
                >
                  📷 从相册选择图片
                </button>
              </div>
            </div>
          </>
        ) : (
          // 实时视频流
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
      </div>

      {/* 隐藏的 canvas 用于截图 */}
      <canvas ref={canvasRef} className="hidden" />

      {isAnalyzing && <ScanningOverlay />}

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition">
          <span className="material-symbols-outlined">close</span>
        </button>
        {!capturedImage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center h-10 px-4 rounded-full bg-black/20 backdrop-blur-md text-white gap-2 hover:bg-black/40 transition"
          >
            <span className="material-symbols-outlined text-[20px]">photo_library</span>
            <span className="text-sm font-semibold">相册</span>
          </button>
        )}
      </div>

      {/* Center Focus Area / Status */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {capturedImage && isAnalyzing ? (
          // 分析中状态
          <div className="text-center">
            <div className="mt-8 px-6 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
              <p className="text-white text-sm font-medium tracking-wide">🔍 AI 正在分析中...</p>
            </div>
          </div>
        ) : !capturedImage && !cameraError && (
          // 拍照前的取景框
          <>
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 border-[2px] border-white/30 rounded-[2rem]"></div>

              {/* Focus Corners */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[4px] border-l-[4px] border-primary rounded-tl-2xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-[4px] border-r-[4px] border-primary rounded-tr-2xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-[4px] border-l-[4px] border-primary rounded-bl-2xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[4px] border-r-[4px] border-primary rounded-br-2xl"></div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-white/50 text-4xl animate-pulse">crop_free</span>
              </div>
            </div>

            <div className="mt-8 px-6 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
              <p className="text-white text-sm font-medium tracking-wide">对准食物 • 点击拍照</p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 flex flex-col w-full px-8 pb-10 pt-4">
        {capturedImage ? (
          // 已拍照状态：显示重拍按钮
          <div className="flex items-center justify-center">
            {!isAnalyzing && (
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white/30 transition"
              >
                <span className="material-symbols-outlined">refresh</span>
                重新拍摄
              </button>
            )}
          </div>
        ) : (
          // 未拍照状态：显示拍照控制按钮
          <div className="flex items-center justify-between sm:px-12">
            {/* Gallery Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="size-14 rounded-2xl overflow-hidden border-2 border-white/20 active:scale-95 transition bg-gray-800 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-white text-2xl">photo_library</span>
            </button>

            {/* Shutter Button */}
            <button
              disabled={isAnalyzing || !!cameraError}
              onClick={captureAndAnalyze}
              className="group relative flex items-center justify-center size-24 rounded-full cursor-pointer transition-transform active:scale-90 disabled:opacity-50"
            >
              <div className="absolute inset-0 rounded-full border-[6px] border-white/30"></div>
              <div className="size-20 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center group-hover:bg-gray-100 transition">
                <div className="size-16 rounded-full border-[2px] border-gray-300"></div>
              </div>
            </button>

            {/* Flip Camera Button */}
            <button
              onClick={toggleCamera}
              disabled={!!cameraError}
              className="size-14 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 flex items-center justify-center active:scale-95 transition disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">flip_camera_ios</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default CameraView;
