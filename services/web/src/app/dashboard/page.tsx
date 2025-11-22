import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, BarChart3, Upload, Play } from "lucide-react"
import { redirect } from "next/navigation"

export default async function Dashboard() {
    const session = await auth()
    if (!session) return redirect("/api/auth/signin")

    return (
        <div className="min-h-screen bg-surface p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
                        <p className="text-secondary">Welcome back, {session.user?.name}</p>
                    </div>
                    <Button className="bg-primary text-white rounded-full px-6">
                        <Upload className="mr-2 h-4 w-4" /> New Upload
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clips</CardTitle>
                            <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">+2 from last week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Play className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4,231</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Processing</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2</div>
                            <p className="text-xs text-muted-foreground">Currently analyzing</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Clips */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Clips</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden border-0 shadow-md">
                                <div className="aspect-[9/16] bg-gray-100 relative group cursor-pointer">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                        <Play className="h-12 w-12 text-white fill-current" />
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold truncate">Gaming Stream Highlight #{i}</h3>
                                    <p className="text-sm text-gray-500">Created 2h ago</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
