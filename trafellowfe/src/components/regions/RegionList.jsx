"use client";

import React from 'react'

const Region = () => {

     const regions = [
    { id: 1, name: "Padang", icon: "🏖️", img:"/background/dashboard/padang.png"},
    { id: 2, name: "Bukittinggi", icon: "🏔️", img:"/background/dashboard/jamgadang.png"},
    { id: 3, name: "Tanah Datar", icon: "🏛️",img:"/background/dashboard/tanahdatar.png" },
    { id: 4, name: "Payakumbuh", icon: "🌾",img:"/background/dashboard/payakumbuh.png"},
    { id: 5, name: "Solok", icon: "🏞️",img:"/background/dashboard/solok.png"},
    { id: 6, name: "Pesisir Selatan", icon: "🌊", img:"/background/dashboard/painan.png"},
  ];
  return (
    <section className="mb-16">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold text-gray-800 mb-2">Pilih Kabupaten/Kota</h2>
    <p className="text-gray-600">Jelajahi destinasi wisata di berbagai wilayah Sumatera Barat</p>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {regions.map((region) => (
      <button
        key={region.id}
        className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        {region.img && (
          <img
            src={region.img}
            alt={region.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-white">
          <div
            className={`w-14 h-14 mb-3 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg`}
          >
          </div>
          <h3 className="text-sm font-semibold text-center">
            {region.name}
          </h3>
        </div>
      </button>
    ))}
  </div>
</section>

  )
}

export default Region
