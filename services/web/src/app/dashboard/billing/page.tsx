import { Check } from 'lucide-react';

export default function BillingPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Billing</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Starter', 'Creator', 'Pro'].map((plan, i) => (
                    <div
                        key={plan}
                        className={`
              p-8 rounded-2xl backdrop-blur-2xl border flex flex-col
              ${i === 1 ? 'bg-white/[0.08] border-purple-500/30 shadow-lg shadow-purple-500/10' : 'bg-white/[0.03] border-white/[0.08]'}
            `}
                    >
                        <h3 className="text-xl font-bold text-white mb-2">{plan}</h3>
                        <div className="text-3xl font-bold text-white mb-6">
                            ${i * 29}<span className="text-sm text-white/40 font-normal">/mo</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {[1, 2, 3, 4].map(f => (
                                <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span>Feature {f} included</span>
                                </li>
                            ))}
                        </ul>

                        <button className={`
              w-full py-3 rounded-xl font-medium transition-colors
              ${i === 1 ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20'}
            `}>
                            {i === 1 ? 'Current Plan' : 'Upgrade'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
