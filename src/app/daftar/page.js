"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DaftarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fileKTP, setFileKTP] = useState(null); // Sinkronkan nama variabel

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    nickname: "",
    usernameDb: "",
    whatsapp: "",
    socialMedia: "",
    readingTracker: "",
    receiverName: "",
    shippingAddress: "",
    surveyFamiliarity: "",
    surveyMotivation: "",
    hasAgreed: null,
  });

  // Validasi Step agar tidak bisa lanjut jika kosong
  const isStepValid = (currentStep) => {
    if (currentStep === 2) {
      return (
        formData.nickname &&
        formData.usernameDb &&
        formData.email &&
        formData.password &&
        formData.socialMedia &&
        formData.whatsapp // Tambahkan whatsapp di validasi
      );
    }
    if (currentStep === 3) {
      return formData.surveyFamiliarity && formData.surveyMotivation;
    }
    if (currentStep === 4) {
      return (
        formData.fullName &&
        formData.receiverName &&
        formData.shippingAddress &&
        fileKTP &&
        formData.hasAgreed === true
      );
    }
    return true;
  };

  const handleDaftar = async (e) => {
    e.preventDefault();
    if (!isStepValid(4)) return;
    setLoading(true);

    try {
      // 1. Auth Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      let finalKtpUrl = "";

      // 2. Upload KTP
      if (fileKTP && userId) {
        const fileExt = fileKTP.name.split(".").pop();
        const filePath = `ktp/${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("id_cards")
          .upload(filePath, fileKTP);
        
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("id_cards")
          .getPublicUrl(filePath);
        finalKtpUrl = data.publicUrl;
      }

      // 3. Simpan Profil Lengkap ke Database
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          full_name: formData.fullName,
          nickname: formData.nickname,
          username_db: formData.usernameDb,
          whatsapp_number: formData.whatsapp,
          social_media_link: formData.socialMedia,
          reading_tracker_link: formData.readingTracker,
          receiver_name: formData.receiverName,
          shipping_address: formData.shippingAddress,
          survey_familiarity: formData.surveyFamiliarity,
          survey_motivation: formData.surveyMotivation,
          ktp_photo_url: finalKtpUrl,
          has_agreed: formData.hasAgreed,
        },
      ]);

      if (profileError) throw profileError;

      alert("Lamaran berhasil dikirim! Mohon tunggu proses verifikasi.");
      router.push("/");
    } catch (err) {
      alert("Terjadi kendala: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-batja-beige flex items-center justify-center p-6 py-10">
      <div className="bg-white/60 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl border border-batja-green/5 text-batja-green">
        
        {/* Progress Indicator */}
        <div className="flex justify-between mb-10 px-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-full mx-1 rounded-full transition-all duration-500 ${step >= s ? "bg-batja-green" : "bg-batja-green/10"}`}
            />
          ))}
        </div>

        {/* STEP 1: INTRO SECTION */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="font-serif text-3xl md:text-4xl italic text-batja-green mb-6 text-center">
              Salam Kenal, Teman Batja
            </h2>

            <div className="space-y-4 text-batja-green/80 leading-relaxed text-sm md:text-base text-justify font-light">
              <p>
                <strong>Belandjar Batja</strong> adalah perpustakaan daring
                nirlaba milik <strong>Zakia Liland (@belandjar)</strong>.
                Belandjar Batja hadir sebagai media untuk memperpanjang manfaat
                koleksi buku pribadi yang Zakia miliki dengan cara
                meminjamkannya kepada teman pembaca lain yang berminat dan
                membutuhkannya.
              </p>
              <p>
                Selain itu, ini adalah usaha memberikan opsi akses membaca buku
                fisik yang lebih terjangkau dan berpartisipasi dalam
                mencerdaskan kehidupan bangsa.
              </p>
              <p className="bg-batja-green/5 p-4 rounded-xl italic">
                Sebelum mendaftarkan diri menjadi anggota, Teman Batja harap
                membaca
                <Link
                  href="/syarat-ketentuan"
                  className="underline font-medium hover:text-batja-terracotta ml-1"
                >
                  syarat dan ketentuan Belandjar Batja.
                </Link>
              </p>
              <p>
                Silakan isi formulir ini untuk menjadi Teman Batja. Namun, perlu
                diketahui bahwa ada kemungkinan lamaran kamu tidak diterima. Hal
                ini berkaitan dengan prinsip kehati-hatian atas koleksi buku.
                Oleh karena itu, isilah formulir ini dengan sebaik dan
                semeyakinkan mungkin agar kami percaya bahwa kamu cukup amanah
                dan berkomitmen untuk membaca, menjaga, dan mengembalikan
                buku-buku Belandjar Batja.
              </p>
              <p className="text-xs opacity-60">
                *Semua data yang kamu lampirkan hanya untuk keperluan Belandjar
                Batja. Jika lamaran belum diterima, data akan kami hapus.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-batja-green text-batja-beige py-4 rounded-full font-medium mt-10 hover:scale-[1.02] transition-all shadow-lg"
            >
              Berikutnya
            </button>
          </div>
        )}


        {/* STEP 2: KENALAN DASAR */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-serif text-2xl italic mb-4">Kenalan Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Nama Panggilan *" className="p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} value={formData.nickname} />
              <input placeholder="Username Unik (Tanpa Spasi) *" className="p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
                onChange={(e) => setFormData({ ...formData, usernameDb: e.target.value.toLowerCase().replace(/\s/g, "") })} value={formData.usernameDb} />
            </div>
            <input type="email" placeholder="Email Aktif *" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} value={formData.email} />
            <input type="password" placeholder="Buat Password *" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} value={formData.password} />
            <input placeholder="Nomor WhatsApp Aktif *" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} value={formData.whatsapp} />
            <input placeholder="Tautan Media Sosial (Instagram/Twitter) *" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
              onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })} value={formData.socialMedia} />
            
            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-full border border-batja-green font-medium">Kembali</button>
              <button onClick={() => setStep(3)} disabled={!isStepValid(2)} className="flex-1 bg-batja-green text-batja-beige py-4 rounded-full font-medium disabled:opacity-30">Berikutnya</button>
            </div>
          </div>
        )}

        {/* STEP 3: SURVEI */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="font-serif text-2xl italic">Kamu & Perpus Virtual</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seberapa familiar kamu dengan perpus virtual? *</label>
              <select className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none"
                onChange={(e) => setFormData({ ...formData, surveyFamiliarity: e.target.value })} value={formData.surveyFamiliarity}>
                <option value="">Pilih...</option>
                <option value="Sangat">Sangat Familiar</option>
                <option value="Cukup">Cukup Familiar</option>
                <option value="Baru">Baru Tahu</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mengapa kami harus mempercayakan koleksi kami kepadamu? *</label>
              <textarea placeholder="Ceritakan motivasi dan komitmenmu..." className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 h-32 outline-none"
                onChange={(e) => setFormData({ ...formData, surveyMotivation: e.target.value })} value={formData.surveyMotivation} />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-full border border-batja-green font-medium">Kembali</button>
              <button onClick={() => setStep(4)} disabled={!isStepValid(3)} className="flex-1 bg-batja-green text-batja-beige py-4 rounded-full font-medium disabled:opacity-30">Terakhir</button>
            </div>
          </div>
        )}

        {/* STEP 4: LOGISTIK */}
        {step === 4 && (
          <form onSubmit={handleDaftar} className="space-y-5 animate-in fade-in">
            <h3 className="font-serif text-2xl italic">Finalisasi & Logistik</h3>
            <input placeholder="Nama Lengkap Sesuai KTP *" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} value={formData.fullName} />
            
            <div className="p-5 bg-batja-green/5 rounded-2xl border border-dashed border-batja-green/20">
              <label className="text-xs font-bold block mb-2 opacity-60 tracking-widest">FOTO KTP (Jaminan Komitmen) *</label>
              <input type="file" accept="image/*" className="text-xs file:bg-batja-green file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3" 
                onChange={(e) => setFileKTP(e.target.files[0])} />
            </div>

            <input placeholder="Nama Penerima Paket Buku *" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
              onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })} value={formData.receiverName} />

            <textarea placeholder="Alamat Pengiriman Lengkap (Kecamatan, Kota, Patokan) *" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 h-24 outline-none" 
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })} value={formData.shippingAddress} />

            <input placeholder="Tautan Reading Tracker (Goodreads/dll) - Opsional" className="w-full p-4 rounded-2xl bg-white/80 border border-batja-green/10 outline-none" 
              onChange={(e) => setFormData({ ...formData, readingTracker: e.target.value })} value={formData.readingTracker} />

            <div className="p-5 bg-batja-green/5 rounded-2xl border border-batja-green/10">
              <p className="text-[13px] italic mb-4 leading-relaxed opacity-80">
                "Saya telah membaca <Link href="/syarat-ketentuan" className="underline">syarat & ketentuan</Link>, berkomitmen mematuhi peraturan, dan bersedia menerima konsekuensi jika melanggar."
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setFormData({ ...formData, hasAgreed: true })} className={`flex-1 p-3 rounded-xl border text-sm transition-all ${formData.hasAgreed === true ? "bg-batja-green text-white" : "bg-white/50"}`}>Ya, Setuju</button>
                <button type="button" onClick={() => setFormData({ ...formData, hasAgreed: false })} className={`flex-1 p-3 rounded-xl border text-sm transition-all ${formData.hasAgreed === false ? "bg-red-500 text-white" : "bg-white/50"}`}>Tidak</button>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-4 rounded-full border border-batja-green font-medium">Kembali</button>
              <button type="submit" disabled={loading || !isStepValid(4)} className="flex-[2] bg-batja-green text-batja-beige py-4 rounded-full font-medium shadow-xl disabled:opacity-30">
                {loading ? "Mengirim..." : "Kirim Lamaran"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}