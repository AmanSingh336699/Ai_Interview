"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"
import Loader from "./ui/Loader"

export function withAuth(Component: React.ComponentType){
    return function ProtectedComponent(props: any){
        const { status } = useSession()
        const router = useRouter()
        useEffect(() => {
            if(status === "unauthenticated"){
                router.push("/login")
            }
        }, [status, router])
        if(status === "loading"){
            return <Loader />
        }
        return <Component {...props} />
    }
}