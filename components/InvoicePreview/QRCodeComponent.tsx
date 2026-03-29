"use client";

import dynamic from "next/dynamic";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), {
  ssr: false,
  loading: () => (
    <div className="w-20 h-20 bg-gray-100 animate-pulse rounded" />
  ),
});

interface Props {
  value: string;
  size?: number;
}

export default function QRCodeComponent({ value, size = 80 }: Props) {
  if (!value) return null;
  return (
    <QRCode
      value={value}
      size={size}
      level="M"
      includeMargin={false}
    />
  );
}
