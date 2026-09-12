import React from "react";
import { Star, MessageSquare, ShieldCheck } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  product: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Arjun Mehta",
    location: "Mumbai, MH",
    quote: "The Carbon Armour Case is exceptionally slim but handles impact like a tank. Dropped it twice from my desk and there's not a single mark on my phone edges. Responsive clicky buttons feel great.",
    product: "Carbon Armour Hybrid Case",
    rating: 5,
  },
  {
    id: "t2",
    name: "Priyanka Nair",
    location: "Bengaluru, KA",
    quote: "Usually matte protectors blur out display colors, but this one is incredibly clear and feels like paper to write/scroll. Zero oily thumb smudges. Super easy bubble-free installation.",
    product: "Anti-Glare Matte Protector",
    rating: 5,
  },
  {
    id: "t3",
    name: "Rahul Sharma",
    location: "Delhi, DL",
    quote: "Dropped my brand new iPhone 15 Pro Max directly face down on concrete. The 9H glass took the entire impact and shattered, but my display is absolutely pristine underneath. Reordered instantly.",
    product: "Premium 9H Tempered Glass",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 relative bg-charcoal-light/10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-gold mb-2">
            <MessageSquare className="w-3.5 h-3.5" /> Customer Feedback
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            TRUSTED BY THOUSANDS
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
            See how PIXKART protectors and premium cases protect smartphone displays across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:border-gold/20 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-gold transition-colors">
                    {t.name}
                  </h4>
                  <span className="text-[10px] text-gray-500">{t.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-extrabold text-emerald-light bg-emerald/10 px-2 py-0.5 rounded border border-emerald-light/20 block">
                    {t.product}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
