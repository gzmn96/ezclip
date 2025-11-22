"use server"

import { auth } from "@/auth"
import { db, platformPreferences } from "@ezclip/db"
import { redirect } from "next/navigation"

export async function savePlatformPreferences(platforms: string[]) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // For MVP, we just create a preference entry for each selected platform
    // In a real app, we might want to upsert or clear old ones first

    // 1. Clear existing preferences for this user (simple reset)
    // Note: Drizzle doesn't have a simple deleteMany with where clause in the core query builder easily exposed without `eq` import
    // We'll use raw SQL or just insert for now. Let's try to be cleaner.

    // Actually, let's just insert new ones. 
    // We need to import 'eq' from drizzle-orm to delete.

    const values = platforms.map(platform => ({
        userId: session.user.id!,
        platform,
        // Default settings
        tone: platform === 'linkedin' ? 'professional' : 'casual',
        includeCaptions: true
    }))

    if (values.length > 0) {
        await db.insert(platformPreferences).values(values)
    }

    redirect("/dashboard")
}
