"use client"; // Wajib karena kita pakai interaksi (useEffect)

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Pastikan folder lib/supabase.js sudah kamu buat

export default function Home() {
  const [statusKoneksi, setStatusKoneksi] = useState("Mengecek koneksi...");

  useEffect(() => {
    async function cekSupabase() {
      try {
        // Kita tes ambil data dari tabel 'profiles'
        const { error } = await supabase.from('profiles').select('*').limit(1);
        
        // Jika errornya 'relation does not exist', itu kabar BAIK! 
        // Artinya web sudah tersambung ke Supabase, tapi tabelnya saja yang belum kita buat.
        if (error && error.message.includes("relation")) {
          setStatusKoneksi("✅ Supabase Tersambung (Tabel belum dibuat)");
        } else if (error) {
          setStatusKoneksi("❌ Error: " + error.message);
        } else {
          setStatusKoneksi("✅ Supabase Tersambung & Tabel Terdeteksi!");
        }
      } catch (err) {
        setStatusKoneksi("❌ Gagal terhubung ke database.");
      }
    }
    cekSupabase();
  }, []);

  return (
    <main className="min-h-screen bg-batja-beige text-batja-green flex flex-col items-center justify-center p-6 text-center">
      
      {/* Label Status Koneksi (Hanya muncul saat ngoding, nanti bisa dihapus) */}
      <div className="absolute top-4 right-4 text-[10px] font-mono opacity-50 bg-white/50 px-2 py-1 rounded">
        Status: {statusKoneksi}
      </div>

      <div className="max-w-2xl">
        {/* Judul Estetik */}
        <h1 className="font-serif text-6xl md:text-8xl italic mb-6 tracking-tighter">
          Belandjar Batja
        </h1>
        
        {/* Kutipan Puitis */}
        <p className="text-lg md:text-xl opacity-80 mb-10 font-light tracking-wide italic">
          "Karena buku seharusnya berkelana, bukan cuma diam di sudut mata."
        </p>
        
        {/* Tombol Navigasi */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-batja-green text-batja-beige px-10 py-4 rounded-full text-sm font-medium hover:scale-105 transition-transform duration-300 shadow-lg">
            Intip Rak Buku
          </button>
          <button className="border border-batja-green px-10 py-4 rounded-full text-sm font-medium hover:bg-batja-green hover:text-batja-beige transition-all duration-300">
            Daftar Member
          </button>
        </div>

        {/* Info Tambahan */}
        <div className="mt-16 pt-8 border-t border-batja-green/10 text-xs opacity-50 uppercase tracking-[0.2em]">
          Medan, Indonesia — 2026
        </div>
      </div>
    </main>
  );
}