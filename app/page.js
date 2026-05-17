'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

// Actualizá este número con el WhatsApp real de Citalo
const WA_URL = 'https://wa.me/5493364642051?text=Hola%2C%20quiero%20mi%20link%20de%20Citalo';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeIn({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Image src="/logo.svg" alt="Citalo" width={110} height={28} priority />

          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cómo funciona</a>
            <a href="#precios" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Precios</a>
            <a href="#contacto" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contacto</a>
            <a
              href="/onboarding"
              className="bg-[#0ea5e9] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0284c7] transition-colors"
            >
              Quiero mi link
            </a>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            <a href="#como-funciona" className="block text-sm text-gray-700 py-2.5" onClick={() => setMenuOpen(false)}>Cómo funciona</a>
            <a href="#precios" className="block text-sm text-gray-700 py-2.5" onClick={() => setMenuOpen(false)}>Precios</a>
            <a href="#contacto" className="block text-sm text-gray-700 py-2.5" onClick={() => setMenuOpen(false)}>Contacto</a>
            <a
              href="/onboarding"
              className="block bg-[#0ea5e9] text-white text-sm font-semibold px-5 py-3 rounded-xl text-center mt-2"
              onClick={() => setMenuOpen(false)}
            >
              Quiero mi link
            </a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-br from-sky-50 via-white to-white px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
              Sin instalaciones · Listo en 72hs
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Tu link de turnos,<br />
              <span className="text-[#0ea5e9]">listo para compartir</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Compartí un link en tus redes o por WhatsApp y tus pacientes sacan turno solos. Sin llamadas, sin mensajes, sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-[#0ea5e9] text-white font-semibold px-7 py-4 rounded-2xl hover:bg-[#0284c7] transition-colors shadow-lg shadow-sky-200 text-base"
              >
                Quiero mi link
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="w-60 bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl ring-1 ring-gray-800">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  <div className="bg-[#0ea5e9] px-4 pt-3 pb-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/70 text-[10px]">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-white/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-white text-[9px] font-medium truncate">citaloapp.com.ar/dra-garcia</span>
                    </div>
                  </div>
                  <div className="-mt-6 mx-3 mb-4">
                    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">G</div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Dra. Ana García</p>
                          <p className="text-[#0ea5e9] text-xs">Cardiología</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {['Lunes 10:00', 'Martes 14:30', 'Jueves 09:00'].map((slot) => (
                          <div key={slot} className="flex items-center gap-2 bg-sky-50 rounded-lg px-2.5 py-1.5">
                            <svg className="w-3 h-3 text-[#0ea5e9] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 text-[10px] font-medium">{slot}</span>
                          </div>
                        ))}
                      </div>
                      <div className="w-full bg-[#0ea5e9] text-white text-xs font-semibold py-2 rounded-xl text-center">
                        Sacar turno
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 top-14 bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-900 whitespace-nowrap">Turno confirmado</p>
                  <p className="text-[9px] text-gray-500">María López</p>
                </div>
              </div>
              <div className="absolute -left-6 bottom-16 bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-2">
                <p className="text-[10px] text-gray-400">Turnos este mes</p>
                <p className="text-xl font-extrabold text-[#0ea5e9]">+48</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ES ── */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-gray-400 font-medium mb-5">Usado por profesionales de todo tipo</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              'Médicos y especialistas',
              'Psicólogos',
              'Odontólogos',
              'Nutricionistas',
            ].map((item) => (
              <span key={item} className="bg-sky-50 text-sky-700 text-sm font-medium px-4 py-2 rounded-full border border-sky-100">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-[#0ea5e9] font-semibold text-sm uppercase tracking-wider">Simple y rápido</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">Cómo funciona</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">En tres pasos simples tenés tu sistema de turnos online funcionando</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Te creamos tu perfil',
                desc: 'Completás el formulario con tus datos → nosotros configuramos todo → en 72hs tu link está listo para compartir',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
                delay: 0,
              },
              {
                step: '02',
                title: 'Compartís tu link',
                desc: 'Lo ponés en Instagram, WhatsApp, donde quieras. Es tuyo para siempre.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
                delay: 150,
              },
              {
                step: '03',
                title: 'Tus pacientes sacan turno solos',
                desc: 'Eligen fecha y hora sin molestarte. Vos recibís la notificación.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                delay: 300,
              },
            ].map(({ step, title, desc, icon, delay }) => (
              <FadeIn key={step} delay={delay}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group h-full">
                  <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-[#0ea5e9] mb-6 group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
                  </div>
                  <div className="text-[#0ea5e9] font-bold text-sm mb-2">{step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-10">
            <a href="/demo" className="text-[#0ea5e9] font-semibold text-sm hover:underline transition-colors">
              Ver demo en vivo →
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section className="py-20 sm:py-28 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-[#0ea5e9] font-semibold text-sm uppercase tracking-wider">Por qué Citalo</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">Todo lo que necesitás,<br className="hidden sm:block" /> nada de lo que no</h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />,
                title: 'Sin llamadas ni mensajes',
                desc: 'Tus pacientes coordinan solos. No más interrupciones en el consultorio.',
                delay: 0,
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                title: 'Horarios siempre actualizados',
                desc: 'Controlás tu disponibilidad desde el panel. Se actualiza en tiempo real.',
                delay: 100,
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
                title: 'Recordatorios por WhatsApp',
                desc: 'Tus pacientes reciben aviso antes del turno. Menos ausencias, más puntualidad.',
                delay: 200,
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
                title: 'Funciona desde el celular',
                desc: 'Tus pacientes sacan turno desde su teléfono, sin descargar ninguna app.',
                delay: 300,
              },
            ].map(({ icon, title, desc, delay }) => (
              <FadeIn key={title} delay={delay}>
                <div className="bg-gray-50 rounded-3xl p-7 border border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-colors group h-full">
                  <div className="text-gray-400 group-hover:text-[#0ea5e9] transition-colors mb-5">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-20 sm:py-28 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-[#0ea5e9] font-semibold text-sm uppercase tracking-wider">Precios claros</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">Elegí tu plan</h2>
            <p className="text-gray-500 mt-4">Sin sorpresas. Podés cambiar de plan cuando quieras.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {[
              {
                name: 'Básico',
                price: '$10.000',
                desc: 'Para empezar',
                features: ['1 profesional', 'Hasta 60 turnos/mes', 'Link personalizado', 'Notificaciones WhatsApp'],
                popular: false,
                delay: 0,
                url: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=7136e2b1b0e04641878d59fee648fbed',
              },
              {
                name: 'Pro',
                price: '$20.000',
                desc: 'El más elegido',
                features: ['Hasta 3 profesionales', 'Turnos ilimitados', 'Recordatorios automáticos', 'Soporte prioritario'],
                popular: true,
                delay: 150,
                url: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=c9cd522d9d304c0cbc2d4e47481d4aae',
              },
              {
                name: 'Negocio',
                price: '$45.000',
                desc: 'Para clínicas y consultorios',
                features: ['Profesionales ilimitados', 'Multi-sucursal', 'Panel de estadísticas', 'Personalización de marca'],
                popular: false,
                delay: 300,
                url: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=00f7cf03d1ac4bbebf9f46e934702055',
              },
            ].map(({ name, price, desc, features, popular, delay, url }) => (
              <FadeIn key={name} delay={delay} className="flex">
                <div className={`flex-1 rounded-3xl p-8 flex flex-col ${popular ? 'bg-[#0ea5e9] text-white shadow-2xl shadow-sky-300 md:scale-105' : 'bg-white border border-gray-200'}`}>
                  {popular && (
                    <div className="inline-flex self-start bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                      Más popular
                    </div>
                  )}
                  <p className={`text-sm font-medium mb-1 ${popular ? 'text-sky-100' : 'text-gray-500'}`}>{desc}</p>
                  <div className={`text-4xl font-extrabold mb-1 ${popular ? 'text-white' : 'text-gray-900'}`}>{price}</div>
                  <p className={`text-sm mb-8 ${popular ? 'text-sky-100' : 'text-gray-400'}`}>/mes</p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <svg className={`w-5 h-5 shrink-0 mt-0.5 ${popular ? 'text-white' : 'text-[#0ea5e9]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm ${popular ? 'text-sky-50' : 'text-gray-600'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                      popular
                        ? 'bg-white text-[#0ea5e9] hover:bg-sky-50'
                        : 'bg-[#0ea5e9] text-white hover:bg-[#0284c7]'
                    }`}
                  >
                    Suscribirme
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 sm:py-28 bg-[#0ea5e9] px-4">
        <FadeIn className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
            Empezá hoy, tus pacientes<br className="hidden sm:block" /> te lo van a agradecer
          </h2>
          <p className="text-sky-100 mb-8 text-lg">
            En menos de 72hs tenés tu link listo. Sin complicaciones.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2.5 bg-white text-[#0ea5e9] font-bold px-8 py-4 rounded-2xl text-base hover:bg-sky-50 transition-colors shadow-xl"
          >
            Quiero mi link ahora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contacto" className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            <div>
              <Image src="/logo.svg" alt="Citalo" width={100} height={25} className="brightness-0 invert mb-4" />
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Turnos médicos online, sin llamadas, sin complicaciones.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="text-white font-semibold text-sm mb-4">Legal</p>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Términos de uso</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-4">Contacto</p>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>
                  </li>
                  <li>
                    <a href="https://instagram.com/citaloapp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4 text-pink-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-600">
            © 2026 Citalo. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* ── BOTÓN FLOTANTE WHATSAPP ── */}
      <a
        href="https://wa.me/5493364642051?text=Hola!%20quiero%20mi%20link%20de%20Citaloapp"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

    </div>
  );
}
