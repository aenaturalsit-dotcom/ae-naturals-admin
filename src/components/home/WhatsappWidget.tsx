"use client";

import React from "react";
import Image from "next/image";
import whatsappIcon from "@/assets/images/whatsapp.png";
import { cn } from "@/lib/utils";

interface WhatsappWidgetProps {
  settings?: {
    enabled?: boolean;
    phoneNumber?: string;
    defaultMessage?: string;
  };
  previewMode?: boolean;
}

export default function WhatsappWidget({
  settings,
  previewMode = false,
}: WhatsappWidgetProps) {
  const enabled = settings?.enabled ?? true;
  const phoneNumber = settings?.phoneNumber || "";

  const defaultMessage =
    settings?.defaultMessage ||
    "Hi 👋 I would like to know more about your products and pricing.";

  // Hide completely if disabled
  if (!enabled) {
    return null;
  }

  // In live store, hide if phone number is missing
  if (!previewMode && !phoneNumber) {
    return null;
  }

  const whatsappUrl = phoneNumber
    ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
        defaultMessage,
      )}`
    : "#";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(`
        fixed
        bottom-4
        right-4
        md:bottom-5
        md:right-5
        lg:bottom-6
        lg:right-6
        z-[9999]
        transition-all
        duration-300
        hover:scale-110
        active:scale-95
      `)}
    >
      <Image
    src={whatsappIcon}
    alt="WhatsApp"
    width={68}
    height={68}
    priority
    className={cn(`
      w-[52px]
      h-[52px]
      md:w-[60px]
      md:h-[60px]
      lg:w-[68px]
      lg:h-[68px]
      drop-shadow-[0_8px_20px_rgba(0,0,0,0.25)]
      animate-[bounce_3s_ease-in-out_infinite]
    `)}
  />
</a>
  );
}
