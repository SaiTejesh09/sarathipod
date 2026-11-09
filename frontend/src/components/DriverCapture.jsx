import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, CheckCircle2, AlertTriangle, RefreshCw, MapPin, Clock,
  Wifi, WifiOff, Volume2, Sparkles, Shield, ChevronDown, Check,
  AlertCircle, ArrowRight, Smartphone, ExternalLink, Info
} from 'lucide-react';
import { compressImageUnder300KB } from '../utils/imageCompression';
import { saveCaptureOffline, getOfflineCaptures, removeOfflineCapture } from '../utils/offlineStorage';
import { audioPrompts } from '../utils/AudioPrompts';

export default function DriverCapture({ trips, onTripUpdated, lang = 'mr', initialSmsToken = null }) {
  const [selectedTripId, setSelectedTripId] = useState('TRP-66120');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileSizeKB, setFileSizeKB] = useState(null);
  const [gpsLocation, setGpsLocation] = useState({ lat: 19.8762, lng: 75.3433, accuracy: 12.0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isHiredSmsMode, setIsHiredSmsMode] = useState(Boolean(initialSmsToken));
  const [driverRemarks, setDriverRemarks] = useState('');
  const [smsToken, setSmsToken] = useState(initialSmsToken || 'sms-tok-66141');

  useEffect(() => {
    if (initialSmsToken) {
      setIsHiredSmsMode(true);
      setSmsToken(initialSmsToken);
      const matchedTrip = trips.find(t => t.sms_token === initialSmsToken);
      if (matchedTrip) {
        setSelectedTripId(matchedTrip.id);
      }
    }
  }, [initialSmsToken, trips]);

  const fileInputRef = useRef(null);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0] || {
    id: 'TRP-66120',
    client_name: 'Company B (cement)',
    vehicle_no: 'MH20 EL 4521',
    destination: 'Nagpur',
    lr_no: 'LR-45901',
    retake_count: 0
  };

  // Text translations
  const t = {
    mr: {
      title: "ड्रायव्हर POD कॅमेरा",
      sub: "गेटवरून बाहेर पडण्यापूर्वी पावतीचा फोटो घ्या",
      activeTrip: "चालू ट्रिप तपशील",
      vehicle: "गाडी क्रमांक",
      route: "रूट / गंतव्य",
      lrNo: "अपेक्षित LR नंबर",
      client: "ग्राहक (Consignee)",
      bigButton: "POD फोटो काढा",
      bigButtonSub: "कॅमेरा सुरू करा आणि एका क्लिकमध्ये फोटो घ्या",
      gpsTagged: "GPS लोकेशन व वेळ प्रमाणित",
      compressBadge: "हायवे नेटवर्कसाठी कॉम्प्रेश केले (<300 KB)",
      analyzing: "AI पावती तपासत आहे... कृपया थांबा",
      verifiedHeading: "POD पडताळणी यशस्वी!",
      verifiedSub: "LR नंबर जुळला, शिक्का व स्वाक्षरी सापडली. तुम्ही गेटवरून निघू शकता.",
      retakeHeading: "पुन्हा फोटो काढा (Retake Needed)",
      retakeLeft: "उरलेले प्रयत्न",
      reviewHeading: "तपासणीसाठी पाठवले (Review Queue)",
      reviewSub: "पावतीवर शेरा (Shortage) किंवा अडचण आढळली. बिलिंग टीम तपासणी करेल.",
      retakeBtn: "🔄 पुन्हा फोटो काढा",
      sampleButtons: "जलद चाचणीसाठी नमुना पावती निवडा:",
      sampleClean: "✅ योग्य पावती (Verified Pass)",
      sampleNoStamp: "⚠️ शिक्का नसलेली पावती (Retake Requested)",
      sampleShortage: "📦 तूट/नुकसान शेरा (Needs Review)",
      offlineBanner: "तुम्ही सध्या ऑफलाइन आहात. फोटो सुरक्षित साठवला जाईल व नेटवर्क आल्यावर आपोआप अपलोड होईल.",
      syncOffline: "ऑफलाइन रांग सिंक करा",
      smsModeBtn: "हर्ड ड्रायव्हर SMS लिंक व्ह्यू (No-App Link)"
    },
    hi: {
      title: "ड्राइवर POD कैमरा",
      sub: "गेट से निकलने से पहले रसीद का फोटो लें",
      activeTrip: "चालू ट्रिप विवरण",
      vehicle: "गाड़ी नंबर",
      route: "रूट / गंतव्य",
      lrNo: "अपेक्षित LR नंबर",
      client: "ग्राहक (Consignee)",
      bigButton: "POD फोटो लें",
      bigButtonSub: "कैमरा खोलें और एक क्लिक में फोटो लें",
      gpsTagged: "GPS लोकेशन व समय प्रमाणित",
      compressBadge: "हाईवे नेटवर्क हेतु कंप्रेस किया गया (<300 KB)",
      analyzing: "AI रसीद की जांच कर रहा है... कृपया प्रतीक्षा करें",
      verifiedHeading: "POD सत्यापन सफल!",
      verifiedSub: "LR नंबर मैच हुआ, मोहर व हस्ताक्षर मिल गए। आप गेट से निकल सकते हैं।",
      retakeHeading: "दोबारा फोटो लें (Retake Needed)",
      retakeLeft: "बचे हुए प्रयास",
      reviewHeading: "जांच हेतु भेजा गया (Review Queue)",
      reviewSub: "रसीद पर कमी या खराबी की टिप्पणी मिली है। बिलिंग टीम जांच करेगी।",
      retakeBtn: "🔄 दोबारा फोटो लें",
      sampleButtons: "त्वरित परीक्षण हेतु नमूना रसीद चुनें:",
      sampleClean: "✅ सही रसीद (Verified Pass)",
      sampleNoStamp: "⚠️ मोहर रहित रसीद (Retake Requested)",
      sampleShortage: "📦 माल कम मिलने की रसीद (Needs Review)",
      offlineBanner: "आप अभी ऑफलाइन हैं। फोटो सुरक्षित सेव होगा और नेटवर्क आने पर अपने आप अपलोड होगा।",
      syncOffline: "ऑफलाइन कतार सिंक करें",
      smsModeBtn: "हायर ड्राइवर SMS लिंक व्यू (No-App Link)"
    },
    en: {
      title: "Driver POD Capture",
      sub: "Capture POD at consignee gate before departure",
      activeTrip: "Active Trip Details",
      vehicle: "Vehicle No",
      route: "Route / Dest",
      lrNo: "Expected LR No",
      client: "Client / Consignee",
      bigButton: "Capture POD Photo",
      bigButtonSub: "Launch camera and snap proof in 1 click",
      gpsTagged: "GPS Geotagged & Timestamped",
      compressBadge: "Dead-zone compressed (<300 KB)",
      analyzing: "AI is verifying POD document... please wait",
      verifiedHeading: "POD Verified Successfully!",
      verifiedSub: "LR matched, stamp & signature confirmed. You may depart gate.",
      retakeHeading: "Retake Requested",
      retakeLeft: "Attempts Left",
      reviewHeading: "Routed to Billing Review",
      reviewSub: "Shortage or damage remark flagged. Billing team will review.",
      retakeBtn: "🔄 Retake Photo Now",
      sampleButtons: "Reviewer Quick-Test Samples:",
      sampleClean: "✅ Clear POD (Verified Pass)",
      sampleNoStamp: "⚠️ Missing Stamp (Retake Trigger)",
      sampleShortage: "📦 Shortage Remark (Needs Review)",
      offlineBanner: "You are currently offline. Photos are cached in IndexedDB and will auto-upload when back online.",
      syncOffline: "Sync Offline Captures",
      smsModeBtn: "Hired Driver SMS Link View (Zero-Install)"
    }
  }[lang] || {};

  // Check online status & load offline queue
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingOffline();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getOfflineCaptures().then(setOfflineQueue);

    // Get live geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        (err) => console.log("Using simulated GPS: Chhatrapati Sambhajinagar"),
        { timeout: 5000 }
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Play audio guidance when AI result updates
  useEffect(() => {
    if (aiResult) {
      if (aiResult.status === 'VERIFIED') {
        audioPrompts.playSuccessChime();
        const text = lang === 'mr' ? aiResult.retake_prompt_marathi : lang === 'hi' ? aiResult.retake_prompt_hindi : "POD verified successfully. You may depart gate.";
        audioPrompts.speak(text, lang);
      } else if (aiResult.status === 'RETAKE_REQUESTED') {
        audioPrompts.playAlertChime();
        const text = lang === 'mr' ? aiResult.retake_prompt_marathi : lang === 'hi' ? aiResult.retake_prompt_hindi : aiResult.retake_reason;
        audioPrompts.speak(text, lang);
      } else if (aiResult.status === 'NEEDS_REVIEW') {
        audioPrompts.playAlertChime();
        const text = lang === 'mr' ? aiResult.retake_prompt_marathi : lang === 'hi' ? aiResult.retake_prompt_hindi : "Discrepancy noted. Routed to office billing team.";
        audioPrompts.speak(text, lang);
      }
    }
  }, [aiResult, lang]);

  // Handle Capture & Process
  const handlePhotoSelected = async (file, sampleType = null) => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setAiResult(null);

      // 1. Client-Side Canvas Compression (< 300 KB constraint)
      const { file: compressedFile, sizeKB } = await compressImageUnder300KB(file);
      setFileSizeKB(sizeKB);
      setPreviewUrl(URL.createObjectURL(compressedFile));

      // 2. If Offline: store in IndexedDB
      if (!isOnline) {
        await saveCaptureOffline({
          tripId: selectedTrip.id,
          file: compressedFile,
          sizeKB,
          gps: gpsLocation,
          remarks: driverRemarks
        });
        const updated = await getOfflineCaptures();
        setOfflineQueue(updated);
        setIsProcessing(false);
        alert(lang === 'mr' ? "फोटो ऑफलाइन सेव्ह झाला आहे! नेटवर्क आल्यावर सिंक होईल." : "फोटो ऑफलाइन सेव हो गया है! नेटवर्क आते ही सिंक होगा।");
        return;
      }

      // 3. Upload to FastAPI backend for AI verification
      const formData = new FormData();
      formData.append('file', compressedFile, sampleType ? `${selectedTrip.id}_${sampleType}.jpg` : compressedFile.name);
      formData.append('gps_lat', gpsLocation.lat);
      formData.append('gps_lng', gpsLocation.lng);
      formData.append('gps_accuracy', gpsLocation.accuracy);
      formData.append('driver_remarks', driverRemarks || (sampleType === 'shortage' ? 'Short by 6 cartons' : ''));

      const res = await fetch(`/api/trips/${selectedTrip.id}/pod-upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAiResult(data);
      if (onTripUpdated) onTripUpdated();
    } catch (err) {
      console.error("Capture processing error", err);
      alert("Failed to process photo: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const syncPendingOffline = async () => {
    const queue = await getOfflineCaptures();
    for (const item of queue) {
      try {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('gps_lat', item.gps.lat);
        formData.append('gps_lng', item.gps.lng);
        formData.append('is_offline_synced', '1');
        await fetch(`/api/trips/${item.tripId}/pod-upload`, { method: 'POST', body: formData });
        await removeOfflineCapture(item.id);
      } catch (e) {
        console.error("Sync error for offline item", e);
      }
    }
    const refreshed = await getOfflineCaptures();
    setOfflineQueue(refreshed);
    if (onTripUpdated) onTripUpdated();
  };

  // Quick Reviewer Sample Loaders
  const loadSamplePhoto = async (sampleType) => {
    let filename = 'TRP-66120_pod.jpg';
    let targetTripId = 'TRP-66120';
    if (sampleType === 'nostamp') {
      filename = 'TRP-66134_pod_nostamp.jpg';
      targetTripId = 'TRP-66134';
      setSelectedTripId('TRP-66134');
    } else if (sampleType === 'shortage') {
      filename = 'TRP-66141_pod_shortage.jpg';
      targetTripId = 'TRP-66141';
      setSelectedTripId('TRP-66141');
      setDriverRemarks('Short by 6 cartons');
    } else {
      setSelectedTripId('TRP-66120');
      setDriverRemarks('');
    }

    try {
      const response = await fetch(`/uploads/${filename}`);
      const blob = await response.blob();
      const testFile = new File([blob], filename, { type: 'image/jpeg' });
      handlePhotoSelected(testFile, sampleType);
    } catch (e) {
      console.error("Error loading sample", e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Banner: Mode & Network status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wifi className="w-3.5 h-3.5" /> 4G Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff className="w-3.5 h-3.5" /> Dead Zone (Offline Mode)
            </span>
          )}
          {offlineQueue.length > 0 && (
            <button
              onClick={syncPendingOffline}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> {offlineQueue.length} queued
            </button>
          )}
        </div>

        {/* Hired Driver SMS Link Toggle */}
        <button
          onClick={() => setIsHiredSmsMode(!isHiredSmsMode)}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            isHiredSmsMode
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isHiredSmsMode ? '📱 Hired SMS Mode Active' : t.smsModeBtn}</span>
        </button>
      </div>

      {/* Hired Driver SMS Simulation Box */}
      {isHiredSmsMode && (
        <div className="mb-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-950">
                Zero-Install Hired Market Driver Mode (TRP-66141)
              </p>
              <p className="text-indigo-700 mt-0.5">
                Market driver Balasaheb Shinde receives this secure one-touch link via SMS. No app installation needed; works in any mobile browser with instant GPS and camera access.
              </p>
              <div className="mt-2 flex items-center gap-2 font-mono text-[11px] bg-white px-2 py-1 rounded border border-indigo-200">
                <span>SMS URL: https://pod.companya.in/p/{selectedTrip.sms_token || 'sms-tok-66141'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Trip Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.activeTrip}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-slate-900">{selectedTrip.id}</span>
              {selectedTrip.is_hired ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  HIRED TRUCK
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                  OWN FLEET
                </span>
              )}
            </div>
          </div>

          {/* Trip Selector for testing */}
          <div className="text-right">
            <label className="text-[10px] text-slate-400 font-medium block">Switch Trip:</label>
            <select
              value={selectedTrip.id}
              onChange={(e) => {
                setSelectedTripId(e.target.value);
                setAiResult(null);
                setPreviewUrl(null);
              }}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-800"
            >
              {trips.map(tr => (
                <option key={tr.id} value={tr.id}>
                  {tr.id} - {tr.client_name} ({tr.vehicle_no})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trip Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">{t.vehicle}</span>
            <span className="font-semibold text-slate-800">{selectedTrip.vehicle_no}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">{t.route}</span>
            <span className="font-semibold text-slate-800">{selectedTrip.destination}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">{t.lrNo}</span>
            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
              {selectedTrip.lr_no}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">{t.client}</span>
            <span className="font-semibold text-slate-800 truncate block">{selectedTrip.client_name}</span>
          </div>
        </div>

        {/* GPS Geotag Live Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-slate-700">GPS: {gpsLocation.lat.toFixed(4)}°N, {gpsLocation.lng.toFixed(4)}°E</span>
            <span className="text-slate-400">(±{gpsLocation.accuracy.toFixed(0)}m)</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
          </div>
        </div>
      </div>

      {/* Driver Voice Audio Guidance Trigger */}
      <div className="mb-4 flex items-center justify-between bg-sky-50 border border-sky-100 rounded-xl px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-sky-950">
              {lang === 'mr' ? 'मराठी आवाज मार्गदर्शन' : lang === 'hi' ? 'हिंदी आवाज मार्गदर्शन' : 'Voice Guidance'}
            </p>
            <p className="text-[11px] text-sky-700">
              {lang === 'mr' ? 'पावतीचा फोटो कसा काढावा हे ऐका' : lang === 'hi' ? 'रसीद का फोटो कैसे लें यह सुनें' : 'Tap to hear audio instructions'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const prompt = lang === 'mr'
              ? "नमस्कार ड्रायव्हर दादा. कृपया पावतीचा स्पष्ट फोटो काढा. पावतीवर कंपनीचा शिक्का, सही आणि एल आर नंबर स्पष्ट दिसणे आवश्यक आहे."
              : "नमस्ते ड्राइवर भाई। कृपया रसीद का साफ फोटो लें। रसीद पर कंपनी की मोहर, हस्ताक्षर और LR नंबर साफ दिखना जरूरी है।";
            audioPrompts.speak(prompt, lang);
          }}
          className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1"
        >
          <Volume2 className="w-3.5 h-3.5" /> ऐका
        </button>
      </div>

      {/* HIDDEN FILE/CAMERA INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handlePhotoSelected(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* THE ONE BIG BUTTON (Driver UI: No forms, 1 Giant Button) */}
      {!aiResult || aiResult.status === 'RETAKE_REQUESTED' ? (
        <div className="my-6">
          <button
            disabled={isProcessing}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={`w-full py-7 px-6 rounded-3xl text-white font-extrabold text-xl sm:text-2xl shadow-xl flex flex-col items-center justify-center gap-2.5 transition-all transform active:scale-95 ${
              isProcessing
                ? 'bg-slate-400 cursor-wait'
                : aiResult?.status === 'RETAKE_REQUESTED'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 shadow-emerald-600/30'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 mb-1">
              {isProcessing ? (
                <RefreshCw className="w-9 h-9 animate-spin text-white" />
              ) : (
                <Camera className="w-9 h-9 text-white" />
              )}
            </div>
            <span>{isProcessing ? t.analyzing : aiResult?.status === 'RETAKE_REQUESTED' ? t.retakeBtn : t.bigButton}</span>
            <span className="text-xs font-normal text-white/90">
              {isProcessing ? "AI Vision Verifying Document..." : t.bigButtonSub}
            </span>
          </button>
        </div>
      ) : null}

      {/* COMPRESSION & DEAD-ZONE BADGE */}
      {fileSizeKB && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4 bg-slate-100 py-1.5 px-3 rounded-full mx-auto w-fit">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Image Compressed: <strong className="text-slate-800">{fileSizeKB} KB</strong> (&lt; 300 KB constraint passed)</span>
        </div>
      )}

      {/* AI RESULT DISPLAY CARD */}
      {aiResult && (
        <div className={`rounded-2xl p-5 border shadow-sm transition-all mb-6 ${
          aiResult.status === 'VERIFIED'
            ? 'bg-emerald-50/70 border-emerald-300'
            : aiResult.status === 'RETAKE_REQUESTED'
            ? 'bg-amber-50/80 border-amber-300'
            : 'bg-orange-50/80 border-orange-300'
        }`}>
          {/* Status Header */}
          <div className="flex items-start gap-3">
            {aiResult.status === 'VERIFIED' && (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
            {aiResult.status === 'RETAKE_REQUESTED' && (
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            {aiResult.status === 'NEEDS_REVIEW' && (
              <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-base font-bold ${
                  aiResult.status === 'VERIFIED' ? 'text-emerald-950' : aiResult.status === 'RETAKE_REQUESTED' ? 'text-amber-950' : 'text-orange-950'
                }`}>
                  {aiResult.status === 'VERIFIED'
                    ? t.verifiedHeading
                    : aiResult.status === 'RETAKE_REQUESTED'
                    ? t.retakeHeading
                    : t.reviewHeading}
                </h3>
                {aiResult.status === 'RETAKE_REQUESTED' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {t.retakeLeft}: {aiResult.retakes_remaining}/2
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {lang === 'mr' ? aiResult.retake_prompt_marathi : lang === 'hi' ? aiResult.retake_prompt_hindi : aiResult.retake_reason || t.verifiedSub}
              </p>
            </div>
          </div>

          {/* AI Check Inspection Checklist Grid */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-slate-200/50">
              {aiResult.lr_match ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <div>
                <span className="text-slate-500 block text-[10px]">LR Number</span>
                <span className="font-semibold text-slate-800">{aiResult.extracted_lr_no}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-slate-200/50">
              {aiResult.stamp_detected ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div>
                <span className="text-slate-500 block text-[10px]">Consignee Stamp</span>
                <span className="font-semibold text-slate-800">
                  {aiResult.stamp_detected ? 'Seal Found ✓' : 'Stamp Missing ❌'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-slate-200/50">
              {aiResult.signature_detected ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div>
                <span className="text-slate-500 block text-[10px]">Signature</span>
                <span className="font-semibold text-slate-800">
                  {aiResult.signature_detected ? 'Signed ✓' : 'Missing ❌'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-slate-200/50">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[10px]">AI Confidence</span>
                <span className="font-semibold text-slate-800">
                  {Math.round(aiResult.confidence_score * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Captured Preview Image */}
          {previewUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-black/5">
              <img src={previewUrl} alt="Captured POD" className="w-full max-h-72 object-contain mx-auto" />
            </div>
          )}
        </div>
      )}

      {/* QUICK SAMPLE TEST BUTTONS FOR REVIEWER */}
      <div className="mt-8 pt-5 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" /> {t.sampleButtons}
          </span>
          <span className="text-[11px] text-slate-400">1-Click Test Scenarios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => loadSamplePhoto('clean')}
            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-950 font-semibold text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-emerald-700 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-bold">TRP-66120</span>
            </div>
            <p className="text-[11px] text-emerald-900">{t.sampleClean}</p>
          </button>

          <button
            onClick={() => loadSamplePhoto('nostamp')}
            className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-950 font-semibold text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-amber-700 mb-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-bold">TRP-66134</span>
            </div>
            <p className="text-[11px] text-amber-900">{t.sampleNoStamp}</p>
          </button>

          <button
            onClick={() => loadSamplePhoto('shortage')}
            className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-950 font-semibold text-left transition-all"
          >
            <div className="flex items-center gap-1.5 text-rose-700 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="font-bold">TRP-66141</span>
            </div>
            <p className="text-[11px] text-rose-900">{t.sampleShortage}</p>
          </button>
        </div>
      </div>
    </div>
  );
}

