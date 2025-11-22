export default function SettingsPage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            <div className="space-y-6">
                <div className="p-8 rounded-2xl backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
                    <h2 className="text-xl font-semibold text-white mb-4">Brand Identity</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Brand Color</label>
                            <div className="flex gap-3">
                                {['#000000', '#FF3B30', '#007AFF', '#5856D6'].map(color => (
                                    <div key={color} className="w-10 h-10 rounded-full border border-white/20 cursor-pointer" style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-2xl backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08]">
                    <h2 className="text-xl font-semibold text-white mb-4">AI Personality</h2>
                    <div className="space-y-4">
                        <label className="block text-sm text-white/60 mb-2">Tone of Voice</label>
                        <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none">
                            <option>Professional</option>
                            <option>Casual</option>
                            <option>Edgy</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
