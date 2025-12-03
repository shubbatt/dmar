"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"

interface BookingButtonProps {
  service?: string
  className?: string
  children?: React.ReactNode
}

export function BookingButton({ service, className, children }: BookingButtonProps) {
  const href = service ? `/booking?service=${service}` : "/booking"

  return (
    <Link href={href}>
      <Button className={className}>
        <Calendar className="mr-2 h-4 w-4" />
        {children || "Book Now"}
      </Button>
    </Link>
  )
}
